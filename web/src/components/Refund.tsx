import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { SignActionLoader } from "./SignActionLoader";
import { ErrorHandler, ErrorCodes, getUserFriendlyMessage, isAppError } from "../utils/errorHandler";
import { IDL_OBJECT } from "../utils/constants";

import { Dropsome } from "../idl/dropsome";
import { Commitment, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { Record } from "types/record";

const COMMITMENT_LEVEL: Commitment = "processed";
const RPC_RATE_LIMIT_DELAY_MS = 120;
const CONFIRMATION_POLL_INTERVAL_MS = 1000;

// Helper function to add delay between transactions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const Refund: FC = () => {
  const connectedWallet = useWallet();
  const { connection } = useConnection();
  const [activeDrops, setActiveDrops] = useState<Record[]>([]);
  const [selectedDrops, setSelectedDrops] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const confirmOptions = { preflightCommitment: COMMITMENT_LEVEL, commitment: COMMITMENT_LEVEL };

  const getProvider = useMemo(() => {
    if (!connectedWallet.connected) return null;
    const provider = new AnchorProvider(
      connection,
      connectedWallet,
      confirmOptions,
    );
    setProvider(provider);
    return provider;
  }, [connection, connectedWallet, confirmOptions.preflightCommitment, confirmOptions.commitment]);

  const program = useMemo(() => {
    if (!getProvider) return null;
    return new Program<Dropsome>(IDL_OBJECT, getProvider);
  }, [getProvider]);

  const fetchDropRecords = useCallback(async () => {
    if (isFetchingRef.current || !connectedWallet.connected || !program || !getProvider) {
      return;
    }

    try {
      isFetchingRef.current = true;
      const allRecords = await program.account.record.all();

      // Filter for records where the current wallet is the sender
      const records = allRecords
        .filter((record) => record.account.sender.toBase58() === getProvider.publicKey.toBase58())
        .map((record) => ({ ...record.account, pubkey: record.publicKey }));

      setActiveDrops(records);
    } catch (error) {
      console.error("Error while getting records:", error);

      const solanaError = ErrorHandler.handleSolanaError(error, 'fetchDropRecords');
      notify({
        type: "error",
        message: getUserFriendlyMessage(solanaError),
        description: solanaError.details || solanaError.message
      });
    } finally {
      isFetchingRef.current = false;
    }
  }, [connectedWallet.connected, getProvider, program]);

  useEffect(() => {
    if (connectedWallet.connected) {
      fetchDropRecords();
    } else {
      setActiveDrops([]);
      setSelectedDrops([]);
    }
  }, [connectedWallet.connected, fetchDropRecords]);

  const refund = async (records: Record[]) => {
    let aborted = false;

    try {
      setIsLoading(true);

      if (!connectedWallet.connected) {
        throw ErrorHandler.createError(ErrorCodes.WALLET_NOT_CONNECTED, "Wallet not connected!");
      }

      if (!getProvider) {
        throw ErrorHandler.createError(ErrorCodes.WALLET_NOT_CONNECTED, "Provider not initialized!");
      }

      if (!program) {
        throw ErrorHandler.createError(ErrorCodes.PROGRAM_NOT_INITIALIZED, "Program instance not initialized!");
      }

      const { blockhash, lastValidBlockHeight } = await getProvider.connection.getLatestBlockhash(COMMITMENT_LEVEL);

      const transactions: Transaction[] = [];

      for (const record of records) {
        const tx = await program.methods
          .refund()
          .accounts({
            sender: getProvider.publicKey,
          })
          .accountsPartial({
            record: record.pubkey,
          })
          .transaction();
        tx.feePayer = getProvider.publicKey;
        tx.recentBlockhash = blockhash;
        transactions.push(tx);
      }

      const signedTxs = await connectedWallet.signAllTransactions(transactions);
      const signatures: string[] = [];
      const signatureToRecordPubkey = new Map<string, string>();

      for (let i = 0; i < signedTxs.length; i++) {
        if (aborted) break;

        const signed = signedTxs[i];
        const record = records[i];

        if (i > 0) {
          await delay(RPC_RATE_LIMIT_DELAY_MS);
        }

        try {
          const txid = await getProvider.connection.sendRawTransaction(
            signed.serialize(),
            { preflightCommitment: COMMITMENT_LEVEL, maxRetries: 1 }
          );
          signatures.push(txid);
          signatureToRecordPubkey.set(txid, record.pubkey.toBase58());
        } catch (error) {
          const solanaError = ErrorHandler.handleSolanaError(error, 'sendRawTransaction');
          notify({
            type: "error",
            message: getUserFriendlyMessage(solanaError),
            description: solanaError.details || solanaError.message,
          });
          console.error("Error while refunding drop (sendRawTransaction):", error);
        }
      }

      const pending = new Set(signatures);

      while (pending.size > 0 && !aborted) {
        const sigsArray = Array.from(pending);

        const statusResp = await getProvider.connection.getSignatureStatuses(sigsArray);
        const currentBlockHeight = await getProvider.connection.getBlockHeight();

        sigsArray.forEach((txid, idx) => {
          const info = statusResp.value[idx];

          if (!info) {
            return;
          }

          if (info.err) {
            pending.delete(txid);
            const solanaError = ErrorHandler.handleSolanaError(
              new Error(`Refund transaction failed: ${JSON.stringify(info.err)}`),
              'refund-confirmation'
            );
            notify({
              type: "error",
              message: getUserFriendlyMessage(solanaError),
              description: solanaError.details || solanaError.message,
            });
            console.error("Refund transaction failed:", txid, info.err);
            return;
          }

          const confirmed =
            info.confirmationStatus === 'confirmed' ||
            info.confirmationStatus === 'finalized';

          if (confirmed) {
            pending.delete(txid);
            const recordPubkey = signatureToRecordPubkey.get(txid);
            if (recordPubkey) {
              setActiveDrops((prev) => prev.filter((record) => record.pubkey.toBase58() !== recordPubkey));
            }
            notify({
              type: "success",
              message: `Successfully refunded drop!`,
              txid,
            });
            console.log("Successfully refunded drop:", txid, info);
          }
        });

        if (pending.size === 0) {
          break;
        }

        if (currentBlockHeight > lastValidBlockHeight) {
          pending.forEach((txid) => {
            const solanaError = ErrorHandler.handleSolanaError(
              new Error('Refund transaction expired before confirmation'),
              'refund-confirmation-expired'
            );
            notify({
              type: "error",
              message: getUserFriendlyMessage(solanaError),
              description: solanaError.details || solanaError.message,
            });
            console.error("Refund transaction expired before confirmation:", txid);
          });
          break;
        }

        await delay(CONFIRMATION_POLL_INTERVAL_MS);
      }
    } catch (error) {
      let errorMessage = "Error while building or signing transactions!";
      let errorDescription = "An unexpected error occurred";

      if (isAppError(error)) {
        errorMessage = getUserFriendlyMessage(error);
        errorDescription = error.details || error.message;
      } else {
        const solanaError = ErrorHandler.handleSolanaError(error, 'refund');
        errorMessage = getUserFriendlyMessage(solanaError);
        errorDescription = solanaError.details || solanaError.message;
      }

      notify({
        type: "error",
        message: errorMessage,
        description: errorDescription,
      });
      console.error("Error while building or signing transactions:", error);
    } finally {
      setIsLoading(false);
      setSelectedDrops([]);
    }

    return () => {
      aborted = true;
    };
  };

  const onClick = useCallback(async () => {
    if (isLoading) return;
    refund(selectedDrops);
  }, [isLoading, selectedDrops, refund]);

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col">
        <h4 className="text-2x1 md:text-3xl text-center text-slate-300 my-2">
          <p>Take back what wasn&apos;t claimed!</p>
          <p className="text-slate-500 text-2x1 leading-relaxed">
            If the receiver hasn&apos;t claimed their drop, you can refund it here.
            Select an unclaimed drop from the list and hit the refund button to
            get your SOL back.
          </p>
        </h4>
        {connectedWallet.connected &&
          (activeDrops.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-nova">
                Unclaimed Drops
              </h2>
              <div className="flex flex-col items-center gap-4">
                {activeDrops.map((drop) => {
                  const isSelected = selectedDrops.some(sel => sel.pubkey.toBase58() === drop.pubkey.toBase58());
                  return (
                    <div
                      key={drop.pubkey.toBase58()}
                      className={`w-full md:w-1/2 cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 shadow-md bg-slate-900 border-gray-700 hover:border-triton ${isSelected ? 'border-fuchsia-500 ring-2 ring-vortex' : ''}`}
                      onClick={() => {
                        setSelectedDrops(prev => {
                          const exists = prev.some(sel => sel.pubkey.toBase58() === drop.pubkey.toBase58());
                          if (exists) {
                            return prev.filter(sel => sel.pubkey.toBase58() !== drop.pubkey.toBase58());
                          } else {
                            return [...prev, drop];
                          }
                        });
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="mb-2 md:mb-0 text-xs md:text-sm text-slate-400 break-all">
                          {drop.pubkey.toBase58()}
                        </div>
                        <div className="mb-2 md:mb-0 text-lg text-nova font-semibold md:ml-4">
                          {drop.amount / LAMPORTS_PER_SOL} SOL
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col items-center mt-8 font-orbitron">
                {isLoading && <SignActionLoader />}
                <button
                  className="group w-60 m-4 btn animate-pulse bg-gradient-to-br from-vortex to-nova hover:from-white hover:to-nova text-nimbus"
                  onClick={onClick}
                  disabled={!connectedWallet.connected || selectedDrops.length === 0 || isLoading}
                >
                  <div className="hidden group-disabled:block text-white/35">
                    {isLoading ? 'Processing...' : (!connectedWallet.connected ? 'Wallet not connected' : 'Select at least one drop')}
                  </div>
                  <span className="block group-disabled:hidden">Refund</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-2xl leading-relaxed">
              No unclamed drops
            </div>
          ))}
      </div>
    </div>
  );
};

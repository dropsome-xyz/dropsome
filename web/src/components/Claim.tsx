import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { ErrorHandler, ErrorCodes, getUserFriendlyMessage, isAppError } from "../utils/errorHandler";
import { IDL_OBJECT, getApiToken } from "../utils/constants";

import { Dropsome } from "../idl/dropsome"
import { Record } from "types/record";
import Link from "next/link";
import { SignActionLoader } from "./SignActionLoader";

export const Claim: FC = () => {
    const connectedWallet = useWallet();
    const { connection } = useConnection();
    const [phrase, setPhrase] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isFetchingRecordRef = useRef(false);

    const getProvider = useMemo(() => {
        if (!connectedWallet.connected) return null;
        const provider = new AnchorProvider(connection, connectedWallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    }, [connection, connectedWallet]);

    const program = useMemo(() => {
        if (!getProvider) return null;
        return new Program<Dropsome>(IDL_OBJECT, getProvider);
    }, [getProvider]);

    function extractEncryptedMnemonic(): string | null {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const value = urlParams.get('data');
        return value;
    }

    useEffect(() => {
        const getPassphrase = async () => {
            try {
                const encryptedMnemonic = extractEncryptedMnemonic();

                if (!encryptedMnemonic) {
                    throw ErrorHandler.createError(
                        ErrorCodes.VALIDATION_ERROR,
                        "Missing claim data",
                        "No encrypted mnemonic found in URL"
                    );
                }

                const response = await fetch("/api/claim/passphrase", {
                    method: "POST",
                    headers: {
                        "x-api-token": getApiToken(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ encryptedMnemonic }),
                });

                if (!response.ok) {
                    const { error } = await response.json();
                    const appError = ErrorHandler.handleApiError(
                        new Error(`HTTP ${response.status}: ${error}`),
                        'getPassphrase'
                    );
                    throw appError;
                }

                const { passphrase } = await response.json();
                setPhrase(passphrase);
            } catch (error) {
                console.error('Error while getting passphrase:', error);

                let errorMessage = "Failed to load secret phrase";
                let errorDescription = "An unexpected error occurred";

                if (isAppError(error)) {
                    errorMessage = getUserFriendlyMessage(error);
                    errorDescription = error.details || error.message;
                }

                notify({
                    type: "error",
                    message: errorMessage,
                    description: errorDescription
                });
            }
        };

        getPassphrase();
    }, []);

    const claim = useCallback(async (record: Record) => {
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

            const signature = await program.methods
                .claim()
                .accounts({
                    receiver: getProvider.publicKey,
                    sender: record.sender.toBase58(),
                })
                .accountsPartial({
                    record: record.pubkey,
                })
                .rpc();

            notify({ type: "success", message: 'Successfully claimed some drop!', txid: signature });
            console.log("Successfully claimed some drop: " + signature);
        } catch (error) {
            let errorMessage = "Error while claiming drop!";
            let errorDescription = "An unexpected error occurred";

            if (isAppError(error)) {
                errorMessage = getUserFriendlyMessage(error);
                errorDescription = error.details || error.message;
            } else {
                const solanaError = ErrorHandler.handleSolanaError(error, 'claim');
                errorMessage = getUserFriendlyMessage(solanaError);
                errorDescription = solanaError.details || solanaError.message;
            }

            notify({
                type: "error",
                message: errorMessage,
                description: errorDescription
            });
            console.error("Error while claiming drop:", error);
        } finally {
            setIsLoading(false);
        }
    }, [connectedWallet.connected, getProvider, program]);

    useEffect(() => {
        if (!connectedWallet.connected || !getProvider || !program) return;
        if (isFetchingRecordRef.current) return;

        let cancelled = false;

        const fetchDropRecord = async () => {
            try {
                isFetchingRecordRef.current = true;

                // Find the record for the current wallet
                const records = await program.account.record.all([
                    {
                        memcmp: {
                            offset: 8 + 32, // Skip discriminator + sender
                            bytes: getProvider.publicKey.toBase58(),
                        }
                    }
                ]);

                if (cancelled || !connectedWallet.connected || !getProvider || !program) return;

                const record = records[0]; // Only one record can be existing for the current wallet
                if (record) {
                    console.log("Found drop record:", record.publicKey.toBase58());
                    claim({ ...record.account, pubkey: record.publicKey });
                } else {
                    console.log("No drop record found for this wallet");
                    notify({
                        type: "error",
                        message: "No drop found for this wallet. Make sure you're using the correct wallet, or you may have already claimed your drop."
                    });
                }
            } catch (error) {
                if (cancelled || !connectedWallet.connected || !getProvider || !program) return;

                console.error("Error while getting records:", error);
                const solanaError = ErrorHandler.handleSolanaError(error, 'fetchDropRecord');
                notify({
                    type: "error",
                    message: getUserFriendlyMessage(solanaError),
                    description: solanaError.details || solanaError.message
                });
            } finally {
                isFetchingRecordRef.current = false;
            }
        };

        fetchDropRecord();

        return () => {
            cancelled = true;
        };
    }, [connectedWallet.connected, getProvider, program, claim]);

    return (
        <div className="mx-auto p-4 max-w-4xl">
            <div className="flex flex-col">
                {isLoading && <SignActionLoader />}
                <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
                    <p>Just a few easy steps to get your SOL!</p>
                    <ol className="list-decimal list-outside text-slate-300 text-lg space-y-6 mt-4 mb-6 max-w-md mx-auto text-start">
                        <li className="ml-6">
                            <p className="font-semibold">Get a Wallet</p>
                            <p className="text-slate-500 mt-2 text-base">
                                Download a wallet app to manage your SOL:
                            </p>
                            <ul className="list-disc list-outside ml-6 mt-2 text-slate-400 space-y-1 text-base">
                                <li>
                                    <Link href="https://phantom.app/" className="text-indigo-500 hover:text-indigo-300">
                                        Phantom Wallet
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://solflare.com/" className="text-indigo-500 hover:text-indigo-300">
                                        Solflare Wallet
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li className="ml-6">
                            <span className="font-semibold">Import the Secret Phrase</span>
                            <p className="text-slate-500 mt-2 text-base">
                                Open the wallet app, select &quot;Import Wallet,&quot; and enter the secret phrase shown below.
                            </p>
                        </li>
                        <li className="ml-6">
                            <span className="font-semibold">Complete the Claim</span>
                            <p className="text-slate-500 mt-2 text-base">
                                After setting up the wallet, come back to this link, connect your wallet, and confirm the transfer. Your SOL will land in your new wallet!
                            </p>
                        </li>
                    </ol>
                </h4>
                {phrase && (<div>
                    <h2 className="text-2xl font-bold mb-4 text-nova">Your Secret Phrase</h2>
                    <div className="relative group max-w-xs mx-auto">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-vortex to-vortex rounded-lg blur opacity-50 animate-tilt"></div>
                        <div className="relative max-w-xs mx-auto textarea textarea-primary textarea-lg bg-primary border-2 border-[#5252529f] p-6 px-10 my-2 text-start">
                            <p className="text-2xl">{phrase}</p>
                        </div>
                    </div>
                </div>)}
            </div>
        </div>
    );
};

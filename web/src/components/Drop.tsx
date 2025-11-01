import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useState, useEffect, useRef, useMemo } from "react";
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, web3, BN, setProvider, utils } from "@coral-xyz/anchor";
import { SignActionLoader } from "./SignActionLoader";
import { ErrorHandler, ErrorCodes, getUserFriendlyMessage, isAppError } from "../utils/errorHandler";
import { IDL_OBJECT, getApiToken, getBaseUrl } from "../utils/constants";
import { AppState } from "../types/appState";

import { Dropsome } from "../idl/dropsome"
import { PublicKey } from "@solana/web3.js";
import { ResponseData } from "pages/api/drop/receiver";

const FALLBACK_MIN_DROP_AMOUNT_LAMPORTS = 1000000;

export const Drop: FC = () => {
    const connectedWallet = useWallet();
    const { connection } = useConnection();
    const [amount, setAmount] = useState<number | null>(null);
    const [link, setLink] = useState("");
    const [signature, setSignature] = useState("");
    const [isDialogShown, setIsDialogShown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [appState, setAppState] = useState<AppState | null>(null);
    const isFetchingAppStateRef = useRef(false);

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

    useEffect(() => {
        const fetchAppState = async () => {
            if (isFetchingAppStateRef.current || !connectedWallet.connected || !program) {
                return;
            }

            try {
                isFetchingAppStateRef.current = true;
                const [appStatePda] = web3.PublicKey.findProgramAddressSync([
                    utils.bytes.utf8.encode("app_state")
                ], program.programId);
                const appState = await program.account.appState.fetch(appStatePda);
                setAppState(appState as AppState);
            } catch (error) {
                console.error("Error fetching app state:", error);
            } finally {
                isFetchingAppStateRef.current = false;
            }
        };

        if (connectedWallet.connected) {
            fetchAppState();
        } else {
            setAppState(null);
        }
    }, [connectedWallet.connected, program]);

    async function createReceiver(): Promise<ResponseData> {
        try {
            const response = await fetch("/api/drop/receiver", {
                method: "GET",
                headers: { "x-api-token": getApiToken() }
            });

            if (!response.ok) {
                const { error } = await response.json();
                const appError = ErrorHandler.handleApiError(
                    new Error(`HTTP ${response.status}: ${error}`),
                    'createReceiver'
                );
                throw appError;
            }
            return await response.json() as ResponseData;
        } catch (error) {
            if (isAppError(error)) {
                throw error;
            }
            throw ErrorHandler.handleApiError(error, 'createReceiver');
        }
    }

    function buildLink(encryptedMnemonic: string): string {
        const link = `${getBaseUrl()}/claim?data=${encryptedMnemonic}`;
        setLink(link);
        console.log(`Claim link: ${link}`);
        return link;
    }

    const drop = useCallback(async () => {
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

            const minDropAmount = appState?.minDropAmount ?? FALLBACK_MIN_DROP_AMOUNT_LAMPORTS;
            if (!amount || amount * web3.LAMPORTS_PER_SOL < minDropAmount) {
                throw ErrorHandler.handleValidationError(
                    'amount',
                    amount,
                    `must be at least ${minDropAmount / web3.LAMPORTS_PER_SOL} SOL`
                );
            }
            if (!appState) {
                throw ErrorHandler.createError(ErrorCodes.UNKNOWN_ERROR, "App state not loaded!");
            }
            if (!appState.treasury) {
                throw ErrorHandler.createError(ErrorCodes.UNKNOWN_ERROR, "Treasury address not found in app state!");
            }

            console.log(`Trying to drop ${amount} SOL`);

            const { address, encryptedMnemonic } = await createReceiver();

            buildLink(encryptedMnemonic);

            const txid = await program.methods.drop(new BN(amount * web3.LAMPORTS_PER_SOL))
                .accounts({
                    sender: getProvider.publicKey,
                    receiver: address,
                })
                .remainingAccounts([
                    {
                        pubkey: new PublicKey(appState.treasury),
                        isWritable: true,
                        isSigner: false,
                    }
                ])
                .rpc();
            setSignature(txid);

            notify({ type: "success", message: "Successfully dropped some funds!", txid: txid });
            console.log(`Successfully dropped some funds: ${txid}`)
        } catch (error) {
            setSignature("");

            let errorMessage = "Error while dropping funds!";
            let errorDescription = "An unexpected error occurred";

            if (isAppError(error)) {
                errorMessage = getUserFriendlyMessage(error);
                errorDescription = error.details || error.message;
            } else {
                const solanaError = ErrorHandler.handleSolanaError(error, 'drop');
                errorMessage = getUserFriendlyMessage(solanaError);
                errorDescription = solanaError.details || solanaError.message;
            }

            notify({
                type: "error",
                message: errorMessage,
                description: errorDescription
            });
            console.error("Error while dropping funds:", error);
        } finally {
            setIsLoading(false);
        }
    }, [connectedWallet.connected, amount, appState, getProvider, program]);

    const onClick = useCallback(async () => {
        if (isLoading) return;
        await drop();
    }, [drop, isLoading]);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputAmount = event.target.value;

        if (inputAmount === "") {
            setAmount(null);
            return;
        }

        const regex = /^(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        if (regex.test(inputAmount)) {
            const numericValue = parseFloat(inputAmount);
            setAmount(numericValue);
        }
    };

    const handleDialogAction = (isConfirmed: boolean) => {
        if (isConfirmed) {
            setSignature("");
            setLink("");
        }
        setIsDialogShown(false);
    }

    return (
        <div className="md:hero mx-auto py-4">
            <div className="md:hero-content flex flex-col items-center">
                {/* Header */}
                <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
                    <p>Kickstart someone&apos;s crypto journey!</p>
                    <p className='text-slate-500 text-2x1 leading-relaxed'>Enter the amount of SOL to drop. The app will create a magic link for the receiver, even if they don&apos;t have a wallet. Simple as that!</p>
                </h4>
                <h2 className="text-2xl font-bold text-nova">Enter Amount to Drop</h2>

                {/* Amount Input */}
                <div className="relative group w-60 m-2 custom-number-input font-orbitron">
                    <div className="absolute -inset-0.5 bg-cyan-500 rounded-lg blur opacity-40 animate-tilt"></div>
                    <input
                        type="number"
                        value={amount !== null ? amount : ""}
                        onChange={handleAmountChange}
                        className="relative border-2 border-vortex text-lg font-semibold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-primary placeholder-gray-400 text-nova focus:ring-blue-500 focus:border-blue-500 pr-10 no-spinner"
                        placeholder="0.00"
                        required
                        step="1"
                        min="0"
                        disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center h-10 select-none">
                        <button
                            type="button"
                            className="text-vortex hover:text-fuchsia-300 text-lg leading-none p-0.5"
                            onClick={() => setAmount(prev => (prev !== null ? +(prev + 1).toFixed(2) : 1))}
                            tabIndex={-1}
                            aria-label="Increase amount"
                            disabled={isLoading}
                        >
                            ▵
                        </button>
                        <button
                            type="button"
                            className="text-vortex hover:text-fuchsia-300 text-lg leading-none p-0.5"
                            onClick={() => setAmount(prev => (prev !== null && prev > 1 ? +(prev - 1).toFixed(2) : 0))}
                            tabIndex={-1}
                            aria-label="Decrease amount"
                            disabled={isLoading}
                        >
                            ▿
                        </button>
                    </div>
                </div>

                {/* Fee Info Block */}
                <div className="w-60 m-2 p-3 bg-slate-800/50 border border-slate-600 rounded-lg">
                    <div className="text-sm text-slate-400 mb-2">
                        App fee: {appState?.feeBasisPoints !== undefined && appState?.feeBasisPoints !== null ? <span className="text-nova font-medium">{(appState.feeBasisPoints / 100).toFixed(2)}%</span> : '...'} per drop
                    </div>
                    {amount && appState?.feeBasisPoints !== undefined && appState?.feeBasisPoints !== null && (
                        <div className="text-xs flex justify-evenly items-center">
                            <span className="text-slate-400">Fee charged:</span>
                            <span className="text-nova font-medium">
                                {(() => {
                                    const fee = amount * appState.feeBasisPoints / 10000;
                                    if (fee > 0 && fee < 0.0001) {
                                        return '< 0.0001 SOL';
                                    }
                                    return `${parseFloat(fee.toFixed(4)).toString()} SOL`;
                                })()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Drop Button */}
                {!signature && <div className="flex flex-col items-center mt-4 font-orbitron">
                    {isLoading && <SignActionLoader />}
                    <button
                        className="group w-60 m-4 btn animate-pulse bg-gradient-to-br from-vortex to-nova hover:from-white hover:to-nova text-nimbus"
                        onClick={onClick}
                        disabled={
                            !connectedWallet.connected ||
                            isLoading ||
                            !amount ||
                            (appState ? amount * web3.LAMPORTS_PER_SOL < appState.minDropAmount : amount * web3.LAMPORTS_PER_SOL < FALLBACK_MIN_DROP_AMOUNT_LAMPORTS)
                        }
                    >
                        <div className="hidden group-disabled:block text-white/35">
                            {isLoading ? "Processing..." :
                                !connectedWallet.connected ? "Wallet not connected" : "Drop"}
                        </div>
                        <span className="block group-disabled:hidden" >
                            Drop
                        </span>
                    </button>
                </div>
                }

                {/* Claim Link */}
                {(signature && connectedWallet.connected) && (<div>
                    <h2 className="text-2xl font-bold mb-4 text-nova">Your Claim Link</h2>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-vortex to-vortex rounded-lg blur opacity-40 animate-tilt" />
                        <div className="relative max-w-xs max-sm:max-w-[280px] mx-auto textarea textarea-primary textarea-lg bg-primary border-2 border-[#5252529f] p-6 px-10 my-2 text-start">
                            <p className="break-words">{link}</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(link);
                                    notify({ type: "success", message: "Link copied to clipboard!" });
                                }}
                                className="absolute top-2 right-2 p-0 bg-transparent border-none cursor-pointer">
                                <img src="/content_copy.svg" alt="Copy the claim link" width={20} height={20} />
                            </button>
                            <button
                                onClick={() => {
                                    setIsDialogShown(true)
                                }}
                                className="absolute bottom-2 right-2 p-0 bg-transparent border-none cursor-pointer">
                                <img src="/cancel.svg" alt="Hide the claim link" width={20} height={20} />
                            </button>
                        </div>
                    </div>
                </div>)
                }
            </div>

            {/* Link Warning Dialog */}
            {isDialogShown && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div
                        className={`bg-abyss rounded-lg p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dialog-title"
                    >
                        <h3 id="dialog-title" className="text-lg font-medium text-nova mb-2">Don&apos;t Lose the Link!</h3>
                        <p className="mb-4">
                            The funds are already dropped, and this link is your golden ticket! Make sure you&apos;ve copied it before closing, or the receiver won&apos;t be able to claim. If you missed it, you&apos;ll need to refund the drop and start over.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 text-accent hover:text-secondary font-medium text-vortex"
                                onClick={() => handleDialogAction(false)}
                            >
                                Copy Link
                            </button>
                            <button
                                className="px-4 py-2 bg-warning text-white rounded hover:bg-error font-medium"
                                onClick={() => handleDialogAction(true)}
                            >
                                Close Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

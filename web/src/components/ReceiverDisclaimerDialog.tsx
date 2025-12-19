import { FC } from "react";
import Link from "next/link";

interface ReceiverDisclaimerDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReceiverDisclaimerDialog: FC<ReceiverDisclaimerDialogProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div
                className={`bg-abyss rounded-lg p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="disclaimer-title"
            >
                <h3 id="disclaimer-title" className="text-lg font-medium text-nova mb-4 text-center">Security & Safety Tips</h3>
                <div className="mb-4 space-y-2 text-sm text-slate-300 text-left">
                    <p>
                        <strong className="text-nova">Welcome to crypto!</strong> This wallet is your entry point. Use it to receive the drop and start your journey.
                    </p>
                    <p>
                        <strong className="text-nova">Set up your own wallet.</strong> After claiming, create a new Solana wallet where only you know the seed phrase, and transfer your SOL there.
                    </p>
                    <p>
                        <strong className="text-nova">Best practice for shared wallets.</strong> Since this wallet was created for the drop, it&apos;s recommended to use it temporarily and move funds to your personal wallet.
                    </p>
                    <p>
                        <strong className="text-nova">Use official wallet apps.</strong> Install wallet apps from official websites or app stores. Always verify you&apos;re using legitimate software.
                    </p>
                </div>
                <div className="mb-4 text-s text-slate-400 text-center">
                    <Link 
                        href="https://docs.dropsome.xyz/legal/security-disclaimer/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-vortex hover:text-nova underline"
                    >
                        Read more about security
                    </Link>
                </div>
                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 bg-warning text-white rounded hover:bg-error font-medium"
                        onClick={onClose}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};


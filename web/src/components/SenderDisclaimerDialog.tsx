import { FC } from "react";
import Link from "next/link";

interface SenderDisclaimerDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SenderDisclaimerDialog: FC<SenderDisclaimerDialogProps> = ({ isOpen, onClose }) => {
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
                        <strong className="text-nova">Perfect for onboarding.</strong> Dropsome is designed for small transfers to help friends get started with crypto.
                    </p>
                    <p>
                        <strong className="text-nova">Share links securely.</strong> Send the claim link only to the intended person, preferably over a private, end-to-end encrypted channel.
                    </p>
                    <p>
                        <strong className="text-nova">Clean up after use.</strong> After the drop is claimed or refunded, remove the link from chats and notes for good housekeeping.
                    </p>
                    <p>
                        <strong className="text-nova">Refund option available.</strong> You can always recover unclaimed funds using the refund feature if needed.
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


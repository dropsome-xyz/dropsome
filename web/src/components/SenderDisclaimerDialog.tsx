import { FC } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface SenderDisclaimerDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SenderDisclaimerDialog: FC<SenderDisclaimerDialogProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation('common');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div
                className={`bg-abyss rounded-lg p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="disclaimer-title"
            >
                <h3 id="disclaimer-title" className="text-lg font-medium text-nova mb-4 text-center">{t('security.title')}</h3>
                <div className="mb-4 space-y-2 text-sm text-slate-300 text-left">
                    <p>
                        <strong className="text-nova">{t('security.sender.onboardingTitle')}</strong> {t('security.sender.onboardingBody')}
                    </p>
                    <p>
                        <strong className="text-nova">{t('security.sender.shareTitle')}</strong> {t('security.sender.shareBody')}
                    </p>
                    <p>
                        <strong className="text-nova">{t('security.sender.cleanupTitle')}</strong> {t('security.sender.cleanupBody')}
                    </p>
                    <p>
                        <strong className="text-nova">{t('security.sender.refundTitle')}</strong> {t('security.sender.refundBody')}
                    </p>
                </div>
                <div className="mb-4 text-s text-slate-400 text-center">
                    <Link
                        href="https://docs.dropsome.xyz/legal/security-disclaimer/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-vortex hover:text-nova underline"
                    >
                        {t('security.readMore')}
                    </Link>
                </div>
                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 bg-warning text-white rounded hover:bg-error font-medium"
                        onClick={onClose}
                    >
                        {t('security.gotIt')}
                    </button>
                </div>
            </div>
        </div>
    );
};


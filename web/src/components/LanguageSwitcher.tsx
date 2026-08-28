import { FC } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/config';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ compact = false }) => {
    const { t } = useTranslation('common');
    const router = useRouter();

    // Navigating (not changeLanguage) is what ships the other locale's namespaces
    // and regenerates <html lang> from _document.
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(router.asPath, router.asPath, { locale: e.target.value });
    };

    // router.locale is always one of the configured locales; i18n.language could
    // hold a region tag and leave the control unselected.
    const value = router.locale ?? router.defaultLocale;

    if (compact) {
        return (
            <label className="cursor-pointer label">
                <a>{t('language.label')}</a>
                <select
                    className="select select-sm bg-base-100 text-base-content w-38 border-none focus:border-vortex focus:ring-0 focus:outline-none"
                    value={value}
                    onChange={handleChange}
                >
                    {LANGUAGES.map(({ code, nativeName }) => (
                        <option key={code} value={code}>
                            {nativeName}
                        </option>
                    ))}
                </select>
            </label>
        );
    }

    return (
        <select
            className="select select-bordered select-sm w-full max-w-xs bg-black text-white"
            value={value}
            onChange={handleChange}
        >
            {LANGUAGES.map(({ code, nativeName }) => (
                <option key={code} value={code}>
                    {nativeName}
                </option>
            ))}
        </select>
    );
};

import type { FC } from "react"
import { Logo } from "./Logo"
import { SocialLinks } from "./SocialLinks"
import { useTranslation } from "react-i18next"

export const Footer: FC = () => {
    const { t } = useTranslation('common');
    return (
        <div className="flex w-full font-orbitron">
            <footer className="mt-auto border-t-2 border-[#141414] bg-black hover:text-white w-full">
                <div className="container mx-auto py-8 px-4">
                    <div className="flex flex-col md:flex-row justify-center md:space-x-16 items-center">
                        <div className="flex flex-col items-center">
                            <div className="mb-2">
                                <Logo size={22} fontSize="text-3xl" />
                            </div>
                            <SocialLinks />
                            <div className="mt-2 text-center font-normal tracking-tight text-secondary">
                                {process.env.NEXT_PUBLIC_COPYRIGHT}
                            </div>
                        </div>

                        <div className="flex flex-col items-center mt-4 md:mt-0 md:self-start md:pt-1">
                            <div className="flex flex-col space-y-5 items-center">
                                <a
                                    href={process.env.NEXT_PUBLIC_DOCS_URL}
                                    className="text-secondary hover:text-white transition duration-150 ease-in-out"
                                >
                                    {t('footer.documentation')}
                                </a>
                                <a
                                    href={process.env.NEXT_PUBLIC_PRIVACY_URL}
                                    className="text-secondary hover:text-white transition duration-150 ease-in-out"
                                >
                                    {t('footer.privacyPolicy')}
                                </a>
                                <a
                                    href={process.env.NEXT_PUBLIC_TERMS_URL}
                                    className="text-secondary hover:text-white transition duration-150 ease-in-out"
                                >
                                    {t('footer.termsOfService')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}


import type { FC, ReactNode } from "react"
import { useRouter } from "next/router"

type SocialLinkProps = {
    href: string
    label: string
    children: ReactNode
}

const SocialLink: FC<SocialLinkProps> = ({ href, label, children }) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-9 w-9 m-1 items-center justify-center rounded-full border-white text-secondary transition duration-150 ease-in-out hover:text-white focus:outline-none focus:ring-0"
        >
            {children}
        </a>
    )
}

const XIcon: FC = () => (
    <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="x-twitter"
        className="h-4 w-4"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
    >
        <path
            fill="currentColor"
            d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
        ></path>
    </svg>
)

const GitHubIcon: FC = () => (
    <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="github"
        className="h-4 w-4"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 496 512"
    >
        <path
            fill="currentColor"
            d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
        ></path>
    </svg>
)

const LinkedInIcon: FC = () => (
    <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="linkedin"
        className="h-4 w-4"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
    >
        <path
            fill="currentColor"
            d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
        ></path>
    </svg>
)

const PerplexityIcon: FC = () => (
    <svg
        aria-hidden="true"
        focusable="false"
        data-icon="perplexity"
        className="h-4 w-4"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
    >
        <path
            fill="currentColor"
            d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z"
        />
    </svg>
)

export const SocialLinks: FC = () => {
    const router = useRouter()
    const locale = router.locale ?? router.defaultLocale ?? "en"
    const language = new Intl.DisplayNames(["en"], { type: "language" }).of(locale) ?? locale
    const askAiPrompt =
        `Explain what Dropsome does and answer my questions about its features and how to use it. Read https://docs.dropsome.xyz/llms-full.txt for the full documentation. Answer in ${language} (locale: ${locale}).`
    const socialLinks = [
        {
            href: process.env.NEXT_PUBLIC_TWITTER_URL ?? "#",
            label: "X / Twitter",
            icon: <XIcon />,
        },
        {
            href: process.env.NEXT_PUBLIC_GITHUB_URL ?? "#",
            label: "GitHub",
            icon: <GitHubIcon />,
        },
        {
            href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "#",
            label: "LinkedIn",
            icon: <LinkedInIcon />,
        },
        {
            href: `https://www.perplexity.ai/search?q=${encodeURIComponent(askAiPrompt)}`,
            label: "Ask AI",
            icon: <PerplexityIcon />,
        },
    ]

    return (
        <div className="flex">
            {socialLinks.map(({ href, label, icon }) => (
                <SocialLink key={label} href={href} label={label}>
                    {icon}
                </SocialLink>
            ))}
        </div>
    )
}

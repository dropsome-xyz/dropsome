import Link from "next/link";
import { useState } from "react";

interface LogoProps {
    size?: number;
    fontSize?: string;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({
    size = 40,
    fontSize = "text-5xl",
    className = ""
}) => {
    const [imageError, setImageError] = useState(false);

    return (
        <Link href={process.env.NEXT_PUBLIC_BASE_URL || "/"} className={`flex items-baseline space-x-1 ${className}`}>
            {!imageError ? (
                <div className="flex items-end">
                    <img
                        src="/logo.svg"
                        alt="Dropsome Logo"
                        className="object-contain"
                        style={{ width: size, height: "auto" }}
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <span className={`${fontSize} font-bold text-transparent bg-clip-text bg-gradient-to-br from-triton to-vortex`}>
                    D
                </span>
            )}
            <span className={`${fontSize} font-bold text-transparent bg-clip-text bg-gradient-to-br from-triton via-vortex to-nova`}>
                ropsome
            </span>
        </Link>
    );
};

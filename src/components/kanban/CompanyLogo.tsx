'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { getCompanyDomain } from '@/constants/companies';

interface CompanyLogoProps {
    companyName: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: {
        frame: 'h-10 w-10 min-w-10',
        image: 24,
        text: 'text-[10px]',
    },
    md: {
        frame: 'h-12 w-12 min-w-12',
        image: 28,
        text: 'text-[11px]',
    },
    lg: {
        frame: 'h-16 w-16 min-w-16',
        image: 36,
        text: 'text-sm',
    },
};

const getInitials = (companyName: string): string => {
    const words = companyName
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) return 'CO';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export function CompanyLogo({ companyName, size = 'md' }: CompanyLogoProps) {
    const [failedLogo, setFailedLogo] = useState<string | null>(null);
    const initials = getInitials(companyName);
    const config = sizeClasses[size];
    const logoSrc = useMemo(() => {
        const domain = getCompanyDomain(companyName);
        return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${domain}`)}&sz=64`;
    }, [companyName]);
    const logoFailed = failedLogo === logoSrc;

    return (
        <div className={`${config.frame} relative flex items-center justify-center overflow-hidden border border-border bg-secondary`}>
            {logoFailed ? (
                <span className={`font-mono font-bold uppercase tracking-[0.08em] text-primary ${config.text}`}>
                    {initials}
                </span>
            ) : (
                <Image
                    src={logoSrc}
                    alt={`${companyName} logo`}
                    width={config.image}
                    height={config.image}
                    className="object-contain"
                    unoptimized
                    onError={() => setFailedLogo(logoSrc)}
                />
            )}
        </div>
    );
}

'use client';

import { useEffect } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useApplicationStore } from "@/store/applicationStore";
import LetterGlitch from "@/components/backgrounds/LetterGlitch";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { fetchApplications } = useApplicationStore();

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return (
        <>
            <LetterGlitch
                glitchColors={['#a855f7', '#c084fc', '#e879f9']}
                glitchSpeed={50}
                centerVignette={false}
                outerVignette={true}
                smooth={true}
            />
            <div className="flex h-screen overflow-hidden relative z-10">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <TopBar />
                    {children}
                </div>
            </div>
        </>
    );
}


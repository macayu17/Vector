'use client';

import { useEffect } from 'react';
import { TopBar } from "@/components/layout/TopBar";
import { useApplicationStore } from "@/store/applicationStore";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { fetchApplications, loadWorkspaceMetadata } = useApplicationStore();

    useEffect(() => {
        loadWorkspaceMetadata();
        fetchApplications();
    }, [fetchApplications, loadWorkspaceMetadata]);

    return (
        <div className="min-h-screen bg-background">
            <TopBar />
            {children}
        </div>
    );
}

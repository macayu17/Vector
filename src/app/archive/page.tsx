'use client';

import { useState } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Archive as ArchiveIcon,
    Trash2,
    RotateCcw,
    Search,
    Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Logo helper
const getLogoUrl = (companyName: string): string => {
    const normalized = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return `https://img.logo.dev/${normalized}.com?token=pk_VAZ6tvAVQHCDwKeqRr9JYg`;
};

export default function ArchivePage() {
    const { applications, updateApplication, deleteApplication } = useApplicationStore();
    const [searchQuery, setSearchQuery] = useState('');

    // Get rejected and stalled applications as "archived"
    const archivedApps = applications.filter(
        a => a.status === 'REJECTED' || a.status === 'STALLED'
    );

    const filteredApps = archivedApps.filter(
        a => a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRestore = (id: string) => {
        updateApplication(id, { status: 'WISHLIST' });
    };

    const handleDelete = (id: string) => {
        deleteApplication(id);
    };

    return (
        <main className="flex-1 overflow-auto glass">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border">
                            <ArchiveIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Archive</h1>
                            <p className="text-sm text-muted-foreground">
                                Rejected and stalled applications
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search archived applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 glass-card border-0"
                    />
                </div>

                {/* Archived List */}
                {filteredApps.length === 0 ? (
                    <Card className="glass-card p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <ArchiveIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No archived applications</h3>
                        <p className="text-muted-foreground">
                            Rejected and stalled applications will appear here
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredApps.map((app) => (
                            <Card key={app.id} className="glass-card p-4 hover-glow">
                                <div className="flex items-center gap-4">
                                    {/* Logo */}
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                        <img
                                            src={getLogoUrl(app.companyName)}
                                            alt=""
                                            className="w-7 h-7 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${app.companyName.charAt(0)}</span>`;
                                            }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{app.companyName}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
                                    </div>

                                    {/* Status Badge */}
                                    <Badge variant="outline" className={
                                        app.status === 'REJECTED'
                                            ? 'border-red-500/30 text-red-500'
                                            : 'border-amber-500/30 text-amber-500'
                                    }>
                                        {app.status === 'REJECTED' ? 'Rejected' : 'Stalled'}
                                    </Badge>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRestore(app.id)}
                                            className="gap-1 text-primary hover:text-primary"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Restore
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(app.id)}
                                            className="gap-1 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

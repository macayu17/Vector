'use client';

import { useState } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { CompanyLogo } from '@/components/kanban';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Archive as ArchiveIcon,
    Trash2,
    RotateCcw,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

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
        <main className="flex-1 overflow-auto bg-background">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8 border-b border-border pb-6">
                    <p className="editorial-label mb-1">§ IV — Closed files</p>
                    <h1 className="text-3xl font-semibold">Archive</h1>
                    <p className="text-sm text-muted-foreground">
                        Rejected and stalled applications
                    </p>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search archived applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-x-0 border-t-0 pl-7"
                    />
                </div>

                {filteredApps.length === 0 ? (
                    <Card className="p-12 text-center">
                        <ArchiveIcon className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No archived applications</h3>
                        <p className="text-muted-foreground">
                            Rejected and stalled applications will appear here
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredApps.map((app) => (
                            <Card key={app.id} className="p-4 hover-glow">
                                <div className="flex items-center gap-4">
                                    <CompanyLogo companyName={app.companyName} size="sm" />

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-serif text-lg font-semibold truncate">{app.companyName}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
                                    </div>

                                    <Badge variant="outline" className={
                                        app.status === 'REJECTED'
                                            ? 'border-red-500/30 text-red-500'
                                            : 'border-amber-500/30 text-amber-500'
                                    }>
                                        {app.status === 'REJECTED' ? 'Rejected' : 'Stalled'}
                                    </Badge>

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

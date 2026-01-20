'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

export function SearchBar() {
    const { filters, setSearchQuery } = useApplicationStore();
    const [localQuery, setLocalQuery] = useState(filters.searchQuery);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [localQuery, setSearchQuery]);

    // Sync with store
    useEffect(() => {
        setLocalQuery(filters.searchQuery);
    }, [filters.searchQuery]);

    const handleClear = useCallback(() => {
        setLocalQuery('');
        setSearchQuery('');
    }, [setSearchQuery]);

    return (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search companies, roles, notes..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-9 pr-9 bg-background/50 border-border/60 focus:bg-background transition-colors"
            />
            {localQuery && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

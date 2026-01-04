'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Moon, Sun, Plus, Bell, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from '@/components/auth/AuthProvider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
    onAddClick?: () => void;
}

export function TopBar({ onAddClick }: TopBarProps) {
    const { settings } = useSettingsStore();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const isDark = localStorage.getItem('darkMode') === 'true' ||
            (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', String(newDarkMode));
        document.documentElement.classList.toggle('dark', newDarkMode);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    // User info from auth or settings
    const email = user?.email || settings?.email || 'user@example.com';
    const displayName = user?.user_metadata?.full_name ||
        `${settings?.firstName || 'User'} ${settings?.lastName || ''}`.trim();
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    if (!isMounted) return <div className="h-16 border-b border-border/10 glass" />;

    return (
        <header className="flex items-center justify-between h-16 px-6 glass z-20 sticky top-0">
            {/* Left: Search */}
            <div className="flex items-center gap-4">
                <div className="relative w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="search"
                        placeholder="Search applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 bg-background/30 border-primary/20 focus:border-primary/50 focus:bg-background/50 transition-all rounded-xl placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-white/5 data-[state=open]:bg-white/5 rounded-full transition-colors">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                </Button>

                {/* Dark Mode Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="h-10 w-10 hover:bg-white/5 rounded-full transition-colors"
                >
                    {darkMode ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4 text-primary" />}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-10 rounded-full p-0 ring-offset-2 ring-offset-background transition-all hover:ring-2 hover:ring-primary/50">
                            <Avatar className="h-9 w-9 border border-primary/20">
                                <AvatarImage src={user?.user_metadata?.avatar_url || "/avatar.png"} alt={displayName} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white text-xs font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-card p-2 mt-2">
                        <DropdownMenuLabel className="px-2 py-2">
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm">{displayName}</span>
                                <span className="text-xs text-muted-foreground">{email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-primary/10" />
                        <DropdownMenuItem
                            className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer"
                            onClick={() => router.push('/settings')}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/10" />
                        <DropdownMenuItem
                            className="text-destructive rounded-lg focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}


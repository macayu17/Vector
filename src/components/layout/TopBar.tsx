'use client';

import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Moon, Search, Settings, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isDarkTheme, setThemePreference } from '@/lib/theme';
import { useApplicationStore } from '@/store/applicationStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { AppCommandPalette } from './AppCommandPalette';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
    { href: '/dashboard', label: 'Ledger' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/resumes', label: 'Resumes' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/archive', label: 'Archive' },
    { href: '/settings', label: 'Settings' },
];

export function TopBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { filters, setSearchQuery } = useApplicationStore();
    const { settings } = useSettingsStore();
    const { user, signOut } = useAuth();
    const [searchInput, setSearchInput] = useState(filters.searchQuery);
    const [isMounted, setIsMounted] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsMounted(true);
            setDarkMode(isDarkTheme());
        });

        const handleThemeChange = (event: Event) => {
            const { darkMode: nextDarkMode } = (event as CustomEvent<{ darkMode: boolean }>).detail;
            setDarkMode(nextDarkMode);
        };

        window.addEventListener('careerflow-theme-change', handleThemeChange);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('careerflow-theme-change', handleThemeChange);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchInput, setSearchQuery]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setSearchInput(filters.searchQuery));
        return () => cancelAnimationFrame(frame);
    }, [filters.searchQuery]);

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
        const nextDarkMode = !darkMode;
        const rect = event.currentTarget.getBoundingClientRect();
        setThemePreference(nextDarkMode, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
    };

    const email = user?.email || settings?.email || 'user@example.com';
    const displayName = user?.user_metadata?.full_name ||
        `${settings?.firstName || 'User'} ${settings?.lastName || ''}`.trim();
    const initials = displayName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    if (!isMounted) {
        return <div className="h-16 border-b border-border bg-background" />;
    }

    return (
        <header className="sticky top-0 z-30 border-b border-border bg-background/95">
            <AppCommandPalette />
            <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-6 px-5 sm:px-8">
                <Link href="/dashboard" className="flex min-w-fit items-baseline gap-2">
                    <span className="font-serif text-xl font-semibold leading-none text-foreground">Vector</span>
                    <span className="editorial-label text-primary">Job Ledger</span>
                </Link>

                <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 md:flex">
                    {navItems.map(({ href, label }) => {
                        const isActive = pathname === href || pathname.startsWith(`${href}/`);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'editorial-link inline-flex items-center border-b border-transparent py-6',
                                    isActive && 'border-primary text-primary'
                                )}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto hidden w-60 shrink-0 items-center xl:flex">
                    <div className="relative w-full">
                        <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search applications..."
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            className="h-9 border-x-0 border-t-0 bg-transparent pl-7 pr-12"
                        />
                        <span className="editorial-label absolute right-0 top-1/2 -translate-y-1/2 text-[10px]" aria-label="Command K">
                            ⌘ K
                        </span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={toggleTheme}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="shrink-0 p-0"
                >
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-10 rounded-none p-0">
                            <Avatar className="h-8 w-8 rounded-none border border-border">
                                {user?.user_metadata?.avatar_url && (
                                    <AvatarImage src={user.user_metadata.avatar_url} alt={displayName} />
                                )}
                                <AvatarFallback className="rounded-none bg-transparent text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mt-2 w-60 p-2">
                        <DropdownMenuLabel className="px-2 py-2">
                            <span className="block font-serif text-base text-foreground">{displayName}</span>
                            <span className="block truncate text-xs text-muted-foreground">{email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="grid grid-cols-2 gap-1 p-1 md:hidden">
                            {navItems.map(({ href, label }) => (
                                <DropdownMenuItem key={href} asChild>
                                    <Link href={href}>{label}</Link>
                                </DropdownMenuItem>
                            ))}
                        </div>
                        <DropdownMenuSeparator className="md:hidden" />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

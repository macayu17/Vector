'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart3,
    Archive,
    Settings,
    Briefcase,
    Calendar,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Archive', href: '/archive', icon: Archive },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex flex-col w-[220px] h-screen glass border-r border-border/50 relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
                <img
                    src="/logo.png"
                    alt="Vector Logo"
                    className="w-10 h-10 object-contain"
                />
                <div>
                    <span className="font-bold text-lg">Vector</span>
                    <p className="text-[10px] text-muted-foreground -mt-0.5">Modern Job Tracking</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
                <ul className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-primary text-primary-foreground font-medium'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Stats Card */}
            <div className="mx-3 mb-4 p-4 rounded-xl stats-card">
                <p className="text-xs font-medium text-muted-foreground mb-3">Quick Stats</p>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-background/30 text-center">
                        <p className="text-lg font-bold text-primary">5</p>
                        <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/30 text-center">
                        <p className="text-lg font-bold text-green-500">1</p>
                        <p className="text-[10px] text-muted-foreground">Offers</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

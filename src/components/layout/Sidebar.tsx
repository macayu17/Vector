'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart3,
    Archive,
    Settings,
    Calendar,
    FileText,
} from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Archive', href: '/archive', icon: Archive },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { applications } = useApplicationStore();

    // Calculate dynamic stats
    const activeCount = applications.filter(
        app => !['REJECTED', 'STALLED', 'WISHLIST'].includes(app.status)
    ).length;
    const interviewsCount = applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length;

    return (
        <aside className="flex flex-col w-[240px] h-screen glass border-r border-border/40 relative z-10">
            {/* Logo - Minimal */}
            <div className="flex items-center gap-3 px-5 py-6 border-b border-border/40">
                <img
                    src="/logo.png"
                    alt="Vector Logo"
                    className="w-10 h-10 object-contain"
                />
                <div>
                    <span className="font-bold text-lg tracking-tight">Vector</span>
                    <p className="text-[10px] text-muted-foreground -mt-0.5 tracking-wide uppercase font-medium">Job Tracking</p>
                </div>
            </div>

            {/* Navigation - Minimal */}
            <nav className="flex-1 px-3 py-5">
                <ul className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                                        transition-colors duration-200
                                        ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        }
                                    `}
                                >
                                    <Icon className="w-[18px] h-[18px]" />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Stats Card - Minimal */}
            <div className="mx-3 mb-6 p-4 rounded-xl border border-border/40 bg-secondary/20">
                <p className="text-[10px] font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">Overview</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 text-center">
                        <p className="text-xl font-bold text-foreground">{activeCount}</p>
                        <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <div className="p-2 text-center border-l border-border/40">
                        <p className="text-xl font-bold text-foreground">{interviewsCount}</p>
                        <p className="text-[10px] text-muted-foreground">Interviews</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

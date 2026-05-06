'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <aside className="flex flex-col w-[248px] h-screen bg-background border-r border-border relative z-10">
            <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
                <Image
                    src="/logo.png"
                    alt="Vector Logo"
                    width={36}
                    height={36}
                    className="object-contain grayscale"
                />
                <div>
                    <span className="font-serif text-xl font-semibold leading-none">Vector</span>
                    <p className="editorial-label mt-1 text-[9px]">Job ledger</p>
                </div>
            </div>

            <nav className="flex-1 px-3 py-5">
                <p className="editorial-label px-3 pb-3">Sections</p>
                <ul className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 border-l-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em]
                                        transition-colors duration-200
                                        ${isActive
                                            ? 'border-primary bg-secondary/50 text-primary'
                                            : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary/30 hover:text-foreground'
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

            <div className="mx-3 mb-6 border border-border bg-card p-4">
                <p className="editorial-label mb-3 text-center">Overview</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 text-center">
                        <p className="font-serif text-2xl font-semibold text-foreground">{activeCount}</p>
                        <p className="editorial-label text-[9px]">Active</p>
                    </div>
                    <div className="p-2 text-center border-l border-border">
                        <p className="font-serif text-2xl font-semibold text-foreground">{interviewsCount}</p>
                        <p className="editorial-label text-[9px]">Interviews</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { HeroLedgerGraphic } from '@/components/dashboard/HeroLedgerGraphic';
import { KanbanBoard } from '@/components/kanban';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const [showLedger, setShowLedger] = useState(false);
    const [isLeavingIntro, setIsLeavingIntro] = useState(false);

    const enterLedger = () => {
        setIsLeavingIntro(true);
        window.setTimeout(() => setShowLedger(true), 420);
    };

    useEffect(() => {
        const revealAndReplay = (eventName: string) => {
            if (showLedger) return;
            setIsLeavingIntro(true);
            window.setTimeout(() => {
                setShowLedger(true);
                window.setTimeout(() => window.dispatchEvent(new CustomEvent(eventName, { detail: { replayed: 'true' } })), 80);
            }, 420);
        };

        const handleAddRequest = (event: Event) => {
            if ((event as CustomEvent<{ replayed?: string }>).detail?.replayed) return;
            revealAndReplay('careerflow-open-add-application');
        };
        const handleDueRequest = (event: Event) => {
            if ((event as CustomEvent<{ replayed?: string }>).detail?.replayed) return;
            revealAndReplay('careerflow-show-due-followups');
        };

        window.addEventListener('careerflow-open-add-application', handleAddRequest);
        window.addEventListener('careerflow-show-due-followups', handleDueRequest);
        return () => {
            window.removeEventListener('careerflow-open-add-application', handleAddRequest);
            window.removeEventListener('careerflow-show-due-followups', handleDueRequest);
        };
    }, [showLedger]);

    return (
        <main className="bg-background">
            <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14">
                {!showLedger ? (
                    <section
                        className={`grid min-h-[calc(100vh-8rem)] items-center gap-8 border-b border-border pb-10 transition-all duration-500 ease-out md:min-h-[calc(100vh-9rem)] lg:min-h-[calc(100vh-11rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)] lg:gap-12 ${isLeavingIntro ? 'translate-y-[-12px] opacity-0 blur-sm' : 'translate-y-0 opacity-100 blur-0'
                            }`}
                    >
                        <div>
                            <p className="editorial-label text-reveal mb-5">The CareerFlow catalog · Vol. 01</p>
                            <h1 className="max-w-[760px] font-serif text-[clamp(2.9rem,14vw,7rem)] font-semibold leading-[0.92] text-foreground sm:text-[clamp(3.1rem,8vw,7rem)]">
                                <span className="text-reveal block">Every job</span>
                                <em className="text-reveal text-reveal-delayed block font-serif italic text-primary">
                                    traceable.
                                </em>
                            </h1>
                            <p className="text-reveal text-reveal-late mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                                Open the ledger to add applications, sort them by stage, and keep the record moving.
                            </p>
                            <div className="text-reveal text-reveal-late mt-10">
                                <Button onClick={enterLedger} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Application
                                </Button>
                            </div>
                        </div>
                        <HeroLedgerGraphic />
                    </section>
                ) : (
                    <section className="dashboard-ledger-enter">
                        <KanbanBoard />
                    </section>
                )}
            </div>
        </main>
    );
}

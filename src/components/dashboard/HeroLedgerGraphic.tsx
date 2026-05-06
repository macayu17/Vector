'use client';

import { ArrowRight, CalendarDays, CheckCircle2, FileCheck2 } from 'lucide-react';
import { CompanyLogo } from '@/components/kanban';

const floatingCompanies = [
    { name: 'Microsoft', className: 'left-[8%] top-[7%] md:left-[10%] md:top-[18%] hero-orbit-one' },
    { name: 'Google', className: 'right-[2%] top-[13%] md:right-[7%] md:top-[10%] hero-orbit-two' },
    { name: 'Wipro', className: 'bottom-[5%] left-[14%] md:bottom-[8%] md:left-[12%] hero-orbit-three' },
    { name: 'Stripe', className: 'bottom-[14%] right-[4%] md:bottom-[22%] md:right-[5%] hero-orbit-four' },
];

const ledgerRows = [
    { company: 'Wipro', role: 'Intern LO', stage: 'Rejected', tone: 'text-destructive' },
    { company: 'Microsoft', role: 'Software Engineer Intern', stage: 'Interview', tone: 'text-primary' },
    { company: 'Stripe', role: 'Product Engineer', stage: 'OA Received', tone: 'text-[#7f8f69]' },
];

export function HeroLedgerGraphic() {
    return (
        <div className="hero-graphic text-reveal text-reveal-delayed relative min-h-[500px] md:min-h-[460px] lg:min-h-[520px]">
            <div className="hero-radar absolute inset-0" aria-hidden="true" />
            <div className="hero-orbital-glow absolute left-[49%] top-[52%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 md:left-[48%] md:top-[51%] md:h-[430px] md:w-[430px]" aria-hidden="true" />

            <div className="absolute left-[49%] top-[52%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 md:left-[48%] md:top-[51%] md:h-72 md:w-72">
                <div className="hero-ring hero-ring-wide absolute -inset-12 rounded-full border border-primary/20" />
                <div className="hero-ring absolute inset-0 rounded-full border border-border" />
                <div className="hero-ring hero-ring-delayed absolute inset-8 rounded-full border border-border" />
                <div className="hero-pulse absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
            </div>

            <div className="pointer-events-none absolute left-[49%] top-[52%] h-[450px] w-[min(100%,430px)] -translate-x-1/2 -translate-y-1/2 md:left-[48%] md:top-[51%] md:h-[430px] md:w-[520px] lg:h-[470px] lg:w-[560px]">
                {floatingCompanies.map((company) => (
                    <div
                        key={company.name}
                        className={`hero-orbit-marker absolute ${company.className}`}
                        aria-label={`${company.name} application marker`}
                    >
                        <CompanyLogo companyName={company.name} size="sm" />
                    </div>
                ))}
            </div>

            <div className="hero-ledger-panel absolute left-[50%] top-[49%] w-[min(86vw,360px)] -translate-x-1/2 -translate-y-1/2 px-3 py-5 md:left-[52%] md:top-[49%] md:px-5 lg:left-[51%]">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <p className="editorial-label mb-1">Live ledger</p>
                        <h2 className="font-serif text-2xl font-semibold">Applications in motion</h2>
                    </div>
                    <FileCheck2 className="h-5 w-5 text-primary" />
                </div>

                <div className="space-y-0">
                    {ledgerRows.map((row, index) => (
                        <div
                            key={row.company}
                            className="hero-ledger-row grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-border/80 py-3"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <CompanyLogo companyName={row.company} size="sm" />
                            <div className="min-w-0">
                                <p className="truncate font-serif text-base font-semibold">{row.company}</p>
                                <p className="truncate text-xs text-muted-foreground">{row.role}</p>
                            </div>
                            <span className={`editorial-label max-w-20 truncate text-[9px] md:max-w-none ${row.tone}`}>{row.stage}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-5 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <div className="hero-progress-line h-px bg-border" />
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <div className="hero-progress-line hero-progress-line-delayed h-px bg-border" />
                    <ArrowRight className="h-4 w-4 text-primary" />
                </div>
            </div>
        </div>
    );
}

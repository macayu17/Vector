import { KanbanBoard } from '@/components/kanban';
import { Briefcase } from 'lucide-react';

export default function DashboardPage() {
    return (
        <main className="flex-1 overflow-auto glass">
            <div className="max-w-7xl mx-auto p-6">
                {/* Page Header - Compact & Clean */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Job Applications</h1>
                            <p className="text-sm text-muted-foreground">
                                Track and manage your job search progress
                            </p>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <KanbanBoard />
            </div>
        </main>
    );
}

import { KanbanBoard } from '@/components/kanban';

export default function DashboardPage() {
    return (
        <main className="flex-1 overflow-auto glass">
            <div className="max-w-7xl mx-auto p-6">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                            <span className="text-xl">🎯</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Job Applications</h1>
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

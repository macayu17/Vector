'use client';

import { useEffect, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Resume } from '@/types';
import { ResumeCard } from '@/components/resumes/ResumeCard';
import { ResumeModal } from '@/components/resumes/ResumeModal';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Loader2 } from 'lucide-react';

export default function ResumesPage() {
    const { resumes, loading, fetchResumes } = useResumeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResume, setEditingResume] = useState<Resume | null>(null);

    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    const handleEdit = (resume: Resume) => {
        setEditingResume(resume);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingResume(null);
    };

    return (
        <main className="flex-1 overflow-auto glass">
            <div className="max-w-5xl mx-auto p-6">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Resumes</h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage your resume versions
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
                            <Plus className="h-4 w-4" />
                            Add Resume
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <FileText className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm">
                            Add your resume versions to track which one you use for each application.
                        </p>
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Your First Resume
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resumes.map((resume) => (
                            <ResumeCard
                                key={resume.id}
                                resume={resume}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}

                {/* Modal */}
                <ResumeModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    resume={editingResume}
                />
            </div>
        </main>
    );
}

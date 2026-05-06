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
        <main className="flex-1 overflow-auto bg-background">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="ledger-reveal mb-8 border-b border-border pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="editorial-label mb-1">§ III — Documents</p>
                            <h1 className="text-3xl font-semibold">Resumes</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your resume versions
                            </p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
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
                        <FileText className="mb-4 h-10 w-10 text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm">
                            Add your resume versions to track which one you use for each application.
                        </p>
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Your First Resume
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                        {resumes.map((resume, index) => (
                            <ResumeCard
                                key={resume.id}
                                resume={resume}
                                onEdit={handleEdit}
                                index={index}
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

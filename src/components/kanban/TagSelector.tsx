'use client';

import { useState } from 'react';
import { useTagStore } from '@/store/tagStore';
import { Tag, TAG_COLORS } from '@/types';
import { TagBadge } from '@/components/ui/tag-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Tag as TagIcon, Check } from 'lucide-react';

interface TagSelectorProps {
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    applicationId?: string;
}

export function TagSelector({ selectedTags, onTagsChange, applicationId }: TagSelectorProps) {
    const { tags, addTag, addTagToApplication, removeTagFromApplication } = useTagStore();
    const [isOpen, setIsOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState<string>(TAG_COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);

    const handleToggleTag = async (tag: Tag) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);

        if (isSelected) {
            // Remove tag
            const newTags = selectedTags.filter(t => t.id !== tag.id);
            onTagsChange(newTags);
            if (applicationId) {
                await removeTagFromApplication(applicationId, tag.id);
            }
        } else {
            // Add tag
            const newTags = [...selectedTags, tag];
            onTagsChange(newTags);
            if (applicationId) {
                await addTagToApplication(applicationId, tag.id);
            }
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        setIsCreating(true);
        const newTag = await addTag({
            userId: '', // Will be set by store
            name: newTagName.trim(),
            color: selectedColor,
        });

        if (newTag) {
            const newTags = [...selectedTags, newTag];
            onTagsChange(newTags);
            if (applicationId) {
                await addTagToApplication(applicationId, newTag.id);
            }
        }

        setNewTagName('');
        setIsCreating(false);
    };

    return (
        <div className="space-y-2">
            {/* Selected tags display */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map((tag) => (
                        <TagBadge
                            key={tag.id}
                            name={tag.name}
                            color={tag.color}
                            size="md"
                            onRemove={() => handleToggleTag(tag)}
                        />
                    ))}
                </div>
            )}

            {/* Tag selector popover */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <TagIcon className="h-3.5 w-3.5" />
                        {selectedTags.length === 0 ? 'Add tags' : 'Manage tags'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-3">
                        {/* Existing tags */}
                        {tags.length > 0 && (
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground">Available tags</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => {
                                        const isSelected = selectedTags.some(t => t.id === tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => handleToggleTag(tag)}
                                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all"
                                                style={{
                                                    backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                                                    color: isSelected ? 'white' : tag.color,
                                                    border: `1px solid ${tag.color}60`,
                                                }}
                                            >
                                                {isSelected && <Check className="h-3 w-3" />}
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Create new tag */}
                        <div className="space-y-2 pt-2 border-t border-border/50">
                            <p className="text-xs font-medium text-muted-foreground">Create new tag</p>
                            <Input
                                placeholder="Tag name..."
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                className="h-8 text-xs"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateTag();
                                    }
                                }}
                            />

                            {/* Color picker */}
                            <div className="flex items-center gap-1.5">
                                {TAG_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                                        style={{
                                            backgroundColor: color,
                                            boxShadow: selectedColor === color
                                                ? `0 0 0 2px white, 0 0 0 4px ${color}`
                                                : undefined,
                                        }}
                                    />
                                ))}
                            </div>

                            <Button
                                type="button"
                                size="sm"
                                className="w-full h-7 text-xs gap-1"
                                onClick={handleCreateTag}
                                disabled={!newTagName.trim() || isCreating}
                            >
                                <Plus className="h-3 w-3" />
                                {isCreating ? 'Creating...' : 'Create tag'}
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

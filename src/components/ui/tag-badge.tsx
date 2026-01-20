import { cn } from '@/lib/utils';

interface TagBadgeProps {
    name: string;
    color: string;
    size?: 'sm' | 'md';
    onRemove?: () => void;
    onClick?: () => void;
    className?: string;
}

export function TagBadge({
    name,
    color,
    size = 'sm',
    onRemove,
    onClick,
    className
}: TagBadgeProps) {
    const sizeClasses = {
        sm: 'text-[10px] h-5 px-1.5',
        md: 'text-xs h-6 px-2',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
                sizeClasses[size],
                onClick && 'cursor-pointer hover:opacity-80',
                className
            )}
            style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `1px solid ${color}40`,
            }}
            onClick={onClick}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            {name}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-0.5 hover:opacity-60 transition-opacity"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>
            )}
        </span>
    );
}

type OptionCardProps = {
    label: string;
    value: string;
    onClick: (value: string) => void;
    selected?: boolean;
    imageUrl?: string;
    helperText?: string;
};

function OptionCard({ label, value, onClick, selected, imageUrl, helperText }: OptionCardProps) {
    return (
        <button
            type="button"
            onClick={() => onClick(value)}
            className={`relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-[2rem] border-4 p-6 text-left transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-rose)] focus-visible:ring-offset-2 ${
                selected
                    ? "border-[var(--accent-amber)] bg-[var(--accent-amber)]/10 shadow-[0_16px_0_rgba(78,74,200,0.2)] -translate-y-1"
                    : "border-black/10 bg-white/85 shadow-[0_14px_0_rgba(46,31,39,0.08)] hover:-translate-y-1 hover:shadow-[0_18px_0_rgba(46,31,39,0.12)]"
            }`}
        >
            {imageUrl && (
                <div className="mb-6 h-40 w-full overflow-hidden rounded-[1.6rem] border-2 border-black/10 bg-[#fff6dc]">
                    <img src={imageUrl} alt={label} className="h-full w-full object-cover" loading="lazy" />
                </div>
            )}
            <div className="space-y-1">
                <p className="text-xl font-semibold text-[var(--text-primary)]">{label}</p>
                {helperText && <p className="text-sm text-[var(--text-muted)]">{helperText}</p>}
            </div>
            {selected && (
                <span className="absolute right-4 top-4 rounded-full bg-[var(--accent-amber)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] shadow-[0_6px_0_rgba(46,31,39,0.15)]">
                    선택됨
                </span>
            )}
        </button>
    );
}

export default OptionCard;


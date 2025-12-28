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
            className={`relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-[2rem] border-4 p-6 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-rose)] focus-visible:ring-offset-2 ${
                selected
                    ? "border-[var(--accent-amber)] bg-gradient-to-br from-[var(--accent-amber)]/15 via-[var(--accent-rose)]/10 to-[var(--accent-mint)]/10 shadow-[0_20px_40px_rgba(246,190,95,0.25)] scale-[1.02] -translate-y-2 ring-4 ring-[var(--accent-amber)]/20"
                    : "border-black/10 bg-white/85 shadow-[0_14px_0_rgba(46,31,39,0.08)] hover:-translate-y-1 hover:shadow-[0_18px_0_rgba(46,31,39,0.12)] hover:scale-[1.01]"
            }`}
        >
            {imageUrl && (
                <div className={`mb-6 h-40 w-full overflow-hidden rounded-[1.6rem] border-2 transition-all duration-300 ${
                    selected 
                        ? "border-[var(--accent-amber)]/50 shadow-lg ring-2 ring-[var(--accent-amber)]/30" 
                        : "border-black/10 bg-[#fff6dc]"
                }`}>
                    <img 
                        src={imageUrl} 
                        alt={label} 
                        className={`h-full w-full object-cover transition-all duration-300 ${
                            selected ? "scale-105 brightness-110" : ""
                        }`} 
                        loading="lazy" 
                    />
                </div>
            )}
            <div className="space-y-1">
                <p className={`text-xl font-semibold transition-colors duration-300 ${
                    selected ? "text-[var(--accent-amber)]" : "text-[var(--text-primary)]"
                }`}>{label}</p>
                {helperText && <p className="text-sm text-[var(--text-muted)]">{helperText}</p>}
            </div>
            {selected && (
                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-amber)] to-[var(--accent-rose)] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(246,190,95,0.4)]">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span>선택됨</span>
                </div>
            )}
        </button>
    );
}
export default OptionCard;

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
            className={`relative flex h-full min-h-[17rem] flex-col overflow-hidden rounded-3xl border-2 p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                selected
                    ? "border-yellow-500 bg-yellow-400/20 shadow-lg"
                    : "border-gray-200 bg-white hover:border-yellow-400"
            }`}
        >
            {imageUrl && (
                <div className="mb-6 h-40 w-full overflow-hidden rounded-2xl bg-gray-100">
                    <img src={imageUrl} alt={label} className="h-full w-full object-cover" loading="lazy" />
                </div>
            )}
            <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">{label}</p>
                {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
            </div>
            {selected && (
                <span className="absolute right-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
                    선택됨
                </span>
            )}
        </button>
    );
}

export default OptionCard;


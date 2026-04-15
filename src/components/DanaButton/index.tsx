interface DanaButtonProps { label: string; tooltip: string; onClick: () => void; }
export function DanaButton({ label, tooltip, onClick }: DanaButtonProps) {
  return (
    <button type="button" onClick={onClick} title={tooltip}
      className="rounded-full border border-amber-300/35 bg-amber-300/12 px-6 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-300/18">
      {label}
    </button>
  );
}

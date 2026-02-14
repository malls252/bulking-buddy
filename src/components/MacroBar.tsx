interface MacroBarProps {
  label: string;
  value: number;
  unit?: string;
  color: string;
}

export default function MacroBar({ label, value, unit = "g", color }: MacroBarProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{unit}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

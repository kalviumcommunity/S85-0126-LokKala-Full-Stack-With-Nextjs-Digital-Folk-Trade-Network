interface StatCardProps {
  title: string;
  value?: string | number | null;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-medium text-slate-800">
        {value !== undefined && value !== null ? String(value) : '—'}
      </div>
    </div>
  );
}

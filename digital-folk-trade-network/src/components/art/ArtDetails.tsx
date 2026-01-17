interface ArtDetailsProps {
  id: string;
  title: string;
  description: string;
}

export default function ArtDetails({ id, title, description }: ArtDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-slate-800">{title || '—'}</h2>
      </div>
      <div className="rounded border border-slate-200 bg-white p-6">
        <p className="text-slate-700 whitespace-pre-wrap">{description || '—'}</p>
      </div>
    </div>
  );
}

interface AboutSectionProps {
  title: string;
  description: string;
  items: string[];
}

export default function AboutSection({ title, description, items }: AboutSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-slate-800">{title}</h2>
      </div>
      <div className="rounded border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-slate-700">{description}</p>
        {items.length > 0 && (
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

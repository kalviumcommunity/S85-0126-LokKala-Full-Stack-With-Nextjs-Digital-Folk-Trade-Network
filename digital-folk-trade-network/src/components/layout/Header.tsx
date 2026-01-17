interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <h1 className="text-xl font-medium text-slate-800">{title}</h1>
    </header>
  );
}

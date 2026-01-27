import Link from "next/link";

interface Props {
  params: { id: string };
}

export default function UserPage({ params }: Props) {
  const { id } = params;

  return (
    <main className="p-6 text-center">
      <nav className="mb-4">
        <Link href="/users" className="text-blue-600 underline">← Back to Users</Link>
      </nav>
      <h2 className="text-xl font-bold">User Profile</h2>
      <p>User ID: {id}</p>
    </main>
  );
}
import Link from "next/link";

export default function Users() {
  // Example user list
  const users = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ];

  return (
    <main className="p-6 text-center">
      <h1 className="text-xl font-bold">User List</h1>
      <ul className="mt-4 space-y-2">
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`} className="text-blue-600 underline">
              {user.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
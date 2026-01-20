import { NextResponse } from 'next/server';

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

// GET user by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = users.find(u => u.id === Number(params.id));

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

// PUT update user
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const user = users.find(u => u.id === Number(params.id));

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  user.name = body.name || user.name;
  return NextResponse.json(user);
}

// DELETE user
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const index = users.findIndex(u => u.id === Number(params.id));

  if (index === -1) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  users.splice(index, 1);
  return NextResponse.json({ message: 'User deleted' });
}

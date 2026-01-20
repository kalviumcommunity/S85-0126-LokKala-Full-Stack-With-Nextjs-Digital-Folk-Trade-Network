import { NextResponse } from 'next/server';

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

// GET all users (with pagination)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const start = (page - 1) * limit;
  const paginatedUsers = users.slice(start, start + limit);

  return NextResponse.json({
    page,
    limit,
    data: paginatedUsers
  });
}

// POST create user
export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json(
      { error: 'Name is required' },
      { status: 400 }
    );
  }

  const newUser = { id: Date.now(), name: body.name };
  users.push(newUser);

  return NextResponse.json(newUser, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fileName, fileURL } = await req.json();

    if (!fileName || !fileURL) {
      return NextResponse.json(
        { success: false, message: "Missing fileName or fileURL" },
        { status: 400 }
      );
    }

    const record = await prisma.file.create({
      data: {
        name: fileName,
        url: fileURL,
      },
    });

    return NextResponse.json({
      success: true,
      file: record,
    });
  } catch (error) {
    console.error("File DB error:", error);
    return NextResponse.json(
      { success: false, message: "DB insertion failed" },
      { status: 500 }
    );
  }
}

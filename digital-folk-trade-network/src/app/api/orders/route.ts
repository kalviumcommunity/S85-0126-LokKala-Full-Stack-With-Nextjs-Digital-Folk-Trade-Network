import { prisma } from "@/lib/prisma";
import { ERROR_CODES, sendError, sendSuccess } from "@/lib/responseHandler";
import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";

const orderItemSchema = z.object({
  artifactId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const orderPayloadSchema = z.object({
  userId: z.number().int().positive(),
  items: z.array(orderItemSchema).nonempty(),
  simulateFailure: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const payload = orderPayloadSchema.parse(await req.json());
    const { userId, items, simulateFailure } = payload;
    const quantityByArtifact = items.reduce((map, item) => {
      map.set(item.artifactId, (map.get(item.artifactId) ?? 0) + item.quantity);
      return map;
    }, new Map<number, number>());
    const artifactIds = Array.from(quantityByArtifact.keys());

    const result = await prisma.$transaction(async (tx) => {
      const artifacts = await tx.artifact.findMany({
        where: { id: { in: artifactIds } },
        select: { id: true, stock: true, price: true, title: true },
      });

      if (artifacts.length !== artifactIds.length) {
        throw new Error("One or more artifacts are missing");
      }

      const stockIssues = artifacts.filter((artifact) => {
        const requested = quantityByArtifact.get(artifact.id) ?? 0;
        return requested > artifact.stock;
      });

      if (stockIssues.length) {
        throw new Error("Insufficient stock for one or more artifacts");
      }

      const artifactMap = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
      const totalAmount = items.reduce((acc, item) => {
        const artifact = artifactMap.get(item.artifactId)!;
        return acc.plus(artifact.price.mul(item.quantity));
      }, new Prisma.Decimal(0));

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "PENDING",
          items: {
            create: items.map((item) => {
              const artifact = artifactMap.get(item.artifactId)!;
              return {
                artifactId: item.artifactId,
                quantity: item.quantity,
                price: artifact.price,
              };
            }),
          },
        },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          userId: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              artifact: { select: { id: true, title: true } },
            },
          },
        },
      });

      await Promise.all(
        Array.from(quantityByArtifact.entries()).map(([artifactId, quantity]) =>
          tx.artifact.update({
            where: { id: artifactId },
            data: { stock: { decrement: quantity } },
          })
        )
      );

      if (simulateFailure) {
        throw new Error("Simulated failure to verify rollback");
      }

      return { order, totalAmount };
    });

    return sendSuccess(result, "Order placed with transaction");
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(
        "Validation error",
        ERROR_CODES.BAD_REQUEST,
        400,
        error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    return sendError(
      "Order transaction failed",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error instanceof Error ? error.message : error
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const skip = (page - 1) * pageSize;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          items: {
            select: {
              quantity: true,
              price: true,
              artifact: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.order.count(),
    ]);

    return sendSuccess(
      {
        orders,
        pagination: {
          page,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      },
      "Orders fetched with optimized selection"
    );
  } catch (error) {
    return sendError(
      "Failed to fetch orders",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : error
    );
  }
}

import bcrypt from "bcryptjs";
import { OrderStatus, Prisma, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "folkpass123";

async function main() {
  console.log("Resetting seeded data...");
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.artifact.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const categories = [
    { name: "Textiles" },
    { name: "Ceramics" },
    { name: "Metalwork" },
  ];

  await prisma.category.createMany({ data: categories });
  const categoryByName = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.name, category.id]),
  );

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const users = [
    {
      name: "Aditi Singh",
      email: "aditi@example.com",
      passwordHash: hashedPassword,
      role: Role.ARTIST,
    },
    {
      name: "Rohan Das",
      email: "rohan@example.com",
      passwordHash: hashedPassword,
      role: Role.USER,
    },
    {
      name: "Meera Pillai",
      email: "meera@example.com",
      passwordHash: hashedPassword,
      role: Role.USER,
    },
  ];

  await prisma.user.createMany({ data: users });
  const userByEmail = Object.fromEntries(
    (await prisma.user.findMany()).map((user) => [user.email, user.id]),
  );

  const artifactsInput = [
    {
      title: "Handwoven Indigo Shawl",
      description: "Naturally dyed shawl with traditional ikat motifs from Odisha.",
      price: new Prisma.Decimal("120.00"),
      stock: 6,
      imageUrl: "https://example.com/shawl.jpg",
      categoryName: "Textiles",
      sellerEmail: "aditi@example.com",
    },
    {
      title: "Brass Oil Lamp",
      description: "Etched brass lamp inspired by South Indian temple designs.",
      price: new Prisma.Decimal("80.00"),
      stock: 10,
      imageUrl: "https://example.com/lamp.jpg",
      categoryName: "Metalwork",
      sellerEmail: "aditi@example.com",
    },
    {
      title: "Glazed Terracotta Tea Set",
      description: "Six-piece terracotta tea set with hand-painted Warli patterns.",
      price: new Prisma.Decimal("95.00"),
      stock: 8,
      imageUrl: "https://example.com/teaset.jpg",
      categoryName: "Ceramics",
      sellerEmail: "aditi@example.com",
    },
  ];

  const artifacts = await Promise.all(
    artifactsInput.map((artifact) =>
      prisma.artifact.create({
        data: {
          title: artifact.title,
          description: artifact.description,
          price: artifact.price,
          stock: artifact.stock,
          imageUrl: artifact.imageUrl,
          sellerId: userByEmail[artifact.sellerEmail],
          categoryId: categoryByName[artifact.categoryName],
        },
      }),
    ),
  );

  const artifactByTitle = new Map(
    artifacts.map((artifact) => [artifact.title, { id: artifact.id, price: artifact.price }]),
  );

  const orders = [
    {
      userEmail: "rohan@example.com",
      status: OrderStatus.PAID,
      items: [
        { artifactTitle: "Handwoven Indigo Shawl", quantity: 1 },
        { artifactTitle: "Glazed Terracotta Tea Set", quantity: 1 },
      ],
    },
    {
      userEmail: "meera@example.com",
      status: OrderStatus.PENDING,
      items: [{ artifactTitle: "Brass Oil Lamp", quantity: 2 }],
    },
  ];

  for (const order of orders) {
    const total = order.items.reduce((sum, item) => {
      const artifact = artifactByTitle.get(item.artifactTitle);
      if (!artifact) {
        throw new Error(`Artifact ${item.artifactTitle} not found for order seeding`);
      }
      return sum.plus(artifact.price.mul(item.quantity));
    }, new Prisma.Decimal(0));

    const createdOrder = await prisma.order.create({
      data: {
        userId: userByEmail[order.userEmail],
        status: order.status,
        totalAmount: total,
      },
    });

    await prisma.orderItem.createMany({
      data: order.items.map((item) => {
        const artifact = artifactByTitle.get(item.artifactTitle);
        if (!artifact) {
          throw new Error(`Artifact ${item.artifactTitle} not found for order item seeding`);
        }
        return {
          orderId: createdOrder.id,
          artifactId: artifact.id,
          quantity: item.quantity,
          price: artifact.price,
        };
      }),
    });
  }

  const reviewSeeds = [
    {
      rating: 5,
      comment: "Beautiful craftsmanship and timely delivery.",
      userEmail: "rohan@example.com",
      artifactTitle: "Handwoven Indigo Shawl",
    },
    {
      rating: 4,
      comment: "Loved the detailing on the lamp.",
      userEmail: "meera@example.com",
      artifactTitle: "Brass Oil Lamp",
    },
  ].map((review) => {
    const artifact = artifactByTitle.get(review.artifactTitle);
    if (!artifact) {
      throw new Error(`Artifact ${review.artifactTitle} not found for review seeding`);
    }

    return {
      rating: review.rating,
      comment: review.comment,
      userId: userByEmail[review.userEmail],
      artifactId: artifact.id,
    };
  });

  await prisma.review.createMany({
    skipDuplicates: true,
    data: reviewSeeds,
  });

  console.log("Seed data inserted successfully.");
}

main()
  .catch(async (error) => {
    console.error("Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

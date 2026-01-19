const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const artist = await prisma.user.upsert({
    where: { email: "artist@test.com" },
    update: {},
    create: {
      name: "Folk Artist",
      email: "artist@test.com",
      password: "hashed",
      role: "ARTIST",
    },
  });

  const category = await prisma.category.upsert({
    where: { name: "Madhubani" },
    update: {},
    create: { name: "Madhubani" },
  });

  const existingArtifact = await prisma.artifact.findFirst({
    where: { title: "Handmade Painting", sellerId: artist.id },
  });

  if (!existingArtifact) {
    await prisma.artifact.create({
      data: {
        title: "Handmade Painting",
        description: "Traditional folk art",
        price: 1200,
        stock: 5,
        imageUrl: "img.jpg",
        sellerId: artist.id,
        categoryId: category.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

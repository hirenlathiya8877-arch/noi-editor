import { PrismaClient, ProjectStatus } from "@prisma/client";
import { defaultTestimonials, defaultVideos } from "../lib/default-data";

const prisma = new PrismaClient();

async function main() {
  const videosCount = await prisma.video.count();
  if (videosCount === 0) {
    await prisma.video.createMany({
      data: defaultVideos
    });
  }

  const testimonialsCount = await prisma.testimonial.count();
  if (testimonialsCount === 0) {
    await prisma.testimonial.createMany({
      data: defaultTestimonials
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "logo" },
    update: {},
    create: {
      key: "logo",
      value: ""
    }
  });

  const demoClient = await prisma.client.upsert({
    where: { username: "clientdemo" },
    update: {},
    create: {
      name: "Demo Client",
      username: "clientdemo",
      password: "client123"
    }
  });

  const demoProjects = await prisma.project.count();
  if (demoProjects === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "Demo Reel Edit",
          status: ProjectStatus.IN_PROGRESS,
          notes: "Initial cut in progress",
          clientId: demoClient.id
        },
        {
          title: "YouTube Long Form",
          status: ProjectStatus.REVIEW,
          video: "dQw4w9WgXcQ",
          notes: "Ready for review",
          clientId: demoClient.id
        }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

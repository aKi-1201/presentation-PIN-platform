import { prisma } from "../src/lib/db";
import { deletePdf } from "../src/lib/storage";

async function main() {
  try {
    const now = new Date();
    const expiredPresentations = await prisma.presentation.findMany({
      where: {
        status: "active",
        expiresAt: { lt: now }
      },
      select: {
        id: true,
        publicCode: true,
        storagePath: true
      }
    });

    let cleaned = 0;
    let failed = 0;

    for (const presentation of expiredPresentations) {
      try {
        await deletePdf(presentation.storagePath);
        await prisma.presentation.update({
          where: { id: presentation.id },
          data: {
            status: "deleted",
            deletedAt: now
          }
        });
        cleaned += 1;
        console.log(
          `Cleaned presentation id=${presentation.id} code=${presentation.publicCode}`
        );
      } catch (error: unknown) {
        failed += 1;
        console.error(
          `Failed cleanup id=${presentation.id} code=${presentation.publicCode}`,
          error
        );
      }
    }

    console.log(`Cleanup finished. cleaned=${cleaned} failed=${failed}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Cleanup failed.", error);
  process.exitCode = 1;
});

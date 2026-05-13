import { prisma } from "../src/lib/db";
import { deletePdf } from "../src/lib/storage";

async function main() {
  const startedAt = Date.now();
  console.log(`Cleanup started at ${new Date(startedAt).toISOString()}`);

  let cleaned = 0;
  let failed = 0;

  try {
    const now = new Date();
    const expiredPresentations = await prisma.presentation.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: now }
      },
      select: {
        id: true,
        publicCode: true,
        storagePath: true
      }
    });

    for (const presentation of expiredPresentations) {
      try {
        await deletePdf(presentation.storagePath);
        await prisma.presentation.update({
          where: { id: presentation.id },
          data: {
            status: "EXPIRED",
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

  } finally {
    const finishedAt = Date.now();
    console.log(
      `Cleanup finished at ${new Date(finishedAt).toISOString()} durationMs=${finishedAt - startedAt} cleaned=${cleaned} failed=${failed}`
    );
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Cleanup failed.", error);
  process.exitCode = 1;
});

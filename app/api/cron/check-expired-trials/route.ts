import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTrialExpiredEmail } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Step 1: Find schools with expired trials, no subscription, not yet notified
  const schools = await prisma.school.findMany({
    where: {
      settings: {
        trialEnd: { lte: now },
        trialExpiryEmailSentAt: null,
      },
      subscription: null,
    },
    include: {
      settings: true,
      subscription: true,
      User: { where: { role: "ADMIN" }, take: 1, select: { email: true } },
    },
  });

  let notified = 0;
  let skipped = 0;

  for (const school of schools) {
    // Step 2: Re-verify subscription is still null (race guard)
    if (school.subscription !== null) {
      skipped++;
      continue;
    }

    // Step 3: Atomic claim
    const update = await prisma.schoolSettings.updateMany({
      where: {
        schoolId: school.id,
        trialExpiryEmailSentAt: null,
      },
      data: {
        trialExpiryEmailSentAt: now,
      },
    });

    if (update.count === 0) {
      // Another worker claimed it
      skipped++;
      continue;
    }

    // Step 4: Re-verify subscription AFTER claim (race guard before send)
    const currentSub = await prisma.subscription.findUnique({
      where: { schoolId: school.id },
    });

    if (currentSub) {
      // Subscription was created during our window — rollback
      await prisma.schoolSettings.updateMany({
        where: { schoolId: school.id },
        data: { trialExpiryEmailSentAt: null },
      });
      skipped++;
      continue;
    }

    // Step 5: Send email
    const adminEmail = school.User[0]?.email;
    if (!adminEmail) {
      // No admin found — rollback
      await prisma.schoolSettings.updateMany({
        where: { schoolId: school.id },
        data: { trialExpiryEmailSentAt: null },
      });
      skipped++;
      continue;
    }

    try {
      await sendTrialExpiredEmail(adminEmail, school.name);
      notified++;
    } catch {
      // Rollback claim — retry next hour
      await prisma.schoolSettings.updateMany({
        where: { schoolId: school.id },
        data: { trialExpiryEmailSentAt: null },
      });
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    checked: schools.length,
    notified,
    skipped,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_CONTEXT_EXTENSIONS = [
  {
    name: "PaymentsContextExtension",
    description: "Context extension for payments, orders, incentives, and triggers.",
  },
  {
    name: "SubscriptionChangedContext",
    description: "Details about subscription changes, related orders, and cancellation.",
  },
  {
    name: "SubscriptionContextExtension",
    description: "Subscription lifecycle context including product, orders, incentives, and dates.",
  },
  {
    name: "CoursesContextExtension",
    description: "Context for courses, authors, variations, and course source.",
  },
  {
    name: "PuzzlePathContextExtension",
    description: "Deprecated puzzle path context including progress, awards, and friends tier.",
    deprecated: true,
  },
  {
    name: "PuzzleContextExtension",
    description: "Deprecated puzzle context with rating, type, result, and move details.",
    deprecated: true,
  },
  {
    name: "StreakContextExtension",
    description: "Context for streak-based experiences including current streak and pause state.",
  },
  {
    name: "UserInteractionContextExtension",
    description: "User interaction context including presence and relationship interactions.",
  },
  {
    name: "UserPopoverContextExtension",
    description: "Context for user popover interactions targeting a recipient user.",
  },
  {
    name: "RelationshipChangeContextExtension",
    description: "Context for relationship changes with target user details and suggestion flag.",
  },
  {
    name: "IncomingFriendRequestContextExtension",
    description: "Context for incoming friend requests including sender and request ID.",
  },
] as const;

export async function GET() {
  // Seed table if empty
  const count = await prisma.contextExtension.count();

  if (count === 0) {
    await prisma.contextExtension.createMany({
      data: SEED_CONTEXT_EXTENSIONS.map((ce) => ({
        name: ce.name,
        description: ce.description,
        deprecated: "deprecated" in ce ? !!ce.deprecated : false,
      })),
      skipDuplicates: true,
    });
  }

  const contextExtensions = await prisma.contextExtension.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ contextExtensions });
}



"use server";

import { prisma } from "@/lib/prisma";
import type { LeadSource } from "@/app/lead-actions";

export async function logCalculatorInteraction(page: LeadSource, income: number) {
  await prisma.calculatorInteraction.create({ data: { page, income } });
}

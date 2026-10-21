"use server";

import { prisma } from "@/lib/prisma";
import type { LeadSource } from "@/app/lead-actions";
import type { StateCode } from "@/lib/stateTax";

export async function logCalculatorInteraction(page: LeadSource, income: number, state: StateCode) {
  await prisma.calculatorInteraction.create({ data: { page, income, state } });
}

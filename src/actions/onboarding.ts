'use server';

import { auth } from '@clerk/nextjs/server';

import { clientIntakeSchema } from '@/features/onboarding/ClientIntakeSchema';
import { ensureOrganization } from '@/libs/AgencyData';
import { db } from '@/libs/DB';
import { clientProfileSchema } from '@/models/Schema';

type ActionResult = {
  error?: string;
  success: boolean;
};

export const submitClientIntake = async (input: unknown): Promise<ActionResult> => {
  const authObject = await auth();

  if (!authObject.orgId) {
    return {
      error: 'No organization selected.',
      success: false,
    };
  }

  const parsed = clientIntakeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Invalid intake payload.',
      success: false,
    };
  }

  await ensureOrganization(authObject.orgId);

  await db
    .insert(clientProfileSchema)
    .values({
      additionalSupport: parsed.data.additionalSupport,
      businessName: parsed.data.businessName,
      goals: parsed.data.goals,
      instagramHandle: parsed.data.instagramHandle,
      mainPointOfContact: parsed.data.mainPointOfContact,
      organizationId: authObject.orgId,
      partnershipPackage: parsed.data.partnershipPackage,
    })
    .onConflictDoUpdate({
      set: {
        additionalSupport: parsed.data.additionalSupport,
        businessName: parsed.data.businessName,
        completedAt: new Date(),
        goals: parsed.data.goals,
        instagramHandle: parsed.data.instagramHandle,
        mainPointOfContact: parsed.data.mainPointOfContact,
        partnershipPackage: parsed.data.partnershipPackage,
        updatedAt: new Date(),
      },
      target: clientProfileSchema.organizationId,
    });

  return { success: true };
};

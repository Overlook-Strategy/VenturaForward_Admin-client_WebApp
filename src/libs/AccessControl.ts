import { auth } from '@clerk/nextjs/server';

import { Env } from '@/libs/Env';

const parseSuperAdminUserIds = () => {
  return (Env.SUPER_ADMIN_USER_IDS ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
};

const SUPER_ADMIN_USER_IDS = new Set(parseSuperAdminUserIds());

export const isSuperAdminUser = (userId: string | null | undefined) => {
  if (!userId) {
    return false;
  }

  return SUPER_ADMIN_USER_IDS.has(userId);
};

export const getDashboardAccessContext = async () => {
  const authObject = await auth();

  return {
    isSuperAdmin: isSuperAdminUser(authObject.userId),
    orgId: authObject.orgId,
    userId: authObject.userId,
  };
};

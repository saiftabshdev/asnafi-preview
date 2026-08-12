export type AuthUser = {
  id: string;
  email: string;
  name: string;
  country: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  status: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  avatarUrl?: string;
  trialAccess?: boolean;
  joinDate: string;
  restaurantName?: string;
  slug?: string;
  plan: string;
  billingCycle: string;
  subscription: {
    status: string;
    planId: string | null;
    planName?: string;
    billingCycle: string | null;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
  } | null;
};

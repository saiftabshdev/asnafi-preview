import { useContext } from 'react';
import { AuthContext } from './auth-context';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useHasSubscription() {
  const { user } = useAuth();
  if (user?.trialAccess) return true;
  const status = user?.subscription?.status;
  return status === 'TRIALING' || status === 'ACTIVE';
}

export function useEffectivePlanId() {
  const { user } = useAuth();
  if (user?.trialAccess) return 'premium';
  return user?.subscription?.planId ?? null;
}

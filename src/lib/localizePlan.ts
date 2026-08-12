import type { TFunction } from 'i18next';
import type { Plan } from '../hooks/useApi';

export function localizePlan(plan: Plan, t: TFunction): Plan {
  const nameKey = `plan.${plan.id}.name`;
  const localizedName = t(nameKey);
  const name = localizedName !== nameKey ? localizedName : plan.name;

  const features = plan.features.map((fallback, index) => {
    const featureKey = `plan.${plan.id}.feature.${index}`;
    const localized = t(featureKey);
    return localized !== featureKey ? localized : fallback;
  });

  return { ...plan, name, features };
}

export function localizePlans(plans: Plan[], t: TFunction): Plan[] {
  return plans.map((plan) => localizePlan(plan, t));
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminPlans, useAdminUpdatePlan, type Plan } from '../../hooks/useApi';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { PageHeader, PageShell, Label, TextInput, TextArea, primaryButton } from '../../components/dashboard/ui';

export default function AdminPlans() {
  const { t } = useTranslation();
  const { data: plans = [], isLoading } = useAdminPlans();
  const updatePlan = useAdminUpdatePlan();
  const [localPlans, setLocalPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (plans.length) setLocalPlans(plans);
  }, [plans]);

  const handleSave = async () => {
    try {
      await Promise.all(
        localPlans.map((plan) =>
          updatePlan.mutateAsync({
            id: plan.id,
            data: {
              name: plan.name,
              monthlyPrice: plan.monthlyPrice,
              annualPrice: plan.annualPrice,
              annualDiscount: plan.annualDiscount,
              popular: plan.popular,
              features: plan.features,
            },
          }),
        ),
      );
      toast.success(t('Plans saved'));
    } catch {
      toast.error(t('Failed to save plans'));
    }
  };

  const updatePlanField = (index: number, field: string, value: unknown) => {
    const newPlans = [...localPlans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setLocalPlans(newPlans);
  };

  const setPopular = (index: number) => {
    setLocalPlans((prev) =>
      prev.map((plan, i) => ({
        ...plan,
        popular: i === index,
      })),
    );
  };

  if (isLoading) {
    return (
      <PageShell>
        <p className="text-muted">{t('Loading plans')}...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={t('Plans Management')}
        subtitle={
          <>
            {t('Manage pricing plans')}
            <span className="mt-1 block text-xs text-amber-600 dark:text-amber-400">
              {t('Stripe sync note')}
            </span>
          </>
        }
        action={
          <button onClick={handleSave} disabled={updatePlan.isPending} className={primaryButton}>
            <Save className="h-4 w-4" /> {t('Save Changes')}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-3">
        {localPlans.map((plan, idx) => (
          <div
            key={plan.id}
            className={cn(
              'bg-surface border-app animate-float-in space-y-4 rounded-2xl border p-5 shadow-card md:p-6',
              plan.popular && 'ring-2 ring-brand-500',
            )}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Label>{t('Plan name')}</Label>
                <TextInput
                  type="text"
                  value={plan.name}
                  onChange={(e) => updatePlanField(idx, 'name', e.target.value)}
                  className="font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={() => setPopular(idx)}
                className={cn(
                  'mt-6 shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
                  plan.popular
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-app bg-surface-2 text-muted hover:border-strong',
                )}
              >
                {t('Most Popular')}
              </button>
            </div>

            <p className="text-xs text-faint">ID: {plan.id}</p>

            {plan.stripeProductId && (
              <p className="truncate text-xs text-faint" title={plan.stripeProductId}>
                Stripe: {plan.stripeProductId}
              </p>
            )}

            <div>
              <Label>{t('Monthly Price')} ($)</Label>
              <TextInput
                type="number"
                min={0}
                step={1}
                value={plan.monthlyPrice}
                onChange={(e) => updatePlanField(idx, 'monthlyPrice', Number(e.target.value))}
              />
            </div>

            <div>
              <Label>{t('Annual Price')} ($)</Label>
              <TextInput
                type="number"
                min={0}
                step={1}
                value={plan.annualPrice}
                onChange={(e) => updatePlanField(idx, 'annualPrice', Number(e.target.value))}
              />
            </div>

            <div>
              <Label>{t('Annual savings badge')} (%)</Label>
              <TextInput
                type="number"
                min={0}
                max={100}
                step={1}
                value={plan.annualDiscount}
                onChange={(e) => updatePlanField(idx, 'annualDiscount', Number(e.target.value))}
              />
            </div>

            <div>
              <Label>{t('Features (one per line)')}</Label>
              <TextArea
                rows={7}
                value={Array.isArray(plan.features) ? plan.features.join('\n') : ''}
                onChange={(e) => updatePlanField(idx, 'features', e.target.value.split('\n').filter(Boolean))}
                className="min-h-[160px]"
              />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Lock, Palette, Save } from "lucide-react";
import { toast } from "sonner";
import {
  usePlans,
  useRestaurant,
  useUpdateRestaurant,
} from "../../hooks/useApi";
import type { Theme } from "../../types/restaurant";
import { cn } from "../../lib/utils";
import { ApiError } from "../../lib/api/client";
import { SubscriptionBanner } from "../../components/SubscriptionBanner";
import {
  useEffectivePlanId,
  useHasSubscription,
} from "../../context/AuthContext";
import {
  ALL_TEMPLATE_IDS,
  MENU_TEMPLATES,
  getTemplateCoverImage,
  type MenuTemplateId,
} from "../../lib/menuTemplates";
import { Card, PageShell, primaryButton } from "../../components/dashboard/ui";

const COLORS = [
  "#111827",
  "#d946ef",
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#84cc16",
  "#f59e0b",
  "#f97316",
  "#ef4444",
];

export default function DesignSettings() {
  const { t } = useTranslation();
  const hasSubscription = useHasSubscription();
  const planId = useEffectivePlanId();
  const { isLoading } = useRestaurant();
  const { data: plans = [] } = usePlans();
  const updateRestaurant = useUpdateRestaurant();
  const location = useLocation();

  // Coming from the public /themes page's "choose theme" CTA preselects the template.
  const incomingTemplate = (location.state as { template?: MenuTemplateId } | null)
    ?.template;
  const initialTemplate =
    incomingTemplate && ALL_TEMPLATE_IDS.includes(incomingTemplate)
      ? incomingTemplate
      : "bistro";

  const [theme, setTheme] = useState<Theme>({
    primaryColor: "#6c5ce7",
    template: initialTemplate,
  });
  const [saved, setSaved] = useState(false);

  const currentPlan = useMemo(
    () => plans.find((p) => p.id === planId),
    [plans, planId],
  );
  const allowedTemplates =
    currentPlan?.allowedTemplates ?? MENU_TEMPLATES.map((x) => x.id);

  const handleSave = async () => {
    if (!allowedTemplates.includes(theme.template)) {
      toast.error(t("Template not available on your plan"));
      return;
    }
    try {
      await updateRestaurant.mutateAsync({
        themePrimaryColor: theme.primaryColor,
        themeTemplate: theme.template,
        coverImageUrl: getTemplateCoverImage(theme.template),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success(t("dash.dz_saved"));
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.data as { code?: string })?.code === "TEMPLATE_NOT_ALLOWED"
      ) {
        toast.error(t("Template not available on your plan"));
      } else {
        toast.error(t("dash.save_failed"));
      }
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <p className="text-sm text-muted">{t("Loading...")}</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SubscriptionBanner />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="animate-float-in">
          <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">
            {t("dash.dz_title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("dash.dz_subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateRestaurant.isPending || !hasSubscription}
          className={cn(
            primaryButton,
            "animate-float-in",
            saved &&
              "bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-500",
          )}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? t("dash.dz_saved") : t("dash.dz_save")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 ">
        {/* --------------------------- settings --------------------------- */}
        <div className="space-y-5 ">
          <Card title={t("dash.dz_choose_template")} icon={Palette} delay={40}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {MENU_TEMPLATES.map((tpl) => {
                const locked =
                  hasSubscription &&
                  allowedTemplates.length > 0 &&
                  !allowedTemplates.includes(tpl.id);
                const isActive = theme.template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={locked}
                    onClick={() => setTheme({ ...theme, template: tpl.id })}
                    title={
                      locked
                        ? t("Template not available on your plan")
                        : tpl.name
                    }
                    className={cn(
                      "group bg-surface-2 relative overflow-hidden rounded-2xl border-2 text-start transition-all",
                      isActive
                        ? "border-brand-500 shadow-lg shadow-brand-500/20"
                        : "border-app hover:border-strong",
                      locked && "cursor-not-allowed",
                    )}
                  >
                    {locked && (
                      <div className="absolute inset-0 z-10 grid place-items-center bg-black/45">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={tpl.image}
                        alt={tpl.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                      <span className="text-sm font-bold text-main">
                        {t(`dash.tpl_${tpl.id}`)}
                      </span>
                      {isActive && (
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title={t("dash.dz_brand_color")} icon={Palette} delay={100}>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => {
                const isActive =
                  theme.primaryColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTheme({ ...theme, primaryColor: c })}
                    className="grid h-11 w-11 place-items-center rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      ...(isActive
                        ? {
                            boxShadow: `0 0 0 2px var(--surface), 0 0 0 4px ${c}`,
                          }
                        : {}),
                    }}
                    aria-label={c}
                  >
                    {isActive && (
                      <Check className="h-5 w-5 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
              <label
                className="border-strong relative grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed"
                title={t("dash.dz_brand_color")}
              >
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    setTheme({ ...theme, primaryColor: e.target.value })
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <span className="text-lg leading-none text-faint">+</span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

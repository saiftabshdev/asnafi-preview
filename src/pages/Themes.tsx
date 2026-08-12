import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { Reveal } from "../components/Reveal";
import { useAuth } from "../context/AuthContext";
import { usePlans } from "../hooks/useApi";
import { localizePlans } from "../lib/localizePlan";
import { MENU_TEMPLATES, type MenuTemplateId } from "../lib/menuTemplates";
import "../styles/landing.css";

export default function Themes() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const [selected, setSelected] = useState<MenuTemplateId | null>(null);

  const localizedPlans = useMemo(() => localizePlans(plans, t), [plans, t]);

  // Cheapest plan that unlocks a given template, based on the real pricing
  // data already used on the landing page's pricing section.
  const planForTemplate = (id: MenuTemplateId) => {
    if (!localizedPlans.length) return null;
    const sorted = [...localizedPlans].sort(
      (a, b) => a.monthlyPrice - b.monthlyPrice,
    );
    return (
      sorted.find(
        (p) => !p.allowedTemplates?.length || p.allowedTemplates.includes(id),
      ) ?? null
    );
  };

  const handleChoose = (id: MenuTemplateId) => {
    setSelected(id);
    if (user) {
      navigate("/dashboard/design", { state: { template: id } });
    } else {
      navigate("/register", { state: { template: id } });
    }
  };

  return (
    <main className="site">
      <SiteNav />

      <section className="themes-page shell">
        <div className="themes-heading heading center">
          <span>
            <Sparkles /> {t("lp.themes.tag")}
          </span>

          <h1>
            {t("lp.themes.title")}
            <br />
            <i>{t("lp.themes.titleAccent")}</i>
          </h1>

          <p>{t("lp.themes.desc")}</p>
        </div>

        <Reveal>
          <div className="theme-cta">
            <div>
              <h3>{t("lp.themes.cta.title")}</h3>
              <p>{t("lp.themes.cta.desc")}</p>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() =>
                navigate(user ? "/dashboard/design" : "/register")
              }
            >
              {t("lp.themes.cta.button")}
              <ArrowRight />
            </button>
          </div>
        </Reveal>

        <div className="theme-grid">
          {plansLoading &&
            MENU_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="theme-card">
                <div className="theme-card-media">
                  <img
                    src={tpl.image}
                    alt={t(`dash.tpl_${tpl.id}`)}
                    loading="lazy"
                  />
                </div>
                <div className="theme-card-body">
                  <div className="theme-card-head">
                    <h3>{t(`dash.tpl_${tpl.id}`)}</h3>
                  </div>
                  <p>{t(`lp.themes.tplDesc.${tpl.id}`)}</p>
                </div>
              </div>
            ))}

          {!plansLoading &&
            MENU_TEMPLATES.map((tpl, i) => {
              const plan = planForTemplate(tpl.id);
              const isSelected = selected === tpl.id;

              return (
                <Reveal delay={i * 0.08} key={tpl.id} fill>
                  <article
                    className={`theme-card ${isSelected ? "is-selected" : ""}`}
                  >
                    <div className="theme-card-media">
                      <img
                        src={tpl.image}
                        alt={t(`dash.tpl_${tpl.id}`)}
                        loading="lazy"
                      />
                    </div>
                    <div className="theme-card-body">
                      <div className="theme-card-head">
                        <h3>{t(`dash.tpl_${tpl.id}`)}</h3>
                        {isSelected && (
                          <span className="theme-card-check">
                            <Check />
                          </span>
                        )}
                      </div>
                      <p>{t(`lp.themes.tplDesc.${tpl.id}`)}</p>
                      <span className="theme-card-price">
                        {plan
                          ? t("lp.themes.card.includedFrom", {
                              plan: plan.name,
                            })
                          : t("lp.themes.card.includedAll")}
                      </span>
                      <button
                        type="button"
                        className={`btn full ${isSelected ? "primary" : "soft"}`}
                        onClick={() => handleChoose(tpl.id)}
                      >
                        {isSelected
                          ? t("lp.themes.card.selected")
                          : t("lp.themes.card.choose")}
                      </button>
                    </div>
                  </article>
                </Reveal>
              );
            })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

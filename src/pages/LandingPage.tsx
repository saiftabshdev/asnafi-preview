import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Check,
  Palette,
  Play,
  QrCode,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { Reveal } from "../components/Reveal";
import { VideoModal } from "../components/VideoModal";
import { useAuth } from "../context/AuthContext";
import { usePlans } from "../hooks/useApi";
import { localizePlans } from "../lib/localizePlan";
import { withBase } from "../lib/utils";
import "../styles/landing.css";

const POSTERS = [
  {
    image: "/hero pic/1.jpg",
    className: "poster-one",
    no: "01",
    name: "Cucina",
    type: "Italian kitchen",
  },
  {
    image: "/hero pic/2.jpg",
    className: "poster-two",
    no: "02",
    name: "MORNING",
    type: "coffee & bakery",
  },
  {
    image: "/hero pic/3.jpg",
    className: "poster-three",
    no: "03",
    name: "BUN & CO.",
    type: "smash burgers",
  },
  {
    image: "/hero pic/4.jpg",
    className: "poster-four",
    no: "04",
    name: "KŌI",
    type: "Japanese dining",
  },
  {
    image: "/hero pic/5.jpg",
    className: "poster-five",
    no: "05",
    name: "VERDE",
    type: "seasonal menu",
  },
];

const LOGOS = ["EMBER", "mōde", "NÛR", "SORA", "KÖZ", "VERDE"];
const BAR_HEIGHTS = [20, 35, 28, 59, 46, 80];

function Heading({
  tag,
  title,
  desc,
  center = false,
}: {
  tag: string;
  title: string;
  desc: string;
  center?: boolean;
}) {
  return (
    <div className={`heading ${center ? "center" : ""}`}>
      <span>{tag}</span>
      <h2>{title}</h2>
      <p>{desc}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  exploreLabel,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  exploreLabel: string;
}) {
  return (
    <article className="feature">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      <a href="#pricing">
        {exploreLabel} <ArrowRight />
      </a>
    </article>
  );
}

function MenuPoster({
  image,
  className,
  no,
  name,
  type,
}: {
  image: string;
  className: string;
  no: string;
  name: string;
  type: string;
}) {
  return (
    <article className={`menu-poster ${className}`}>
      <img src={withBase(image)} alt={`${name} menu`} loading="lazy" />
      <div className="poster-shade" />
      <div className="poster-copy">
        <span>ASNAFI MENU · 2026</span>
        <h3>{name}</h3>
        <p>{type}</p>
      </div>
      <b className="poster-no">{no}</b>
    </article>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const {
    data: plans = [],
    isLoading: plansLoading,
    isError: plansError,
  } = usePlans();

  const [annual, setAnnual] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // Arriving from another page via a nav link like /#pricing — jump to that section.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el)
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
  }, [location.hash]);

  const localizedPlans = useMemo(() => localizePlans(plans, t), [plans, t]);
  const maxAnnualDiscount =
    plans.length > 0 ? Math.max(...plans.map((p) => p.annualDiscount)) : 20;

  /* Annual plans are priced as a yearly total in the API, and dividing it back
     into a monthly figure rounds to the same number as the monthly price on
     most plans — so the yearly view shows the total and says "/ year". */
  const priceFor = (monthlyPrice: number, annualPrice: number) =>
    annual ? annualPrice : monthlyPrice;

  return (
    <main className="site">
      <SiteNav />

      {/* ------------------------------- hero ------------------------------ */}
      <section className="hero" id="top">
        <div className="copy shell">
          <Reveal delay={0}>
            <span className="pill">
              <Sparkles /> {t("lp.pill")}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1>
              {t("lp.title.lead")}
              <br />
              <i>{t("lp.title.accent")}</i>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p>{t("lp.desc")}</p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="ctas">
              <Link
                className="btn primary"
                to={user ? "/dashboard" : "/register"}
              >
                {user ? t("lp.controlPanel") : t("lp.start")}
                <ArrowRight />
              </Link>
              <button
                type="button"
                className="btn soft"
                onClick={() => setVideoOpen(true)}
              >
                <Play fill="currentColor" /> {t("lp.demo")}
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="trusted">
              <div className="avatars">
                <b>م</b>
                <b>ل</b>
                <b>ر</b>
                <b>ن</b>
              </div>
              <span>
                <strong>4.9/5</strong> <em>★★★★★</em>
              </span>
              <small>{t("lp.trust")}</small>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.25} y={40}>
          <div className="menu-showcase" aria-hidden="true">
            <div className="menu-arc">
              {POSTERS.map((p) => (
                <MenuPoster key={p.className} {...p} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------ logos ------------------------------ */}
      <Reveal>
        <section className="logos">
          <p>{t("lp.trust")}</p>
          <div>
            {LOGOS.map((x) => (
              <b key={x}>{x}</b>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ----------------------------- features ---------------------------- */}
      <section className="section shell" id="features">
        <Reveal>
          <Heading
            tag={t("lp.features.tag")}
            title={t("lp.features.title")}
            desc={t("lp.features.desc")}
          />
        </Reveal>
        <div className="features">
          <Reveal delay={0} fill>
            <Feature
              icon={<Palette />}
              title={t("lp.features.design.title")}
              desc={t("lp.features.design.desc")}
              exploreLabel={t("lp.features.explore")}
            />
          </Reveal>
          <Reveal delay={0.1} fill>
            <Feature
              icon={<QrCode />}
              title={t("lp.features.qr.title")}
              desc={t("lp.features.qr.desc")}
              exploreLabel={t("lp.features.explore")}
            />
          </Reveal>
          <Reveal delay={0.2} fill>
            <Feature
              icon={<Zap />}
              title={t("lp.features.live.title")}
              desc={t("lp.features.live.desc")}
              exploreLabel={t("lp.features.explore")}
            />
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- pricing ----------------------------- */}
      <section className="section shell" id="pricing">
        <Reveal>
          <Heading
            center
            tag={t("lp.pricing.tag")}
            title={t("lp.pricing.title")}
            desc={t("lp.pricing.desc")}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="switch">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={!annual ? "on" : ""}
            >
              {t("lp.pricing.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={annual ? "on" : ""}
            >
              {t("lp.pricing.yearly")}
              <small>
                {t("lp.pricing.save", { percent: maxAnnualDiscount })}
              </small>
            </button>
          </div>
        </Reveal>

        <div className="plans">
          <p className="plans-note">{t("lp.pricing.note")}</p>

          {plansLoading && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              {t("Loading plans")}…
            </p>
          )}
          {plansError && !plansLoading && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              {t("Backend unavailable message")}
            </p>
          )}

          {!plansLoading &&
            localizedPlans.map((plan, i) => (
              <Reveal delay={i * 0.1} key={plan.id} fill>
                <article className={plan.popular ? "chosen" : ""}>
                  {plan.popular && <label>{t("lp.pricing.popular")}</label>}
                  <h3>
                    {plan.name}
                    <span className="plan-tag">
                      {plan.popular
                        ? t("lp.pricing.planTagBest")
                        : t("lp.pricing.planTag")}
                    </span>
                  </h3>
                  <div className="price">
                    <sup>$</sup>
                    {priceFor(plan.monthlyPrice, plan.annualPrice)}
                    <small>
                      {annual
                        ? t("lp.pricing.perYear")
                        : t("lp.pricing.perMonth")}
                    </small>
                  </div>
                  <ul>
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`btn full ${plan.popular ? "primary" : "soft"}`}
                  >
                    {t("lp.start")}
                  </Link>
                </article>
              </Reveal>
            ))}
        </div>

        <Reveal delay={0.2}>
          <div className="pricing-cta">
            <div className="pricing-cta-copy">
              <h3>{t("lp.pricing.cta.title")}</h3>
              <p>{t("lp.pricing.cta.tagline")}</p>
            </div>
            <span className="btn primary">
              {t("lp.pricing.cta.title")}
              <ArrowRight />
            </span>
          </div>
        </Reveal>
      </section>

      <SiteFooter />

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </main>
  );
}

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown, Globe2, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { setLanguage } from "../lib/setLanguage";

const LANGS = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
] as const;

export function SiteNav() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  const jumpToSection = (id: string) => (e: ReactMouseEvent) => {
    if (location.pathname !== "/") return; // let the Link navigate to / then land on the hash
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectLang = (code: string) => {
    setLanguage(code);
    setLangOpen(false);
  };

  return (
    <nav className="nav shell">
      <Link className="brand" to="/">
        <Logo className="h-7 object-contain" />
      </Link>

      <div className="links">
        <Link to="/#features" onClick={jumpToSection("features")}>
          {t("lp.nav.features")}
        </Link>
        <Link to="/#pricing" onClick={jumpToSection("pricing")}>
          {t("lp.nav.pricing")}
        </Link>
        <Link to="/themes">{t("lp.nav.themes")}</Link>
        <Link to="/faq">{t("lp.nav.faq")}</Link>
      </div>

      <div className="actions">
        <button
          type="button"
          className="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun /> : <Moon />}
        </button>

        <div className="langs" ref={langRef}>
          <button
            type="button"
            className="lang"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
          >
            <Globe2 /> {i18n.language.toUpperCase()} <ChevronDown />
          </button>
          {langOpen && (
            <div className="langmenu">
              {LANGS.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => selectLang(l.code)}
                  className={i18n.language === l.code ? "sel" : ""}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <Link
            className="btn primary small"
            to={user.role === "ADMIN" ? "/admin" : "/dashboard"}
          >
            {t("lp.controlPanel")}
            <ArrowRight />
          </Link>
        ) : (
          <>
            <Link className="login" to="/login">
              {t("lp.login")}
            </Link>
            <Link className="btn primary small" to="/register">
              {t("lp.start")}
              <ArrowRight />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

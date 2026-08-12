import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Instagram, Music2 } from "lucide-react";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer>
      <div className="shell foot">
        <div>
          <Link className="brand" to="/">
            <Logo className="h-7 object-contain brightness-0 invert" />
          </Link>

          <p>{t("lp.footer.desc")}</p>
        </div>

        <div>
          <strong>{t("lp.footer.product")}</strong>
          <Link to="/#features">{t("lp.nav.features")}</Link>
          <Link to="/#pricing">{t("lp.nav.pricing")}</Link>
          <Link to="/themes">{t("lp.footer.themes")}</Link>
          <Link to="/faq">{t("lp.footer.faq")}</Link>
        </div>

        <div>
          <strong>{t("lp.footer.contact")}</strong>

          <a href="mailto:hello@asnafii.com">hello@asnafii.com</a>

          <div className="social-links">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.963 6.817H1.684l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
                />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/asnafione?igsh=MW92djNsMWRlc2VvZg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>

            <a
              href="https://www.tiktok.com/@asnafione?_r=1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <Music2 size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="shell copyright">
        {t("lp.footer.rights")}

        <div className="legal-links">
          <Link to="/privacy">{t("Privacy Policy")}</Link>
          <Link to="/terms">{t("Terms and Conditions")}</Link>
        </div>
      </div>
    </footer>
  );
}

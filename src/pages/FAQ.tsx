import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import "../styles/landing.css";

const FAQ_COUNT = 20;

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="site">
      <SiteNav />

      <section className="faq-page shell">
        <div className="faq-heading heading center">
          <span>{t("lp.faq.tag")}</span>

          <h1>
            {t("lp.faq.title")}
            <br />
            <i>{t("lp.faq.titleAccent")}</i>
          </h1>

          <p>{t("lp.faq.desc")}</p>
        </div>

        <div className="faq-list">
          {Array.from({ length: FAQ_COUNT }, (_, index) => {
            const number = index + 1;
            const isOpen = openIndex === index;

            return (
              <div
                className={`faq-item ${isOpen ? "is-open" : ""}`}
                key={number}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{t(`lp.faq.question.${number}`)}</span>

                  <span className="faq-icon">
                    <ChevronDown />
                  </span>
                </button>

                <div className="faq-answer">
                  <p>{t(`lp.faq.answer.${number}`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

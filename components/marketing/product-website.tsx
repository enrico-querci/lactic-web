"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAuth } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { websiteCopy } from "./copy";
import styles from "./website.module.css";

type Product = "lactic" | "studio";

function Arrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Brand({ studio = false }: { studio?: boolean }) {
  return (
    <span className={styles.brand}>
      lactic<span className={styles.brandDot}>.</span>
      {studio && <span className={styles.brandStudio}>studio</span>}
    </span>
  );
}

export default function ProductWebsite() {
  const { user } = useAuth();
  const { locale, setLocale } = useLocale();
  const copy = websiteCopy[locale];
  const [product, setProduct] = useState<Product>("lactic");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const studio = product === "studio";
  const accountHref = user
    ? user.role === "coach"
      ? "/coach/programs"
      : "/client/programs"
    : "/login";
  const features = studio ? copy.studioFeatures : copy.clientFeatures;

  useEffect(() => {
    const restoreProduct = () => {
      if (window.location.hash === "#studio") setProduct("studio");
      else if (window.location.hash === "#lactic" || !window.location.hash)
        setProduct("lactic");
    };
    restoreProduct();
    window.addEventListener("hashchange", restoreProduct);
    return () => window.removeEventListener("hashchange", restoreProduct);
  }, []);

  function selectProduct(next: Product) {
    setProduct(next);
    window.history.replaceState(
      null,
      "",
      next === "studio" ? "#studio" : "#lactic",
    );
  }

  function onTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight")
      nextIndex = 1 - index;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = 1;
    else return;
    event.preventDefault();
    selectProduct(nextIndex === 0 ? "lactic" : "studio");
    tabs.current[nextIndex]?.focus();
  }

  return (
    <div className={styles.site} lang={locale}>
      <a className={styles.skip} href="#main">
        {copy.skip}
      </a>
      <header className={styles.header}>
        <a
          href="#lactic"
          aria-label="Lactic"
          onClick={() => selectProduct("lactic")}
        >
          <Brand />
        </a>
        <nav
          className={styles.nav}
          aria-label={
            locale === "it" ? "Navigazione principale" : "Main navigation"
          }
        >
          <a className={styles.aboutLink} href="#how-it-works">
            {copy.nav}
          </a>
          <div
            className={styles.languages}
            aria-label={locale === "it" ? "Lingua" : "Language"}
          >
            <button
              type="button"
              lang="it"
              aria-label="Italiano"
              aria-pressed={locale === "it"}
              onClick={() => setLocale("it")}
            >
              IT
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              lang="en"
              aria-label="English"
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
          <Link className={styles.login} href={accountHref}>
            {user ? copy.dashboard : copy.login}
            <Arrow />
          </Link>
        </nav>
      </header>
      <main id="main">
        <div
          className={styles.productPicker}
          role="tablist"
          aria-label={copy.switchLabel}
        >
          {(["lactic", "studio"] as const).map((item, index) => (
            <button
              key={item}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`tab-${item}`}
              aria-controls="product-panel"
              aria-selected={product === item}
              tabIndex={product === item ? 0 : -1}
              onClick={() => selectProduct(item)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              <span>{item === "lactic" ? "Lactic" : "Lactic Studio"}</span>
              <small>{item === "lactic" ? copy.athlete : copy.coach}</small>
            </button>
          ))}
        </div>
        <div
          id="product-panel"
          role="tabpanel"
          aria-labelledby={`tab-${product}`}
          tabIndex={0}
          className={styles.productPanel}
        >
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{copy.eyebrow}</p>
              <h1 id="hero-title">
                {studio ? copy.studioTitle : copy.clientTitle}
                <br />
                <span>
                  {studio ? copy.studioHighlight : copy.clientHighlight}
                </span>
              </h1>
              <p className={styles.description}>
                {studio ? copy.studioDescription : copy.clientDescription}
              </p>
              <Link className={styles.primaryButton} href={accountHref}>
                {user
                  ? copy.dashboard
                  : studio
                    ? copy.studioCta
                    : copy.clientCta}
                <Arrow />
              </Link>
              <p className={styles.ctaNote}>
                {studio ? copy.studioNote : copy.clientNote}
              </p>
            </div>
            <figure
              className={`${styles.showcase} ${studio ? styles.studioShowcase : ""}`}
            >
              <div className={styles.showcaseLabel}>
                <span>
                  {studio ? copy.studioImageLabel : copy.clientImageLabel}
                </span>
                <span aria-hidden="true">↗</span>
              </div>
              <div className={styles.screenStage}>
                {studio ? (
                  <div className={styles.tablet}>
                    <Image
                      src="/images/marketing/lactic-studio.png"
                      alt={copy.studioAlt}
                      width={2064}
                      height={2752}
                      sizes="(max-width: 500px) 245px, 330px"
                      priority
                    />
                  </div>
                ) : (
                  <>
                    <div className={`${styles.phone} ${styles.phoneBack}`}>
                      <Image
                        src="/images/marketing/lactic-home.png"
                        alt={copy.homeAlt}
                        width={1206}
                        height={2622}
                        sizes="(max-width: 700px) 46vw, 245px"
                        priority
                      />
                    </div>
                    <div className={`${styles.phone} ${styles.phoneFront}`}>
                      <Image
                        src="/images/marketing/lactic-workout.png"
                        alt={copy.workoutAlt}
                        width={1206}
                        height={2622}
                        sizes="(max-width: 700px) 49vw, 265px"
                        priority
                      />
                    </div>
                  </>
                )}
              </div>
              <figcaption>{copy.nativeStatus}</figcaption>
            </figure>
          </section>
          <section
            className={styles.features}
            aria-label={studio ? "Lactic Studio" : "Lactic"}
          >
            {features.map((feature, index) => (
              <article key={feature.title}>
                <span className={styles.featureNumber}>0{index + 1}</span>
                <h2>{feature.title}</h2>
                <p>{feature.body}</p>
              </article>
            ))}
          </section>
        </div>
        <section
          className={styles.connection}
          id="how-it-works"
          aria-labelledby="connection-title"
        >
          <div>
            <p className={styles.eyebrow}>{copy.connectionEyebrow}</p>
            <h2 id="connection-title">{copy.connectionTitle}</h2>
          </div>
          <div className={styles.connectionDetail}>
            <p>{copy.connectionBody}</p>
            <ol>
              {copy.steps.map((step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className={styles.closing} aria-labelledby="closing-title">
          <div>
            <Brand studio />
            <h2 id="closing-title">{copy.closing}</h2>
          </div>
          <div>
            <p>{copy.closingBody}</p>
            <Link className={styles.limeButton} href={accountHref}>
              {user ? copy.dashboard : copy.closingCta}
              <Arrow />
            </Link>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div>
          <Brand />
          <p>{copy.footer}</p>
        </div>
        <p>
          {copy.availability}
          <br />© {new Date().getFullYear()} Lactic
        </p>
      </footer>
    </div>
  );
}

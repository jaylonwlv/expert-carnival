"use client";

import { useEffect, useState } from "react";

// /california and /optin both stack a hero, value props, and how-it-works
// (plus, on /california, the tax calculator) above the lead form -- once a
// visitor has scrolled past the hero, the real submit button can still be
// below the fold. This floating shortcut shows only in that specific gap.
//
// Previously measured as fractions of the viewport height via scroll +
// getBoundingClientRect, which stopped working once later content/spacing
// changes shortened the page: "hero mostly gone" and "form visible" ended
// up true at nearly the same scroll position, so the bar never showed at
// all on common phone sizes -- confirmed directly via Playwright, not
// assumed.
//
// The second signal is specifically the submit button, not the form card
// as a whole: the card (inputs + checkbox + legal text + button) is
// taller than one screen on a short phone, so "the whole card is in view"
// and "the button itself is in view" are quite different moments -- using
// the card's own visibility left the floating bar rendered directly on
// top of the real button for a stretch of scroll, which looked like two
// near-identical buttons stacked on each other (caught by screenshot, not
// assumed either).
export function StickyCtaBar({
  heroId,
  formId,
  label,
}: {
  heroId: string;
  formId: string;
  label: string;
}) {
  const [heroGone, setHeroGone] = useState(false);
  const [submitButtonVisible, setSubmitButtonVisible] = useState(false);

  useEffect(() => {
    const heroEl = document.getElementById(heroId);
    const formEl = document.getElementById(formId);
    const submitEl = formEl?.querySelector('button[type="submit"]');
    if (!heroEl || !submitEl) return;

    const heroObserver = new IntersectionObserver(([entry]) => setHeroGone(!entry.isIntersecting), {
      threshold: 0,
    });
    const submitObserver = new IntersectionObserver(([entry]) => setSubmitButtonVisible(entry.isIntersecting));
    heroObserver.observe(heroEl);
    submitObserver.observe(submitEl);

    return () => {
      heroObserver.disconnect();
      submitObserver.disconnect();
    };
  }, [heroId, formId]);

  function scrollToForm() {
    document.getElementById(formId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!heroGone || submitButtonVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToForm}
      className="fixed bottom-4 left-4 right-4 z-20 mx-auto max-w-xs rounded-full bg-amber-600 text-white text-sm font-semibold py-3 shadow-lg shadow-black/10 hover:bg-amber-700 transition"
    >
      {label}
    </button>
  );
}

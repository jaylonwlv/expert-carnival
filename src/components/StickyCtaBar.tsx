"use client";

import { useEffect, useState } from "react";

// /california stacks the hero, value props, how-it-works, and the tax
// calculator above the form. Measured against the page's actual rendered
// height (not assumed), the gap between "hero mostly scrolled away" and
// "form becomes visible" is real but narrow -- so both edges are read as
// fractions of the viewport height (not fixed pixel guesses) to stay
// correct across phone sizes: show once the hero is mostly gone, hide once
// the form is substantially on screen, whichever device this renders on.
export function StickyCtaBar({
  heroId,
  formId,
  label,
}: {
  heroId: string;
  formId: string;
  label: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroEl = document.getElementById(heroId);
    const formEl = document.getElementById(formId);
    if (!heroEl || !formEl) return;

    function update() {
      const heroMostlyGone = heroEl!.getBoundingClientRect().bottom <= window.innerHeight * 0.3;
      const formMeaningfullyVisible = formEl!.getBoundingClientRect().top <= window.innerHeight * 0.6;
      setVisible(heroMostlyGone && !formMeaningfullyVisible);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [heroId, formId]);

  function scrollToForm() {
    document.getElementById(formId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!visible) return null;

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

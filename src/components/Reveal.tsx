"use client";

import { useEffect, useRef, useState } from "react";

// Fades an element up into place the first time it scrolls into view --
// same IntersectionObserver primitive already used elsewhere in this app
// (StickyCtaBar, BRollVideo), not a new animation library. Reveals once
// and stays revealed; it doesn't re-hide if scrolled back past, which
// would just be distracting on a second pass down the page.
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

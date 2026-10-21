import { BUSINESS } from "@/lib/business";

// Simplified, single-color glyphs (not the exact brand marks) -- same
// fair-use, link-identification role as any other footer social row, kept
// visually consistent with this app's other inline-SVG icons (viewBox
// 0 0 24 24, fill="currentColor").
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M22.5 7.2a2.8 2.8 0 00-2-2C18.7 4.7 12 4.7 12 4.7s-6.7 0-8.5.5a2.8 2.8 0 00-2 2C1 9 1 12 1 12s0 3 .5 4.8a2.8 2.8 0 002 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 002-2C23 15 23 12 23 12s0-3-.5-4.8zM9.8 15.4V8.6l6 3.4-6 3.4z" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16.6 2h-3.2v13.6a2.9 2.9 0 11-2.9-2.9c.3 0 .6 0 .9.1V9.6a6 6 0 10.9 11.9c3.3 0 6-2.7 6-6V8.2a7.9 7.9 0 004.7 1.6V6.6a4.8 4.8 0 01-3.3-1.4A4.8 4.8 0 0116.6 2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M4.98 3.5a2 2 0 110 4 2 2 0 010-4zM3 9h4v12H3V9zm6.5 0h3.8v1.7h.05c.5-.95 1.75-1.95 3.6-1.95 3.85 0 4.55 2.5 4.55 5.75V21h-4v-5.5c0-1.3-.025-3-1.85-3-1.85 0-2.15 1.4-2.15 2.9V21h-4V9z" />
    </svg>
  );
}

function GoogleBusinessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: BUSINESS.social.youtube, label: "YouTube", Icon: YoutubeIcon },
  { href: BUSINESS.social.tiktok, label: "TikTok", Icon: TiktokIcon },
  { href: BUSINESS.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: BUSINESS.social.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: BUSINESS.social.googleBusiness, label: "Google Business profile", Icon: GoogleBusinessIcon },
];

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="text-stone-400 hover:text-stone-700 transition"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

const PHONE = "+506 7107-0803";
const EMAIL = "management@zenithlr.com";

const iconClass = "h-4 w-4";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.32 1.6.57 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.25 1.55.44 2.36.57A2 2 0 0 1 22 16.92z"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} fill-current`} aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-7H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} fill-current`} aria-hidden>
      <path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2Zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1Zm6.2-8.2a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1ZM12 4.4c1.6 0 1.8 0 2.5.1a4.3 4.3 0 0 1 1.4.3 2.7 2.7 0 0 1 1.5 1.5 4.3 4.3 0 0 1 .3 1.4c.1.7.1.9.1 2.5s0 1.8-.1 2.5a4.3 4.3 0 0 1-.3 1.4 2.7 2.7 0 0 1-1.5 1.5 4.3 4.3 0 0 1-1.4.3c-.7.1-.9.1-2.5.1s-1.8 0-2.5-.1a4.3 4.3 0 0 1-1.4-.3 2.7 2.7 0 0 1-1.5-1.5 4.3 4.3 0 0 1-.3-1.4c-.1-.7-.1-.9-.1-2.5s0-1.8.1-2.5a4.3 4.3 0 0 1 .3-1.4 2.7 2.7 0 0 1 1.5-1.5 4.3 4.3 0 0 1 1.4-.3c.7-.1.9-.1 2.5-.1Zm0-1.7c-1.6 0-1.8 0-2.5.1a6 6 0 0 0-2 .4 4.4 4.4 0 0 0-2.5 2.5 6 6 0 0 0-.4 2c-.1.7-.1.9-.1 2.5s0 1.8.1 2.5a6 6 0 0 0 .4 2 4.4 4.4 0 0 0 2.5 2.5 6 6 0 0 0 2 .4c.7.1.9.1 2.5.1s1.8 0 2.5-.1a6 6 0 0 0 2-.4 4.4 4.4 0 0 0 2.5-2.5 6 6 0 0 0 .4-2c.1-.7.1-.9.1-2.5s0-1.8-.1-2.5a6 6 0 0 0-.4-2 4.4 4.4 0 0 0-2.5-2.5 6 6 0 0 0-2-.4c-.7-.1-.9-.1-2.5-.1Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} fill-current`} aria-hidden>
      <path d="M19.6 7.8a5.4 5.4 0 0 1-3.2-1V15a5.5 5.5 0 1 1-5.5-5.5c.2 0 .5 0 .7.1v2.8a2.7 2.7 0 1 0 1.9 2.6V2.2h2.8a5.4 5.4 0 0 0 3.3 4.4V7.8Z" />
    </svg>
  );
}

const linkClass = "inline-flex items-center gap-1.5 text-ink/80 transition-colors hover:text-ink";

export function ContactBar() {
  return (
    <div className="border-b border-sand-soft bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[13px] text-ink lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <a href={`tel:${PHONE.replace(/\s/g, "")}`} className={`${linkClass} whitespace-nowrap`}>
            <PhoneIcon />
            {PHONE}
          </a>
          <a href={`mailto:${EMAIL}`} className={linkClass} aria-label={EMAIL}>
            <EmailIcon />
          </a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="https://www.facebook.com/profile.php?id=61590554156172"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label="Facebook Zenith LR"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.instagram.com/Zenithluxuryrealty"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label="Instagram Zenith Luxury Realty"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://www.tiktok.com/@barealestates_"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label="TikTok @barealestates_"
          >
            <TikTokIcon />
          </a>
          <a
            href="https://www.tiktok.com/@springer.real.estate"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label="TikTok @springer.real.estate"
          >
            <TikTokIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

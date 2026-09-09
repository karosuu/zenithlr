export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/50671070803"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sand shadow-lg transition hover:bg-sand hover:text-ink"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3a9 9 0 1 1 7.9 4.5Zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.1 8.1 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.1-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.5-.8-2s-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1 15.6 15.6 0 0 0 1.6.6 3.8 3.8 0 0 0 1.8.1 3 3 0 0 0 2-1.3 2.4 2.4 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.3Z" />
      </svg>
    </a>
  );
}

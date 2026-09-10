export function TwitchIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}

export function KickIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg viewBox="0 0 21 24" className={className} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 .028h7.7v5.32h2.561v-2.66h2.562V.028h7.7v7.996H17.96v2.66h-2.562v2.66h2.562v2.66h2.562V24h-7.699v-2.66h-2.562v-2.66H7.7V24H0V.028Z"
      />
    </svg>
  );
}

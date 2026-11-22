import React from 'react';

export function FlagPL({ className = 'flag-svg' }) {
  return (
    <svg className={className} viewBox="0 0 640 480" width="100%" height="100%">
      <rect width="640" height="240" fill="#ffffff" />
      <rect y="240" width="640" height="240" fill="#dc143c" />
    </svg>
  );
}

export function FlagUA({ className = 'flag-svg' }) {
  return (
    <svg className={className} viewBox="0 0 640 480" width="100%" height="100%">
      <rect width="640" height="240" fill="#0057b7" />
      <rect y="240" width="640" height="240" fill="#ffd700" />
    </svg>
  );
}

export function FlagEN({ className = 'flag-svg' }) {
  return (
    <svg className={className} viewBox="0 0 60 30" width="100%" height="100%">
      <clipPath id="uk-clip-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="uk-clip-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#uk-clip-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-clip-t)" stroke="#c8102e" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

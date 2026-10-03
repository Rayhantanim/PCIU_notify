// src/data/countries.js
// A small starter list — add more as needed.
// `iso` is a 2-letter ISO code we render as an emoji flag.
export const countries = [
  { name: 'United Kingdom', iso: 'GB', dial: '+44' },
  { name: 'United States',  iso: 'US', dial: '+1' },
  { name: 'Canada',         iso: 'CA', dial: '+1' },
  { name: 'Australia',      iso: 'AU', dial: '+61' },
  { name: 'India',          iso: 'IN', dial: '+91' },
  { name: 'Bangladesh',     iso: 'BD', dial: '+880' },
  { name: 'Pakistan',       iso: 'PK', dial: '+92' },
  { name: 'Germany',        iso: 'DE', dial: '+49' },
  { name: 'France',         iso: 'FR', dial: '+33' },
  { name: 'Spain',          iso: 'ES', dial: '+34' },
  { name: 'Italy',          iso: 'IT', dial: '+39' },
  { name: 'Netherlands',    iso: 'NL', dial: '+31' },
  { name: 'UAE',            iso: 'AE', dial: '+971' },
  { name: 'Saudi Arabia',   iso: 'SA', dial: '+966' },
  { name: 'China',          iso: 'CN', dial: '+86' },
  { name: 'Japan',          iso: 'JP', dial: '+81' },
  { name: 'Nigeria',        iso: 'NG', dial: '+234' },
  { name: 'South Africa',   iso: 'ZA', dial: '+27' },
];

// Turn "GB" → 🇬🇧
export const isoToFlagEmoji = (iso) =>
  iso.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
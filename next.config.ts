import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// ── Content-Security-Policy ──────────────────────────────────────────────────
// Autorise : scripts Next.js, Stripe.js, hCaptcha ; frames Stripe & hCaptcha ;
// connexions API Stripe et hCaptcha ; images et fonts self + data URIs.
const CSP = [
  "default-src 'self'",
  // Next.js requiert unsafe-inline pour l'hydratation React.
  // unsafe-eval uniquement en dev pour le React Compiler (retiré en production).
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""} https://js.hcaptcha.com https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src https://hcaptcha.com https://*.hcaptcha.com https://js.stripe.com https://*.stripe.com https://www.google.com https://maps.google.com",
  "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://api.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Empêche le clickjacking (iframe embedding dans d'autres sites)
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Protection XSS pour navigateurs anciens
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Contrôle les infos envoyées dans le Referer header
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive accès caméra / micro / géolocalisation
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS pendant 1 an (HSTS) — à n'activer qu'en production
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
  // Content-Security-Policy
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  async headers() {
    return [
      {
        // Appliquer les headers à toutes les routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

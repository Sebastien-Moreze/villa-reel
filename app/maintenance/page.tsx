/**
 * Page de maintenance — affichée quand MAINTENANCE_MODE=true dans .env
 * Accessible à /maintenance — tout le reste du site est redirigé ici.
 * Les routes /api/* et /admin/* restent accessibles (voir middleware.ts).
 */
export default function MaintenancePage() {
  return (
    <html lang="fr">
      <head>
        <title>Maintenance — Villa R.E.E.L</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #1a0f0a 0%, #2d1a10 50%, #1a0f0a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            padding: 2rem;
          }
          .card {
            text-align: center;
            max-width: 480px;
          }
          .logo {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
          }
          .logo-badge {
            background: linear-gradient(135deg, #633C2B, #A0522D);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.3em;
            color: #fff;
          }
          .logo-text {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.35em;
            color: rgba(255,255,255,0.9);
          }
          .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 1.5rem;
            background: rgba(163,113,76,0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(163,113,76,0.3);
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
          }
          .subtitle {
            font-size: 0.85rem;
            color: rgba(255,255,255,0.7);
            line-height: 1.6;
            margin-bottom: 2rem;
          }
          .divider {
            width: 48px;
            height: 2px;
            background: linear-gradient(90deg, #633C2B, #A0522D);
            margin: 1.5rem auto;
            border-radius: 1px;
          }
          .contact {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.5);
          }
          .contact a {
            color: rgba(163,113,76,0.9);
            text-decoration: none;
          }
          .contact a:hover { text-decoration: underline; }
          .badge {
            display: inline-block;
            background: rgba(163,113,76,0.15);
            border: 1px solid rgba(163,113,76,0.3);
            color: rgba(163,113,76,0.9);
            font-size: 0.65rem;
            font-weight: 600;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            padding: 0.3rem 0.75rem;
            border-radius: 9999px;
            margin-bottom: 1.25rem;
          }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="logo">
            <span className="logo-badge">VILLA</span>
            <span className="logo-text">R.E.E.L</span>
          </div>

          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="rgba(163,113,76,0.9)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>

          <div className="badge">Maintenance en cours</div>

          <h1>Nous revenons bientôt</h1>
          <p className="subtitle">
            Le site Villa R.E.E.L est temporairement indisponible le temps d&apos;une
            mise à jour. Toutes vos réservations existantes sont sécurisées et préservées.
          </p>

          <div className="divider" />

          <p className="contact">
            Une urgence ?{" "}
            <a href="mailto:contact@villareel.com">contact@villareel.com</a>
          </p>
        </div>
      </body>
    </html>
  );
}

/**
 * Déclaration globale de l'API hCaptcha JS.
 * Utilisée par ContactForm.tsx et ReservationStep3.tsx.
 */
declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          size?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

export {};

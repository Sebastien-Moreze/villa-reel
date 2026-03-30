/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import { AvailabilityCalendar } from "@/components/villa/AvailabilityCalendar";

/* ── Mocks ──────────────────────────────────────────────────────────── */

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "calendar.loading": "Chargement...",
      "calendar.available": "Disponible",
      "calendar.unavailable": "Indisponible",
    };
    return translations[key] ?? key;
  },
  useLocale: () => "fr",
}));

// Mock date-fns (passthrough)
jest.mock("date-fns", () => ({
  subMonths: jest.requireActual("date-fns").subMonths,
  addMonths: jest.requireActual("date-fns").addMonths,
  startOfMonth: jest.requireActual("date-fns").startOfMonth,
  endOfMonth: jest.requireActual("date-fns").endOfMonth,
}));

/* ── Tests ────────────────────────────────────────────────────────────── */

describe("AvailabilityCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche un loading puis charge les données", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ blocked: [] }),
    });

    render(<AvailabilityCalendar villaId={1} />);

    // Le composant devrait afficher les labels de jours FR
    await waitFor(() => {
      expect(screen.getByText("L")).toBeInTheDocument();
      expect(screen.getByText("V")).toBeInTheDocument();
      expect(screen.getByText("D")).toBeInTheDocument();
    });
  });

  it("appelle /api/availability avec le bon villaId", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ blocked: [] }),
    });

    render(<AvailabilityCalendar villaId={42} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/availability?villaId=42")
      );
    });
  });

  it("affiche la légende Disponible et Indisponible", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ blocked: [] }),
    });

    render(<AvailabilityCalendar villaId={1} />);

    await waitFor(() => {
      expect(screen.getByText("Disponible")).toBeInTheDocument();
      expect(screen.getByText("Indisponible")).toBeInTheDocument();
    });
  });

  it("affiche les boutons de navigation ← et →", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ blocked: [] }),
    });

    render(<AvailabilityCalendar villaId={1} />);

    expect(screen.getByText("←")).toBeInTheDocument();
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("gère une erreur fetch sans crash", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    // Ne devrait pas throw
    render(<AvailabilityCalendar villaId={1} />);

    await waitFor(() => {
      // Le composant doit quand même s'afficher
      expect(screen.getByText("←")).toBeInTheDocument();
    });
  });

  it("gère une réponse non-ok sans crash", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<AvailabilityCalendar villaId={1} />);

    await waitFor(() => {
      expect(screen.getByText("←")).toBeInTheDocument();
    });
  });
});

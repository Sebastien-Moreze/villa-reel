// Charge jest-dom uniquement quand le DOM est disponible (tests jsdom)
if (typeof document !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@testing-library/jest-dom");
}

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "fr",
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/fr",
  useSearchParams: () => new URLSearchParams(),
}));

// Reset all mocks between tests
afterEach(() => {
  jest.restoreAllMocks();
});

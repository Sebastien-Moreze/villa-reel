import { logger } from "@/lib/logger";

describe("logger", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("en mode développement", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("logger.info écrit dans console.info", () => {
      const spy = jest.spyOn(console, "info").mockImplementation();
      logger.info("Test info");
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toContain("Test info");
    });

    it("logger.warn écrit dans console.warn", () => {
      const spy = jest.spyOn(console, "warn").mockImplementation();
      logger.warn("Test warn");
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toContain("Test warn");
    });

    it("logger.error écrit dans console.error", () => {
      const spy = jest.spyOn(console, "error").mockImplementation();
      logger.error("Test error");
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toContain("Test error");
    });

    it("logger.debug écrit via console.log en dev", () => {
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.debug("Test debug");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("logger.info inclut le contexte", () => {
      const spy = jest.spyOn(console, "info").mockImplementation();
      logger.info("Réservation créée", { reservationId: 42 });
      expect(spy.mock.calls[0][0]).toContain("reservationId");
    });

    it("sérialise les Error dans le contexte", () => {
      const spy = jest.spyOn(console, "error").mockImplementation();
      const err = new Error("DB down");
      logger.error("Erreur BDD", { error: err });
      const output = spy.mock.calls[0][0];
      expect(output).toContain("DB down");
    });
  });

  describe("en mode production", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("logger.info écrit du JSON sur stdout", () => {
      const spy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
      logger.info("Prod info");
      expect(spy).toHaveBeenCalledTimes(1);
      const output = spy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe("info");
      expect(parsed.message).toBe("Prod info");
      expect(parsed.ts).toBeDefined();
    });

    it("logger.error écrit sur stderr", () => {
      const spy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
      logger.error("Prod error");
      expect(spy).toHaveBeenCalledTimes(1);
      const output = spy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe("error");
    });

    it("logger.warn écrit sur stderr", () => {
      const spy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
      logger.warn("Prod warn");
      expect(spy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(spy.mock.calls[0][0] as string);
      expect(parsed.level).toBe("warn");
    });

    it("logger.debug ne s'exécute pas en prod sans LOG_LEVEL=debug", () => {
      const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
      const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
      delete process.env.LOG_LEVEL;
      logger.debug("Should not appear");
      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it("logger.debug s'exécute en prod si LOG_LEVEL=debug", () => {
      process.env.LOG_LEVEL = "debug";
      const spy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
      logger.debug("Debug en prod");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("sérialise les Error sans stack en production", () => {
      const spy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
      const err = new Error("crash");
      logger.error("Erreur", { error: err });
      const parsed = JSON.parse(spy.mock.calls[0][0] as string);
      expect(parsed.error.name).toBe("Error");
      expect(parsed.error.message).toBe("crash");
      expect(parsed.error.stack).toBeUndefined();
    });
  });
});

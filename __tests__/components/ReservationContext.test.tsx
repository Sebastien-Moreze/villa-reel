/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ReservationProvider,
  useReservation,
} from "@/components/reservation/ReservationContext";

/* ── Composant helper pour tester le contexte ────────────────────────── */

function TestConsumer() {
  const ctx = useReservation();
  return (
    <div>
      <span data-testid="drawer-state">
        {ctx.isOpen ? "open" : "closed"}
      </span>
      <span data-testid="availability-state">
        {ctx.isAvailabilityOpen ? "open" : "closed"}
      </span>
      <button onClick={ctx.openDrawer}>open-drawer</button>
      <button onClick={ctx.closeDrawer}>close-drawer</button>
      <button onClick={ctx.openAvailability}>open-availability</button>
      <button onClick={ctx.closeAvailability}>close-availability</button>
    </div>
  );
}

/* ── Tests ────────────────────────────────────────────────────────────── */

describe("ReservationContext", () => {
  it("le drawer est fermé par défaut", () => {
    render(
      <ReservationProvider>
        <TestConsumer />
      </ReservationProvider>
    );
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("closed");
  });

  it("openDrawer ouvre le drawer", async () => {
    const user = userEvent.setup();
    render(
      <ReservationProvider>
        <TestConsumer />
      </ReservationProvider>
    );
    await user.click(screen.getByText("open-drawer"));
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("open");
  });

  it("closeDrawer ferme le drawer", async () => {
    const user = userEvent.setup();
    render(
      <ReservationProvider>
        <TestConsumer />
      </ReservationProvider>
    );
    await user.click(screen.getByText("open-drawer"));
    await user.click(screen.getByText("close-drawer"));
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("closed");
  });

  it("la modale de disponibilité est fermée par défaut", () => {
    render(
      <ReservationProvider>
        <TestConsumer />
      </ReservationProvider>
    );
    expect(screen.getByTestId("availability-state")).toHaveTextContent("closed");
  });

  it("openAvailability ouvre la modale", async () => {
    const user = userEvent.setup();
    render(
      <ReservationProvider>
        <TestConsumer />
      </ReservationProvider>
    );
    await user.click(screen.getByText("open-availability"));
    expect(screen.getByTestId("availability-state")).toHaveTextContent("open");
  });

  it("closeAvailability ferme la modale", async () => {
    const user = userEvent.setup();
    render(
      <ReservationProvider>
        <TestConsumer />
      </ReservationProvider>
    );
    await user.click(screen.getByText("open-availability"));
    await user.click(screen.getByText("close-availability"));
    expect(screen.getByTestId("availability-state")).toHaveTextContent("closed");
  });

  it("drawer et availability sont indépendants", async () => {
    const user = userEvent.setup();
    render(
      <ReservationProvider>
        <TestConsumer />
      </ReservationProvider>
    );
    await user.click(screen.getByText("open-drawer"));
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("open");
    expect(screen.getByTestId("availability-state")).toHaveTextContent("closed");
  });

  it("useReservation retourne des valeurs par défaut hors Provider", () => {
    // Sans Provider, le contexte utilise les valeurs par défaut
    render(<TestConsumer />);
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("closed");
    expect(screen.getByTestId("availability-state")).toHaveTextContent("closed");
  });
});

'use client';

import { createContext, useContext, useState, ReactNode } from "react";

type ReservationContextType = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  isAvailabilityOpen: boolean;
  openAvailability: () => void;
  closeAvailability: () => void;
};

const ReservationContext = createContext<ReservationContextType>({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  isAvailabilityOpen: false,
  openAvailability: () => {},
  closeAvailability: () => {},
});

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  return (
    <ReservationContext.Provider
      value={{
        isOpen,
        openDrawer: () => setIsOpen(true),
        closeDrawer: () => setIsOpen(false),
        isAvailabilityOpen,
        openAvailability: () => setIsAvailabilityOpen(true),
        closeAvailability: () => setIsAvailabilityOpen(false),
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export const useReservation = () => useContext(ReservationContext);

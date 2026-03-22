import { useState, createContext, useContext, ReactNode } from "react";

interface LeadCaptureContextType {
  isOpen: boolean;
  openCapture: () => void;
  closeCapture: () => void;
  isSubmitted: boolean;
  setSubmitted: () => void;
}

const LeadCaptureContext = createContext<LeadCaptureContextType | null>(null);

export function LeadCaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <LeadCaptureContext.Provider
      value={{
        isOpen,
        openCapture: () => setIsOpen(true),
        closeCapture: () => setIsOpen(false),
        isSubmitted,
        setSubmitted: () => {
          setIsSubmitted(true);
          setIsOpen(false);
        },
      }}
    >
      {children}
    </LeadCaptureContext.Provider>
  );
}

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) throw new Error("useLeadCapture must be used within LeadCaptureProvider");
  return ctx;
}

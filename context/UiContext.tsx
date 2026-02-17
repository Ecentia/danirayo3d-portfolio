'use client';

import React, { createContext, useContext, useState } from 'react';

type UiContextType = {
  isProjectModalOpen: boolean;
  setProjectModalOpen: (value: boolean) => void;
};

const UiContext = createContext<UiContextType | undefined>(undefined);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  return (
    <UiContext.Provider value={{ isProjectModalOpen, setProjectModalOpen }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const context = useContext(UiContext);
  if (context === undefined) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
}
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

interface AdminContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Usamos un cliente seguro que no falla si faltan envs momentáneamente
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      } catch (e) {
        console.error("Error sesión:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AdminContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin debe usarse dentro de AdminProvider");
  return context;
};
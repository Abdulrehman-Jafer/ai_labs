"use client";

import { app } from "@/firebase/client";
import { use_Auth_State } from "@/stores/auth_provider";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const { user, set_user } = use_Auth_State();

  const auth = getAuth(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (auth_user) => {
      if (auth_user) {
        set_user(auth_user);
      } else set_user(user ?? null);
    });

    return () => unsub();
  }, []);

  return { user, auth };
};

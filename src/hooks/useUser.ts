import { useContext, useEffect, useState } from "react";
import UserContext from "@/utils/UserContext";

const USERNAME_KEY = "usuario";

export function useUser() {
  const [currentUsername, setCurrrentUsername] = useState<string | null>(null);

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  // Al inicar el hook se accede al localstorage
  useEffect(() => {
    const storedToken = localStorage.getItem(USERNAME_KEY);
    if (storedToken) {
      setCurrrentUsername(storedToken);
    }
  }, []);

  const saveCurrentUsername = (newToken: string) => {
    localStorage.setItem(USERNAME_KEY, newToken);
    setCurrrentUsername(newToken);
  };

  const clearCurrentUsername = () => {
    localStorage.removeItem(USERNAME_KEY);
    setCurrrentUsername(null);
  };

  return {
    context,
    currentUsername,
    saveCurrentUsername,
    clearCurrentUsername,
    isAuthenticated: !!currentUsername,
  };
}

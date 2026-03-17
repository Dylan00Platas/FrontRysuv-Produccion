import { useState, useEffect, ReactNode } from "react";
import UserContext, { IUserContext } from "./UserContext";
import ICurrentUser from "@/interfaces/auth/CurrentUser";

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // TODO-Desarrollo: Cambiar lógica al uso de cookies
  useEffect(() => {
    try {
      const userSaved = localStorage.getItem("usuario");
      if (userSaved) {
        setCurrentUser(JSON.parse(userSaved));
      }
    } catch {
      localStorage.removeItem("usuario");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  const value: IUserContext = { currentUser, setCurrentUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;

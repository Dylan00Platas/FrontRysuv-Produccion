import { useState, useEffect } from "react";
import { UserContext } from "./UserContext.jsx";

const UserProvider = ({ children }) => {
  const [usuario, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSaved = localStorage.getItem("usuario");
    if (userSaved) {
      setUser(JSON.parse(userSaved));
    }
    setLoading(false); // Se terminó de cargar datos de usuario
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <UserContext.Provider value={{ usuario, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

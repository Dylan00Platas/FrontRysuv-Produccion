import { createContext, Dispatch, SetStateAction } from "react";

// TODO-Desarrollo: obtener usuario desde contexto/cookie
export interface IUserContext {
  FKIdTipoAcceso?: number;
  id?: number;
  nombre?: string;
  email?: string;
  setCurrentUser: Dispatch<
    SetStateAction<{
      FKIdTipoAcceso?: number;
      id?: number;
      nombre?: string;
      email?: string;
    } | null>
  >;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export default UserContext;

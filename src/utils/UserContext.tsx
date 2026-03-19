import { createContext, Dispatch, SetStateAction } from "react";

export interface IUserContext {
  FKIdTipoAcceso?: number;
  id?: number;
  nombre?: string;
  setCurrentUser: Dispatch<
    SetStateAction<{
      FKIdTipoAcceso?: number;
      id?: number;
      nombre?: string;
    } | null>
  >;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export default UserContext;

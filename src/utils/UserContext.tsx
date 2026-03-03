import { createContext, Dispatch, SetStateAction } from "react";
import ICurrentUser from "@/interfaces/auth/CurrentUser";

export interface IUserContext {
  currentUser: ICurrentUser | null;
  setCurrentUser: Dispatch<SetStateAction<ICurrentUser | null>>;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export default UserContext;

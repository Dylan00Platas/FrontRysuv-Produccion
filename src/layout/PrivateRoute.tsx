import { Navigate, Outlet } from "react-router-dom";
import { useCookie } from "@/hooks/useCookie";
import PageTransition from "./PageTransition";

export default function PrivateRoute() {
  const { currentUser, isLoading } = useCookie();

  if (isLoading) {
    return (
      <PageTransition>
        <div>Cargando...</div>
      </PageTransition>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/" replace />;
}

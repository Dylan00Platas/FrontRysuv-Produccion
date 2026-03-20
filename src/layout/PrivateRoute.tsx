import { Navigate, Outlet } from "react-router-dom";
import { useCookie } from "@/hooks/useCookie";
import { Suspense } from "react";
import PageLoader from "./PageLoader";

export default function PrivateRoute() {
  const { currentUser, isLoading } = useCookie();

  if (isLoading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/" replace />;

  // Un solo Suspense que cubre TODAS las rutas privadas
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

import { RouteObject, useLocation, useRoutes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import authRoutes from "./routes/authRoutes";
import agendaRoutes from "./routes/agendaRoutes";
import cedulasRoutes from "./routes/cedulasRoutes";
import solicitudesRoutes from "./routes/solicitudesRoutes";
import usuariosRoutes from "./routes/usuariosRoutes";
import oficiosRoutes from "./routes/oficiosRoutes";
import procesosRoutes from "./routes/procesosRoutes";
import seguimientoRoutes from "./routes/seguimientoRoutes";
import Login from "./pages/login/Login";
import PrivateRoute from "./layout/PrivateRoute";

const allRoutes: RouteObject[] = [
  { path: "/", element: <Login /> },
  { path: "", element: <Login /> },
  {
    element: <PrivateRoute />,
    children: [
      ...authRoutes,
      ...agendaRoutes,
      ...cedulasRoutes,
      ...solicitudesRoutes,
      ...usuariosRoutes,
      ...oficiosRoutes,
      ...procesosRoutes,
      ...seguimientoRoutes,
    ],
  },
];

function AppRoutes() {
  const location = useLocation();
  const element = useRoutes(allRoutes, location);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {element && React.cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
}

export default AppRoutes;

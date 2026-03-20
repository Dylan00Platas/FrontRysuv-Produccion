import { RouteObject, useLocation, useRoutes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, useEffect } from "react";
import authRoutes from "./routes/authRoutes";
import agendaRoutes from "./routes/agendaRoutes";
import cedulasRoutes from "./routes/cedulasRoutes";
import solicitudesRoutes from "./routes/solicitudesRoutes";
import usuariosRoutes from "./routes/usuariosRoutes";
import oficiosRoutes from "./routes/oficiosRoutes";
import procesosRoutes from "./routes/procesosRoutes";
import seguimientoRoutes from "./routes/seguimientoRoutes";
import PrivateRoute from "./layout/PrivateRoute";
import Login from "./pages/login/Login";

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
    <AnimatePresence mode="wait" initial={false}>
      <div key={location.pathname} className="h-full">
        {element}
      </div>
    </AnimatePresence>
  );
}

export default AppRoutes;

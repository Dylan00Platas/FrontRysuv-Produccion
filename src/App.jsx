import { BrowserRouter } from "react-router-dom";
import UsuarioProvider from "./utils/UserProvider.jsx";
import AppRoutes from "./AppRoutes.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <UsuarioProvider>
        <AppRoutes />
      </UsuarioProvider>
    </BrowserRouter>
  );
}

export default App;

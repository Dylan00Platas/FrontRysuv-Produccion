import { BrowserRouter } from "react-router-dom";
import UserProvider from "./utils/UserProvider.jsx";
import AppRoutes from "./AppRoutes.js";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;

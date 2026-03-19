import React, { useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import { useCookie } from "@/hooks/useCookie";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const { currentUser, isLoading, checkSession } = useCookie();
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="flex lg:flex-col sm:flex-row w-svw h-svh bg-white ">
      <Sidebar tipoAcceso={currentUser?.tipoDeAcceso!!} />
      {children}
    </div>
  );
}

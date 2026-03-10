import React from "react";
import Sidebar from "../sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex lg:flex-col sm:flex-row w-svw h-svh bg-white ">
      <Sidebar tipoAcceso={1} />
      {children}
    </div>
  );
}

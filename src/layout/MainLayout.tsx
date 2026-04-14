import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import { useCookie } from "@/hooks/useCookie";

type Props = {
	children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
	const { currentUser, checkSession } = useCookie();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		checkSession();
	}, []);

	// Cierra el sidebar en desktop
	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const handler = (e: MediaQueryListEvent) => {
			if (e.matches) setSidebarOpen(false);
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return (
		<div className="flex flex-row w-svw h-svh bg-white overflow-hidden">
			{/* ── Overlay (móvil) ── */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* ── Sidebar ── */}
			<Sidebar
				tipoAcceso={currentUser?.tipoDeAcceso!}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>

			{/* ── Contenido principal ── */}
			<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
				{/* Topbar móvil */}
				<header className="flex items-center gap-3 px-4 py-3 bg-[#05163d] lg:hidden shrink-0">
					<button
						onClick={() => setSidebarOpen(true)}
						aria-label="Abrir menú"
						className="text-white text-2xl p-1 rounded-md hover:bg-white/10 transition-colors">
						☰
					</button>
					<span className="text-white font-semibold text-lg tracking-wide">
						RySUV
					</span>
				</header>

				{/* Página */}
				<main className="flex-1 overflow-y-auto w-full h-full px-4 sm:px-[4%] py-4 sm:py-[2%]">
					{children}
				</main>
			</div>
		</div>
	);
}

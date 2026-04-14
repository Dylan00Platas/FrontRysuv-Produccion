import { useRef } from "react";
import uvBlanco from "@/assets/uvBlanco.png";

export function MainMenu() {
	const logoRef = useRef<HTMLImageElement>(null);

	return (
		<main className="flex-1 flex justify-center items-center px-6 py-8 bg-white overflow-hidden">
			<div className="flex flex-col text-center items-center w-full max-w-md">
				<img
					ref={logoRef}
					src={uvBlanco}
					alt="Logo UV"
					className="w-[clamp(120px,40vw,220px)] h-auto cursor-pointer
						transition-transform duration-300 ease-[ease]
						animate-[fadeIn_1.2s_ease]
						bg-[#05163d] rounded-[20px] p-4"
				/>
				<div className="text-[#444] leading-[1.6] animate-[fadeIn_1.2s_ease] mt-6 space-y-0.5">
					<p className="font-semibold text-[clamp(0.9rem,2.5vw,1.05rem)]">
						Secretaría de Administración y Finanzas
					</p>
					<p className="font-normal text-[clamp(0.85rem,2vw,1rem)]">
						Dirección General de Recursos Humanos
					</p>
					<p className="font-normal text-[clamp(0.8rem,1.8vw,0.95rem)] text-[#666]">
						Departamento de Evaluación y Desarrollo de Personal
					</p>
					<p className="font-normal text-[clamp(0.8rem,1.8vw,0.95rem)] text-[#666]">
						Oficina de Evaluación y Proyectos de Recursos Humanos
					</p>
				</div>
			</div>
		</main>
	);
}

export default MainMenu;

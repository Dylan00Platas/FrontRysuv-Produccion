import { motion, Variants } from "framer-motion";
import uvBlanco from "@/assets/uvBlanco.png";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full gap-6">
      {/* Logo con bounce */}
      <motion.img
        src={uvBlanco}
        alt="Logo Universidad Veracruzana"
        initial={{ opacity: 0, scale: 0.6, y: -12 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -8, 0], // bounce inline — sin estado extra
        }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { type: "spring", stiffness: 420, damping: 14, mass: 0.8 },
          y: {
            delay: 0.3, // espera a que termine el entrada
            duration: 2.4,
            ease: "easeInOut",
            repeat: Infinity,
          },
        }}
        style={{
          height: "clamp(32px, 5vw, 48px)",
          width: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.25))",
        }}
      />

      {/* Tres puntos animados */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
            style={{
              display: "block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

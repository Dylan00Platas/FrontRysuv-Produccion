import { motion, Variants } from "framer-motion";
import uvBlanco from "@/assets/uvBlanco.png";
import { useCookie } from "@/hooks/useCookie";

// Interfaces de UI ------------------------------------------------------------
interface PageTransitionProps {
  children: React.ReactNode;
  /** Dirección de entrada de la página */
  direction?: "up" | "down" | "left" | "right";
  /** Duración de la transición en segundos */
  duration?: number;
}

// Variantes de animación ------------------------------------------------------

const directionOffset: Record<
  NonNullable<PageTransitionProps["direction"]>,
  { x: number; y: number }
> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
};

const pageVariants: Variants = {
  initial: (dir: NonNullable<PageTransitionProps["direction"]>) => ({
    opacity: 0,
    ...directionOffset[dir],
    filter: "blur(4px)",
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
  },
  exit: (dir: NonNullable<PageTransitionProps["direction"]>) => ({
    opacity: 0,
    x: -directionOffset[dir].x,
    y: -directionOffset[dir].y,
    filter: "blur(4px)",
  }),
};

const logoVariants: Variants = {
  initial: { opacity: 0, scale: 0.6, y: -12 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 14,
      mass: 0.8,
      delay: 0.15,
    },
  },
};

/** Animación continua de bouncing suave */
const bouncingAnimation = {
  y: [0, -6, 0],
  transition: {
    duration: 2.4,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "loop" as const,
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = "up",
  duration = 0.4,
}) => {
  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier suave
      }}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      {/* Logo con bouncing */}
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate={["animate", bouncingAnimation]}
        style={{ display: "inline-block" }}
        whileHover={{
          scale: 1.1,
          filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))",
          transition: { duration: 0.2 },
        }}
      >
        <img
          src={uvBlanco}
          alt="Logo Universidad Veracruzana"
          style={{
            height: "clamp(25px, 4vw, 40px)",
            width: "auto",
            objectFit: "contain",
            display: "block",
            filter: "drop-shadow(0 0 2px rgba(255,255,255,0.2))",
          }}
        />
      </motion.div>

      {/* Contenido de la página */}
      {children}
    </motion.div>
  );
};

export default PageTransition;

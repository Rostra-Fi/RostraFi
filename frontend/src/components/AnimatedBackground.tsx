import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  y: any;
  opacity: any;
}

export default function AnimatedBackground({
  y,
  opacity,
}: AnimatedBackgroundProps) {
  return (
    <motion.div
      className="relative h-64 overflow-hidden"
      style={{ y, opacity }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black">
        {/* Animated Stars/Sparkles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.7, 0.2, 0.7],
              scale: [1, Math.random() * 1.5 + 0.5, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Glowing Lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              width: "100%",
              top: `${20 + i * 15}%`,
              opacity: 0.2,
              left: 0,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scaleY: [1, 2, 1],
            }}
            transition={{
              duration: 4,
              delay: i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

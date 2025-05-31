import { motion } from "framer-motion";
import { Wallet, Trophy, Settings, History, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  userId: string | undefined;
  points: number | undefined;
  onWalletClick: () => void;
  onTransactionsClick: () => void;
  onSettingsClick: () => void;
}

export default function ProfileHeader({
  userId,
  points,
  onWalletClick,
  onTransactionsClick,
  onSettingsClick,
}: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-full border-2 border-white/20 p-1 bg-black relative z-10"
        >
          <div className="rounded-full overflow-hidden relative h-32 w-32">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            />
            <Avatar className="h-32 w-32">
              <AvatarImage
                src="/placeholder.svg?height=128&width=128"
                alt="Profile"
              />
              <AvatarFallback className="bg-[#111]">CG</AvatarFallback>
            </Avatar>
          </div>

          {/* Animated Rings */}
          {[40, 30, 20, 10].map((delay, i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border border-white/5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
                ease: "easeOut",
              }}
            />
          ))}

          <motion.div
            className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border-2 border-black"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="bg-black rounded-full p-1">
              <Star className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 text-center"
      >
        <motion.h1
          className="text-2xl font-bold text-white"
          animate={{
            textShadow: [
              "0 0 0px rgba(255,255,255,0)",
              "0 0 10px rgba(255,255,255,0.5)",
              "0 0 0px rgba(255,255,255,0)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {`rostera/${userId}`}
        </motion.h1>

        <div className="flex items-center justify-center gap-2 mt-2">
          {/* Wallet - Now Clickable */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full cursor-pointer"
            onClick={onWalletClick}
          >
            <Wallet className="h-4 w-4 text-white/70" />
            <span>2.5 SOL</span>
          </motion.div>

          {/* Points */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"
          >
            <Trophy className="h-4 w-4 text-white/70" />
            <span>{points || 0} Points</span>
          </motion.div>

          {/* New Transactions Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full cursor-pointer"
            onClick={onTransactionsClick}
          >
            <History className="h-4 w-4 text-white/70" />
            <span>Transactions</span>
          </motion.div>

          {/* Settings - Now Clickable */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full cursor-pointer"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4 text-white/70" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

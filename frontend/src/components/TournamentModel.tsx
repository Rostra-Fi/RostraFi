"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "./ui/animated-modal";
import PlatformCard from "./Cards";
import { useAppSelector } from "@/hooks/reduxHooks";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trophy, X } from "lucide-react";

// export function TournamentModal() {
//   const { tournaments, loading, openRegistrationTournaments } = useAppSelector(
//     (state) => state.tournaments
//   );
//   console.log(openRegistrationTournaments);
//   const [isAnimating, setIsAnimating] = useState(false);

//   // Auto-animate occasionally to draw attention
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!isAnimating) {
//         setIsAnimating(true);
//         setTimeout(() => setIsAnimating(false), 2000);
//       }
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [isAnimating]);

//   return (
//     <div className="flex flex-col items-center gap-6">
//       <div className="w-full max-w-md rounded-lg overflow-hidden shadow-xl relative">
//         <div
//           className={`absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-0 transition-opacity duration-500 ${
//             isAnimating ? "opacity-30" : ""
//           } group-hover:opacity-30 z-10 pointer-events-none`}
//         ></div>

//         <div
//           className={`absolute w-full h-16 bg-white/10 -skew-y-12 -top-20 blur-xl ${
//             isAnimating ? "animate-lightSweep" : ""
//           } group-hover:animate-lightSweep pointer-events-none`}
//         ></div>
//       </div>

//       <Modal>
//         <div
//           onMouseEnter={() => setIsAnimating(true)}
//           onMouseLeave={() => setIsAnimating(false)}
//         >
//           <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group rounded-full w-48 h-16 shadow-xl relative overflow-hidden">
//             <div
//               className={`absolute inset-0 bg-blue-500/20 blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
//                 isAnimating ? "opacity-100" : ""
//               }`}
//             ></div>

//             <div
//               className={`absolute w-16 h-full bg-white/20 -skew-x-12 -left-32 group-hover:left-64 transition-all duration-700 ${
//                 isAnimating ? "left-64" : "-left-32"
//               }`}
//             ></div>

//             <div className="flex items-center justify-center gap-2 z-10">
//               <span className="font-bold text-xl transition-all duration-300 group-hover:text-white">
//                 Tournaments
//               </span>

//               <div
//                 className={`text-3xl ml-1 transition-all duration-500 ${
//                   isAnimating ? "scale-125 animate-pulse" : ""
//                 } group-hover:scale-125 group-hover:animate-pulse`}
//               >
//                 🏆
//               </div>
//             </div>

//             <div
//               className={`absolute inset-0 rounded-full border-2 border-blue-400/0 group-hover:border-blue-400/70 transition-all duration-500 ${
//                 isAnimating ? "border-blue-400/70 scale-105" : ""
//               } group-hover:scale-105`}
//             ></div>

//             <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <div
//                   key={i}
//                   className="absolute w-1 h-1 bg-white rounded-full"
//                   style={{
//                     left: `${Math.random() * 100}%`,
//                     top: `${Math.random() * 100}%`,
//                     opacity: Math.random() * 0.7 + 0.3,
//                     animation: `float ${
//                       Math.random() * 2 + 2
//                     }s ease-in-out infinite`,
//                   }}
//                 ></div>
//               ))}
//             </div>
//           </ModalTrigger>
//         </div>
//         <ModalBody className="p-0 ">
//           <ModalContent className="w-[90vw] h-[85vh] max-w-6xl max-h-[85vh] bg-gradient-to-br from-gray-900 to-black overflow-auto">
//             <div className="w-full h-full flex flex-col">
//               <div className="text-center p-8 pb-4 border-b border-gray-800 flex-shrink-0">
//                 <h2 className="text-3xl font-bold text-white mb-2">
//                   Active Tournaments
//                 </h2>
//                 <p className="text-gray-400">
//                   Join or create a team to participate in our ongoing
//                   tournaments
//                 </p>
//               </div>

//               <div className="flex-1 overflow-y-auto scrollbar-thumb-gray-600 scrollbar-track-gray-900">
//                 <div className="px-4 pt-4 pb-8">
//                   <div className="flex flex-wrap justify-center gap-6 items-start">
//                     {loading ? (
//                       <div className="text-white">Loading tournaments...</div>
//                     ) : openRegistrationTournaments.length > 0 ? (
//                       openRegistrationTournaments.map((tournament) => {
//                         return (
//                           <div
//                             key={tournament._id}
//                             className="transform hover:-translate-y-2 transition-transform duration-300"
//                           >
//                             <PlatformCard
//                               platform={tournament.platform}
//                               image={tournament.image}
//                               icon={tournament.icon}
//                               tournamentData={tournament}
//                             />
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="text-white">
//                         No active tournaments found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="p-8 pt-4 border-t border-gray-800 text-center flex-shrink-0">
//                 <p className="text-gray-400 text-sm">
//                   New tournaments are added weekly. Stay tuned for more
//                   opportunities!
//                 </p>
//               </div>
//             </div>
//           </ModalContent>
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// }

// export default TournamentModal;

export const TournamentDialogTrigger = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsAnimating(true)}
        onMouseLeave={() => setIsAnimating(false)}
        onClick={onClick}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group rounded-full w-48 h-16 shadow-xl relative overflow-hidden border-2 border-transparent hover:border-blue-400/70 transition-all duration-500"
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 bg-blue-500/20 blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
              isAnimating ? "opacity-100" : ""
            }`}
          />

          {/* Light sweep effect */}
          <div
            className={`absolute w-16 h-full bg-white/20 -skew-x-12 -left-32 group-hover:left-64 transition-all duration-700 ${
              isAnimating ? "left-64" : "-left-32"
            }`}
          />

          {/* Button content */}
          <div className="flex items-center justify-center gap-2 z-10">
            <span className="font-bold text-xl transition-all duration-300 group-hover:text-white">
              Tournaments
            </span>
            <motion.div
              animate={
                isAnimating
                  ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                  : {}
              }
              className="text-3xl ml-1 transition-all duration-500 group-hover:scale-125"
            >
              🏆
            </motion.div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400/0 group-hover:border-blue-400/70"
            animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </div>
    </div>
  );
};

// Main Tournament Dialog Component
interface TournamentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentDialog = ({
  isOpen,
  onClose,
}: TournamentDialogProps) => {
  // Mock data for demonstration

  const { loading, openRegistrationTournaments } = useAppSelector(
    (state) => state.tournaments
  );
  const tournamentsToShow = openRegistrationTournaments;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-2 md:inset-6 lg:inset-12 z-[9999] flex items-center justify-center"
          >
            <div className="w-full max-w-7xl h-[85vh] bg-black rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="relative p-10 pb-8 border-b border-gray-800">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-3 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-all duration-300 group"
                >
                  <X
                    size={22}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                </button>

                <div className="text-center">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-4 mb-6"
                  >
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-black" />
                    </div>
                    <h2 className="text-4xl font-light text-white tracking-tight">
                      Active Tournaments
                    </h2>
                  </motion.div>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-400 text-lg font-light"
                  >
                    Join or create a team to participate in our ongoing
                    tournaments
                  </motion.p>
                </div>

                {/* Minimalist decorative line */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-white"></div>
              </div>

              {/* Content */}
              <div
                className="flex-1 overflow-y-auto p-10"
                style={{ maxHeight: "calc(85vh - 200px)" }}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-10 h-10 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="ml-4 text-gray-300 font-light text-lg">
                      Loading tournaments...
                    </span>
                  </div>
                ) : tournamentsToShow.length > 0 ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    {tournamentsToShow.map((tournament, index) => (
                      <motion.div
                        key={tournament._id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
                      >
                        <PlatformCard
                          platform={tournament.platform}
                          image={tournament.image}
                          icon={tournament.icon}
                          tournamentData={tournament}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-24">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Sparkles className="w-10 h-10 text-gray-500" />
                    </motion.div>
                    <h3 className="text-2xl font-light text-white mb-3">
                      No Active Tournaments
                    </h3>
                    <p className="text-gray-400 font-light text-lg">
                      Check back soon for new tournaments!
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-gray-800 text-center bg-gray-900/30">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-400 text-sm font-light flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-4 h-4" />
                  New tournaments are added weekly. Stay tuned for more
                  opportunities!
                  <Sparkles className="w-4 h-4" />
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

"use client";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "./ui/animated-modal";
import PlatformCard from "./Cards";
import { useAppSelector } from "@/hooks/reduxHooks";

export function TournamentModal() {
  const { tournaments, loading } = useAppSelector((state) => state.tournaments);

  return (
    <div>
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group/modal-btn rounded-full w-32 h-14 shadow-lg hover:shadow-xl transition-all overflow-hidden relative">
          <span className="absolute group-hover/modal-btn:translate-x-32 text-center transition-transform duration-500">
            Tournaments
          </span>
          <div className="-translate-x-32 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition-transform duration-500 text-2xl">
            🏆
          </div>
        </ModalTrigger>
        <ModalBody className="p-0 ">
          <ModalContent className="w-[90vw] h-[85vh] max-w-6xl max-h-[85vh] bg-gradient-to-br from-gray-900 to-black overflow-auto">
            <div className="w-full h-full flex flex-col">
              {/* Fixed Header */}
              <div className="text-center p-8 pb-4 border-b border-gray-800 flex-shrink-0">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Active Tournaments
                </h2>
                <p className="text-gray-400">
                  Join or create a team to participate in our ongoing
                  tournaments
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thumb-gray-600 scrollbar-track-gray-900">
                <div className="px-4 pt-4 pb-8">
                  <div className="flex flex-wrap justify-center gap-6 items-start">
                    {loading ? (
                      <div className="text-white">Loading tournaments...</div>
                    ) : tournaments.length > 0 ? (
                      tournaments.map((tournament) => {
                        // Calculate time remaining in minutes
                        const endDate = new Date(tournament.endDate);
                        const now = new Date();
                        const diffMs = endDate.getTime() - now.getTime();
                        const timeRemaining = Math.max(
                          0,
                          Math.floor(diffMs / (1000 * 60))
                        );

                        return (
                          <div
                            key={tournament._id}
                            className="transform hover:-translate-y-2 transition-transform duration-300"
                          >
                            <PlatformCard
                              platform={tournament.platform}
                              image={tournament.image}
                              icon={tournament.icon}
                              timeRemaining={timeRemaining}
                              tournamentData={tournament}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-white">
                        No active tournaments found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-8 pt-4 border-t border-gray-800 text-center flex-shrink-0">
                <p className="text-gray-400 text-sm">
                  New tournaments are added weekly. Stay tuned for more
                  opportunities!
                </p>
              </div>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default TournamentModal;

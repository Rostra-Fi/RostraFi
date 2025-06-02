import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import TournamentCard from "./tournament-card";
import { UserCurrentTournament } from "../types/types";

export interface TournamentCardProps {
  tournament: UserCurrentTournament; // Changed from Tournament to UserCurrentTournament
}

export interface TournamentsListProps {
  userCurrentTournament: UserCurrentTournament[];
}

export default function TournamentsList({
  userCurrentTournament,
}: TournamentsListProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.7 }}
      className="mt-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-white/70" />
          Your Tournaments
        </h2>
      </div>

      {/* <div className="space-y-8">
        {Array.isArray(userCurrentTournament) &&
          userCurrentTournament.map(
            (tournament: UserCurrentTournament, index: number) => (
              <TournamentCard key={index} tournament={tournament} />
            )
          )}
      </div> */}
    </motion.div>
  );
}

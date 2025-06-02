import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gamepad2, Star, Trophy, Target, Zap, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface GameData {
  success: boolean;
  userId: string;
  games: {
    candycrush: {
      totalPoints: number;
      currentLevel: number;
      levels: {
        levelNumber: number;
        cleared: boolean;
        stars: number;
        pointsEarned: number;
        maxPoints: number;
        _id: string;
      }[];
    } | null;
    battleship: {
      totalPoints: number;
      totalGames: number;
      gamesWon: number;
      gameHistory: {
        difficulty: string;
        won: boolean;
        pointsEarned: number;
        movesUsed: number;
        playedAt: string;
        _id: string;
      }[];
    } | null;
    spaceinvaders: {
      totalPoints: number;
      highScore: number;
      totalGames: number;
      gameHistory: {
        score: number;
        level: number;
        enemiesDestroyed: number;
        playedAt: string;
        _id: string;
      }[];
    } | null;
    platformer: null;
  };
}

interface GamesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameData: GameData | null;
}

export default function GamesDialog({
  open,
  onOpenChange,
  gameData,
}: GamesDialogProps) {
  const router = useRouter();

  const handleGameClick = (gameKey: string) => {
    router.push("/games");
  };

  const games = [
    {
      key: "candycrush",
      title: "CANDY CRUSH",
      icon: <Star className="h-6 w-6" />,
      color: "from-pink-500/20 to-purple-500/20",
      borderColor: "border-pink-500/30",
      data: gameData?.games.candycrush,
      available: true,
    },
    {
      key: "battleship",
      title: "BATTLESHIP",
      icon: <Target className="h-6 w-6" />,
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      data: gameData?.games.battleship,
      available: true,
    },
    {
      key: "spaceinvaders",
      title: "SPACE INVADERS",
      icon: <Zap className="h-6 w-6" />,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      data: gameData?.games.spaceinvaders,
      available: true,
    },
    {
      key: "platformer",
      title: "PLATFORMER",
      icon: <Gamepad2 className="h-6 w-6" />,
      color: "from-gray-500/20 to-slate-500/20",
      borderColor: "border-gray-500/30",
      data: null,
      available: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-2 border-white text-white font-mono max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="border-b border-white pb-4">
          <DialogTitle className="text-2xl font-bold tracking-widest flex items-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            YOUR GAMES
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {games.map((game, index) => (
            <motion.div
              key={game.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: game.available ? 1.02 : 1 }}
              className={`
                relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-300
                ${
                  game.available
                    ? "hover:shadow-lg hover:shadow-white/20"
                    : "opacity-60"
                }
                ${game.borderColor}
                bg-gradient-to-br ${game.color}
              `}
              onClick={() => game.available && handleGameClick(game.key)}
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full bg-black/50 ${
                      game.available ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {game.icon}
                  </div>
                  <h3 className="text-lg font-bold">{game.title}</h3>
                </div>
                {!game.available && <Clock className="h-5 w-5 text-gray-500" />}
              </div>

              {/* Game Stats */}
              {game.available && game.data ? (
                <div className="space-y-3">
                  {/* Candy Crush Stats */}
                  {game.key === "candycrush" && gameData?.games.candycrush && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">
                          Current Level
                        </span>
                        <span className="text-sm font-bold">
                          {gameData.games.candycrush.currentLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">
                          Total Points
                        </span>
                        <span className="text-sm font-bold">
                          {formatNumber(gameData.games.candycrush.totalPoints)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Stars</span>
                        <div className="flex">
                          {[...Array(3)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i <
                                (gameData.games.candycrush?.levels[0]?.stars ||
                                  0)
                                  ? "text-yellow-400"
                                  : "text-gray-600"
                              }`}
                              fill={
                                i <
                                (gameData.games.candycrush?.levels[0]?.stars ||
                                  0)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Battleship Stats */}
                  {game.key === "battleship" && gameData?.games.battleship && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">
                          Total Games
                        </span>
                        <span className="text-sm font-bold">
                          {gameData.games.battleship.totalGames}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Games Won</span>
                        <span className="text-sm font-bold">
                          {gameData.games.battleship.gamesWon}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Win Rate</span>
                        <span className="text-sm font-bold">
                          {gameData.games.battleship.totalGames > 0
                            ? Math.round(
                                (gameData.games.battleship.gamesWon /
                                  gameData.games.battleship.totalGames) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">
                          Total Points
                        </span>
                        <span className="text-sm font-bold">
                          {formatNumber(gameData.games.battleship.totalPoints)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Space Invaders Stats */}
                  {game.key === "spaceinvaders" &&
                    gameData?.games.spaceinvaders && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">
                            High Score
                          </span>
                          <span className="text-sm font-bold">
                            {formatNumber(
                              gameData.games.spaceinvaders.highScore
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">
                            Total Games
                          </span>
                          <span className="text-sm font-bold">
                            {gameData.games.spaceinvaders.totalGames}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">
                            Total Points
                          </span>
                          <span className="text-sm font-bold">
                            {formatNumber(
                              gameData.games.spaceinvaders.totalPoints
                            )}
                          </span>
                        </div>
                        {gameData.games.spaceinvaders.gameHistory[0] && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-300">
                              Last Played
                            </span>
                            <span className="text-sm font-bold">
                              {new Date(
                                gameData.games.spaceinvaders.gameHistory[0].playedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                  {/* Play Button */}
                  <div className="pt-2">
                    <Button
                      className="w-full bg-white text-black hover:bg-gray-200 font-mono font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGameClick(game.key);
                      }}
                    >
                      PLAY NOW
                    </Button>
                  </div>
                </div>
              ) : game.available ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400 text-center py-8">
                    NO DATA AVAILABLE
                  </div>
                  <Button
                    className="w-full bg-white text-black hover:bg-gray-200 font-mono font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameClick(game.key);
                    }}
                  >
                    START PLAYING
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500 mb-4">COMING SOON</div>
                  <Button
                    disabled
                    className="w-full bg-gray-800 text-gray-500 cursor-not-allowed font-mono"
                  >
                    UNLOCK SOON
                  </Button>
                </div>
              )}

              {/* Hover Effect Overlay */}
              {game.available && (
                <motion.div
                  className="absolute inset-0 bg-white/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  whileHover={{ opacity: 1 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white pt-4 text-center">
          <p className="text-xs text-gray-400">
            Click on any available game to start playing
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

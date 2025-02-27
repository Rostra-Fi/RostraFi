"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Wallet,
  Trophy,
  Settings,
  TrendingUp,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const tournaments = [
    {
      id: "t1",
      name: "Crypto Masters 2024",
      status: "Active",
      prize: "10,000 SOL",
      position: "4th",
      date: "Ends in 3 days",
      image: "/placeholder.svg?height=80&width=80",
      team: {
        name: "Blockchain Bandits",
        members: [
          {
            id: "m1",
            name: "CryptoKing",
            role: "Captain",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "m2",
            name: "SolanaQueen",
            role: "Strategist",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "m3",
            name: "TokenMaster",
            role: "Analyst",
            image: "/placeholder.svg?height=40&width=40",
          },
        ],
        stats: { points: "24,500", rank: "4th", winRate: "68%" },
      },
    },
    {
      id: "t2",
      name: "Solana Summer Showdown",
      status: "Completed",
      prize: "5,000 SOL",
      position: "2nd",
      date: "Ended 2 weeks ago",
      image: "/placeholder.svg?height=80&width=80",
      team: {
        name: "DeFi Demons",
        members: [
          {
            id: "m4",
            name: "CryptoKing",
            role: "Captain",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "m5",
            name: "NFTNinja",
            role: "Designer",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "m6",
            name: "BlockWizard",
            role: "Developer",
            image: "/placeholder.svg?height=40&width=40",
          },
        ],
        stats: { points: "32,750", rank: "2nd", winRate: "75%" },
      },
    },
    {
      id: "t3",
      name: "Influencer Battle Royale",
      status: "Upcoming",
      prize: "25,000 SOL",
      position: "Registered",
      date: "Starts in 2 weeks",
      image: "/placeholder.svg?height=80&width=80",
      team: {
        name: "Crypto Crusaders",
        members: [
          {
            id: "m7",
            name: "CryptoKing",
            role: "Captain",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "m8",
            name: "MetaMogul",
            role: "Influencer",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "m9",
            name: "ChainChampion",
            role: "Trader",
            image: "/placeholder.svg?height=40&width=40",
          },
          {
            id: "m10",
            name: "TokenTitan",
            role: "Analyst",
            image: "/placeholder.svg?height=40&width=40",
          },
        ],
        stats: { points: "0", rank: "TBD", winRate: "N/A" },
      },
    },
  ];

  return (
    <div
      className="min-h-screen bg-black text-white overflow-hidden"
      ref={containerRef}
    >
      {/* Animated Background */}
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

      {/* Profile Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-20">
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
              CryptoGamer
            </motion.h1>
            <p className="text-gray-400 text-sm mt-1">
              Level 42 • Diamond Tier
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge className="bg-white text-black hover:bg-white/90">
                  Top 1%
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="outline" className="border-white/20 text-white">
                  Verified
                </Badge>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-4 gap-2 mt-8 max-w-md mx-auto"
        >
          {[
            { icon: <Wallet className="h-5 w-5" />, label: "Deposit" },
            { icon: <TrendingUp className="h-5 w-5" />, label: "Performance" },
            { icon: <Clock className="h-5 w-5" />, label: "Transactions" },
            { icon: <Settings className="h-5 w-5" />, label: "Settings" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                className="w-full h-full flex flex-col items-center justify-center py-3 border border-white/10 bg-black hover:bg-white/5 hover:border-white/20 transition-all duration-300"
              >
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                  }}
                >
                  {item.icon}
                </motion.div>
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Wallet & Points */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 overflow-hidden relative">
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="rounded-full bg-white p-1.5"
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(255,255,255,0)",
                          "0 0 10px rgba(255,255,255,0.5)",
                          "0 0 0px rgba(255,255,255,0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <Wallet className="h-4 w-4 text-black" />
                    </motion.div>
                    <span className="text-sm text-gray-400">SOL Balance</span>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  245.87
                </motion.div>
                <div className="text-green-400 text-sm mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.4% (24h)
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 overflow-hidden relative">
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="rounded-full bg-white p-1.5"
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(255,255,255,0)",
                          "0 0 10px rgba(255,255,255,0.5)",
                          "0 0 0px rgba(255,255,255,0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <Star className="h-4 w-4 text-black" />
                    </motion.div>
                    <span className="text-sm text-gray-400">Points</span>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  12,450
                </motion.div>
                <div className="text-white text-sm mt-1 flex items-center">
                  <Trophy className="h-3 w-3 mr-1" />
                  Top 5% this month
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tournaments Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              My Tournaments
            </h2>
            <Badge variant="outline" className="border-white/20">
              {tournaments.length} Total
            </Badge>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {tournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                  exit={{ x: -20, opacity: 0 }}
                  layout
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="bg-[#111] border-white/10 overflow-hidden cursor-pointer hover:bg-[#1a1a1a] transition-colors duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="relative overflow-hidden rounded-lg">
                                <Image
                                  src={tournament.image || "/placeholder.svg"}
                                  alt={tournament.name}
                                  width={80}
                                  height={80}
                                  className="object-cover rounded-lg"
                                />
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12"
                                  animate={{
                                    x: ["-100%", "200%"],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                    repeatDelay: 3,
                                    ease: "easeInOut",
                                  }}
                                />
                              </div>

                              {tournament.status === "Active" && (
                                <motion.div
                                  className="absolute inset-0 rounded-lg"
                                  animate={{
                                    boxShadow: [
                                      "0 0 0px rgba(255,255,255,0)",
                                      "0 0 10px rgba(255,255,255,0.5)",
                                      "0 0 0px rgba(255,255,255,0)",
                                    ],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold">
                                  {tournament.name}
                                </h3>
                                <Badge
                                  className={
                                    tournament.status === "Active"
                                      ? "bg-white text-black"
                                      : tournament.status === "Completed"
                                      ? "bg-gray-600"
                                      : "bg-gray-800 text-white"
                                  }
                                >
                                  {tournament.status}
                                </Badge>
                              </div>
                              <div className="mt-1 text-sm text-gray-400">
                                {tournament.date}
                              </div>
                              <div className="mt-2 flex justify-between items-center">
                                <div className="text-sm">
                                  <span className="text-gray-400">Prize: </span>
                                  <span className="text-white">
                                    {tournament.prize}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-400">
                                    Position:{" "}
                                  </span>
                                  <span
                                    className={
                                      tournament.position === "1st"
                                        ? "text-white"
                                        : tournament.position === "2nd"
                                        ? "text-gray-300"
                                        : tournament.position === "3rd"
                                        ? "text-gray-400"
                                        : "text-white"
                                    }
                                  >
                                    {tournament.position}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="bg-[#111] border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                          {tournament.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <Badge
                            className={
                              tournament.status === "Active"
                                ? "bg-white text-black"
                                : tournament.status === "Completed"
                                ? "bg-gray-600"
                                : "bg-gray-800 text-white"
                            }
                          >
                            {tournament.status}
                          </Badge>
                          <div className="text-sm text-gray-400">
                            {tournament.date}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-400">
                              Prize Pool
                            </div>
                            <div className="text-xl font-bold">
                              {tournament.prize}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Your Position
                            </div>
                            <div className="text-xl font-bold">
                              {tournament.position}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <h3 className="text-lg font-semibold mb-2">
                            Your Team: {tournament.team.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-400 mb-2">
                                Team Members
                              </div>
                              {tournament.team.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center gap-2 mb-2"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.image} />
                                    <AvatarFallback>
                                      {member.name.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-medium">
                                      {member.name}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {member.role}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div className="text-sm text-gray-400 mb-2">
                                Team Stats
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-400">
                                    Points:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {tournament.team.stats.points}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-400">
                                    Rank:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {tournament.team.stats.rank}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-400">
                                    Win Rate:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {tournament.team.stats.winRate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Animated Particles Overlay */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Zap,
  Calendar,
  Clock,
  X,
  Check,
  ArrowUpRight,
  Award,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabsShade";
import { Skeleton } from "@/components/ui/skeleton";
import confetti from "canvas-confetti";

// Types
interface Participant {
  _id: string;
  walletAddress: string;
  points: number;
  id: string;
}

interface Tournament {
  _id: string;
  id: string;
  name: string;
  timeLimit: number;
  registrationTimeLimit: number;
  startDate: string;
  prizePool: number;
  image: string;
  icon: string;
  platform: string;
  endDate: string;
  registrationEndDate: string;
  pointsForVisit: number;
  visited: Participant[];
  participated: Participant[];
  isActive: boolean;
  isOngoing: boolean;
  isRegistrationOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  walletAddress: string;
  score: number;
  prize: number;
  paid: boolean;
}

interface LeaderboardData {
  success: boolean;
  tournament: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    prizePool: number;
    isActive: boolean;
    isOngoing: boolean;
  };
  status: string;
  calculatedAt: string;
  distributed: boolean;
  leaderboard: LeaderboardEntry[];
}

// Dummy YouTube tournaments
const dummyYoutubeTournaments: Tournament[] = [
  {
    _id: "yt1",
    id: "yt1",
    name: "YouTube Gaming Championship",
    timeLimit: 48,
    registrationTimeLimit: 24,
    startDate: "2024-12-01T10:00:00Z",
    prizePool: 10,
    image: "/yu.jpg",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png",
    platform: "YouTube",
    endDate: "2024-12-03T10:00:00Z",
    registrationEndDate: "2024-12-01T10:00:00Z",
    pointsForVisit: 10,
    visited: Array(5)
      .fill(null)
      .map((_, i) => ({
        _id: `v${i}`,
        walletAddress: `addr${i}`,
        points: 10,
        id: `v${i}`,
      })),
    participated: Array(5)
      .fill(null)
      .map((_, i) => ({
        _id: `p${i}`,
        walletAddress: `addr${i}`,
        points: Math.floor(Math.random() * 1000),
        id: `p${i}`,
      })),
    isActive: false,
    isOngoing: false,
    isRegistrationOpen: false,
    createdAt: "2024-11-25T10:00:00Z",
    updatedAt: "2024-12-03T10:00:00Z",
  },
  {
    _id: "yt2",
    id: "yt2",
    name: "Content Creator Challenge",
    timeLimit: 72,
    registrationTimeLimit: 36,
    startDate: "2024-11-15T14:00:00Z",
    prizePool: 10,
    image: "/yu.jpg",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png",
    platform: "YouTube",
    endDate: "2024-11-18T14:00:00Z",
    registrationEndDate: "2024-11-15T14:00:00Z",
    pointsForVisit: 15,
    visited: Array(7)
      .fill(null)
      .map((_, i) => ({
        _id: `v${i}`,
        walletAddress: `addr${i}`,
        points: 15,
        id: `v${i}`,
      })),
    participated: Array(4)
      .fill(null)
      .map((_, i) => ({
        _id: `p${i}`,
        walletAddress: `addr${i}`,
        points: Math.floor(Math.random() * 1200),
        id: `p${i}`,
      })),
    isActive: false,
    isOngoing: false,
    isRegistrationOpen: false,
    createdAt: "2024-11-10T14:00:00Z",
    updatedAt: "2024-11-18T14:00:00Z",
  },
  {
    _id: "yt3",
    id: "yt3",
    name: "Viral Video Contest",
    timeLimit: 96,
    registrationTimeLimit: 48,
    startDate: "2024-10-20T08:00:00Z",
    prizePool: 10,
    image: "/yu.jpg",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png",
    platform: "YouTube",
    endDate: "2024-10-24T08:00:00Z",
    registrationEndDate: "2024-10-20T08:00:00Z",
    pointsForVisit: 20,
    visited: Array(2)
      .fill(null)
      .map((_, i) => ({
        _id: `v${i}`,
        walletAddress: `addr${i}`,
        points: 20,
        id: `v${i}`,
      })),
    participated: Array(2)
      .fill(null)
      .map((_, i) => ({
        _id: `p${i}`,
        walletAddress: `addr${i}`,
        points: Math.floor(Math.random() * 1500),
        id: `p${i}`,
      })),
    isActive: false,
    isOngoing: false,
    isRegistrationOpen: false,
    createdAt: "2024-10-15T08:00:00Z",
    updatedAt: "2024-10-24T08:00:00Z",
  },
  {
    _id: "yt4",
    id: "yt4",
    name: "YouTube Shorts Battle",
    timeLimit: 24,
    registrationTimeLimit: 12,
    startDate: "2024-09-10T16:00:00Z",
    prizePool: 10,
    image: "/yu.jpg",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png",
    platform: "YouTube",
    endDate: "2024-09-11T16:00:00Z",
    registrationEndDate: "2024-09-10T16:00:00Z",
    pointsForVisit: 5,
    visited: Array(3)
      .fill(null)
      .map((_, i) => ({
        _id: `v${i}`,
        walletAddress: `addr${i}`,
        points: 5,
        id: `v${i}`,
      })),
    participated: Array(3)
      .fill(null)
      .map((_, i) => ({
        _id: `p${i}`,
        walletAddress: `addr${i}`,
        points: Math.floor(Math.random() * 8),
        id: `p${i}`,
      })),
    isActive: false,
    isOngoing: false,
    isRegistrationOpen: false,
    createdAt: "2024-09-08T16:00:00Z",
    updatedAt: "2024-09-11T16:00:00Z",
  },
];

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Twitter");

  // Platform configurations
  const platforms = [
    {
      name: "Twitter",
      icon: "https://img.freepik.com/premium-vector/twitter-new-x-logo-design-vector_1340851-70.jpg",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      name: "Instagram",
      icon: "https://img.freepik.com/premium-vector/instagram-logo_976174-11.jpg",
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
    {
      name: "TikTok",
      icon: "https://img.freepik.com/free-psd/tiktok-logo-icon-psd-editable_314999-3664.jpg",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      name: "YouTube",
      icon: "https://img.freepik.com/free-vector/red-play-button-3d-vector-illustration-social-media-icon-networking-sites-applications-cartoon-style-isolated-white-background-online-communication-digital-marketing-concept_778687-1701.jpg?t=st=1748857518~exp=1748861118~hmac=78d169861cb578fa4babf1a80d805353d99d8bfc37868dfd213bdbf0a3eea5d2&w=1060",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  ];

  // Fetch tournaments data
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:3001/api/v1/compitition/tournaments/?active=false"
        );
        const data = await res.json();

        // Filter inactive tournaments with participants
        const inactiveTournaments = data.data.filter(
          (tournament: Tournament) =>
            !tournament.isActive &&
            tournament.participated &&
            tournament.participated.length > 0
        );

        // Add dummy YouTube tournaments
        const allTournaments = [
          ...inactiveTournaments,
          ...dummyYoutubeTournaments,
        ];
        setTournaments(allTournaments);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        // If API fails, just show YouTube dummy data
        setTournaments(dummyYoutubeTournaments);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Fetch leaderboard data when a tournament is selected
  const fetchLeaderboard = async (tournamentId: string) => {
    setLeaderboardLoading(true);
    try {
      // For YouTube dummy tournaments, create dummy leaderboard
      if (tournamentId.startsWith("yt")) {
        const dummyLeaderboard: LeaderboardData = {
          success: true,
          tournament: {
            id: tournamentId,
            name: selectedTournament?.name || "",
            startDate: selectedTournament?.startDate || "",
            endDate: selectedTournament?.endDate || "",
            prizePool: selectedTournament?.prizePool || 0,
            isActive: false,
            isOngoing: false,
          },
          status: "completed",
          calculatedAt: new Date().toISOString(),
          distributed: Math.random() > 0.5,
          leaderboard: Array(10)
            .fill(null)
            .map((_, i) => ({
              rank: i + 1,
              teamName: `Creator${i + 1}`,
              walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
              score: Math.floor(Math.random() * 1000) + 500,
              prize: i < 3 ? [2, 1, 0.5][i] : 0,
              paid: Math.random() > 0.3,
            })),
        };
        setLeaderboardData(dummyLeaderboard);
      } else {
        const res = await fetch(
          `http://127.0.0.1:3001/api/v1/compitition/tournaments/${tournamentId}/leaderboard`
        );
        const data = await res.json();
        setLeaderboardData(data);
      }

      // Trigger confetti when leaderboard loads
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Handle tournament selection
  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDialogOpen(true);
    fetchLeaderboard(tournament.id);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time function
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  // Truncate wallet address
  const truncateWallet = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Filter tournaments by active tab
  const filteredTournaments = tournaments.filter(
    (tournament) => tournament.platform === activeTab
  );

  // Handle back navigation
  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-black"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              onClick={handleBack}
              variant="outline"
              className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-white hover:text-white transition-all duration-300 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              PAST <span className="text-amber-500">CONQUESTS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore completed tournaments and their champions across different
              platforms
            </p>
          </motion.div>

          {/* Platform Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex justify-center">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-800">
                <div className="flex space-x-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => setActiveTab(platform.name)}
                      className={`relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 min-w-[140px] justify-center ${
                        activeTab === platform.name
                          ? `bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 ${platform.color}`
                          : `hover:bg-gray-800/50 text-gray-400 hover:text-white border border-transparent`
                      }`}
                    >
                      <div className="h-6 w-6 rounded-full overflow-hidden">
                        <img
                          src={platform.icon}
                          alt={platform.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-semibold">{platform.name}</span>
                      {activeTab === platform.name && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl border border-amber-500/20"
                          initial={false}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tournament Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden"
                >
                  <Skeleton className="h-60 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full overflow-hidden mx-auto border-4 border-gray-700">
                  <img
                    src={platforms.find((p) => p.name === activeTab)?.icon}
                    alt={activeTab}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gray-700 rounded-full p-2">
                  <Trophy className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                No {activeTab} Tournaments
              </h3>
              <p className="text-gray-400 max-w-md mx-auto text-lg">
                There are no completed {activeTab} tournaments with participants
                yet. Check back later!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.4)",
                  }}
                  className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-900/40 cursor-pointer backdrop-blur-sm group"
                  onClick={() => handleTournamentClick(tournament)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                  <div className="h-64 bg-cover bg-center transition-transform duration-700 group-hover:scale-110">
                    <Image
                      src={
                        tournament.image ||
                        "/placeholder.svg?height=600&width=800"
                      }
                      alt={tournament.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <Trophy className="h-3 w-3" /> COMPLETED
                    </div>
                  </div>

                  {/* Platform Icon */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                      <img
                        src={tournament.icon}
                        alt={tournament.platform}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-20 p-6 -mt-24">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
                        <Zap className="h-3 w-3 mr-1" /> {tournament.prizePool}{" "}
                        Sol
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 group-hover:text-amber-400 transition-colors">
                      {tournament.name}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">
                          {formatDate(tournament.startDate)} -{" "}
                          {formatDate(tournament.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Users className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">
                          {tournament.participated.length} Participants
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center text-amber-400 font-semibold group-hover:text-amber-300 transition-colors">
                      View Leaderboard{" "}
                      <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Tournament Dialog */}
      <AnimatePresence>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #111827;
              border-radius: 20px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #374151;
              border-radius: 20px;
              transition: background 0.2s;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #4b5563;
            }
          `}</style>
          <DialogContent className="w-[95%] max-w-[1000px] h-[90vh] max-h-[900px] bg-gray-900 border-gray-800 text-white p-0 overflow-hidden rounded-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col">
            {selectedTournament && (
              <>
                <div className="relative h-[200px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
                  <Image
                    src={
                      selectedTournament.image ||
                      "/placeholder.svg?height=1200&width=1600"
                    }
                    alt={selectedTournament.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-amber-500">
                      <img
                        src={selectedTournament.icon}
                        alt={selectedTournament.platform}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-amber-500 font-medium">
                        {selectedTournament.platform}
                      </div>
                      <h2 className="text-2xl font-bold">
                        {selectedTournament.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-grow overflow-auto">
                  <Tabs defaultValue="leaderboard" className="w-full h-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="leaderboard" className="text-base">
                        Leaderboard
                      </TabsTrigger>
                      <TabsTrigger value="details" className="text-base">
                        Tournament Details
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="leaderboard" className="mt-0 h-full">
                      {leaderboardLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="space-y-2 mt-6">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-16 w-full" />
                            ))}
                          </div>
                        </div>
                      ) : leaderboardData &&
                        leaderboardData.leaderboard.length > 0 ? (
                        <div>
                          <div className="h-full overflow-auto custom-scrollbar">
                            <div className="text-gray-400 mb-1">
                              Final standings calculated on
                            </div>
                            <div className="text-lg font-medium">
                              {formatDateTime(leaderboardData.calculatedAt)}
                            </div>
                            {leaderboardData.distributed && (
                              <div className="mt-2 flex items-center gap-2 text-green-500">
                                <Check className="h-5 w-5" />
                                <span>Rewards have been distributed</span>
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden rounded-lg border border-gray-800 mt-6">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-800/50">
                                    <th className="px-6 py-4 text-left">
                                      Rank
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Team
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Wallet
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Score
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Prize
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {leaderboardData.leaderboard.map((entry) => (
                                    <motion.tr
                                      key={entry.rank}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: entry.rank * 0.1,
                                      }}
                                      className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                                    >
                                      <td className="px-6 py-4">
                                        <div className="flex items-center">
                                          <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                                              entry.rank === 1
                                                ? "bg-amber-500 text-black"
                                                : entry.rank === 2
                                                ? "bg-gray-300 text-black"
                                                : entry.rank === 3
                                                ? "bg-amber-700 text-white"
                                                : "bg-gray-700 text-white"
                                            }`}
                                          >
                                            {entry.rank}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 font-bold">
                                        {entry.teamName}
                                      </td>
                                      <td className="px-6 py-4 font-mono">
                                        {truncateWallet(entry.walletAddress)}
                                      </td>
                                      <td className="px-6 py-4 font-bold">
                                        {entry.score.toFixed(2)}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="text-amber-500 font-bold">
                                          {entry.prize} Sol
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        {entry.paid ? (
                                          <span className="inline-flex items-center gap-1 text-green-500">
                                            <Check className="h-4 w-4" /> Paid
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-gray-400">
                                            <Clock className="h-4 w-4" />{" "}
                                            Pending
                                          </span>
                                        )}
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Award className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold mb-2">
                            No Leaderboard Data
                          </h3>
                          <p className="text-gray-400 max-w-md mx-auto">
                            Leaderboard data is not available for this
                            tournament yet.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 h-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-bold mb-2">
                            Tournament Info
                          </h3>
                          <div className="space-y-2">
                            {/* Simplified tournament information with smaller text */}
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">
                                Platform
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="h-6 w-6 rounded-full overflow-hidden">
                                  <Image
                                    src={
                                      selectedTournament.icon ||
                                      "/placeholder.svg?height=100&width=100"
                                    }
                                    alt={selectedTournament.platform}
                                    width={24}
                                    height={24}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <span className="text-sm font-bold">
                                  {selectedTournament.platform}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-gray-400">Status</span>
                              <span className="text-lg font-bold text-gray-400">
                                Completed
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-gray-400">Prize Pool</span>
                              <span className="text-lg font-bold">
                                {selectedTournament.prizePool} Sol
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-gray-400">
                                Points for Visit
                              </span>
                              <span className="text-lg font-bold">
                                {selectedTournament.pointsForVisit} points
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold mb-2">Timeline</h3>
                          <div className="relative border-l-2 border-gray-700 pl-6 space-y-6">
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Registration Start
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(selectedTournament.createdAt)}
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Registration End
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(
                                    selectedTournament.registrationEndDate
                                  )}
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Tournament Start
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(selectedTournament.startDate)}
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="relative"
                            >
                              <div className="absolute -left-[29px] top-0 h-6 w-6 rounded-full bg-amber-500"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-400">
                                  Tournament End
                                </span>
                                <span className="text-lg font-bold">
                                  {formatDateTime(selectedTournament.endDate)}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-sm font-bold mb-2">
                          Participation Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Reduced participation statistics */}
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-2 text-center"
                          >
                            <div className="text-xl font-bold text-amber-500 mb-1">
                              {selectedTournament.visited?.length || 0}
                            </div>
                            <div className="text-xs text-gray-400">
                              Visitors
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-4 text-center"
                          >
                            <div className="text-3xl font-bold text-amber-500 mb-2">
                              {selectedTournament.participated?.length || 0}
                            </div>
                            <div className="text-gray-400">Participants</div>
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-4 text-center"
                          >
                            <div className="text-3xl font-bold text-amber-500 mb-2">
                              {selectedTournament.registrationTimeLimit}h
                            </div>
                            <div className="text-gray-400">
                              Registration Period
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-800/50 rounded-lg p-4 text-center"
                          >
                            <div className="text-3xl font-bold text-amber-500 mb-2">
                              {selectedTournament.timeLimit}h
                            </div>
                            <div className="text-gray-400">
                              Tournament Duration
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  );
}
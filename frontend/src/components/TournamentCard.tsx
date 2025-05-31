import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  BarChart,
  Clock,
  Loader,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TournamentCardProps } from "@/types/types";
import { TeamCard } from "./TeamCard";
import Image from "next/image";

export const TournamentCard = ({ tournament }: TournamentCardProps) => {
  const [loading, setLoading] = useState(false);
  console.log(tournament);

  const endDate = new Date(tournament.tournamentId.endDate);
  const startDate = new Date(tournament.tournamentId.startDate);
  const now = new Date();
  const remainingDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getTimeStatus = () => {
    if (remainingDays <= 0) {
      return "Ended recently";
    } else if (remainingDays === 1) {
      return "Ends tomorrow";
    } else {
      return `Ends in ${remainingDays} days`;
    }
  };

  const getStartTimeStatus = () => {
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (now < startDate) {
      if (daysUntilStart <= 0) {
        return "Starting soon";
      } else if (daysUntilStart === 1) {
        return "Starts tomorrow";
      } else {
        return `Starts in ${daysUntilStart} days`;
      }
    }
    return null;
  };

  // Combine all teams from all sections
  const allTeams = tournament.sections.flatMap((section) =>
    section.selectedTeams.map((team) => ({
      ...team,
      section: section.sectionId.name,
    }))
  );

  // Use the Twitter stats provided directly from the backend
  const tweetStats = tournament.twitterStats || {
    posts: 0,
    likes: 0,
    comments: 0,
    retweets: 0,
    views: 0,
    recentTweets: [],
  };

  // Format time since tweet was posted
  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="bg-[#111] border-white/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={tournament.tournamentId.image || "/placeholder.svg"}
            alt={tournament.tournamentId.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black" />
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white/20">
                <AvatarImage src={tournament.tournamentId.icon} />
                <AvatarFallback>
                  {tournament.tournamentId.platform.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <Badge className="bg-white/20 backdrop-blur-md text-white">
                {tournament.tournamentId.platform}
              </Badge>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-white">
                {tournament.tournamentId.name}
              </h3>
              <Badge
                className={
                  tournament.tournamentId.isOngoing
                    ? "bg-white text-black"
                    : "bg-gray-600"
                }
              >
                {tournament.tournamentId.isOngoing ? "Active" : "Completed"}
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm text-white/70">
                {getStartTimeStatus() || getTimeStatus()}
              </div>
              <div className="text-sm text-white/70">
                Prize: {tournament.tournamentId.prizePool} SOL
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          {/* If tournament hasn't started, show a special message */}
          {now < startDate && (
            <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 mb-6">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-white/70" />
                  <span className="font-medium">Tournament Starts Soon</span>
                </div>
                <div className="text-sm text-white/50 mt-2">
                  Start Date: {startDate.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/10 rounded-full p-1.5">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">
              Your Team: {tournament.teamName}
            </span>
          </div>

          {/* Tournament Stats */}
          <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-white/70" />
                  Tournament Stats
                </h3>
                <Badge className="bg-white/10 text-white">
                  {tournament.tournamentId.name}
                </Badge>
              </div>

              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader className="h-6 w-6 text-white animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {[
                      {
                        label: "Teams",
                        value: allTeams.length,
                        icon: <Users className="h-3 w-3" />,
                      },
                      {
                        label: "Posts",
                        value: tweetStats.posts,
                        icon: <TrendingUp className="h-3 w-3" />,
                      },
                      {
                        label: "Likes",
                        value: tweetStats.likes,
                        icon: <Heart className="h-3 w-3" />,
                      },
                      {
                        label: "Comments",
                        value: tweetStats.comments,
                        icon: <MessageSquare className="h-3 w-3" />,
                      },
                      {
                        label: "Views",
                        value: tweetStats.views,
                        icon: <Eye className="h-3 w-3" />,
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-2 text-center"
                      >
                        <div className="text-gray-400 text-xs flex items-center justify-center gap-1 mb-1">
                          {stat.icon}
                          {stat.label}
                        </div>
                        <div className="text-white font-semibold">
                          {stat.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-white/50 mt-2">
                    Tracking since:{" "}
                    {new Date(tournament.createdAt).toLocaleDateString()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tournament Recent Posts */}
          <Card className="bg-gradient-to-br from-[#111] to-black border-white/10 mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-white/70" />
                Recent Tournament Activity
              </h3>

              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader className="h-6 w-6 text-white animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tweetStats.recentTweets.length > 0 ? (
                    tweetStats.recentTweets.map((tweet, i) => (
                      <Card
                        key={tweet.id || i}
                        className="bg-black/30 border-white/5"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={tweet.author.image} />
                              <AvatarFallback>
                                {tweet.author.name
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {tweet.author.name}
                            </span>
                            <Badge className="text-xs bg-white/10 text-white/80">
                              {tweet.author.section.charAt(0).toUpperCase() +
                                tweet.author.section.slice(1)}
                            </Badge>
                            <span className="text-xs text-white/50 ml-auto">
                              {formatTimeSince(tweet.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-white/80">
                            {tweet.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Heart size={12} />
                              {tweet.metrics.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare size={12} />
                              {tweet.metrics.replyCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <RefreshCw size={12} />
                              {tweet.metrics.retweetCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {tweet.metrics.viewCount}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-4 text-white/50">
                      No recent tweets found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Teams */}
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-white/70" />
            Tournament Teams
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {allTeams.map((team, teamIndex) => (
              <TeamCard
                key={teamIndex}
                team={team}
                section={{ name: team.section }}
                tournament={tournament.tournamentId._id}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

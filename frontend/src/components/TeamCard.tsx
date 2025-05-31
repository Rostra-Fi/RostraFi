import { useState } from "react";
import Image from "next/image";
import {
  Loader,
  Eye,
  Heart,
  MessageSquare,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import WobbleCard from "./WobbleCard";
import { TeamCardProps, TwitterData } from "../types/types";

export const TeamCard = ({ team, section, tournament }: TeamCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [twitterData, setTwitterData] = useState<TwitterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch Twitter data when team card is clicked
  const fetchTwitterData = async () => {
    try {
      setIsLoading(true);
      console.log(tournament);
      console.log(team.twitterId);

      // Get tournamentId and teamId from props
      const tournamentId = tournament; // Assuming tournament prop contains the tournamentId
      const twitterId = team.twitterId; // Assuming team has twitterId property

      if (!tournamentId || !twitterId) {
        console.error("Missing tournamentId or twitterId");
        return;
      }

      // Make API call to fetch Twitter data
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/userTeams/twitter/${tournamentId}/${twitterId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Twitter data: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setTwitterData(data.data);
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching Twitter data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog open - fetch data when opening
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    fetchTwitterData();
  };

  const sectionColors: { [key: string]: string } = {
    diamond:
      "from-blue-900 to-blue-800 bg-blue-500/20 text-blue-300 border-blue-500/30",
    premium:
      "from-purple-900 to-purple-800 bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  const colorClass = sectionColors[section.name] || "from-gray-900 to-gray-800";

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer" onClick={handleDialogOpen}>
            <WobbleCard
              containerClassName={`bg-gradient-to-br ${
                colorClass.split(" ")[0]
              } ${colorClass.split(" ")[1]} w-full h-40`}
              className="p-4 h-full"
            >
              <div className="flex h-full">
                <div className="relative h-full aspect-square overflow-hidden rounded-xl mr-4">
                  <Image
                    src={team.image || "/placeholder.svg"}
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {team.name}
                    </h3>
                    <Badge className="mt-1 bg-white/20 text-white">
                      {section.name.charAt(0).toUpperCase() +
                        section.name.slice(1)}
                    </Badge>
                    <p className="text-white/70 text-sm line-clamp-2 mt-1">
                      {team.description || "No description available"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-white/90">
                      <span className="font-semibold">{team.points || 0}</span>{" "}
                      <span className="text-sm">points</span>
                    </div>
                  </div>
                </div>
              </div>
            </WobbleCard>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={team.image} />
                <AvatarFallback>
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {team.name}
              <Badge
                className={`ml-2 ${colorClass.split(" ")[2]} ${
                  colorClass.split(" ")[3]
                } ${colorClass.split(" ")[4]} border`}
              >
                {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div className="relative rounded-xl overflow-hidden h-56">
              <Image
                src={team.image || "/placeholder.svg"}
                alt={team.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h2 className="text-xl font-bold text-white">{team.name}</h2>
                <p className="text-white/70 text-sm mt-1">
                  {team.description ||
                    "A competitive team looking to make its mark."}
                </p>
              </div>
            </div>

            {/* Twitter Stats Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Twitter Stats</h3>
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : twitterData ? (
                <div className="grid grid-cols-5 gap-3">
                  {[
                    {
                      icon: <Eye size={18} />,
                      label: "Views",
                      value: twitterData.stats.viewCount.toLocaleString(),
                    },
                    {
                      icon: <Heart size={18} />,
                      label: "Likes",
                      value: twitterData.stats.likeCount.toLocaleString(),
                    },
                    {
                      icon: <MessageSquare size={18} />,
                      label: "Replies",
                      value: twitterData.stats.replyCount.toLocaleString(),
                    },
                    {
                      icon: <RefreshCw size={18} />,
                      label: "Retweets",
                      value: twitterData.stats.retweetCount.toLocaleString(),
                    },
                    {
                      icon: <TrendingUp size={18} />,
                      label: "Tweets",
                      value: twitterData.stats.tweetCount.toLocaleString(),
                    },
                  ].map((stat, i) => (
                    <Card key={i} className="bg-[#1a1a1a] border-white/10">
                      <CardContent className="p-3 flex flex-col items-center justify-center">
                        <div className="text-white/60 mb-1">{stat.icon}</div>
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-white/60">
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border-white/10 rounded-lg p-4 text-center text-white/70">
                  No Twitter data available for this team
                </div>
              )}
            </div>

            {/* Recent Tweets Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Tweets</h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <Loader className="h-8 w-8 text-white animate-spin" />
                  </div>
                ) : twitterData &&
                  twitterData.tweets &&
                  twitterData.tweets.length > 0 ? (
                  twitterData.tweets.map((tweet, i) => (
                    <Card key={i} className="bg-[#1a1a1a] border-white/10">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={team.image} />
                            <AvatarFallback>
                              {team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {team.name}
                          </span>
                          <span className="text-xs text-white/50">
                            {new Date(tweet.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/80">{tweet.content}</p>
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
                  <div className="bg-[#1a1a1a] border-white/10 rounded-lg p-4 text-center text-white/70">
                    No tweets available
                  </div>
                )}
              </div>
            </div>

            {/* Last Updated Info */}
            {twitterData && (
              <div className="text-xs text-white/50 text-right">
                Last updated:{" "}
                {new Date(twitterData.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

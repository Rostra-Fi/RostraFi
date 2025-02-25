import React from "react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { useToast } from "@/hooks/use-toast";
import { Tournament } from "@/store/tournamentSlice";
import { useRouter } from "next/navigation";
import { setCurrentTournament } from "@/store/userSlice";

interface PlatformCardProps {
  platform: string;
  image: string;
  icon: string;
  timeRemaining: number;
  tournamentData: Tournament;
  href?: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  image,
  icon,
  timeRemaining,
  tournamentData,
  href = "twitterTeams",
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const formatTimeRemaining = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const { userId, userWalletAddress } = useAppSelector((state) => state.user);
  console.log(userId, userWalletAddress);

  const getPlatformStyles = (
    platform: string
  ): { background: string; text: string } => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return {
          background: "bg-gray-900",
          text: "text-white",
        };
      case "instagram":
        return {
          background:
            "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
          text: "text-white",
        };
      case "tiktok":
        return {
          background: "bg-[#010101]",
          text: "text-white",
        };
      default:
        return {
          background: "bg-gray-600",
          text: "text-white",
        };
    }
  };

  const platformStyles = getPlatformStyles(platform);

  // New function to handle action dispatch and routing
  const handleCreateTeam = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userWalletAddress) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a team.",
      });
      return;
    }

    // Dispatch action to store selected tournament data before navigation
    dispatch(setCurrentTournament(tournamentData._id));

    // You can add additional dispatches or async operations here

    // After dispatching the action(s), navigate to the destination route
    router.push(href);
  };

  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-black/80 relative group/card border-white/[0.2] w-[20rem] h-[26rem] rounded-xl p-4 border">
        {/* Platform Icon */}
        <CardItem translateZ="50" className="absolute top-4 right-4 w-8 h-8">
          <Image
            src={icon}
            width={32}
            height={32}
            alt={`${platform} icon`}
            className="rounded-full"
          />
        </CardItem>

        {/* Title */}
        <CardItem translateZ="50" className="text-xl font-bold text-white mb-2">
          {platform} Tournament
        </CardItem>

        {/* Main Image */}
        <CardItem translateZ="100" className="w-full mt-2">
          <Image
            src={image}
            height={400}
            width={400}
            className="h-44 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={`${platform} tournament`}
          />
        </CardItem>

        {/* Information Section */}
        <div className="space-y-2 mt-4">
          {/* Time Remaining */}
          <CardItem
            translateZ="50"
            className="flex items-center text-white/90 text-base"
          >
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </CardItem>

          {/* Prize Pool */}
          <CardItem
            translateZ="50"
            className="text-base text-white/90 font-medium"
          >
            Prize Pool: 1000 SOL
          </CardItem>
        </div>

        {/* Create Team Button - Centered */}
        <div className="flex justify-center mt-4">
          <CardItem
            translateZ={20}
            as="button"
            onClick={handleCreateTeam}
            className={`px-6 py-1.5 rounded-lg ${platformStyles.background} ${platformStyles.text} text-sm font-bold hover:opacity-90 transition-opacity`}
          >
            Create Team
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
};

export default PlatformCard;

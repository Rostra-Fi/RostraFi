import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Medal,
  Award,
  Crown,
  Zap,
  X,
  Eye,
  CheckCircle,
  Sparkles,
  Gift,
  LucideIcon,
} from "lucide-react";

// Type definitions based on your backend models
interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: "tournament_participation" | "points" | "streak" | "achievement";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  requirement: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserBadge {
  _id: string;
  userId: string;
  badgeId: Badge;
  earnedAt: string;
  isNewlyEarned: boolean;
  isViewed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserBadgesResponse {
  success: boolean;
  data: {
    badges: UserBadge[];
    totalBadges: number;
    lastBadgeEarned: string | null;
  };
}

interface NewBadgesResponse {
  success: boolean;
  data: {
    newBadges: UserBadge[];
    hasNewBadges: boolean;
  };
}

interface MarkViewedResponse {
  success: boolean;
  message: string;
}

interface ApiError {
  success: false;
  message: string;
}

// Badge tier configurations
interface BadgeTierConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: LucideIcon;
  glow: string;
}

type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

const BADGE_TIERS: Record<BadgeTier, BadgeTierConfig> = {
  bronze: {
    color: "from-amber-600 to-amber-800",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    icon: Trophy,
    glow: "shadow-amber-500/20",
  },
  silver: {
    color: "from-slate-400 to-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    textColor: "text-slate-300",
    icon: Medal,
    glow: "shadow-slate-500/20",
  },
  gold: {
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
    icon: Award,
    glow: "shadow-yellow-500/20",
  },
  platinum: {
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    icon: Star,
    glow: "shadow-purple-500/20",
  },
  diamond: {
    color: "from-cyan-400 to-blue-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-400",
    icon: Crown,
    glow: "shadow-cyan-500/20",
  },
};

// Badge Service
class BadgeService {
  static async getUserBadges(
    walletAddress: string
  ): Promise<UserBadge[] | null> {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/badges/user/${walletAddress}`
      );
      const result: UserBadgesResponse | ApiError = await response.json();
      return result.success ? (result as UserBadgesResponse).data.badges : null;
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return null;
    }
  }

  static async getNewBadges(
    walletAddress: string
  ): Promise<{ newBadges: UserBadge[]; hasNewBadges: boolean } | null> {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/badges/user/${walletAddress}/new`
      );
      const result: NewBadgesResponse | ApiError = await response.json();
      return result.success ? (result as NewBadgesResponse).data : null;
    } catch (error) {
      console.error("Error fetching new badges:", error);
      return null;
    }
  }

  static async markBadgesViewed(
    walletAddress: string,
    badgeIds?: string[]
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/badges/user/${walletAddress}/mark-viewed`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ badgeIds }),
        }
      );
      const result: MarkViewedResponse | ApiError = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error marking badges as viewed:", error);
      return false;
    }
  }
}

// Props interfaces
interface BadgeCardProps {
  badge: Badge;
  userBadge: UserBadge;
  isNew?: boolean;
  onClick: () => void;
}

interface NewBadgeDialogProps {
  badges: UserBadge[];
  isOpen: boolean;
  onClose: () => void;
  onMarkViewed: () => Promise<void>;
}

interface BadgeSystemProps {
  walletAddress: string;
  userId?: string;
  onBadgeCountUpdate?: (count: number) => void;
}

interface SelectedBadge {
  badge: Badge;
  userBadge: UserBadge;
}

// Individual Badge Card Component
const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  userBadge,
  isNew = false,
  onClick,
}) => {
  const tierConfig = BADGE_TIERS[badge.tier] || BADGE_TIERS.bronze;
  const IconComponent = tierConfig.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative cursor-pointer group overflow-hidden rounded-xl
        ${tierConfig.bgColor} ${tierConfig.borderColor} border-2
        backdrop-blur-sm transition-all duration-300
        hover:${tierConfig.glow} hover:shadow-lg
        ${isNew ? "animate-pulse ring-2 ring-white/50" : ""}
      `}
      onClick={onClick}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${tierConfig.color} opacity-5`}
      />

      {/* Content */}
      <div className="relative p-4 text-center">
        {/* Badge Icon */}
        <div className="relative mx-auto mb-3 w-12 h-12">
          <div
            className={`
            absolute inset-0 rounded-full bg-gradient-to-br ${tierConfig.color}
            flex items-center justify-center
          `}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>

          {/* Animated Ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${tierConfig.borderColor}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Badge Name */}
        <h3 className={`font-bold text-sm ${tierConfig.textColor} mb-1`}>
          {badge.name}
        </h3>

        {/* Badge Description */}
        <p className="text-xs text-white/60 mb-2">{badge.description}</p>

        {/* Earned Date */}
        <div className="text-xs text-white/40">
          Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
        </div>

        {/* New Badge Indicator */}
        {isNew && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2"
          >
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// New Badge Dialog Component
const NewBadgeDialog: React.FC<NewBadgeDialogProps> = ({
  badges,
  isOpen,
  onClose,
  onMarkViewed,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleNext = (): void => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = async (): Promise<void> => {
    setIsClosing(true);
    await onMarkViewed();
    setTimeout(() => {
      setIsClosing(false);
      setCurrentIndex(0);
      onClose();
    }, 300);
  };

  if (!isOpen || !badges.length) return null;

  const currentBadge = badges[currentIndex];
  const tierConfig =
    BADGE_TIERS[currentBadge.badgeId.tier] || BADGE_TIERS.bronze;
  const IconComponent = tierConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6,
          }}
          className="relative bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 rounded-2xl p-8 max-w-md w-full text-center overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Congratulations Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Gift className="w-8 h-8 text-white/80 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-white mb-1">
              Congratulations!
            </h2>
            <p className="text-white/60 text-sm mb-6">
              You've earned a new badge!
            </p>
          </motion.div>

          {/* Badge Display */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="relative mb-6"
          >
            {/* Animated Background */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierConfig.color} opacity-20`}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Badge Icon */}
            <div
              className={`
              relative mx-auto w-24 h-24 rounded-full 
              bg-gradient-to-br ${tierConfig.color}
              flex items-center justify-center
              shadow-2xl ${tierConfig.glow}
            `}
            >
              <IconComponent className="w-12 h-12 text-white" />
            </div>

            {/* Sparkle Effects */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                  top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>

          {/* Badge Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className={`text-xl font-bold ${tierConfig.textColor} mb-2`}>
              {currentBadge.badgeId.name}
            </h3>
            <p className="text-white/70 mb-4">
              {currentBadge.badgeId.description}
            </p>
            <div
              className={`
              inline-block px-3 py-1 rounded-full text-xs font-medium
              ${tierConfig.bgColor} ${tierConfig.textColor} ${tierConfig.borderColor} border
            `}
            >
              {currentBadge.badgeId.tier.toUpperCase()} TIER
            </div>
          </motion.div>

          {/* Progress Indicator */}
          {badges.length > 1 && (
            <div className="flex justify-center space-x-2 mt-6 mb-4">
              {badges.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleNext}
            className={`
              w-full py-3 rounded-lg font-medium transition-all
              bg-gradient-to-r ${tierConfig.color} text-white
              hover:shadow-lg hover:${tierConfig.glow}
            `}
          >
            {currentIndex < badges.length - 1 ? "Next Badge" : "Awesome!"}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Badge System Component
const BadgeSystem: React.FC<BadgeSystemProps> = ({
  walletAddress,
  userId,
  onBadgeCountUpdate,
}) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [newBadges, setNewBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewBadgeDialog, setShowNewBadgeDialog] = useState<boolean>(false);
  const [selectedBadge, setSelectedBadge] = useState<SelectedBadge | null>(
    null
  );
  const [showBadgeDetail, setShowBadgeDetail] = useState<boolean>(false);

  // Fetch all badges
  const fetchBadges = async (): Promise<void> => {
    setLoading(true);
    const badgeData = await BadgeService.getUserBadges(walletAddress);
    if (badgeData) {
      setBadges(badgeData);
      // Update badge count in parent component
      if (onBadgeCountUpdate) {
        onBadgeCountUpdate(badgeData.length);
      }
    }
    setLoading(false);
  };

  // Check for new badges
  const checkNewBadges = async (): Promise<void> => {
    const newBadgeData = await BadgeService.getNewBadges(walletAddress);
    if (newBadgeData && newBadgeData.hasNewBadges) {
      setNewBadges(newBadgeData.newBadges);
      setShowNewBadgeDialog(true);
    }
  };

  // Mark badges as viewed
  const markBadgesViewed = async (): Promise<void> => {
    const success = await BadgeService.markBadgesViewed(walletAddress);
    if (success) {
      setNewBadges([]);
      await fetchBadges(); // Refresh badges
    }
  };

  // Handle badge click
  const handleBadgeClick = (badge: Badge, userBadge: UserBadge): void => {
    setSelectedBadge({ badge, userBadge });
    setShowBadgeDetail(true);
  };

  // Initial load
  useEffect(() => {
    if (walletAddress) {
      fetchBadges();
      checkNewBadges();
    }
  }, [walletAddress]);

  // Group badges by tier
  const badgesByTier = badges.reduce<Record<BadgeTier, UserBadge[]>>(
    (acc, userBadge) => {
      const tier = userBadge.badgeId.tier;
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(userBadge);
      return acc;
    },
    {} as Record<BadgeTier, UserBadge[]>
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded mb-4 w-48"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ml-[5.4rem] mt-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center  gap-3">
          <Trophy className="w-6 h-6 text-white/70" />
          <h2 className="text-xl font-bold text-white">Achievement Badges</h2>
          {badges.length > 0 && (
            <span className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-sm">
              {badges.length} earned
            </span>
          )}
        </div>

        {newBadges.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowNewBadgeDialog(true)}
            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            {newBadges.length} New
          </motion.button>
        )}
      </div>

      {/* Badge Grid */}
      {badges.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(badgesByTier).map(([tier, tierBadges]) => (
            <div key={tier}>
              <h3
                className={`
                text-lg font-semibold mb-3 capitalize flex items-center gap-2
                ${BADGE_TIERS[tier as BadgeTier]?.textColor || "text-white"}
              `}
              >
                {React.createElement(
                  BADGE_TIERS[tier as BadgeTier]?.icon || Trophy,
                  { className: "w-5 h-5" }
                )}
                {tier} Badges ({tierBadges.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tierBadges.map((userBadge) => (
                  <BadgeCard
                    key={userBadge._id}
                    badge={userBadge.badgeId}
                    userBadge={userBadge}
                    onClick={() =>
                      handleBadgeClick(userBadge.badgeId, userBadge)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No Badges Yet</h3>
          <p className="text-white/60 text-sm">
            Participate in tournaments to earn your first badge!
          </p>
        </div>
      )}

      {/* New Badge Dialog */}
      <NewBadgeDialog
        badges={newBadges}
        isOpen={showNewBadgeDialog}
        onClose={() => setShowNewBadgeDialog(false)}
        onMarkViewed={markBadgesViewed}
      />

      {/* Badge Detail Dialog */}
      {showBadgeDetail && selectedBadge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setShowBadgeDetail(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/20 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div
                className={`
                mx-auto w-20 h-20 rounded-full mb-4
                bg-gradient-to-br ${
                  BADGE_TIERS[selectedBadge.badge.tier]?.color ||
                  BADGE_TIERS.bronze.color
                }
                flex items-center justify-center
              `}
              >
                {React.createElement(
                  BADGE_TIERS[selectedBadge.badge.tier]?.icon || Trophy,
                  { className: "w-10 h-10 text-white" }
                )}
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${
                  BADGE_TIERS[selectedBadge.badge.tier]?.textColor ||
                  BADGE_TIERS.bronze.textColor
                }`}
              >
                {selectedBadge.badge.name}
              </h3>

              <p className="text-white/70 mb-4">
                {selectedBadge.badge.description}
              </p>

              <div className="space-y-2 text-sm text-white/60">
                <div>Tier: {selectedBadge.badge.tier.toUpperCase()}</div>
                <div>
                  Earned:{" "}
                  {new Date(
                    selectedBadge.userBadge.earnedAt
                  ).toLocaleDateString()}
                </div>
                <div>
                  Requirement: {selectedBadge.badge.requirement} tournaments
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BadgeSystem;

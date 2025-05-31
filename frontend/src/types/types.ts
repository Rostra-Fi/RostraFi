// Add these interfaces at the top of your file
export interface Team {
  _id: string;
  id: string;
  name: string;
  image: string;
  description?: string;
  points: number;
  twitterId: string;
  createdAt: string;
  updatedAt: string;
  audio?: string;
  followers?: number;
}

export interface SectionId {
  _id: string;
  id: string;
  name: string;
}

export interface TournamentSection {
  _id: string;
  id: string;
  name: string;
  sectionId: SectionId;
  selectedTeams: Team[];
}

export interface TournamentId {
  _id: string;
  id: string;
  name: string;
  endDate: string;
  startDate: string;
  icon: string;
  image: string;
  isActive: boolean;
  isOngoing: boolean;
  isRegistrationOpen: boolean;
  platform: string;
  prizePool: number;
  registrationEndDate: string;
}

export interface UserCurrentTournament {
  _id: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  sections: TournamentSection[];
  teamName: string;
  totalFollowers: number;
  tournamentId: TournamentId;
  userId: string;
  walletUserId: string;
  twitterStats?: TwitterStats1;
  __v: number;
}

export interface TwitterStats1 {
  posts: number;
  likes: number;
  comments: number;
  retweets: number;
  views: number;
  recentTweets: Tweet[];
}

export interface TwitterStats {
  viewCount: number;
  likeCount: number;
  replyCount: number;
  retweetCount: number;
  tweetCount: number;
}

export interface Tweet {
  id: string;
  content: string;
  createdAt: string;
  author: TweetAuthor;
  metrics: {
    likeCount: number;
    replyCount: number;
    retweetCount: number;
    viewCount: number;
  };
}

export interface TweetAuthor {
  name: string;
  image: string;
  section: string;
}

export interface TwitterData {
  stats: TwitterStats;
  tweets: Tweet[];
  lastUpdated: string;
}

// Define base interfaces for nested objects
export interface TournamentDetails {
  createdAt: string;
  endDate: string;
  icon: string;
  id: string;
  image: string;
  isActive: boolean;
  isOngoing: boolean;
  isRegistrationOpen: boolean;
  name: string;
  participated: string[];
  platform: string;
  pointsForVisit: number;
  prizePool: number;
  registrationEndDate: string;
  registrationTimeLimit: number;
  startDate: string;
  timeLimit: number;
  updatedAt: string;
  visited: string[];
  __v: number;
  _id: string;
}

export interface TeamMember {
  audio?: string;
  createdAt: string;
  description: string;
  followers: number;
  id: string;
  image: string;
  name: string;
  points: number;
  twitterId: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

export interface Section {
  id: string;
  name: string;
  sectionId: string;
  selectedTeams: TeamMember[];
  _id: string;
}

export interface UserTeam {
  createdAt: string;
  id: string;
  isActive: boolean;
  sections: Section[];
  teamName: string;
  totalFollowers: number;
  tournamentId: string;
  updatedAt: string;
  userId: string;
  walletUserId: string;
  __v: number;
  _id: string;
}

// Main interface for the tournament data
export interface UserTournament {
  userTeam: UserTeam;
  tournamentDetails: TournamentDetails;
  isActive: boolean;
  isOngoing: boolean;
}

export interface TeamCardProps {
  team: Team;
  section: {
    name: string;
  };
  tournament: string; // tournamentId
}

export interface TournamentCardProps {
  tournament: UserCurrentTournament;
}

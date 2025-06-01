"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, Award, Plus, TrendingUp, Zap, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data for the background
const mockInfluencers = [
  {
    _id: "1",
    id: "1",
    title: "Elon Musk's Next Tweet",
    image: "/placeholder.svg?height=200&width=300",
    description: "Will Elon tweet about Mars colonization this week?",
    voteCost: 50,
    points: 1000,
    duration: 7,
    timeRemaining: 86400000,
    startDate: "2024-01-01",
    endDate: "2024-01-08",
    isActive: true,
    isExpired: false,
    yesVotes: 750,
    noVotes: 250,
    totalVotes: 1000,
    yesPercentage: 75,
    noPercentage: 25,
  },
  {
    _id: "2",
    id: "2",
    title: "MrBeast's Next Video",
    image: "/placeholder.svg?height=200&width=300",
    description: "Will MrBeast's next video hit 100M views in 24 hours?",
    voteCost: 75,
    points: 1500,
    duration: 5,
    timeRemaining: 432000000,
    startDate: "2024-01-01",
    endDate: "2024-01-06",
    isActive: true,
    isExpired: false,
    yesVotes: 600,
    noVotes: 400,
    totalVotes: 1000,
    yesPercentage: 60,
    noPercentage: 40,
  },
  {
    _id: "3",
    id: "3",
    title: "Taylor Swift Announcement",
    image: "/placeholder.svg?height=200&width=300",
    description: "Will Taylor Swift announce a new album this month?",
    voteCost: 100,
    points: 2000,
    duration: 30,
    timeRemaining: 2592000000,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    isActive: true,
    isExpired: false,
    yesVotes: 800,
    noVotes: 200,
    totalVotes: 1000,
    yesPercentage: 80,
    noPercentage: 20,
  },
  {
    _id: "4",
    id: "4",
    title: "Cristiano Ronaldo Goal",
    image: "/placeholder.svg?height=200&width=300",
    description: "Will Ronaldo score in his next match?",
    voteCost: 25,
    points: 500,
    duration: 3,
    timeRemaining: 259200000,
    startDate: "2024-01-01",
    endDate: "2024-01-04",
    isActive: true,
    isExpired: false,
    yesVotes: 650,
    noVotes: 350,
    totalVotes: 1000,
    yesPercentage: 65,
    noPercentage: 35,
  },
]

const getCategoryIcon = (title: string) => {
  if (title.includes("Elon")) return <Zap className="h-4 w-4" />
  if (title.includes("MrBeast")) return <Star className="h-4 w-4" />
  if (title.includes("Taylor")) return <Star className="h-4 w-4" />
  if (title.includes("Ronaldo")) return <TrendingUp className="h-4 w-4" />
  return <Star className="h-4 w-4" />
}

const getCategory = (title: string) => {
  if (title.includes("Elon")) return "Tech"
  if (title.includes("MrBeast")) return "Entertainment"
  if (title.includes("Taylor")) return "Entertainment"
  if (title.includes("Ronaldo")) return "Sports"
  return "Entertainment"
}

export function BackgroundContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="container mx-auto py-8 px-4">
        <div className="relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl z-0"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text drop-shadow-lg pb-2">
              Bet on Influencers
            </h1>
            <p className="text-center text-gray-400 max-w-xl mx-auto mt-2">
              Place your bets on the future actions of top influencers and win big!
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 border-purple-700 bg-purple-950/50">
              <TrendingUp className="h-4 w-4 mr-1 text-pink-500" />
              <span>Hot Bets</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-blue-700 bg-blue-950/50">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              <span>Ending Soon</span>
            </Badge>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-full px-5 py-3 flex items-center gap-3 border border-gray-700 shadow-lg shadow-purple-900/10">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Your Balance</span>
              <span className="text-xl font-bold text-yellow-400">1,250</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <Button
              size="sm"
              className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-md shadow-purple-900/20"
            >
              <Plus className="h-4 w-4 mr-1" /> Buy Points
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockInfluencers.map((influencer) => {
            const category = getCategory(influencer.title)

            return (
              <motion.div
                key={influencer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card className="bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20">
                  <div className="relative h-48">
                    <Image
                      src={influencer.image || "/placeholder.svg"}
                      alt={influencer.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gray-800/80 backdrop-blur-sm border-gray-700 px-2 py-1 flex items-center gap-1">
                        {getCategoryIcon(influencer.title)}
                        {category}
                      </Badge>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-xl text-white">{influencer.title}</h3>
                    </div>
                  </div>

                  <CardContent className="pt-4 pb-2">
                    <p className="text-gray-300 mb-4 text-sm">{influencer.description}</p>

                    <div className="flex justify-between items-center mb-3">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-gray-800/50 text-blue-400 border-blue-900"
                      >
                        <Clock className="h-3 w-3" /> 2 days left
                      </Badge>
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {influencer.voteCost} points
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Yes Votes</span>
                        <span className="text-gray-300">{influencer.yesPercentage}%</span>
                      </div>
                      <Progress value={influencer.yesPercentage} className="h-1.5" />
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-0">
                    <Button className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 border-0">
                      Yes
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 border-0">
                      No
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

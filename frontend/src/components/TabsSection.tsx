"use client";

import Image from "next/image";
import { Tabs } from "./ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Users, LineChart, Wallet, Trophy, Crown, Swords, Target, Coins } from "lucide-react";
import { useState, useEffect } from "react";

export function TabsDemo() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const AnimatedContent = ({ title, icon: Icon, description, features }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative w-full h-full flex flex-col"
      >
        <motion.div
          className="flex items-center space-x-4 mb-8"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Icon className="w-12 h-12 text-purple-400 glow-purple" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-6 h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-6 border border-white/10"
            >
              <motion.div
                className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
                animate={{ opacity: hoveredIndex === idx ? 0.1 : 0 }}
              />

              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-lg">{feature.description}</p>

              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.2 * idx }}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="absolute -bottom-20 -right-20 w-72 h-72 blur-3xl rounded-full bg-white/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.div>
    );
  };

  
  const tabs = [
    {
      title: "Draft Squad",
      value: "team",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 via-purple-900 to-black">
          <AnimatedContent
            title="Assemble Your Empire"
            icon={Swords}
            features={[
              {
                title: "Elite Tier Selection",
                description: "Handpick from S-tier, A-tier, and rising star influencers",
              },
              {
                title: "Championship Builder",
                description: "Craft your 5-player dream team from 1000+ creators",
              },
              {
                title: "Live Power Rankings",
                description: "Real-time RP (Rostra Points) tracking for each member",
              },
              {
                title: "Meta Compositions",
                description: "AI-powered synergy analysis for maximum points",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "War Room",
      value: "track",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 via-blue-900 to-black">
          <AnimatedContent
            title="Conquer the Leaderboards"
            icon={Target}
            features={[
              {
                title: "Live Battlefeed",
                description: "Second-by-second updates on influencer engagements",
              },
              {
                title: "Rivalry Radar",
                description: "Track competing teams' moves in real-time",
              },
              {
                title: "Victory Predictor",
                description: "AI-powered win probability calculations",
              },
              {
                title: "Clutch Moments",
                description: "Highlight reels of key performance spikes",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Solana Arena",
      value: "invest",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 via-yellow-900 to-black">
          <AnimatedContent
            title="Web3 Warfare"
            icon={Coins}
            features={[
              {
                title: "Blitz Deposits",
                description: "Fund your warchest in <1s with SOL",
              },
              {
                title: "Smart Contract Siege",
                description: "Provably fair matches on-chain",
              },
              {
                title: "Victory Vault",
                description: "Auto-claim prizes to your Phantom wallet",
              },
              {
                title: "Yield Generators",
                description: "Stake SOL between battles for extra rewards",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Hall of Fame",
      value: "winners",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 via-red-900 to-black">
          <AnimatedContent
            title="Eternal Glory"
            icon={Trophy}
            features={[
              {
                title: "Daily Spoils",
                description: "$10k+ SOL pool distributed every 24h",
              },
              {
                title: "Legendary NFTs",
                description: "Mint champion badges with royalty rights",
              },
              {
                title: "Global Dominance",
                description: "Climb from Bronze to Celestial ranks",
              },
              {
                title: "Pro Circuit",
                description: "Qualify for $100k championship tournaments",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Elite Dynasty",
      value: "vip",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 via-pink-900 to-black">
          <AnimatedContent
            title="Shadow Council"
            icon={Crown}
            features={[
              {
                title: "Alpha Access",
                description: "Early intel on influencer performance metrics",
              },
              {
                title: "Whale Benefits",
                description: "5% edge on all point calculations",
              },
              {
                title: "Dark Pool",
                description: "Exclusive high-stakes private matches",
              },
              {
                title: "Oracle Network",
                description: "Direct Q&A with top strategists",
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="h-[18rem] md:h-[35rem] [perspective:1000px] relative flex flex-col w-[90%] max-w-6xl items-start justify-start my-4 ml-0">
      <div className="mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Build Your Influencer Empire
        </h1>
        <p className="text-xl text-gray-300 mt-2">
          Draft. Strategize. Conquer. Win SOL prizes daily in the ultimate Web3 showdown
        </p>
      </div>
      
      <Tabs
        tabs={tabs}
        tabClassName="mx-1 text-lg font-semibold bg-white/5 hover:bg-white/20 transition-all duration-300 glow-hover"
        activeTabClassName="bg-white/20 backdrop-blur-sm glow-active"
      />
    </div>
  );


}
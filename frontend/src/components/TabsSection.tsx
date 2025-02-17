"use client";

import Image from "next/image";
import { Tabs } from "./ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Users, LineChart, Wallet, Trophy, Crown } from "lucide-react";
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
          <Icon className="w-12 h-12 text-white opacity-80" />
          <h2 className="text-4xl font-bold text-white">{title}</h2>
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
      title: "Build Team",
      value: "team",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 to-black">
          <AnimatedContent
            title="Create Your Dream Team"
            icon={Users}
            features={[
              {
                title: "Premium Selection",
                description:
                  "Choose from Diamond, Gold, Silver, and Bronze tier influencers",
              },
              {
                title: "Strategic Builder",
                description:
                  "Build your perfect 20-account roster from our curated selections",
              },
              {
                title: "Performance Stats",
                description: "Track real-time engagement metrics and growth",
              },
              {
                title: "AI Optimization",
                description: "Get intelligent suggestions for team composition",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Track",
      value: "track",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 to-black">
          <AnimatedContent
            title="Performance Analytics"
            icon={LineChart}
            features={[
              {
                title: "24h Analysis",
                description:
                  "Real-time monitoring of likes, comments, and follower growth",
              },
              {
                title: "Engagement Metrics",
                description:
                  "Deep dive into post performance and audience interaction",
              },
              {
                title: "Competitive Edge",
                description: "Compare your team's performance against others",
              },
              {
                title: "Trend Detection",
                description: "Identify patterns and optimize your strategy",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Invest",
      value: "invest",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 to-black">
          <AnimatedContent
            title="Solana Integration"
            icon={Wallet}
            features={[
              {
                title: "Swift Deposits",
                description: "Instant funding with Solana's high-speed network",
              },
              {
                title: "Smart Bidding",
                description: "Place secure bids with smart contract protection",
              },
              {
                title: "Auto Rewards",
                description: "Instant prize distribution to winning teams",
              },
              {
                title: "Minimal Fees",
                description:
                  "Benefit from Solana's efficient transaction costs",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Winners",
      value: "winners",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 to-black">
          <AnimatedContent
            title="Champions Circle"
            icon={Trophy}
            features={[
              {
                title: "Reward Pools",
                description:
                  "Multiple prize tiers based on performance metrics",
              },
              {
                title: "Daily Victories",
                description: "New winning opportunities every 24 hours",
              },
              {
                title: "NFT Badges",
                description: "Collect exclusive achievement NFTs",
              },
              {
                title: "Global Ranks",
                description: "Compete for top positions worldwide",
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "VIP",
      value: "vip",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-8 text-2xl md:text-5xl font-bold text-white bg-gradient-to-br from-gray-900 to-black">
          <AnimatedContent
            title="Elite Benefits"
            icon={Crown}
            features={[
              {
                title: "Early Access",
                description: "First pick of new influencers and features",
              },
              {
                title: "Premium Rates",
                description: "Exclusive transaction fee discounts",
              },
              {
                title: "Pro Insights",
                description: "Advanced analytics and strategy guidance",
              },
              {
                title: "Elite Events",
                description: "VIP-only tournaments and virtual meetups",
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="h-[18rem] md:h-[35rem] [perspective:1000px] relative flex flex-col w-[90%] max-w-6xl items-start justify-start my-4 ml-0">
      <Tabs
        tabs={tabs}
        tabClassName="mx-1 text-lg font-semibold transition-all duration-300 hover:bg-white/10"
        activeTabClassName="bg-white/20 backdrop-blur-sm"
      />
    </div>
  );
}

const DummyContent = () => {
  return (
    <Image
      src="/linear.webp"
      alt="dummy image"
      width="1000"
      height="1000"
      className="object-cover object-left-top h-[60%] md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
    />
  );
};

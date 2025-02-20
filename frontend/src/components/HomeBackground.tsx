"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "./ui/lamp";
import { TextRevealEffect } from "./ui/text-reveal-card";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { ColourfulText } from "./ui/colourful-text";
import PlatformCard from "./Cards";

const words = "Select, Bid, and Win Big with Solana-Powered Social Influence";

export function HomeBackGround() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-44 text-center text-5xl font-bold tracking-tight md:text-8xl"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-4">
            <span className="bg-gradient-to-br from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Craft Your
            </span>
            <TextRevealEffect text="Winning" />
            <span className="bg-gradient-to-br from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Team
            </span>
          </div>
          <div>
            <span className="bg-gradient-to-br from-slate-100 to-slate-300 bg-clip-text text-transparent">
              with <ColourfulText text="Influencers" />{" "}
              {/* Apply ColourfulText here */}
            </span>
          </div>
        </div>
      </motion.h1>

      <motion.span
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-4 text-center text-lg font-bold text-slate-500/80 md:text-xl"
      >
        <TextGenerateEffect words={words} />
      </motion.span>

      {/* Button placed here without disrupting other elements */}
      <div className="flex flex-wrap gap-6 justify-center mt-8">
        <PlatformCard
          platform="Twitter"
          image="https://media.istockphoto.com/id/1649927045/photo/social-media-social-media-marketing-engagement-post-structure.jpg?s=1024x1024&w=is&k=20&c=L_qdR5o6diw78hc7dSE4SML5tiNPoYVJihGKSe_2cTw="
          icon="https://img.freepik.com/premium-vector/twitter-new-x-logo-design-vector_1340851-70.jpg"
          timeRemaining={1380}
        />
        <PlatformCard
          platform="Instagram"
          image="https://cdn.pixabay.com/photo/2016/06/22/22/13/instagram-1474233_1280.jpg"
          icon="https://img.freepik.com/premium-vector/instagram-logo_976174-11.jpg"
          timeRemaining={1260}
        />
        <PlatformCard
          platform="TikTok"
          image="https://cdn.pixabay.com/photo/2020/04/19/15/14/tiktok-5064078_1280.jpg"
          icon="https://img.freepik.com/free-psd/tiktok-logo-icon-psd-editable_314999-3664.jpg?t=st=1740029719~exp=1740033319~hmac=b6b603c1eb0a766430f5072a197612c50143d0db8e8d78412c83ff21fd3b85c9&w=740"
          timeRemaining={1440}
        />
      </div>
    </LampContainer>
  );
}

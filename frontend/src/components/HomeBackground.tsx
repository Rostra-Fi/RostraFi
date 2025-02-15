"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "./ui/lamp";
import { TextRevealEffect } from "./ui/text-reveal-card";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { Button } from "./ui/moving-border";
import { ColourfulText } from "./ui/colourful-text";
import Link from "next/link";

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
        className="mt-20 text-center text-5xl font-bold tracking-tight md:text-8xl"
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
      <div className="mt-8">
        <Link href={"/teams"}>
          <Button
            borderRadius="1.75rem"
            className="rounded-3xl bg-white text-black border-neutral-200"
            borderClassName="bg-gradient-to-r from-pink-500 to-purple-500"
          >
            Create Team
          </Button>
        </Link>
      </div>
    </LampContainer>
  );
}

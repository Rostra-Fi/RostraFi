import GlowingContainer from "@/components/GlowingContainer";
import { InfluencersTeamSection } from "@/components/InfluencersTeamSection";
import { RulesModel } from "@/components/RulesModel";
import { TeamsHeader } from "@/components/TeamsHeader";
import { TeamSection } from "@/components/teamsSection";
import { ColourfulText } from "@/components/ui/colourful-text";
import { Cover } from "@/components/ui/cover";
import React from "react";

function page() {
  return (
    <div className="bg-black mb-6">
      <TeamsHeader />
      <div className="relative mb-4">
        {/* Enhanced white glow effect behind the heading */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-2xl" />

        <h1 className="relative group text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
          <span className="relative inline-block">
            <Cover>Create Teams</Cover>
          </span>{" "}
          Of <ColourfulText text="Influencers" />
          {/* Animated underline effect for the entire heading */}
          <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-white via-white/50 to-transparent transform origin-left transition-all duration-500 scale-x-0 group-hover:scale-x-100" />
        </h1>
      </div>

      <div className="flex justify-start flex-col w-full mt-10">
        <TeamSection teamSectionName="Premium Diamond" />
        <GlowingContainer>
          <InfluencersTeamSection />
        </GlowingContainer>
      </div>

      <div className="flex justify-start flex-col w-full mt-10">
        <TeamSection teamSectionName="Premium Gold" />
        <GlowingContainer>
          <InfluencersTeamSection />
        </GlowingContainer>
      </div>

      <div className="flex justify-start flex-col w-full mt-10">
        <TeamSection teamSectionName="Premium Silver" />
        <GlowingContainer>
          <InfluencersTeamSection />
        </GlowingContainer>
      </div>

      <div className="flex justify-start flex-col w-full mt-10">
        <TeamSection teamSectionName="Premium Bronze" />
        <GlowingContainer>
          <InfluencersTeamSection />
        </GlowingContainer>
      </div>

      <div className="flex justify-start flex-col w-full mt-10">
        <TeamSection teamSectionName="Others" />
        <GlowingContainer>
          <InfluencersTeamSection />
        </GlowingContainer>
      </div>
      <RulesModel />
    </div>
  );
}

export default page;

import GlowingContainer from "@/components/GlowingContainer";
import { InfluencersTeamSection } from "@/components/InfluencersTeamSection";
import { RulesModel } from "@/components/RulesModel";
import { TeamsHeader } from "@/components/TeamsHeader";
import { TeamSection } from "@/components/teamsSection";
import { ColourfulText } from "@/components/ui/colourful-text";
import { Cover } from "@/components/ui/cover";
import { Section } from "../../types/team.types";
import { SelectedTeamsOverview } from "@/components/SelectedTeamsOverview";
import { AuroraBack } from "@/components/aroraBack";
import AnimatedScrollButton from "@/components/AnimatedScrollButton";
import SolanaNavbar from "@/components/SolanaBar";

async function fetchTeamsData(): Promise<Section[]> {
  try {
    const res = await fetch("http://127.0.0.1:3001/api/v1/sections");

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to fetch teams data:", error);
    return [];
  }
}

export default async function Page() {
  const teamsData: Section[] = await fetchTeamsData();

  return (
    <div className="bg-black mb-6">
      <SolanaNavbar />
      <TeamsHeader />
      <AnimatedScrollButton />
      <AuroraBack />
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-2xl" />
        <h1 className="relative group text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
          <span className="relative inline-block">
            <Cover>Create Teams</Cover>
          </span>{" "}
          Of <ColourfulText text="Influencers" />
        </h1>
      </div>

      {teamsData.map((section) => (
        <div
          key={section._id}
          className="flex justify-start flex-col w-full mt-10"
        >
          <TeamSection
            teamSectionName={section.name}
            teamsSectionId={section._id}
          />
          <GlowingContainer>
            <InfluencersTeamSection
              sectionName={section.name}
              teamsSectionId={section._id}
              teams={section.teams}
            />
          </GlowingContainer>
        </div>
      ))}
      <RulesModel />
      <SelectedTeamsOverview />
    </div>
  );
}

import { InfluencersTeamSection } from "@/components/InfluencersTeamSection";
import { TeamsHeader } from "@/components/TeamsHeader";
import { TeamSection } from "@/components/teamsSection";
import React from "react";

function page() {
  return (
    <div className="bg-black ">
      <TeamsHeader />
      <div className="flex justify-start flex-col w-full">
        <TeamSection teamSectionName="Premium Diamond" />
        <InfluencersTeamSection />
      </div>
    </div>
  );
}

export default page;

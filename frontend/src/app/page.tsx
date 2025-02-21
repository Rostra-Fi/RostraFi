"use client";
import { FeaturesSectionDemo } from "@/components/BentoGrid";
import { HomeBackGround } from "@/components/HomeBackground";
import { VideoSection } from "@/components/VideoSection";

export default function Home() {
  return (
    <div className="">
      <HomeBackGround />

      <VideoSection />
      <FeaturesSectionDemo />
    </div>
  );
}

"use client";
import { FeaturesSectionDemo } from "@/components/BentoGrid";
import { HomeBackGround } from "@/components/HomeBackground";
import { VideoSection } from "@/components/VideoSection";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function Home() {
  return (
    <div className="">
      <div className="absolute top-4 right-4 z-50">
        <WalletConnectButton />
      </div>
      <HomeBackGround />
      <VideoSection />
      <FeaturesSectionDemo />
    </div>
  );
}
"use client";
import { FeaturesSectionDemo } from "@/components/BentoGrid";
import { HomeBackGround } from "@/components/HomeBackground";
import Navbar from "@/components/Navbar";
import { VideoSection } from "@/components/VideoSection";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { fetchTournaments } from "@/store/tournamentSlice";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  return (
    <div className="">
      <Navbar />
      <div className="absolute top-4 right-4 z-50">
        <WalletConnectButton />
      </div>
      <HomeBackGround />
      <VideoSection />
      <FeaturesSectionDemo />
    </div>
  );
}

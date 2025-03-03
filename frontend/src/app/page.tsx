"use client";
import { FeaturesSectionDemo } from "@/components/BentoGrid";
import { HomeBackGround } from "@/components/HomeBackground";
import Navbar from "@/components/Navbar";
import TournamentList from "@/components/tournament-list";
import { VideoSection } from "@/components/VideoSection";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useAppDispatch } from "@/hooks/reduxHooks";
import {
  fetchOpenRegistrationTournaments,
  fetchTournaments,
} from "@/store/tournamentSlice";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTournaments());
    dispatch(fetchOpenRegistrationTournaments());
  }, [dispatch]);

  return (
    <div className="w-full min-h-screen bg-black">
      <Navbar />
      <div className="absolute top-4 right-4 z-50">
        <WalletConnectButton />
      </div>
      <HomeBackGround />
      
      <div className="m-0 p-0">
        <VideoSection />
      </div>
      
      <div className="w-full bg-black pt-0 pb-0 -mt-24">
        <FeaturesSectionDemo />
      </div>
      
      <div className="w-full h-48 bg-black"></div>
      
      <main className="w-full bg-black text-white pb-8 flex justify-center relative">
  <div className="w-full max-w-7xl px-4 mx-auto flex flex-col items-center">
    <div className="w-full max-w-4xl text-left mb-12">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
        Active Tournaments
      </h1>
      <p className="text-gray-400">
        Pick your Rostra dream team and bet on their likes, views, and comments.
      </p>
    </div>
    <div className="w-full max-w-4xl">
      <TournamentList />
    </div>
  </div>
</main>
    </div>
  );
}
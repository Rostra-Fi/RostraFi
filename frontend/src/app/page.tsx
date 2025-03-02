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
    <div className="">
      <Navbar />
      <div className="absolute top-4 right-4 z-50">
        <WalletConnectButton />
      </div>
      <HomeBackGround />
      <VideoSection />
      <FeaturesSectionDemo />
      <main className="min-h-screen bg-black text-white py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Active Tournaments
          </h1>
          <p className="text-gray-400 mb-8">
            Participate and win amazing prizes
          </p>
          <TournamentList />
        </div>
      </main>
    </div>
  );
}

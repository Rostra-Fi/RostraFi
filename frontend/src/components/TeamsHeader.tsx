"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import SearchComponent from "./SearchComponent";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useEffect } from "react";

export function TeamsHeader() {
  const words = [
    {
      text: "Build",
    },
    {
      text: "awesome",
    },
    {
      text: "teams",
    },
    {
      text: "with",
    },
    {
      text: "RostraFi.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  const { userId, userWalletAddress, currentTournament } = useAppSelector(
    (state) => state.user
  );

  useEffect(() => {
    const isVisited = async () => {
      const tournamentId = currentTournament;
      if (!tournamentId) return; // Add guard clause

      try {
        const response = await fetch(
          `http://127.0.0.1:3001/api/v1/compitition/tournaments/${tournamentId}/visit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletAddress: userWalletAddress,
              userId: userId,
            }),
          }
        );

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to record tournament visit");
        }

        return data;
      } catch (e) {
        if (e.name === "AbortError") {
          console.log("Request was aborted");
        } else if (e instanceof Error) {
          console.log(e.message);
        } else {
          console.log("An unknown error occurred");
        }
      }
    };

    isVisited();
  }, [currentTournament, userWalletAddress, userId]);

  return (
    <div className="flex flex-col items-center justify-center h-[25rem]">
      <TypewriterEffectSmooth words={words} />
      <SearchComponent />
    </div>
  );
}

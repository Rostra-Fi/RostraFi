"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
} from "../components/ui/animated-modal";
import { Wallet } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

const SolanaNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [balance, setBalance] = useState("0.000");
  const [points, setPoints] = useState(25);
  const dispatch = useAppDispatch();
  const { userId, currentTournament } = useAppSelector((state) => state.user);
  console.log(userId, currentTournament);

  useEffect(() => {
    const isVisited = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:3001/api/v1/compitition/tournaments/${tournamentId}/visit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
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
        if (e instanceof Error) {
          console.log(e.message);
        } else {
          console.log("An unknown error occurred");
        }
      }
    };

    isVisited();
  }, [userId]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed w-full transition-all duration-300 z-50 ${
        scrolled ? "top-0" : "top-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-center">
        <div
          className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-[32px] px-3 py-2 max-w-[350px] sm:max-w-[520px] border border-gray-800"
          style={{ backgroundColor: "rgba(0, 0, 0, .6)" }}
        >
          {/* SOL Balance */}
          <div className="flex items-center gap-2 px-2">
            <div className="w-6 h-6 bg-blue-600 flex items-center justify-center rounded-full">
              <svg
                width="12"
                height="12"
                viewBox="0 0 128 128"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M93.96 42.02C94.36 41.26 93.76 40.37 92.89 40.39L77.01 40.71C76.55 40.73 76.13 41 75.95 41.44L63.5 72.16L49.44 41.44C49.27 41.01 48.85 40.73 48.4 40.71L32.53 40.39C31.66 40.37 31.06 41.26 31.45 42.02L56.14 92.4C56.32 92.77 56.7 93 57.11 93H65.83C66.24 93 66.62 92.77 66.79 92.4L93.96 42.02Z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-white">{balance}</span>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          {/* Points */}
          <div className="flex items-center gap-2 px-2 border-l border-gray-700">
            <div className="w-6 h-6 bg-gray-600 flex items-center justify-center rounded-full ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="text-white">{points}</span>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          {/* Buy Button */}
          <Modal>
            <ModalTrigger className="bg-slate-300 text-black font-medium px-4 py-1 rounded-full h-8 ml-2 flex items-center justify-center">
              Buy
            </ModalTrigger>
            <ModalBody className="md:max-w-[70%] p-0">
              <ModalContent className=" w-[80vw] h-[80vh] max-w-4xl max-h-[80vh] p-0">
                <div className="w-full h-full">
                  <h3 className="text-xl font-bold mb-4">Wallet</h3>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500">Amount in wallet</span>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 128 128"
                        fill="none"
                      >
                        <path
                          d="M93.96 42.02C94.36 41.26 93.76 40.37 92.89 40.39L77.01 40.71C76.55 40.73 76.13 41 75.95 41.44L63.5 72.16L49.44 41.44C49.27 41.01 48.85 40.73 48.4 40.71L32.53 40.39C31.66 40.37 31.06 41.26 31.45 42.02L56.14 92.4C56.32 92.77 56.7 93 57.11 93H65.83C66.24 93 66.62 92.77 66.79 92.4L93.96 42.02Z"
                          fill="#00FFBD"
                        />
                      </svg>
                      <span className="font-medium">0.00</span>
                    </div>
                  </div>

                  <button className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full py-3 font-medium hover:bg-opacity-80 transition-all flex items-center justify-center">
                    <Wallet className="w-4 h-4 mr-2" />
                    Deposit from wallet
                  </button>
                </div>
              </ModalContent>
            </ModalBody>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default SolanaNavbar;

"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useParams } from "next/navigation";
import { WalletDialog } from "@/components/WalletDialog";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const SolanaNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [balance, setBalance] = useState("0.000");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const { tourId } = useParams();

  const { points } = useAppSelector((state) => state.user);
  // const { userWalletAddress } = useAppSelector((state) => state.user);

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

    loadWalletFromLocalStorage();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const loadWalletFromLocalStorage = () => {
    try {
      const storedWalletAddress = localStorage.getItem("UserId");

      if (storedWalletAddress) {
        setWalletAddress(storedWalletAddress);
        fetchWalletBalance(storedWalletAddress);
      }
    } catch (error) {
      console.error("Error loading wallet from localStorage:", error);
    }
  };

  const fetchWalletBalance = async (address) => {
    try {
      const { solana } = window as any;

      if (solana && address) {
        const connection = new solana.Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );

        const publicKey = new solana.PublicKey(address);
        const balanceInLamports = await connection.getBalance(publicKey);

        const balanceInSol = balanceInLamports / 1000000000;
        setBalance(balanceInSol.toFixed(3));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const openWalletDialog = () => {
    setIsWalletOpen(true);
  };

  return (
    <>
      <div
        className={`fixed w-full transition-all duration-300 z-50 ${
          scrolled ? "top-0" : "top-4"
        } pointer-events-none`}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div
            className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-[32px] px-3 py-2 max-w-[350px] sm:max-w-[520px] border border-gray-800 pointer-events-auto"
            style={{ backgroundColor: "rgba(0, 0, 0, .6)" }}
          >
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
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={openWalletDialog}
              >
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
              <span className="text-white">{points || 0}</span>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={openWalletDialog}
              >
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

            <button
              onClick={openWalletDialog}
              className="flex gap-1 items-center bg-slate-300 text-black font-medium px-4 py-1 rounded-full h-8 ml-2"
            >
              <span>Wallet</span>
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
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <WalletDialog
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />
    </>
  );
};

export default SolanaNavbar;

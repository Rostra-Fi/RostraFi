"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { addPoints } from "@/store/userSlice";
import { useParams } from "next/navigation";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const POINTS_PER_PURCHASE = 150;
const SOL_COST = 0.2; 
const RECIPIENT_WALLET = new PublicKey("JCsFjtj6tem9Dv83Ks4HxsL7p8GhdLtokveqW7uWjGyi");
const SOLANA_RPC_URL = "https://api.devnet.solana.com";

export const WalletDialog = ({ isOpen, onClose }) => {
  const [UserId, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const dispatch = useAppDispatch();
  const { tourId } = useParams();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadWalletFromLocalStorage();
    } else {
      document.body.style.overflow = "auto";
      setMessage({ type: "", text: "" });
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

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
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const publicKey = new PublicKey(address);
      const balanceInLamports = await connection.getBalance(publicKey);
      setBalance(balanceInLamports / 1_000_000_000);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const buyPoints = async () => {
    try {
      if (!UserId) {
        setMessage({ type: "error", text: "Please connect your wallet first." });
        return;
      }

      if (balance < SOL_COST) {
        setMessage({ type: "error", text: `Insufficient balance. You need at least ${SOL_COST} SOL.` });
        return;
      }

      setIsPurchasing(true);
      setMessage({ type: "", text: "" });

      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const fromPublicKey = new PublicKey(UserId);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: RECIPIENT_WALLET,
          lamports: SOL_COST * 1_000_000_000,
        })
      );

      transaction.feePayer = fromPublicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const { solana } = window as any;
      if (!solana) throw new Error("Phantom wallet not found");

      const signedTransaction = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      fetchWalletBalance(UserId);
      dispatch(addPoints({ tournamentId: tourId, points: POINTS_PER_PURCHASE }));

      setMessage({ type: "success", text: `Successfully purchased ${POINTS_PER_PURCHASE} points!` });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error buying points:", error);
      setMessage({ type: "error", text: "Transaction failed. Please try again." });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md m-4 z-10 overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          ✕
        </button>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Wallet</h3>

          {message.text && (
            <div
              className={`px-4 py-3 rounded relative mb-4 ${
                message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500">Wallet Balance</span>
            <span className="font-medium">{balance.toFixed(3)} SOL</span>
          </div>

          {!UserId ? (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">No wallet connected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500">Connected Wallet</div>
                <div className="text-sm font-mono truncate">{UserId}</div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Cost</span>
                  <span className="font-medium">{SOL_COST} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Points Earned</span>
                  <span className="font-medium">{POINTS_PER_PURCHASE}</span>
                </div>
              </div>

              <button
                onClick={buyPoints}
                disabled={isPurchasing}
                className={`w-full py-2 rounded-lg text-white ${
                  isPurchasing ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isPurchasing ? "Processing..." : `Buy ${POINTS_PER_PURCHASE} Points`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

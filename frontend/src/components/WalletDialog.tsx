"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addUserPoints, removeUserPoints } from "@/store/userSlice";
import { useParams } from "next/navigation";
import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

const POINTS_PER_PURCHASE = 150;
const SONIC_AMOUNT = 2; // Adjust this as needed for equivalent value
const TREASURY_WALLET = new PublicKey(
  "JCsFjtj6tem9Dv83Ks4HxsL7p8GhdLtokveqW7uWjGyi"
);
const SONIC_TOKEN_ADDRESS = new PublicKey(
  "SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES"
);
const SOLANA_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=a969d395-9864-418f-8a64-65c1ef2107f9";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletDialog: React.FC<WalletDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [sonicBalance, setSonicBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionType, setTransactionType] = useState("buy"); // "buy" points or "exchange" points
  const [message, setMessage] = useState({ type: "", text: "" });

  const dispatch = useAppDispatch();
  const params = useParams();
  const tourId = params?.tourId as string | undefined;

  const { points } = useAppSelector((state) => state.user);

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
        fetchWalletBalances(storedWalletAddress);
      }
    } catch (error) {
      console.error("Error loading wallet from localStorage:", error);
    }
  };

  const fetchWalletBalances = async (address: string) => {
    try {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const publicKey = new PublicKey(address);
      
      // Fetch SOL balance (still needed for transaction fees)
      const solBalanceInLamports = await connection.getBalance(publicKey);
      setSolBalance(solBalanceInLamports / LAMPORTS_PER_SOL);
      
      // Fetch Sonic token balance
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: SONIC_TOKEN_ADDRESS }
        );
        
        if (tokenAccounts.value.length > 0) {
          const tokenAccount = tokenAccounts.value[0];
          const amount = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
          setSonicBalance(amount);
        } else {
          setSonicBalance(0);
        }
      } catch (err) {
        console.error("Error fetching Sonic token balance:", err);
        setSonicBalance(0);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const buyPoints = async () => {
    try {
      if (!walletAddress) {
        setMessage({
          type: "error",
          text: "Please connect your wallet first.",
        });
        return;
      }

      if (sonicBalance < SONIC_AMOUNT) {
        setMessage({
          type: "error",
          text: `Insufficient balance. You need at least ${SONIC_AMOUNT} SONIC.`,
        });
        return;
      }

      if (solBalance < 0.00001) {
        setMessage({
          type: "error",
          text: "Insufficient SOL for transaction fees.",
        });
        return;
      }

      setIsProcessing(true);
      setMessage({ type: "", text: "" });

      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const fromPublicKey = new PublicKey(walletAddress);
      
      // Find the user's token account for Sonic
      const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        fromPublicKey,
        { mint: SONIC_TOKEN_ADDRESS }
      );
      
      if (userTokenAccounts.value.length === 0) {
        throw new Error("Sonic token account not found");
      }
      
      const userTokenAccount = new PublicKey(userTokenAccounts.value[0].pubkey);
      
      // Find or create token account for the treasury
      let treasuryTokenAccount;
      try {
        const treasuryTokenAccounts = await connection.getParsedTokenAccountsByOwner(
          TREASURY_WALLET,
          { mint: SONIC_TOKEN_ADDRESS }
        );
        
        if (treasuryTokenAccounts.value.length > 0) {
          treasuryTokenAccount = new PublicKey(treasuryTokenAccounts.value[0].pubkey);
        } else {
          // This would require creating a token account for the treasury
          // This is complex and would typically be handled by the backend
          throw new Error("Treasury doesn't have a Sonic token account");
        }
      } catch (err) {
        throw new Error("Failed to find treasury token account");
      }
      
      // Create the token transfer instruction
      const transferInstruction = splToken.createTransferInstruction(
        userTokenAccount,
        treasuryTokenAccount,
        fromPublicKey,
        SONIC_AMOUNT * Math.pow(10, 9) // Assuming 9 decimals, adjust if different
      );

      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = fromPublicKey;
      
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const { solana } = window as any;
      if (!solana) throw new Error("Phantom wallet not found");

      const signedTransaction = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(signature, "confirmed");

      fetchWalletBalances(walletAddress);
      dispatch(addUserPoints(POINTS_PER_PURCHASE));

      setMessage({
        type: "success",
        text: `Successfully purchased ${POINTS_PER_PURCHASE} points!`,
      });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error buying points:", error);
      setMessage({
        type: "error",
        text: "Transaction failed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exchangePointsForSonic = async () => {
    try {
      if (!walletAddress) {
        setMessage({
          type: "error",
          text: "Please connect your wallet first.",
        });
        return;
      }

      if (points < POINTS_PER_PURCHASE) {
        setMessage({
          type: "error",
          text: `Insufficient points. You need at least ${POINTS_PER_PURCHASE} points.`,
        });
        return;
      }

      setIsProcessing(true);
      setMessage({ type: "", text: "" });

      // Get public key from localStorage
      const publicKey = localStorage.getItem("UserId");
      if (!publicKey) {
        throw new Error("Wallet address not found");
      }

      // Make API call to record redemption
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: POINTS_PER_PURCHASE,
          publicKey,
          tokenAmount: SONIC_AMOUNT,
          tokenAddress: SONIC_TOKEN_ADDRESS.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Redemption failed");
      }

      // Only deduct points after successful Redis storage
      dispatch(removeUserPoints(POINTS_PER_PURCHASE));

      setMessage({
        type: "success",
        text: `${POINTS_PER_PURCHASE} points exchanged for ${SONIC_AMOUNT} SONIC!`,
      });

      setTimeout(() => {
        fetchWalletBalances(walletAddress);
        setMessage({ type: "", text: "" });
        onClose();
      }, 5000);
    } catch (error) {
      console.error("Error exchanging points:", error);
      setMessage({
        type: "error",
        text:
          (error instanceof Error
            ? error.message
            : "Transaction failed. Please try again.") ||
          "Transaction failed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md m-4 z-10 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Wallet</h3>

          {message.text && (
            <div
              className={`px-4 py-3 rounded relative mb-4 ${
                message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">SONIC Balance</span>
            <span className="font-medium">{sonicBalance.toFixed(3)} SONIC</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">SOL Balance</span>
            <span className="font-medium">{solBalance.toFixed(3)} SOL</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500">Points Balance</span>
            <span className="font-medium">{points || 0} Points</span>
          </div>

          {!walletAddress ? (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">No wallet connected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500">Connected Wallet</div>
                <div className="text-sm font-mono truncate">
                  {walletAddress}
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setTransactionType("buy")}
                  className={`flex-1 py-2 rounded-lg ${
                    transactionType === "buy"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Buy Points
                </button>
                <button
                  onClick={() => setTransactionType("exchange")}
                  className={`flex-1 py-2 rounded-lg ${
                    transactionType === "exchange"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Exchange Points
                </button>
              </div>

              {transactionType === "buy" ? (
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Cost</span>
                    <span className="font-medium">{SONIC_AMOUNT} SONIC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Points Earned</span>
                    <span className="font-medium">{POINTS_PER_PURCHASE}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Points Cost</span>
                    <span className="font-medium">
                      {POINTS_PER_PURCHASE} Points
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">SONIC Received</span>
                    <span className="font-medium">{SONIC_AMOUNT} SONIC</span>
                  </div>
                </div>
              )}

              <button
                onClick={
                  transactionType === "buy" ? buyPoints : exchangePointsForSonic
                }
                disabled={isProcessing}
                className={`w-full py-2 rounded-lg text-white ${
                  isProcessing ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isProcessing
                  ? "Processing..."
                  : transactionType === "buy"
                  ? `Buy ${POINTS_PER_PURCHASE} Points`
                  : `Exchange for ${SONIC_AMOUNT} SONIC`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
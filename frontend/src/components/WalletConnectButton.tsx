"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";

export const WalletConnectButton = () => {
  const { publicKey, disconnecting } = useWallet();

  useEffect(() => {
    if (publicKey) {
      // Store public key as UserId in localStorage
      localStorage.setItem("UserId", publicKey.toString());
    }
    
    if (disconnecting) {
      // Remove UserId when wallet disconnects
      localStorage.removeItem("UserId");
    }
  }, [publicKey, disconnecting]);

  return <WalletMultiButton />;
};
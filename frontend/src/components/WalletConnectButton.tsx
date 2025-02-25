"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";
import { userWalletConnect } from "@/store/userSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";

export const WalletConnectButton = () => {
  const { publicKey, disconnecting } = useWallet();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (publicKey) {
      // Store public key as UserId in localStorage
      localStorage.setItem("UserId", publicKey.toString());
      dispatch(userWalletConnect(publicKey.toString()));
    }

    if (disconnecting) {
      // Remove UserId when wallet disconnects
      localStorage.removeItem("UserId");
    }
  }, [publicKey, disconnecting, dispatch]);

  return <WalletMultiButton />;
};

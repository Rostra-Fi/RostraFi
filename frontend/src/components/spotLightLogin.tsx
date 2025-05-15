"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Spotlight } from "./ui/Spotlight";
import { useUser, UserButton } from "@civic/auth-web3/react";
// import { UserButton } from "@civic/auth/react";
import { userHasWallet } from "@civic/auth-web3";
import { useRouter } from "next/navigation";
import { MultiStepLoader } from "./ui/multi-step-loader";
import { LoginButton } from "./loginButton";

export function SpotlightLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useUser();
  const { signIn } = useUser();

  const loadingStates = [
    {
      text: "Logging in securely...",
    },
    {
      text: "Connecting to Civic's secure wallet",
    },
    {
      text: "Verifying your credentials",
    },
    {
      text: "Blockchain authentication in progress",
    },
    {
      text: "Civic provides embedded wallet for seamless experience",
    },
    {
      text: "Ensuring secure Solana transactions",
    },
    {
      text: "Getting your profile ready",
    },
    {
      text: "Welcome to RostraFi!",
    },
  ];

  const connectWallet = async () => {
    try {
      await user.signIn();
      console.log("User signed in successfully");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (user.user) {
        console.log("User authenticated:", user.user);

        if (!userHasWallet(user)) {
          // Show loading animation while creating wallet
          setLoading(true);

          try {
            console.log("Creating wallet...");
            await user.createWallet();
            console.log("Wallet created successfully");

            // Redirect after loading animation completes
            setTimeout(() => {
              router.push("/");
            }, 18000); // 2s per state × 8 states + 2s buffer
          } catch (error) {
            console.error("Error creating wallet:", error);
            setLoading(false);
            return;
          }
        } else {
          // User already has wallet, show loading animation and redirect
          setLoading(true);
          console.log("User already has wallet");

          setTimeout(() => {
            router.push("/");
          }, 18000);
        }
      }
    };

    handleUserAuthentication();
  }, [user, router]);

  console.log(user);
  console.log("Loading state:", loading);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black/[0.96] antialiased">
      {/* Show the loader when loading state is true */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <MultiStepLoader
            loadingStates={loadingStates}
            loading={loading}
            duration={2000}
          />
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 flex flex-col items-center justify-center h-full">
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl mb-12">
          RostraFi <br />
          <span className="text-3xl md:text-5xl mt-2 block">
            The Future of Social Influence
          </span>
        </h1>

        <div className="w-full max-w-md border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl py-8 px-6 shadow-lg">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-white/60 text-sm px-4">
              Form teams of influencers from X, TikTok, and Instagram to compete
              for virality on the Solana blockchain.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm text-white/60 mb-3 text-center">
                Sign in using Civic embedded wallet
              </p>

              <div className="flex justify-center">
                <UserButton className="bg-white/10 text-white/60 hover:bg-white/20 rounded-full px-4 py-2" />
              </div>

              {user.isLoading && (
                <div className="my-3 flex gap-2 items-center justify-center text-[12px] text-center text-white/60">
                  <svg
                    className="text-white/60 animate-spin"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                  >
                    <path
                      d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth={5}
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth={5}
                      strokeLinejoin="round"
                      className="text-white"
                    ></path>
                  </svg>
                  Please wait while we sign you in...
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-white/40">
                Powered by Solana • Secure blockchain • Transparent rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

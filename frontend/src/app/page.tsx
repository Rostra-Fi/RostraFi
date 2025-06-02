"use client"

import TournamentList from "@/components/tournament-list"
import { VideoSection } from "@/components/VideoSection"
import { WalletConnectButton } from "@/components/WalletConnectButton"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { fetchOpenRegistrationTournaments, fetchTournaments } from "@/store/tournamentSlice"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { X, Award, Trophy, Github, Twitter } from "lucide-react"
import { setIsNewUser } from "@/store/userSlice"
import RetroGameCompletionPopup from "@/components/GameComplitionPopup"
import { TournamentDialog, TournamentDialogTrigger } from "@/components/TournamentModel"
import Spline from "@splinetool/react-spline"
import Image from "next/image"

export default function Home() {
  const dispatch = useAppDispatch()
  const { isNewUser, points } = useAppSelector((state) => state.user)
  const [showDialog, setShowDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [gameCompletionInfo, setGameCompletionInfo] = useState<{
    pointsEarned: number
    gameWon: boolean
    gameName: string
  } | null>(null)
  const [isTournamentDialogOpen, setIsTournamentDialogOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchTournaments())
    dispatch(fetchOpenRegistrationTournaments())
  }, [dispatch])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pointsEarned = params.get("pointsEarned")
    const gameWon = params.get("gameWon")
    const gameName = params.get("gameName")

    if (pointsEarned && gameWon && gameName) {
      setGameCompletionInfo({
        pointsEarned: Number.parseInt(pointsEarned),
        gameWon: gameWon === "true",
        gameName: gameName,
      })

      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isNewUser) {
      setShowDialog(true)
      const timer = setTimeout(() => {
        dispatch(setIsNewUser(false))
        setShowDialog(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isNewUser, dispatch])

  useEffect(() => {
    if (showDialog) {
      createConfetti()
      const interval = setInterval(() => {
        createConfetti(0.4)
      }, 800)
      setTimeout(() => {
        clearInterval(interval)
      }, 3000)
    }
  }, [showDialog])

  const handleCloseDialog = () => {
    setShowDialog(false)
    dispatch(setIsNewUser(false))
  }

  const handleCloseGameCompletion = () => {
    setGameCompletionInfo(null)
  }

  const createConfetti = (intensity = 1) => {
    if (typeof window === "undefined") return
    const count = 200 * intensity
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        scalar: 1.2,
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#6366f1", "#f472b6"],
    })
    fire(0.2, {
      spread: 60,
      colors: ["#22d3ee", "#10b981"],
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#fbbf24", "#ec4899"],
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#4ade80", "#f87171"],
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#60a5fa", "#c084fc", "#0ea5e9", "#34d399"],
    })
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* Global styles to hide Spline watermark */}
      <style jsx global>{`
        /* Hide Spline watermark */
        #spline-watermark,
        [id*="spline"],
        [class*="spline-watermark"],
        div[style*="position: absolute"][style*="bottom: 16px"][style*="right: 16px"],
        div[style*="pointer-events: auto"][style*="position: absolute"][style*="right: 16px"][style*="bottom: 16px"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* Alternative approach - cover with black overlay */
        .spline-background::after {
          content: "";
          position: absolute;
          bottom: 0;
          right: 0;
          width: 200px;
          height: 60px;
          background: black;
          z-index: 999;
          pointer-events: none;
        }
      `}</style>

      {/* Fixed Spline Background */}
      <div className="fixed inset-0 w-full h-full spline-background z-0">
        <Spline scene="https://prod.spline.design/snnfyzsZVl8UWgLU/scene.splinecode" />
      </div>

      {/* Logo - Top Left (scrolls with page) */}
      <div className="absolute top-4 left-4 z-50">
        <Image
          src="/logo.png"
          alt="RostaFi Logo"
          width={240}
          height={80}
          className="h-20 w-auto object-contain"
          priority
        />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 w-full">
        {/* Wallet Connect Button */}
        <div className="absolute top-4 right-4 z-50">
          <WalletConnectButton />
        </div>

        {/* Hero Section with Tournament Button */}
        <section className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Draft. Strategize. Conquer.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Win SOL prizes daily in the ultimate Web3 showdown. Build your dream team and dominate the leaderboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-16"
          >
            <TournamentDialogTrigger onClick={() => setIsTournamentDialogOpen(true)} />
          </motion.div>
        </section>

        {/* Video Section */}
        <section className="relative z-20">
          <VideoSection />
        </section>

        {/* Tournament List Section */}
        <section className="relative z-20 py-16">
          <div className="w-full max-w-7xl px-4 mx-auto flex flex-col items-center">
            <div className="w-full max-w-4xl text-left mb-12">
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Active Tournaments
              </h2>
              <p className="text-gray-400">Pick your Rostra dream team and bet on their likes, views, and comments.</p>
            </div>
            <div className="w-full max-w-4xl">
              <TournamentList />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-20 bg-black/95 backdrop-blur-sm border-t border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand Section */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  RostaFi
                </h3>
                <p className="text-gray-400 max-w-sm">
                  The ultimate Solana fantasy platform where you draft influencer teams and compete for SOL prizes
                  daily.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/history" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Leaderboard
                    </a>
                  </li>
                  <li>
                    <a href="/history" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Rewards
                    </a>
                  </li>
                  <li>
                    <a href="/bettings" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Bettings
                    </a>
                  </li>
                  <li>
                    <a href="/profile" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Profile
                    </a>
                  </li>
                  <li>
                    <a href="/History" className="text-gray-400 hover:text-purple-400 transition-colors">
                      History
                    </a>
                  </li>
                  <li>
                    <a href="/games" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Games
                    </a>
                  </li>
                </ul>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://twitter.com/rostrafi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-colors group"
                  >
                    <Twitter className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                  </a>
                  <a
                    href="https://github.com/rostrafi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-colors group"
                  >
                    <Github className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                  </a>
                </div>
                <p className="text-sm text-gray-500">Follow us for updates and announcements</p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-purple-500/20 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">© 2025 RostaFi. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-2 md:mt-0">Built with ❤️ for the Solana community</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Dialogs and Popups */}
      {gameCompletionInfo && (
        <RetroGameCompletionPopup
          pointsEarned={gameCompletionInfo.pointsEarned}
          gameWon={gameCompletionInfo.gameWon}
          gameName={gameCompletionInfo.gameName}
          onClose={handleCloseGameCompletion}
        />
      )}

      <TournamentDialog isOpen={isTournamentDialogOpen} onClose={() => setIsTournamentDialogOpen(false)} />

      {/* Welcome Dialog for New Users */}
      {isMounted && (
        <AnimatePresence>
          {showDialog && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
                onClick={handleCloseDialog}
              />

              <motion.div
                className="fixed top-1/2 left-1/2 z-50 w-full max-w-md"
                initial={{
                  scale: 0.8,
                  opacity: 0,
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: "-50%",
                  y: "-50%",
                }}
                exit={{
                  scale: 0.8,
                  opacity: 0,
                  x: "-50%",
                  y: "-50%",
                }}
                transition={{ type: "spring", damping: 15 }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-0.5 shadow-xl">
                  <div className="relative bg-black rounded-2xl p-6 overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full" />
                    <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-full" />

                    <button
                      onClick={handleCloseDialog}
                      title="Close Dialog"
                      className="absolute top-3 right-3 p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 z-10"
                    >
                      <X size={18} />
                    </button>

                    <div className="relative z-10 flex flex-col items-center justify-center space-y-5 py-3">
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg"
                      >
                        <Trophy className="w-10 h-10 text-white" />
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                      >
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Welcome to the Arena!
                        </h2>
                        <p className="text-gray-400 mt-1">You've received bonus tokens to get started</p>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.7,
                          type: "spring",
                          stiffness: 200,
                          damping: 10,
                        }}
                        className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl px-8 py-4 text-center shadow-sm"
                      >
                        <span className="text-5xl font-mono font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          +{points || 100}
                        </span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Award size={14} className="text-purple-400" />
                          <span className="text-sm font-medium text-gray-400">TOKENS EARNED</span>
                        </div>
                      </motion.div>

                      <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        onClick={handleCloseDialog}
                        className="mt-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Start Playing
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

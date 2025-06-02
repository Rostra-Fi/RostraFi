"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletButton } from "../solana/solana-provider"
import { ellipsify } from "../ui/ui-layout"
import { ExplorerLink } from "../cluster/cluster-ui"
import { useVestingProgram } from "./vesting-data-access"
import { VestingCreate, VestingList } from "./vesting-ui"

export default function VestingFeature() {
  const { publicKey } = useWallet()
  const { programId } = useVestingProgram()

  return publicKey ? (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Token Vesting
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Create and manage token vesting schedules for your team and investors with ease.
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Program ID:</span>
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          />
        </div>
        <VestingCreate />
      </div>
      <VestingList />
    </div>
  ) : (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Token Vesting Platform
        </h1>
        <p className="text-gray-400 mb-8">Connect your wallet to create and manage token vesting schedules.</p>
        <WalletButton />
      </div>
    </div>
  )
}

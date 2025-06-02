"use client"

import type { PublicKey } from "@solana/web3.js"
import { useMemo, useState } from "react"
import { useVestingProgram, useVestingProgramAccount } from "./vesting-data-access"
import { useWallet } from "@solana/wallet-adapter-react"
import { ArrowRight, Calendar, Clock, Coins, Plus } from "lucide-react"

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram()
  const { publicKey } = useWallet()
  const [company, setCompany] = useState("")
  const [mint, setMint] = useState("")

  const isFormValid = company.length > 0

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({ companyName: company, mint: mint })
    }
  }

  if (!publicKey) {
    return <p className="text-gray-400">Connect your wallet</p>
  }

  return (
    <div className="mt-8 bg-black/30 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
      <h2 className="text-xl font-medium mb-4">Create New Vesting Account</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Name</label>
          <input
            type="text"
            placeholder="Enter  name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Token Mint Address</label>
          <input
            type="text"
            placeholder="Enter token mint address"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <button
        className={`flex items-center justify-center px-6 py-2 rounded-md text-sm font-medium transition-all ${
          isFormValid ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-800 text-gray-400 cursor-not-allowed"
        }`}
        onClick={handleSubmit}
        disabled={createVestingAccount.isPending || !isFormValid}
      >
        {createVestingAccount.isPending ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing
          </span>
        ) : (
          <span className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Account
          </span>
        )}
      </button>
    </div>
  )
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram()

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="bg-blue-900/20 border border-blue-800 text-blue-300 px-6 py-4 rounded-lg">
        <p className="text-center">
          Program account not found. Make sure you have deployed the program and are on the correct cluster.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">Vesting Accounts</h2>

      {accounts.isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-6">
          {accounts.data?.map((account) => (
            <VestingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="bg-black/30 border border-gray-800 rounded-lg p-12 text-center">
          <h3 className="text-xl font-medium text-gray-300 mb-2">No accounts found</h3>
          <p className="text-gray-500 mb-6">Create a new vesting account to get started</p>
          <div className="flex justify-center">
            <ArrowRight className="text-gray-500 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  )
}

function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting } = useVestingProgramAccount({
    account,
  })
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [cliffTime, setCliffTime] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  const companyName = useMemo(() => accountQuery.data?.companyName ?? 0, [accountQuery.data?.companyName])

  return accountQuery.isLoading ? (
    <div className="bg-black/30 border border-gray-800 rounded-lg p-6 h-64 flex items-center justify-center">
      <div className="animate-pulse flex space-x-2">
        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  ) : (
    <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden transition-all hover:border-gray-700">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3
            className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {companyName}
          </h3>
          <div className="bg-blue-900/20 text-blue-400 text-xs px-2 py-1 rounded-full">Active</div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Start Time
              </label>
              <input
                type="number"
                placeholder="Unix timestamp"
                value={startTime || ""}
                onChange={(e) => setStartTime(Number.parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-black/50 border border-gray-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                End Time
              </label>
              <input
                type="number"
                placeholder="Unix timestamp"
                value={endTime || ""}
                onChange={(e) => setEndTime(Number.parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-black/50 border border-gray-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Cliff Time
              </label>
              <input
                type="number"
                placeholder="Unix timestamp"
                value={cliffTime || ""}
                onChange={(e) => setCliffTime(Number.parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-black/50 border border-gray-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 flex items-center">
                <Coins className="h-3 w-3 mr-1" />
                Total Allocation
              </label>
              <input
                type="number"
                placeholder="Amount"
                value={totalAmount || ""}
                onChange={(e) => setTotalAmount(Number.parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-black/50 border border-gray-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 p-4">
        <button
          className={`w-full flex items-center justify-center py-2 rounded-md text-sm font-medium transition-all ${
            createEmployeeVesting.isPending
              ? "bg-gray-800 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
          }`}
          onClick={() =>
            createEmployeeVesting.mutateAsync({
              startTime,
              endTime,
              totalAmount,
              cliffTime,
            })
          }
          disabled={createEmployeeVesting.isPending}
        >
          {createEmployeeVesting.isPending ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing
            </span>
          ) : (
            <span>Create Employee Vesting</span>
          )}
        </button>
      </div>
    </div>
  )
}

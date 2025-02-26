"use client";
import React, { useState, useEffect } from "react";
import { Wallet } from "lucide-react";

export const WalletDialog = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md m-4 z-10 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Wallet</h3>

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500">Amount in wallet</span>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 128 128" fill="none">
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
      </div>
    </div>
  );
};

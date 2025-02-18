"use client";
import React, { ReactNode } from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

interface GlowingContainerProps {
  children: ReactNode;
}

const GlowingContainer: React.FC<GlowingContainerProps> = ({ children }) => {
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <div className="bg-black min-h-screen flex items-start justify-start ">
      <div className="relative w-full max-w-5xl ml-12 mt-16">
        {/* White glow effect - first layer with reduced opacity */}
        <div className="absolute inset-0 bg-white blur-md opacity-20 rounded-[2.5rem]"></div>

        {/* Additional subtle glow layer with reduced opacity */}
        <div className="absolute inset-0 bg-white blur-xl opacity-15 rounded-[2.5rem]"></div>

        {/* Content container */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-black border border-gray-800">
          <div
            className="w-full h-[100vh] overflow-y-auto rounded-[2.5rem] p-6 gap-2
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-900
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-700
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:hover:bg-gray-600
            text-gray-100"
          >
            <div className="ml-[10px]  w-[80%] mb-6">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
              />
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlowingContainer;

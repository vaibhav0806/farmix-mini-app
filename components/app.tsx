"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

import WalletConnector from "./wallet-connector";
import Farmix from "./farmix";

export default function App() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [farcasterUserContext, setFarcasterUserContext] = useState<any>();

  useEffect(() => {
    const load = async () => {
      setFarcasterUserContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">F</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Farmix
              </h1>
            </div>
            <WalletConnector />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <Farmix />
    </div>
  );
}

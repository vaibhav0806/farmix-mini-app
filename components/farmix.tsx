"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Users, Heart, Loader2, Network, GitBranch, CheckCircle } from "lucide-react";
import {
  getUserByUsername,
  getUserFollowers,
  getUserFollowing,
  calculateCompatibility,
  type FarcasterUser,
} from "@/lib/neynar";

interface CompatibilityResult {
  score: number;
  commonFollowers: FarcasterUser[];
  commonFollowing: FarcasterUser[];
  details: {
    followerOverlap: number;
    followingOverlap: number;
    totalUserConnections: number;
    totalTargetConnections: number;
  };
  targetUser: FarcasterUser;
}

export default function Farmix() {
  const { user, authenticated } = usePrivy();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the logged-in user's Farcaster info
  const farcasterAccount = user?.linkedAccounts?.find(
    (account) => account.type === "farcaster"
  ) as any;

  const analyzeCompatibility = async () => {
    if (!farcasterAccount || !username.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep("Finding user...");

    try {
      // Get target user by username
      const targetUser = await getUserByUsername(username.trim());
      if (!targetUser) {
        setError("User not found. Please check the username and try again.");
        setLoading(false);
        return;
      }

      // Get logged-in user's FID from Privy
      const loggedInUserFid = farcasterAccount.fid;

      setLoadingStep("Fetching social connections... This may take a moment for users with many followers.");

      // Fetch social data for both users with higher limits
      const [
        userFollowers,
        userFollowing,
        targetFollowers,
        targetFollowing,
      ] = await Promise.all([
        getUserFollowers(loggedInUserFid, 1000),
        getUserFollowing(loggedInUserFid, 1000),
        getUserFollowers(targetUser.fid, 1000),
        getUserFollowing(targetUser.fid, 1000),
      ]);

      setLoadingStep("Calculating compatibility...");

      // Calculate compatibility
      const compatibility = calculateCompatibility(
        userFollowers,
        userFollowing,
        targetFollowers,
        targetFollowing
      );

      setResult({
        ...compatibility,
        targetUser,
      });
    } catch (err) {
      setError("Failed to analyze compatibility. Please try again.");
      console.error("Compatibility analysis error:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const getCompatibilityMessage = (score: number) => {
    if (score >= 80) return "Perfect Match";
    if (score >= 60) return "Great Compatibility";
    if (score >= 40) return "Good Match";
    if (score >= 20) return "Some Common Ground";
    return "Different Circles";
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-purple-600";
    if (score >= 20) return "text-orange-600";
    return "text-gray-500";
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Network className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-2xl font-semibold text-gray-900">Farmix</CardTitle>
            </div>
            <p className="text-gray-600">Social Compatibility Analysis</p>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Connect your Farcaster account to analyze social compatibility.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!farcasterAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Network className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-2xl font-semibold text-gray-900">Farmix</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Please link your Farcaster account to continue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Network className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-semibold text-gray-900">Farmix</CardTitle>
            </div>
            <p className="text-gray-600 text-lg">
              Analyze Farcaster social compatibility
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center space-x-3">
              <img 
                src={farcasterAccount.pfp || "/default-avatar.png"} 
                alt="Your avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700 font-medium">@{farcasterAccount.username}</span>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-3">
              <Input
                placeholder="Enter Farcaster username (without @)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && analyzeCompatibility()}
                disabled={loading}
                className="text-lg h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button 
                onClick={analyzeCompatibility} 
                disabled={loading || !username.trim()}
                className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            {loading && loadingStep && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-purple-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{loadingStep}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-center">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Compatibility Score */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={result.targetUser.pfpUrl || "/default-avatar.png"} 
                      alt={result.targetUser.displayName}
                      className="w-16 h-16 rounded-full border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{result.targetUser.displayName}</h3>
                      <p className="text-purple-600 font-medium">@{result.targetUser.username}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{result.targetUser.followerCount.toLocaleString()} followers</span>
                        <span>{result.targetUser.followingCount.toLocaleString()} following</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-1">
                      {result.score}%
                    </div>
                    <Badge variant="outline" className="text-gray-600">
                      Compatibility
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-semibold ${getCompatibilityColor(result.score)}`}>
                      {getCompatibilityMessage(result.score)}
                    </span>
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <Progress value={result.score} className="h-3" />
                  <div className="text-sm text-gray-500 text-center">
                    Based on {(result.details.totalUserConnections + result.details.totalTargetConnections).toLocaleString()} total connections
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Connection Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">Common Following</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {result.commonFollowing.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.details.followingOverlap}% overlap
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">Mutual Followers</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      {result.commonFollowers.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.details.followerOverlap}% overlap
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Connections */}
            {(result.commonFollowing.length > 0 || result.commonFollowers.length > 0) && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <GitBranch className="h-5 w-5 mr-2 text-purple-600" />
                    Shared Connections
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {result.commonFollowing.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          You both follow ({result.commonFollowing.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.commonFollowing.slice(0, 12).map((user) => (
                            <Badge key={user.fid} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              @{user.username}
                            </Badge>
                          ))}
                          {result.commonFollowing.length > 12 && (
                            <Badge variant="outline" className="border-blue-300 text-blue-600">
                              +{result.commonFollowing.length - 12} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {result.commonFollowers.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Mutual followers ({result.commonFollowers.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.commonFollowers.slice(0, 12).map((user) => (
                            <Badge key={user.fid} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              @{user.username}
                            </Badge>
                          ))}
                          {result.commonFollowers.length > 12 && (
                            <Badge variant="outline" className="border-green-300 text-green-600">
                              +{result.commonFollowers.length - 12} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

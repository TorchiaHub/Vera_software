import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Medal, Award, User, TrendingUp, Droplets, Leaf } from 'lucide-react';
import { cn } from './ui/utils';

interface LeaderboardUser {
  rank: number;
  name: string;
  region: string;
  points: number;
  co2Saved: number;
  bottlesSaved: number;
  badges: string[];
}

interface LeaderboardProps {
  embedded?: boolean;
  userPoints?: number;
  userCO2Saved?: number;
  userBottlesSaved?: number;
  userName?: string;
  userRegion?: string;
}

export function Leaderboard({ 
  embedded = false, 
  userPoints = 1250,
  userCO2Saved = 45.8,
  userBottlesSaved = 91.6,
  userName = "Tu",
  userRegion = "Lombardia"
}: LeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  // Mock leaderboard data
  const leaderboardData: LeaderboardUser[] = [
    {
      rank: 1,
      name: "EcoWarrior_IT",
      region: "Toscana",
      points: 3450,
      co2Saved: 125.5,
      bottlesSaved: 251.0,
      badges: ["eco-warrior", "energy-saver"]
    },
    {
      rank: 2,
      name: "GreenChampion",
      region: "Veneto",
      points: 3120,
      co2Saved: 112.8,
      bottlesSaved: 225.6,
      badges: ["green-champion"]
    },
    {
      rank: 3,
      name: "SaveThePlanet",
      region: "Lazio",
      points: 2890,
      co2Saved: 104.2,
      bottlesSaved: 208.4,
      badges: ["energy-saver"]
    },
    {
      rank: 4,
      name: "EcoFriendly_92",
      region: "Lombardia",
      points: 2650,
      co2Saved: 95.6,
      bottlesSaved: 191.2,
      badges: []
    },
    {
      rank: 5,
      name: "NatureFirst",
      region: "Emilia-Romagna",
      points: 2420,
      co2Saved: 87.3,
      bottlesSaved: 174.6,
      badges: ["eco-warrior"]
    },
    {
      rank: 6,
      name: "CleanEnergy_Pro",
      region: "Piemonte",
      points: 2180,
      co2Saved: 78.6,
      bottlesSaved: 157.2,
      badges: []
    },
    {
      rank: 7,
      name: "GreenLife_IT",
      region: "Sicilia",
      points: 1950,
      co2Saved: 70.3,
      bottlesSaved: 140.6,
      badges: ["green-champion"]
    },
    {
      rank: 8,
      name: "EcoHero_2024",
      region: "Campania",
      points: 1720,
      co2Saved: 62.0,
      bottlesSaved: 124.0,
      badges: []
    },
    {
      rank: 9,
      name: "PlanetSaver",
      region: "Puglia",
      points: 1480,
      co2Saved: 53.4,
      bottlesSaved: 106.8,
      badges: ["energy-saver"]
    },
    {
      rank: 10,
      name: "GreenMind",
      region: "Liguria",
      points: 1290,
      co2Saved: 46.5,
      bottlesSaved: 93.0,
      badges: []
    }
  ];

  // Current user position (simulated based on points)
  const userRank = leaderboardData.findIndex(u => userPoints > u.points) + 1 || 11;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm text-muted-foreground w-5 text-center">{rank}</span>;
  };

  const getBadgeInfo = (badgeId: string) => {
    const badges = {
      "eco-warrior": { label: "Eco Warrior", color: "bg-green-500" },
      "energy-saver": { label: "Energy Saver", color: "bg-blue-500" },
      "green-champion": { label: "Green Champion", color: "bg-emerald-500" }
    };
    return badges[badgeId as keyof typeof badges] || { label: badgeId, color: "bg-gray-500" };
  };

  return (
    <div className="space-y-4">
      {/* User Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5" />
            La tua posizione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Rank</p>
              <div className="flex items-center justify-center">
                {getRankIcon(userRank)}
                <span className="ml-2 text-lg">#{userRank}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Punti</p>
              <p className="text-lg">{userPoints}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">CO₂ risparmiato</p>
              <p className="text-lg">{userCO2Saved.toFixed(1)} kg</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Bottiglie equiv.</p>
              <p className="text-lg">{userBottlesSaved.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Card */}
      <Card className={embedded ? "border-0 shadow-none" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Classifica Mondiale
              </CardTitle>
              <CardDescription className="mt-1">
                Compete con utenti di tutto il mondo risparmiando energia
              </CardDescription>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={timeFilter === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter('week')}
                className="h-7 text-xs"
              >
                Settimana
              </Button>
              <Button
                variant={timeFilter === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter('month')}
                className="h-7 text-xs"
              >
                Mese
              </Button>
              <Button
                variant={timeFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter('all')}
                className="h-7 text-xs"
              >
                Sempre
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Privacy Notice */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy garantita:</strong> Questa classifica è simulata localmente. 
              I tuoi dati rimangono sul tuo dispositivo e non vengono condivisi.
            </p>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-2">
            {leaderboardData.map((user) => (
              <div
                key={user.rank}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  user.rank <= 3 ? "bg-accent/50" : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm truncate">{user.name}</p>
                    {user.badges.map((badge) => {
                      const badgeInfo = getBadgeInfo(badge);
                      return (
                        <Badge
                          key={badge}
                          variant="outline"
                          className={cn("text-xs px-1.5 py-0", badgeInfo.color, "text-white border-0")}
                        >
                          {badgeInfo.label}
                        </Badge>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.region}, Italy</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <p className="text-muted-foreground">Punti</p>
                    <p className="font-medium">{user.points}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">CO₂</p>
                    <p className="font-medium">{user.co2Saved.toFixed(1)} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Bottiglie</p>
                    <p className="font-medium">{user.bottlesSaved.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Current User (if outside top 10) */}
            {userRank > 10 && (
              <>
                <div className="flex items-center justify-center py-2">
                  <span className="text-xs text-muted-foreground">...</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border-2 border-primary">
                  <div className="flex items-center justify-center w-8">
                    <span className="text-sm text-muted-foreground">#{userRank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{userName} (Tu)</p>
                    <p className="text-xs text-muted-foreground">{userRegion}, Italy</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-muted-foreground">Punti</p>
                      <p className="font-medium">{userPoints}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">CO₂</p>
                      <p className="font-medium">{userCO2Saved.toFixed(1)} kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Bottiglie</p>
                      <p className="font-medium">{userBottlesSaved.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Achievements Info */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Come guadagnare punti
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <Leaf className="h-5 w-5 text-green-600 mb-2" />
                <p className="text-xs">Eco Warrior</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Risparmia 100 kg CO₂
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-xs">Energy Saver</p>
                <p className="text-xs text-muted-foreground mt-1">
                  30 giorni consecutivi
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <Droplets className="h-5 w-5 text-emerald-600 mb-2" />
                <p className="text-xs">Green Champion</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Top 100 mondiale
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

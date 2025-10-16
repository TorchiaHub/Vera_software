import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Droplets, Zap, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { useEnergyStats } from '../hooks/useTauri';

interface EnergyData {
  currentPower: number; // Watts
  todayKwh: number;
  weeklyKwh: number;
  monthlyKwh: number;
  bottlesToday: number;
  bottlesWeek: number;
  bottlesMonth: number;
  co2Today: number; // grams
  weeklyTrend: number; // percentage change
}

interface EnergyMonitorProps {
  selectedDevice?: 'pc' | 'cellulare' | 'tablet';
}

const deviceMockData = {
  pc: {
    currentPower: 85,
    todayKwh: 0.46,
    weeklyKwh: 3.1,
    monthlyKwh: 12.4,
    bottlesToday: 1.4,
    bottlesWeek: 9.3,
    bottlesMonth: 37.2,
    co2Today: 230,
    weeklyTrend: -8,
    maxPower: 150,
    peakToday: 127
  },
  cellulare: {
    currentPower: 3.2,
    todayKwh: 0.012,
    weeklyKwh: 0.084,
    monthlyKwh: 0.36,
    bottlesToday: 0.036,
    bottlesWeek: 0.252,
    bottlesMonth: 1.08,
    co2Today: 6,
    weeklyTrend: -12,
    maxPower: 8,
    peakToday: 4.8
  },
  tablet: {
    currentPower: 12,
    todayKwh: 0.078,
    weeklyKwh: 0.546,
    monthlyKwh: 2.34,
    bottlesToday: 0.234,
    bottlesWeek: 1.638,
    bottlesMonth: 7.02,
    co2Today: 39,
    weeklyTrend: -5,
    maxPower: 25,
    peakToday: 18.5
  }
};

export function EnergyMonitor({ selectedDevice = 'pc' }: EnergyMonitorProps) {
  // Use Tauri hook for real-time energy stats
  const { stats, loading, error } = useEnergyStats(selectedDevice);
  
  // Fallback to mock data if Tauri stats not available
  const [data, setData] = useState<EnergyData & { maxPower: number; peakToday: number }>(deviceMockData[selectedDevice]);

  // Update data when Tauri stats are available
  useEffect(() => {
    if (stats) {
      setData(prev => ({
        ...prev,
        currentPower: stats.currentPower,
        todayKwh: stats.todayKwh,
        weeklyKwh: stats.weeklyKwh,
        monthlyKwh: stats.monthlyKwh,
        bottlesToday: stats.bottlesToday,
        bottlesWeek: stats.bottlesWeek,
        bottlesMonth: stats.bottlesMonth,
        co2Today: stats.co2Today,
        weeklyTrend: stats.weeklyTrend,
        peakToday: stats.peakToday,
        maxPower: stats.maxPower
      }));
    }
  }, [stats]);

  // Update data when device changes (fallback)
  useEffect(() => {
    if (!stats) {
      setData(deviceMockData[selectedDevice]);
    }
  }, [selectedDevice, stats]);

  // Simulate real-time power consumption changes (only if no Tauri stats)
  useEffect(() => {
    if (stats) return; // Skip simulation if we have real data

    const interval = setInterval(() => {
      const deviceData = deviceMockData[selectedDevice];
      const minPower = selectedDevice === 'pc' ? 45 : selectedDevice === 'cellulare' ? 1.5 : 6;
      const maxPower = deviceData.maxPower;
      const variation = selectedDevice === 'pc' ? 10 : selectedDevice === 'cellulare' ? 1 : 3;
      
      setData(prev => ({
        ...prev,
        currentPower: Math.max(minPower, Math.min(maxPower, prev.currentPower + (Math.random() - 0.5) * variation))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedDevice, stats]);

  const getPowerColor = (power: number) => {
    const thresholds = selectedDevice === 'pc' 
      ? { low: 60, medium: 90 }
      : selectedDevice === 'cellulare'
      ? { low: 2, medium: 4 }
      : { low: 8, medium: 15 };
    
    if (power < thresholds.low) return 'text-green-600';
    if (power < thresholds.medium) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPowerLevel = (power: number) => {
    const thresholds = selectedDevice === 'pc' 
      ? { low: 60, medium: 90 }
      : selectedDevice === 'cellulare'
      ? { low: 2, medium: 4 }
      : { low: 8, medium: 15 };
    
    if (power < thresholds.low) return 'Low';
    if (power < thresholds.medium) return 'Medium';
    return 'High';
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Real-time Power Consumption */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Power</CardTitle>
          <Activity className={`h-4 w-4 ${getPowerColor(data.currentPower)}`} />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className={`text-2xl font-bold ${getPowerColor(data.currentPower)}`}>
              {selectedDevice === 'cellulare' ? data.currentPower.toFixed(1) : Math.round(data.currentPower)}W
            </div>
            <Badge variant="outline" className="text-xs">
              {getPowerLevel(data.currentPower)}
            </Badge>
          </div>
          <Progress value={(data.currentPower / data.maxPower) * 100} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Peak today: {selectedDevice === 'cellulare' ? data.peakToday.toFixed(1) : Math.round(data.peakToday)}W
          </p>
        </CardContent>
      </Card>

      {/* Today's Impact */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Impact</CardTitle>
          <Droplets className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {selectedDevice === 'cellulare' || selectedDevice === 'tablet' ? data.bottlesToday.toFixed(3) : data.bottlesToday}
          </div>
          <p className="text-xs text-muted-foreground">
            water bottles (0.5L)
          </p>
          <div className="mt-2 text-sm">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>
                {selectedDevice === 'cellulare' || selectedDevice === 'tablet' ? data.todayKwh.toFixed(3) : data.todayKwh} kWh
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.co2Today}g CO₂
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          {data.weeklyTrend < 0 ? (
            <TrendingDown className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {selectedDevice === 'cellulare' || selectedDevice === 'tablet' ? data.bottlesWeek.toFixed(3) : data.bottlesWeek}
          </div>
          <p className="text-xs text-muted-foreground">
            water bottles
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <Badge 
              variant={data.weeklyTrend < 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {data.weeklyTrend > 0 ? '+' : ''}{data.weeklyTrend}%
            </Badge>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {selectedDevice === 'cellulare' || selectedDevice === 'tablet' ? data.weeklyKwh.toFixed(3) : data.weeklyKwh} kWh total
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
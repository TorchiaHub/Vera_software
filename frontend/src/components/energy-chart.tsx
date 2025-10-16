import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Droplets, Zap } from 'lucide-react';

interface EnergyChartProps {
  period: 'day' | 'week' | 'month';
  selectedDevice?: 'pc' | 'cellulare' | 'tablet';
}

// Mock data for different devices and time periods
const deviceData = {
  pc: {
    daily: [
      { time: '00:00', kwh: 0.02, bottles: 0.06, power: 45 },
      { time: '02:00', kwh: 0.04, bottles: 0.12, power: 45 },
      { time: '04:00', kwh: 0.06, bottles: 0.18, power: 45 },
      { time: '06:00', kwh: 0.08, bottles: 0.24, power: 45 },
      { time: '08:00', kwh: 0.12, bottles: 0.36, power: 85 },
      { time: '10:00', kwh: 0.18, bottles: 0.54, power: 95 },
      { time: '12:00', kwh: 0.25, bottles: 0.75, power: 110 },
      { time: '14:00', kwh: 0.32, bottles: 0.96, power: 105 },
      { time: '16:00', kwh: 0.38, bottles: 1.14, power: 90 },
      { time: '18:00', kwh: 0.42, bottles: 1.26, power: 75 },
      { time: '20:00', kwh: 0.44, bottles: 1.32, power: 65 },
      { time: '22:00', kwh: 0.46, bottles: 1.38, power: 55 },
    ],
    weekly: [
      { day: 'Mon', kwh: 0.52, bottles: 1.56, avgPower: 78 },
      { day: 'Tue', kwh: 0.48, bottles: 1.44, avgPower: 72 },
      { day: 'Wed', kwh: 0.46, bottles: 1.38, avgPower: 69 },
      { day: 'Thu', kwh: 0.51, bottles: 1.53, avgPower: 76 },
      { day: 'Fri', kwh: 0.49, bottles: 1.47, avgPower: 74 },
      { day: 'Sat', kwh: 0.35, bottles: 1.05, avgPower: 52 },
      { day: 'Sun', kwh: 0.38, bottles: 1.14, avgPower: 57 },
    ],
    monthly: [
      { week: 'Week 1', kwh: 3.2, bottles: 9.6, avgPower: 71 },
      { week: 'Week 2', kwh: 3.1, bottles: 9.3, avgPower: 69 },
      { week: 'Week 3', kwh: 2.9, bottles: 8.7, avgPower: 65 },
      { week: 'Week 4', kwh: 3.1, bottles: 9.3, avgPower: 69 },
    ]
  },
  cellulare: {
    daily: [
      { time: '00:00', kwh: 0.0005, bottles: 0.0015, power: 1.5 },
      { time: '02:00', kwh: 0.001, bottles: 0.003, power: 1.5 },
      { time: '04:00', kwh: 0.0015, bottles: 0.0045, power: 1.5 },
      { time: '06:00', kwh: 0.002, bottles: 0.006, power: 1.8 },
      { time: '08:00', kwh: 0.003, bottles: 0.009, power: 2.5 },
      { time: '10:00', kwh: 0.005, bottles: 0.015, power: 3.2 },
      { time: '12:00', kwh: 0.007, bottles: 0.021, power: 3.8 },
      { time: '14:00', kwh: 0.008, bottles: 0.024, power: 3.5 },
      { time: '16:00', kwh: 0.009, bottles: 0.027, power: 3.0 },
      { time: '18:00', kwh: 0.010, bottles: 0.030, power: 2.8 },
      { time: '20:00', kwh: 0.011, bottles: 0.033, power: 2.5 },
      { time: '22:00', kwh: 0.012, bottles: 0.036, power: 2.0 },
    ],
    weekly: [
      { day: 'Mon', kwh: 0.014, bottles: 0.042, avgPower: 2.8 },
      { day: 'Tue', kwh: 0.013, bottles: 0.039, avgPower: 2.6 },
      { day: 'Wed', kwh: 0.012, bottles: 0.036, avgPower: 2.4 },
      { day: 'Thu', kwh: 0.013, bottles: 0.039, avgPower: 2.7 },
      { day: 'Fri', kwh: 0.015, bottles: 0.045, avgPower: 3.0 },
      { day: 'Sat', kwh: 0.010, bottles: 0.030, avgPower: 2.0 },
      { day: 'Sun', kwh: 0.011, bottles: 0.033, avgPower: 2.2 },
    ],
    monthly: [
      { week: 'Week 1', kwh: 0.088, bottles: 0.264, avgPower: 2.5 },
      { week: 'Week 2', kwh: 0.084, bottles: 0.252, avgPower: 2.4 },
      { week: 'Week 3', kwh: 0.080, bottles: 0.240, avgPower: 2.3 },
      { week: 'Week 4', kwh: 0.084, bottles: 0.252, avgPower: 2.4 },
    ]
  },
  tablet: {
    daily: [
      { time: '00:00', kwh: 0.004, bottles: 0.012, power: 6 },
      { time: '02:00', kwh: 0.008, bottles: 0.024, power: 6 },
      { time: '04:00', kwh: 0.012, bottles: 0.036, power: 6 },
      { time: '06:00', kwh: 0.016, bottles: 0.048, power: 7 },
      { time: '08:00', kwh: 0.024, bottles: 0.072, power: 10 },
      { time: '10:00', kwh: 0.035, bottles: 0.105, power: 14 },
      { time: '12:00', kwh: 0.048, bottles: 0.144, power: 16 },
      { time: '14:00', kwh: 0.058, bottles: 0.174, power: 15 },
      { time: '16:00', kwh: 0.065, bottles: 0.195, power: 13 },
      { time: '18:00', kwh: 0.070, bottles: 0.210, power: 11 },
      { time: '20:00', kwh: 0.074, bottles: 0.222, power: 9 },
      { time: '22:00', kwh: 0.078, bottles: 0.234, power: 8 },
    ],
    weekly: [
      { day: 'Mon', kwh: 0.085, bottles: 0.255, avgPower: 12 },
      { day: 'Tue', kwh: 0.082, bottles: 0.246, avgPower: 11.5 },
      { day: 'Wed', kwh: 0.078, bottles: 0.234, avgPower: 11 },
      { day: 'Thu', kwh: 0.084, bottles: 0.252, avgPower: 12 },
      { day: 'Fri', kwh: 0.089, bottles: 0.267, avgPower: 12.5 },
      { day: 'Sat', kwh: 0.065, bottles: 0.195, avgPower: 9 },
      { day: 'Sun', kwh: 0.070, bottles: 0.210, avgPower: 10 },
    ],
    monthly: [
      { week: 'Week 1', kwh: 0.553, bottles: 1.659, avgPower: 11.8 },
      { week: 'Week 2', kwh: 0.546, bottles: 1.638, avgPower: 11.6 },
      { week: 'Week 3', kwh: 0.520, bottles: 1.560, avgPower: 11.0 },
      { week: 'Week 4', kwh: 0.546, bottles: 1.638, avgPower: 11.6 },
    ]
  }
};

export function EnergyChart({ period, selectedDevice = 'pc' }: EnergyChartProps) {
  const getData = () => {
    switch (period) {
      case 'day': return deviceData[selectedDevice].daily;
      case 'week': return deviceData[selectedDevice].weekly;
      case 'month': return deviceData[selectedDevice].monthly;
      default: return deviceData[selectedDevice].daily;
    }
  };

  const getXDataKey = () => {
    switch (period) {
      case 'day': return 'time';
      case 'week': return 'day';
      case 'month': return 'week';
      default: return 'time';
    }
  };

  const data = getData();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Energy Consumption Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Energy Consumption</CardTitle>
          <Zap className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={getXDataKey()} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => selectedDevice === 'cellulare' || selectedDevice === 'tablet' 
                  ? `${value.toFixed(3)} kWh` 
                  : `${value} kWh`}
              />
              <Tooltip 
                formatter={(value: number) => [
                  selectedDevice === 'cellulare' || selectedDevice === 'tablet' 
                    ? `${value.toFixed(3)} kWh` 
                    : `${value} kWh`, 
                  'Energy'
                ]}
                labelFormatter={(label) => `${period === 'day' ? 'Time' : period === 'week' ? 'Day' : 'Week'}: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="kwh"
                stroke="#fbbf24"
                fill="#fbbf24"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Water Bottles Impact Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Environmental Impact</CardTitle>
          <Droplets className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={getXDataKey()} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => selectedDevice === 'cellulare' || selectedDevice === 'tablet' 
                  ? `${value.toFixed(3)} bottles` 
                  : `${value} bottles`}
              />
              <Tooltip 
                formatter={(value: number) => [
                  selectedDevice === 'cellulare' || selectedDevice === 'tablet' 
                    ? `${value.toFixed(3)} bottles` 
                    : `${value} bottles`, 
                  'Water Impact'
                ]}
                labelFormatter={(label) => `${period === 'day' ? 'Time' : period === 'week' ? 'Day' : 'Week'}: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="bottles"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-muted-foreground">
            💧 Each bottle = 0.5L water equivalent
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
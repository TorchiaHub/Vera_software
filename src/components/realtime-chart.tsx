import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '../hooks/useCircularBuffer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface RealtimeChartProps {
  data: DataPoint[];
  dataKey: 'cpu' | 'ram' | 'gpu' | 'disk' | 'network_download' | 'network_upload';
  title: string;
  color: string;
  unit?: string;
}

export function RealtimeChart({
  data,
  dataKey,
  title,
  color,
  unit = '%',
}: RealtimeChartProps) {
  // Prepara i dati per recharts
  const chartData = data.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('it-IT', {
      minute: '2-digit',
      second: '2-digit',
    }),
    value: point[dataKey],
  }));

  const currentValue = data.length > 0 ? data[data.length - 1][dataKey] : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{title}</span>
          <span className="text-2xl" style={{ color }}>
            {currentValue.toFixed(1)}{unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

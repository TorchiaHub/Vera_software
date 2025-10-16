/**
 * ESEMPIO 2: Dashboard con Storico Dati e Grafici
 * 
 * Questo esempio mostra come recuperare e visualizzare
 * i dati storici delle prestazioni con grafici.
 */

import { useState, useEffect } from 'react';
import { usePerformanceData } from '../hooks/usePerformanceData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp } from 'lucide-react';

type TimeRange = '24h' | '7d' | '30d';

export function DashboardExample() {
  const { fetchHistoricalData, isOnline } = usePerformanceData();
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    avgCpu: 0,
    avgRam: 0,
    totalWaterBottles: 0,
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Calcola data di inizio in base al range selezionato
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    try {
      const data = await fetchHistoricalData({
        limit: 1000,
        startDate,
        endDate: now,
      });

      // Prepara dati per il grafico
      const processedData = data.map(record => ({
        timestamp: new Date(record.timestamp).toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        cpu: record.cpu_usage,
        ram: record.ram_usage,
        gpu: record.gpu_usage,
        waterBottles: record.water_bottles_equivalent,
      }));

      setChartData(processedData);

      // Calcola statistiche
      if (data.length > 0) {
        const avgCpu = data.reduce((sum, r) => sum + r.cpu_usage, 0) / data.length;
        const avgRam = data.reduce((sum, r) => sum + r.ram_usage, 0) / data.length;
        const totalWaterBottles = data.reduce((sum, r) => sum + r.water_bottles_equivalent, 0);
        
        setStats({
          avgCpu,
          avgRam,
          totalWaterBottles,
        });
      }
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    // Esporta dati in CSV
    const csv = chartData.map(row => 
      `${row.timestamp},${row.cpu},${row.ram},${row.gpu},${row.waterBottles}`
    ).join('\n');
    
    const blob = new Blob([`Timestamp,CPU,RAM,GPU,Water Bottles\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vera-export-${timeRange}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header con Filtri */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Dashboard Prestazioni</h1>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Ore</SelectItem>
              <SelectItem value="7d">7 Giorni</SelectItem>
              <SelectItem value="30d">30 Giorni</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Esporta CSV
          </Button>

          <Button onClick={loadData}>
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Statistiche Riepilogative */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="CPU Media"
          value={`${stats.avgCpu.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="RAM Media"
          value={`${stats.avgRam.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Bottiglie Totali"
          value={stats.totalWaterBottles.toFixed(2)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Grafico */}
      <Card>
        <CardHeader>
          <CardTitle>Andamento Prestazioni - {timeRange}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <p>Caricamento dati...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">
                {isOnline ? 'Nessun dato disponibile' : 'Offline - dati non disponibili'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                <Line type="monotone" dataKey="ram" stroke="#82ca9d" name="RAM %" />
                <Line type="monotone" dataKey="gpu" stroke="#ffc658" name="GPU %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Grafico Bottiglie d'Acqua */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo Energetico (Bottiglie d'Acqua)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="waterBottles" 
                stroke="#0ea5e9" 
                name="Bottiglie 500ml" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente per card statistiche
function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl mt-2">{value}</p>
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

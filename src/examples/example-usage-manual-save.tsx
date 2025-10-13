/**
 * ESEMPIO 3: Salvataggio Manuale
 * 
 * Questo esempio mostra come salvare manualmente
 * i dati quando necessario (es. click su bottone).
 */

import { useState } from 'react';
import { usePerformanceData } from '../hooks/usePerformanceData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Save, AlertCircle } from 'lucide-react';

export function ManualSaveExample() {
  const { savePerformanceData, isSaving, isOnline } = usePerformanceData({
    enableAutoSync: true,
    deviceId: 'manual-device-001',
    deviceName: 'Test Device',
  });

  const [formData, setFormData] = useState({
    cpu: 0,
    ram: 0,
    gpu: 0,
    disk: 0,
    network: 0,
  });

  const handleSave = async () => {
    // Validazione
    if (formData.cpu < 0 || formData.cpu > 100) {
      toast.error('CPU deve essere tra 0 e 100');
      return;
    }

    // Calcola equivalente bottiglie
    const avgUsage = (formData.cpu + formData.ram + formData.gpu) / 3;
    const waterBottles = avgUsage * 0.001; // Formula semplificata

    try {
      const success = await savePerformanceData({
        cpu_usage: formData.cpu,
        ram_usage: formData.ram,
        gpu_usage: formData.gpu,
        disk_usage: formData.disk,
        network_usage: formData.network,
        water_bottles_equivalent: waterBottles,
      });

      if (success) {
        toast.success(
          isOnline 
            ? '✅ Dati salvati su Supabase!' 
            : '📴 Dati salvati in locale (sincronizzeremo dopo)'
        );
        
        // Reset form
        setFormData({
          cpu: 0,
          ram: 0,
          gpu: 0,
          disk: 0,
          network: 0,
        });
      } else {
        toast.warning('⚠️ Errore salvataggio - dati in coda locale');
      }
    } catch (error) {
      toast.error('❌ Errore durante il salvataggio');
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Salvataggio Manuale Metriche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert Offline */}
          {!isOnline && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-600" />
              <div className="text-sm">
                <p className="font-semibold">Modalità Offline</p>
                <p className="text-muted-foreground">
                  I dati verranno salvati localmente e sincronizzati quando tornerai online
                </p>
              </div>
            </div>
          )}

          {/* Form Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu">CPU Usage (%)</Label>
              <Input
                id="cpu"
                type="number"
                min="0"
                max="100"
                value={formData.cpu}
                onChange={(e) => setFormData({ ...formData, cpu: parseFloat(e.target.value) || 0 })}
                placeholder="0-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ram">RAM Usage (%)</Label>
              <Input
                id="ram"
                type="number"
                min="0"
                max="100"
                value={formData.ram}
                onChange={(e) => setFormData({ ...formData, ram: parseFloat(e.target.value) || 0 })}
                placeholder="0-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpu">GPU Usage (%)</Label>
              <Input
                id="gpu"
                type="number"
                min="0"
                max="100"
                value={formData.gpu}
                onChange={(e) => setFormData({ ...formData, gpu: parseFloat(e.target.value) || 0 })}
                placeholder="0-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disk">Disk Usage (%)</Label>
              <Input
                id="disk"
                type="number"
                min="0"
                max="100"
                value={formData.disk}
                onChange={(e) => setFormData({ ...formData, disk: parseFloat(e.target.value) || 0 })}
                placeholder="0-100"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="network">Network Usage (MB/s)</Label>
              <Input
                id="network"
                type="number"
                min="0"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: parseFloat(e.target.value) || 0 })}
                placeholder="0+"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <p className="text-sm">
              <strong>Equivalente Bottiglie:</strong>{' '}
              {((formData.cpu + formData.ram + formData.gpu) / 3 * 0.001).toFixed(4)} bottiglie da 500ml
            </p>
            <p className="text-sm text-muted-foreground">
              (Formula semplificata di esempio)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? 'Salvataggio...' : 'Salva Dati'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setFormData({ cpu: 0, ram: 0, gpu: 0, disk: 0, network: 0 })}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

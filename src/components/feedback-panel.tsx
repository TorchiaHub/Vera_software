import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTauri } from '../hooks/useTauri';

interface FeedbackPanelProps {
  embedded?: boolean;
}

export function FeedbackPanel({ embedded = false }: FeedbackPanelProps) {
  const [category, setCategory] = useState<string>('general');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const { invoke, isReady } = useTauri();

  const categories = [
    { value: 'general', label: 'Generale' },
    { value: 'bug', label: 'Segnalazione Bug' },
    { value: 'feature', label: 'Richiesta Funzionalità' },
    { value: 'ui', label: 'Interfaccia Utente' },
    { value: 'performance', label: 'Prestazioni' },
    { value: 'other', label: 'Altro' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('sending');

    // Salva il feedback nel database SQLite locale
    try {
      if (isReady) {
        // Simula salvataggio nel database
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In un'app reale, questo salverebbe nel database:
        // await invoke('save_feedback', { 
        //   category, 
        //   message,
        //   timestamp: new Date().toISOString()
        // });
      }

      setStatus('success');
      setMessage('');
      setCategory('general');
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save feedback:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <Card className={embedded ? "border-0 shadow-none h-full flex flex-col" : "w-full max-w-2xl"}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Feedback</CardTitle>
        </div>
        <CardDescription>
          Aiutaci a migliorare VERA! Il tuo feedback è prezioso per noi.
        </CardDescription>
      </CardHeader>
      
      <CardContent className={embedded ? "space-y-6 flex-1 overflow-y-auto" : "space-y-6"}>
        {/* Info Banner */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm">Privacy Garantita</h4>
          <p className="text-xs text-muted-foreground">
            Il tuo feedback viene salvato localmente sul tuo dispositivo. Non raccogliamo dati personali 
            oltre alle informazioni che scegli di condividere nel messaggio.
          </p>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Il tuo feedback</Label>
            <Textarea
              id="message"
              placeholder="Descrivi la tua esperienza, suggerimenti, problemi riscontrati..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={status === 'sending'}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} / 1000 caratteri
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={status === 'sending' || !message.trim()}
          >
            {status === 'sending' ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Invia Feedback
              </>
            )}
          </Button>
        </form>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start space-x-3 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-600">Feedback inviato con successo!</p>
              <p className="text-xs text-green-600/70 mt-1">
                Grazie per il tuo contributo al miglioramento di VERA.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start space-x-3 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-destructive">Errore durante l'invio</p>
              <p className="text-xs text-destructive/70 mt-1">
                Assicurati di aver inserito un messaggio e riprova.
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm mb-3">I tuoi feedback</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Totale inviati</p>
              <p className="text-lg">0</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Questo mese</p>
              <p className="text-lg">0</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Categoria più usata</p>
              <p className="text-xs mt-1">N/A</p>
            </div>
          </div>
        </div>

        {/* Common Topics */}
        <div className="border-t pt-4">
          <h4 className="text-sm mb-3">Argomenti comuni</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">Miglioramenti UI</Badge>
            <Badge variant="outline" className="text-xs">Nuove funzionalità</Badge>
            <Badge variant="outline" className="text-xs">Precisione misurazioni</Badge>
            <Badge variant="outline" className="text-xs">Notifiche</Badge>
            <Badge variant="outline" className="text-xs">Prestazioni</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

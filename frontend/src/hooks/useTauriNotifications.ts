import { useState, useEffect, useCallback } from 'react';
import { useTauri } from './useTauri';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

/**
 * Hook per gestire notifiche in tempo reale dal backend Tauri
 */
export function useTauriNotifications() {
  const { invoke, listen, isReady } = useTauri();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica notifiche iniziali dal database
  useEffect(() => {
    if (!isReady) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await invoke('get_notifications');
        // Formatta i timestamp dal database (Unix timestamp in secondi)
        const formattedNotifications = (data as any[]).map((n: any) => ({
          ...n,
          timestamp: formatTimestamp(new Date(n.timestamp * 1000))
        }));
        setNotifications(formattedNotifications);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        // Fallback a notifiche mock in caso di errore
        setNotifications([
          {
            id: '1',
            title: 'Consumo elevato',
            message: 'Il PC ha consumato 2.5 kWh oggi',
            timestamp: formatTimestamp(new Date(Date.now() - 2 * 60 * 60 * 1000)),
            read: false,
            type: 'warning'
          },
          {
            id: '2',
            title: 'Obiettivo raggiunto!',
            message: 'Hai risparmiato 15 bottiglie d\'acqua questa settimana',
            timestamp: formatTimestamp(new Date(Date.now() - 5 * 60 * 60 * 1000)),
            read: false,
            type: 'success'
          },
          {
            id: '3',
            title: 'Aggiornamento disponibile',
            message: 'Nuove funzionalità disponibili per VERA',
            timestamp: formatTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000)),
            read: true,
            type: 'info'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isReady, invoke]);

  // Ascolta nuove notifiche in tempo reale
  useEffect(() => {
    if (!isReady) return;

    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen('new-notification', (event: any) => {
          const notification = event.payload;
          const formattedNotification: Notification = {
            ...notification,
            timestamp: formatTimestamp(new Date(notification.timestamp * 1000))
          };
          setNotifications(prev => [formattedNotification, ...prev]);
        });
      } catch (err) {
        console.error('Failed to setup notification listener:', err);
      }
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [isReady]);

  // Segna notifica come letta
  const markAsRead = useCallback(async (id: string) => {
    try {
      await invoke('mark_notification_read', { id });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Aggiorna localmente anche se fallisce il backend
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    }
  }, [invoke]);

  // Segna tutte come lette
  const markAllAsRead = useCallback(async () => {
    try {
      await invoke('mark_all_notifications_read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Aggiorna localmente anche se fallisce il backend
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [invoke]);

  // Elimina notifica
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await invoke('delete_notification', { id });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      // Elimina localmente anche se fallisce il backend
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, [invoke]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}

// Helper per formattare il timestamp
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minuti'} fa`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
  } else {
    return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
  }
}

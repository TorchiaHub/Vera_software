import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { cn } from './ui/utils';
import { useTauriNotifications } from '../hooks/useTauriNotifications';

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    loading 
  } = useTauriNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="font-medium text-sm">Notifiche</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Segna tutte come lette
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Caricamento...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nessuna notifica
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative flex flex-col gap-1 p-3 cursor-pointer hover:bg-accent/70 transition-colors border-b border-border last:border-b-0 group",
                      !notification.read && "bg-accent/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded-full hover:bg-destructive/10 flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                    <div className="flex items-center gap-2 w-full pr-6">
                      <div className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        notification.type === 'warning' && "bg-yellow-500",
                        notification.type === 'success' && "bg-green-500",
                        notification.type === 'info' && "bg-blue-500"
                      )} />
                      <span className="font-medium text-sm flex-1">{notification.title}</span>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground pl-4">{notification.message}</p>
                    <span className="text-xs text-muted-foreground pl-4">{notification.timestamp}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

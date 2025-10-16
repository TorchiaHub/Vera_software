import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Info } from 'lucide-react';
import { cn } from './ui/utils';

interface UserData {
  email: string;
  name: string;
  region: string;
  id: string;
}

interface ProfileMenuProps {
  user: UserData;
  onSettingsClick: () => void;
}

export function ProfileMenu({ user, onSettingsClick }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSettingsClick = () => {
    onSettingsClick();
    setIsOpen(false);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center transition-opacity"
      >
        <span className="text-xs">{getInitials(user.name)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <span className="text-sm">{getInitials(user.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <span className="inline-block mr-1">📍</span>
                {user.region}, Italy
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1">
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Impostazioni</span>
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <Info className="h-4 w-4" />
              <span>Informazioni</span>
            </button>

            <div className="my-1 h-px bg-border" />

            <button
              onClick={() => {
                console.log('Logout clicked');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Esci</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              VERA v1.0 - Privacy First
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

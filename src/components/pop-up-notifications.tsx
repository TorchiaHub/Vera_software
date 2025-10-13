import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Droplets, TrendingDown, TrendingUp, Target } from 'lucide-react';

export interface PopUpNotification {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  message: string;
  data: {
    kwh: number;
    bottles: number;
    trend?: number;
    goal?: string;
  };
  timestamp: Date;
}

interface PopUpNotificationsProps {
  notifications: PopUpNotification[];
  onDismiss: (id: string) => void;
}

export function PopUpNotifications({ notifications, onDismiss }: PopUpNotificationsProps) {
  if (notifications.length === 0) return null;

  const getIcon = (type: string, trend?: number) => {
    switch (type) {
      case 'daily':
        return <Droplets className="h-4 w-4 text-blue-600" />;
      case 'weekly':
        return trend && trend < 0 ? 
          <TrendingDown className="h-4 w-4 text-green-600" /> :
          <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'monthly':
        return <Target className="h-4 w-4 text-purple-600" />;
      default:
        return <Droplets className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-50 border-blue-200';
      case 'weekly': return 'bg-green-50 border-green-200';
      case 'monthly': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`shadow-lg border-2 ${getTypeColor(notification.type)} animate-in slide-in-from-right duration-300`}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              {getIcon(notification.type, notification.data.trend)}
              <CardTitle className="text-sm font-medium">
                {notification.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onDismiss(notification.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-sm">{notification.message}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {notification.data.kwh} kWh
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {notification.data.bottles} bottles 💧
                  </Badge>
                </div>
                
                {notification.data.trend && (
                  <Badge 
                    variant={notification.data.trend < 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {notification.data.trend > 0 ? '+' : ''}{notification.data.trend}%
                  </Badge>
                )}
              </div>

              {notification.data.goal && (
                <div className="text-xs text-muted-foreground">
                  Goal: {notification.data.goal}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sample notifications data
export const sampleNotifications: PopUpNotification[] = [
  {
    id: '1',
    type: 'daily',
    title: 'Daily Summary',
    message: 'Today: 0.46 kWh ≈ 1.4 bottles 💧',
    data: {
      kwh: 0.46,
      bottles: 1.4,
      trend: -8
    },
    timestamp: new Date()
  },
  {
    id: '2',
    type: 'weekly',
    title: 'Weekly Summary',
    message: 'Last week: 3.1 kWh ≈ 9.3 bottles',
    data: {
      kwh: 3.1,
      bottles: 9.3,
      trend: -5,
      goal: '-5% improvement'
    },
    timestamp: new Date(Date.now() - 300000) // 5 minutes ago
  }
];
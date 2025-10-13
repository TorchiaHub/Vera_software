import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Settings, Bell, Moon, BarChart3, Shield, Palette } from 'lucide-react';

interface UserData {
  email: string;
  name: string;
  region: string;
  id: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  user?: UserData;
  theme?: string;
  onThemeChange?: (theme: string) => void;
}

export function SettingsPanel({ isOpen, onClose, embedded = false, user, theme = 'light', onThemeChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    dailyNotifications: true,
    weeklyNotifications: true,
    monthlyNotifications: true,
    quietHours: true,
    autoStart: true,
    region: 'lombardy',
    notificationPosition: 'top-right'
  });

  if (!isOpen && !embedded) return null;

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const content = (
    <Card className={embedded ? "border-0 shadow-none h-full flex flex-col" : "w-full max-w-lg max-h-[90vh] overflow-y-auto"}>
      {!embedded && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>VERA Settings</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
      )}
      {embedded && (
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle className="text-base">Settings</CardTitle>
          </div>
        </CardHeader>
      )}
        
        <CardContent className={embedded ? "space-y-6 flex-1 overflow-y-auto" : "space-y-6"}>
          {/* User Profile */}
          {user && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <h3 className="font-medium">User Profile</h3>
              </div>
              
              <div className="space-y-3 ml-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Region</Label>
                    <p className="font-medium">{user.region}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">User ID</Label>
                    <p className="font-mono text-xs">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <h3 className="font-medium">Notifications</h3>
            </div>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-notifications">Daily pop-ups</Label>
                <Switch
                  id="daily-notifications"
                  checked={settings.dailyNotifications}
                  onCheckedChange={(checked) => handleSettingChange('dailyNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-notifications">Weekly summaries</Label>
                <Switch
                  id="weekly-notifications"
                  checked={settings.weeklyNotifications}
                  onCheckedChange={(checked) => handleSettingChange('weeklyNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly-notifications">Monthly questionnaire</Label>
                <Switch
                  id="monthly-notifications"
                  checked={settings.monthlyNotifications}
                  onCheckedChange={(checked) => handleSettingChange('monthlyNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="quiet-hours">Quiet hours (19:00-08:00)</Label>
                  <p className="text-xs text-muted-foreground">No notifications during these hours</p>
                </div>
                <Switch
                  id="quiet-hours"
                  checked={settings.quietHours}
                  onCheckedChange={(checked) => handleSettingChange('quietHours', checked)}
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <h3 className="font-medium">Appearance</h3>
            </div>
            
            <div className="space-y-3 ml-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={onThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <h3 className="font-medium">System</h3>
            </div>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start">Start with Windows</Label>
                <Switch
                  id="auto-start"
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => handleSettingChange('autoStart', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Region (for CO₂/water factors)</Label>
                <Select value={settings.region} onValueChange={(value) => handleSettingChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lombardy">Lombardy, Italy</SelectItem>
                    <SelectItem value="tuscany">Tuscany, Italy</SelectItem>
                    <SelectItem value="lazio">Lazio, Italy</SelectItem>
                    <SelectItem value="veneto">Veneto, Italy</SelectItem>
                    <SelectItem value="piemonte">Piemonte, Italy</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Current: 1.5 L/kWh water usage effectiveness
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <h3 className="font-medium">Privacy & Data</h3>
            </div>
            
            <div className="ml-6 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Machine ID (CMU)</span>
                  <Badge variant="outline" className="font-mono text-xs">ITLO000001</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anonymous identifier based on your region. No personal data is collected.
                </p>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Data Collection</span>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Energy consumption metrics</li>
                  <li>• Hardware utilization (CPU, GPU, RAM)</li>
                  <li>• System state (idle, active, sleep)</li>
                  <li>• Anonymous questionnaire responses</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">NOT Collected</span>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Personal files or documents</li>
                  <li>• Browsing history or web activity</li>
                  <li>• Email content or communication</li>
                  <li>• Personal identification information</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!embedded && (
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" size="sm">
                Export Data
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={onClose}>
                  Save Settings
                </Button>
              </div>
            </div>
          )}
          {embedded && (
            <div className="flex justify-end pt-4 border-t">
              <Button size="sm">
                Save Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {content}
    </div>
  );
}
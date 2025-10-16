import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EnergyMonitor } from './components/energy-monitor';
import { EnergyChart } from './components/energy-chart';
import { SettingsPanel } from './pages/settings-panel';
import { NotificationMenu } from './components/notification-menu';
import { ProfileMenu } from './components/profile-menu';
import { ThemeToggle } from './components/theme-toggle';
import { FeedbackPanel } from './components/feedback-panel';
import { Leaderboard } from './components/leaderboard';
import { LocalPCMonitorReal } from './components/local-pc-monitor-real';
import { DevicesPanel } from './components/devices-panel';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Leaf, Monitor, Smartphone, Tablet, BarChart3, Activity, ChevronLeft, ChevronRight, MessageSquare, Trophy, Laptop, Wifi } from 'lucide-react';
import { cn } from './components/ui/utils';
import { useTauri } from './hooks/useTauri';
import { useAuth } from './contexts/AuthContext';
// import { useDeviceManager } from './hooks/useDeviceManager'; // Commented out as not used currently
import { Toaster } from './components/ui/sonner';

interface UserData {
  email: string;
  name: string;
  region: string;
  id: string;
}

function App() {
  const { user: authUser } = useAuth();
  // const { currentDevice, devices } = useDeviceManager(); // Commented out as not used currently
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [activeTab, setActiveTab] = useState<'monitor' | 'analytics' | 'pcmonitor' | 'leaderboard' | 'feedback' | 'devices'>('monitor');
  const [selectedDevice, setSelectedDevice] = useState<'pc' | 'cellulare' | 'tablet'>('pc');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<string>('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { invoke, isReady } = useTauri();
  
  // User points calculation (based on simulated energy savings)
  const [userPoints] = useState(1250); // setUserPoints removed as not used
  const [userCO2Saved] = useState(45.8); // setUserCO2Saved removed as not used
  const [userBottlesSaved] = useState(91.6); // setUserBottlesSaved removed as not used
  
  // User from auth context
  const user: UserData = {
    email: authUser?.email || 'user@example.com',
    name: authUser?.name || 'User',
    region: 'Lombardia',
    id: authUser?.id || 'demo-user-001'
  };

  // Carica tema dal database all'avvio
  useEffect(() => {
    if (!isReady) return;

    // Timeout di 3 secondi per evitare blocchi
    const timeoutId = setTimeout(() => {
      console.warn('Theme loading timeout - using default light theme');
    }, 3000);

    invoke('get_settings')
      .then((settings: any) => {
        clearTimeout(timeoutId);
        if (settings && typeof settings === 'object' && 'theme' in settings) {
          setTheme(settings.theme);
        }
      })
      .catch((err: any) => {
        clearTimeout(timeoutId);
        console.error('Failed to load theme from database:', err);
      });
  }, [isReady, invoke]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Full screen desktop application
  return (
    <div className="h-screen w-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 ease-in-out shrink-0",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <div className="flex flex-col">
                <span className="text-sm font-bold">VERA</span>
                <span className="text-xs text-sidebar-foreground/70">Eco Monitor</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <Leaf className="h-5 w-5 text-green-600 mx-auto" />
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Navigation Section */}
          <div className="px-3 mb-6">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs text-sidebar-foreground/70 uppercase tracking-wider">Navigation</p>
            )}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('monitor')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  activeTab === 'monitor' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Activity className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Monitor</span>}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  activeTab === 'analytics' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Analytics</span>}
              </button>
              <button
                onClick={() => setActiveTab('pcmonitor')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  activeTab === 'pcmonitor' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Laptop className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Monitor Local PC</span>}
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  activeTab === 'leaderboard' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Trophy className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Classifica</span>}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  activeTab === 'feedback' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Feedback</span>}
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  activeTab === 'devices' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Wifi className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">I Miei Dispositivi</span>}
              </button>
            </div>
          </div>

          {/* Device Section */}
          <div className="px-3">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs text-sidebar-foreground/70 uppercase tracking-wider">Device</p>
            )}
            <div className="space-y-1">
              <button
                onClick={() => setSelectedDevice('pc')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  selectedDevice === 'pc' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Monitor className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">PC Desktop</span>}
              </button>
              <button
                onClick={() => setSelectedDevice('cellulare')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  selectedDevice === 'cellulare' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Smartphone</span>}
              </button>
              <button
                onClick={() => setSelectedDevice('tablet')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  selectedDevice === 'tablet' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Tablet className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">Tablet</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-sidebar-border p-3">
          {!sidebarCollapsed && (
            <div className="text-xs text-sidebar-foreground/70 mb-2 px-3">
              {user.region}, Italy
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            {activeTab === 'monitor' && (
              <>
                <Activity className="h-5 w-5" />
                <span className="font-medium">Energy Monitor</span>
              </>
            )}
            {activeTab === 'analytics' && (
              <>
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Analytics</span>
                <div className="h-5 w-px bg-border mx-3" />
                <div className="inline-flex h-8 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                  <button
                    onClick={() => setChartPeriod('day')}
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs transition-all",
                      chartPeriod === 'day' 
                        ? "bg-background text-foreground shadow" 
                        : "hover:bg-background/50"
                    )}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setChartPeriod('week')}
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs transition-all",
                      chartPeriod === 'week' 
                        ? "bg-background text-foreground shadow" 
                        : "hover:bg-background/50"
                    )}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setChartPeriod('month')}
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs transition-all",
                      chartPeriod === 'month' 
                        ? "bg-background text-foreground shadow" 
                        : "hover:bg-background/50"
                    )}
                  >
                    Month
                  </button>
                </div>
              </>
            )}
            {activeTab === 'pcmonitor' && (
              <>
                <Laptop className="h-5 w-5" />
                <span className="font-medium">Monitor Local PC</span>
              </>
            )}
            {activeTab === 'leaderboard' && (
              <>
                <Trophy className="h-5 w-5" />
                <span className="font-medium">Classifica Mondiale</span>
              </>
            )}
            {activeTab === 'feedback' && (
              <>
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Feedback</span>
              </>
            )}
            {activeTab === 'devices' && (
              <>
                <Wifi className="h-5 w-5" />
                <span className="font-medium">I Miei Dispositivi</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationMenu />
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <span className="text-sm hidden sm:inline">
                {user.name}
              </span>
              <ProfileMenu 
                user={user} 
                onSettingsClick={() => setSettingsOpen(true)}
              />
            </div>
            <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Monitor Tab */}
          {activeTab === 'monitor' && (
            <div className="h-full p-6 space-y-4 overflow-y-auto">
              <EnergyMonitor selectedDevice={selectedDevice} />
              
              {/* Device-specific Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    {selectedDevice === 'pc' && <Monitor className="h-4 w-4" />}
                    {selectedDevice === 'cellulare' && <Smartphone className="h-4 w-4" />}
                    {selectedDevice === 'tablet' && <Tablet className="h-4 w-4" />}
                    <CardTitle className="text-sm">
                      {selectedDevice === 'pc' && 'PC Desktop Information'}
                      {selectedDevice === 'cellulare' && 'Smartphone Information'}
                      {selectedDevice === 'tablet' && 'Tablet Information'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Tipo dispositivo:</span>
                      <p className="font-medium">
                        {selectedDevice === 'pc' && 'Desktop Computer'}
                        {selectedDevice === 'cellulare' && 'Smartphone Android/iOS'}
                        {selectedDevice === 'tablet' && 'Tablet Android/iOS'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Consumo medio:</span>
                      <p className="font-medium">
                        {selectedDevice === 'pc' && '120-200W'}
                        {selectedDevice === 'cellulare' && '2-5W'}
                        {selectedDevice === 'tablet' && '8-15W'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impatto CO₂/ora:</span>
                      <p className="font-medium">
                        {selectedDevice === 'pc' && '0.12-0.20 kg'}
                        {selectedDevice === 'cellulare' && '0.002-0.005 kg'}
                        {selectedDevice === 'tablet' && '0.008-0.015 kg'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bottiglie H₂O eq/ora:</span>
                      <p className="font-medium">
                        {selectedDevice === 'pc' && '0.24-0.40'}
                        {selectedDevice === 'cellulare' && '0.004-0.01'}
                        {selectedDevice === 'tablet' && '0.016-0.03'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="h-full p-6">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-sm">Energy Analytics</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  <EnergyChart period={chartPeriod} selectedDevice={selectedDevice} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Local PC Monitor Tab - REAL DATA ONLY */}
          {activeTab === 'pcmonitor' && (
            <div className="h-full p-6 overflow-y-auto">
              <LocalPCMonitorReal />
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="h-full p-6 overflow-y-auto">
              <Leaderboard 
                embedded={true}
                userPoints={userPoints}
                userCO2Saved={userCO2Saved}
                userBottlesSaved={userBottlesSaved}
                userName={user.name}
                userRegion={user.region}
              />
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="h-full p-6 overflow-y-auto">
              <FeedbackPanel embedded={true} />
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="h-full p-6 overflow-y-auto">
              <DevicesPanel embedded={true} />
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel (Modal) */}
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        embedded={false} 
        user={user}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}

// Wrapper component con Auth
function AppWithAuth() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
      <Toaster />
    </AuthProvider>
  );
}

export default AppWithAuth;

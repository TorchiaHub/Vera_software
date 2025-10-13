import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Leaf, Mail, Lock, User, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: (user?: UserData) => void;
}

interface UserData {
  email: string;
  name: string;
  region: string;
  id: string;
}

const italianRegions = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    region: 'Lombardia'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData: UserData = {
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
      region: formData.region,
      id: `user_${Date.now()}`
    };
    
    setIsLoading(false);
    onClose(userData);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    // Simulate registration process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData: UserData = {
      email: formData.email,
      name: formData.name,
      region: formData.region,
      id: `user_${Date.now()}`
    };
    
    setIsLoading(false);
    onClose(userData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>VERA Authentication</DialogTitle>
          <DialogDescription>
            Login or register to access VERA environmental monitoring
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gradient-to-b from-green-50 to-background p-6 border-b">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold">VERA</h1>
              <p className="text-xs text-muted-foreground">Environmental Responsibility & Awareness</p>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              🌱 Monitora il tuo impatto ambientale
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="register">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="la-tua-email@esempio.it"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                onClick={handleLogin} 
                className="w-full" 
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? 'Accedendo...' : 'Accedi'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Accedendo accetti i nostri termini di privacy
              </p>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    placeholder="Il tuo nome"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="la-tua-email@esempio.it"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-region">Regione</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    id="register-region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-input bg-input-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {italianRegions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleRegister} 
                className="w-full" 
                disabled={isLoading || !formData.email || !formData.password || !formData.name}
              >
                {isLoading ? 'Registrando...' : 'Registrati'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Registrandoti accetti i nostri termini di privacy.
                <br />
                <strong>Non raccogliamo dati personali sensibili.</strong>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletStore } from '@/store/wallet.store';
import { Wallet, Globe, Shield, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { address, connected } = useWalletStore();

  return (
    <div className="mx-auto max-w-[700px] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
          <User className="h-6 w-6 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-brand-blue">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      {/* Wallet Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-brand-blue to-brand-blue/90 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white font-heading">Wallet Connection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
              />
              <span className="text-sm font-medium">Connection Status</span>
            </div>
            <Badge
              variant={connected ? 'default' : 'secondary'}
              className={connected ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {address && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Wallet Address</span>
              <code className="rounded-lg bg-brand-blue/10 px-3 py-1.5 font-mono text-xs text-brand-blue">
                {address.slice(0, 6)}...{address.slice(-4)}
              </code>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-brand-blue" />
              <span className="text-sm font-medium">Network</span>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-600">
              Starknet Sepolia
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-brand-gold to-brand-gold/90 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white font-heading">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium block">Two-Factor Authentication</span>
              <span className="text-xs text-muted-foreground">Add an extra layer of security</span>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium block">Transaction Confirmations</span>
              <span className="text-xs text-muted-foreground">
                Require confirmation for all transactions
              </span>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-brand-orange to-brand-orange/90 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white font-heading">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium block">Email Notifications</span>
              <span className="text-xs text-muted-foreground">
                Receive updates about your DCA plans
              </span>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium block">Execution Alerts</span>
              <span className="text-xs text-muted-foreground">
                Get notified when DCA orders execute
              </span>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium block">Marketing Updates</span>
              <span className="text-xs text-muted-foreground">News and feature announcements</span>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-red-200 shadow-lg">
        <CardHeader className="border-b bg-red-50 rounded-t-lg">
          <CardTitle className="text-red-600 font-heading text-base">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium block">Delete Account</span>
              <span className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </span>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

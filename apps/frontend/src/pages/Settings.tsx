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
        <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
          <User className="h-6 w-6 text-brand-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      {/* Wallet Card */}
      <Card className="glass rounded-2xl border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-brand-orange" />
            </div>
            <CardTitle className="text-foreground font-heading">Wallet Connection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`}
              />
              <span className="text-sm font-medium text-foreground">Connection Status</span>
            </div>
            <Badge
              variant={connected ? 'default' : 'secondary'}
              className={connected ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {address && (
            <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
              <span className="text-sm font-medium text-foreground">Wallet Address</span>
              <code className="rounded-lg bg-brand-orange/10 px-3 py-1.5 font-mono text-xs text-brand-orange">
                {address.slice(0, 6)}...{address.slice(-4)}
              </code>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-brand-orange" />
              <span className="text-sm font-medium text-foreground">Network</span>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-500">
              Starknet Sepolia
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="glass rounded-2xl border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-brand-gold" />
            </div>
            <CardTitle className="text-foreground font-heading">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
            <div>
              <span className="text-sm font-medium block text-foreground">
                Two-Factor Authentication
              </span>
              <span className="text-xs text-muted-foreground">Add an extra layer of security</span>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
            <div>
              <span className="text-sm font-medium block text-foreground">
                Transaction Confirmations
              </span>
              <span className="text-xs text-muted-foreground">
                Require confirmation for all transactions
              </span>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card className="glass rounded-2xl border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-brand-orange" />
            </div>
            <CardTitle className="text-foreground font-heading">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
            <div>
              <span className="text-sm font-medium block text-foreground">Email Notifications</span>
              <span className="text-xs text-muted-foreground">
                Receive updates about your DCA plans
              </span>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
            <div>
              <span className="text-sm font-medium block text-foreground">Execution Alerts</span>
              <span className="text-xs text-muted-foreground">
                Get notified when DCA orders execute
              </span>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
            <div>
              <span className="text-sm font-medium block text-foreground">Marketing Updates</span>
              <span className="text-xs text-muted-foreground">News and feature announcements</span>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-2xl border-2 border-red-500/30">
        <CardHeader className="border-b border-red-500/20 bg-red-500/5 rounded-t-2xl">
          <CardTitle className="text-red-500 font-heading text-base">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium block text-foreground">Delete Account</span>
              <span className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </span>
            </div>
            <Button variant="destructive" size="sm" className="rounded-xl">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

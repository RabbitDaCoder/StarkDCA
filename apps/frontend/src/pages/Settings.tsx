import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { useStarknetConnect, truncateAddress } from '@/hooks';
import { Wallet, Globe, Shield, Bell, User, Copy, Check, LogOut, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const {
    address,
    isConnected: connected,
    isConnecting: connecting,
    connect,
    disconnect,
  } = useStarknetConnect();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

      {/* Profile Card */}
      <Card className="glass rounded-2xl border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-blue/10 via-brand-orange/5 to-brand-gold/10">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-brand-orange" />
              </div>
              <CardTitle className="text-foreground font-heading">Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-brand-orange">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{user?.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {user?.emailVerified && (
                    <Badge
                      variant="outline"
                      className="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-xs"
                    >
                      Verified
                    </Badge>
                  )}
                  {user?.launchAccessGranted && (
                    <Badge
                      variant="outline"
                      className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange text-xs"
                    >
                      Early Access
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs capitalize">
                    {user?.role?.toLowerCase() || 'user'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
              <span className="text-sm font-medium text-foreground">Name</span>
              <span className="text-sm text-muted-foreground">{user?.name || '—'}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
              <span className="text-sm font-medium text-foreground">Email</span>
              <span className="text-sm text-muted-foreground">{user?.email || '—'}</span>
            </div>
          </CardContent>
        </div>
      </Card>

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

          {connected && address ? (
            <>
              <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border/30">
                <span className="text-sm font-medium text-foreground">Wallet Address</span>
                <div className="flex items-center gap-2">
                  <code className="rounded-lg bg-brand-orange/10 px-3 py-1.5 font-mono text-xs text-brand-orange">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                onClick={disconnect}
                variant="outline"
                className="w-full gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500"
              >
                <LogOut className="h-4 w-4" />
                Disconnect Wallet
              </Button>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect your Starknet wallet to enable DCA execution, accumulation savings, and BTC
                purchases.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Supported:</span>
                <Badge variant="outline" className="text-xs">
                  Argent
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Braavos
                </Badge>
              </div>
              <Button
                onClick={connect}
                disabled={connecting}
                className="w-full gap-2 bg-brand-orange hover:bg-brand-orange/90"
              >
                <Wallet className="h-4 w-4" />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
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

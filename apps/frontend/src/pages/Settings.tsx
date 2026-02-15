import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletStore } from '@/store/wallet.store';

export default function SettingsPage() {
  const { address, connected } = useWalletStore();

  return (
    <div className="mx-auto max-w-[700px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={connected ? 'success' : 'secondary'}>
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          {address && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Address</span>
              <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{address}</code>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <span className="text-sm">Starknet Sepolia</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

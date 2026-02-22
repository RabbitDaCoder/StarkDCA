import { useEffect, useState } from 'react';
import { Server, Database, Cpu, HardDrive, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi, type SystemHealth } from '@/services/api/admin';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AdminSystem() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Failed to load system health data.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
            <Server className="h-6 w-6 text-brand-blue dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              System Health
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor system components and resources.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHealth} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`h-4 w-4 rounded-full ${
                  health.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}
              />
              <div>
                <p className="text-lg font-heading font-bold text-foreground capitalize">
                  System {health.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Uptime: {formatUptime(health.uptime)} &bull; Node {health.nodeVersion} &bull;{' '}
                  {health.env}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                health.status === 'healthy'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                  : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
              }
            >
              {health.status.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Service Checks */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(health.checks).map(([name, check]) => (
          <Card key={name} className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base text-foreground flex items-center gap-2">
                {name === 'database' ? (
                  <Database className="h-5 w-5 text-brand-blue dark:text-blue-400" />
                ) : (
                  <Server className="h-5 w-5 text-brand-orange" />
                )}
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {check.status === 'healthy' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      check.status === 'healthy'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-500'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
              </div>
              {check.latencyMs !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <span className="text-sm font-medium text-foreground">{check.latencyMs}ms</span>
                </div>
              )}
              {check.error && (
                <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                  <p className="text-xs text-red-500 font-mono">{check.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Memory Usage */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-500" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <HardDrive className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-heading font-bold text-foreground">
                {health.memory.rss}MB
              </p>
              <p className="text-xs text-muted-foreground mt-1">RSS</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Cpu className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-heading font-bold text-foreground">
                {health.memory.heapUsed}MB
              </p>
              <p className="text-xs text-muted-foreground mt-1">Heap Used</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Cpu className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-heading font-bold text-foreground">
                {health.memory.heapTotal}MB
              </p>
              <p className="text-xs text-muted-foreground mt-1">Heap Total</p>
            </div>
          </div>

          {/* Memory bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Heap Usage</span>
              <span>{Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-orange transition-all"
                style={{
                  width: `${Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100)}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  Users,
  ScrollText,
  Activity,
  DollarSign,
  Bitcoin,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Rocket,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi, type PlatformOverview, type LaunchStatus } from '@/services/api/admin';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: number;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-heading font-bold text-foreground tracking-tight">
              {value}
            </p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-green-500">+{trend} today</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchSuccess, setLaunchSuccess] = useState<string | null>(null);
  const [confirmLaunch, setConfirmLaunch] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.getPlatformOverview(), adminApi.getLaunchStatus().catch(() => null)])
      .then(([ov, ls]) => {
        setOverview(ov);
        setLaunchStatus(ls);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLaunch = async () => {
    if (!confirmLaunch) {
      setConfirmLaunch(true);
      return;
    }
    setLaunching(true);
    setLaunchError(null);
    setLaunchSuccess(null);
    try {
      const result = await adminApi.launchPlatform();
      setLaunchSuccess(
        `Platform launched! ${result.usersUpdated} users granted access. ${result.emailsQueued} launch emails queued.`,
      );
      setLaunchStatus({
        launched: true,
        launchedAt: result.launchedAt,
        launchedBy: result.launchedBy,
        emailProgress: { total: result.emailsQueued, sent: 0, failed: 0, inProgress: true },
      });
      setConfirmLaunch(false);
    } catch (err: any) {
      setLaunchError(err?.response?.data?.error?.message || err?.message || 'Launch failed');
      setConfirmLaunch(false);
    }
    setLaunching(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-16 text-muted-foreground">Failed to load platform data.</div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
          Platform Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time monitoring of StarkDCA platform metrics.
        </p>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={overview.users.total}
          icon={Users}
          iconBg="bg-brand-blue/10"
          iconColor="text-brand-blue dark:text-blue-400"
          trend={overview.users.today}
        />
        <StatCard
          label="Active Plans"
          value={overview.plans.active}
          sub={`${overview.plans.total} total plans`}
          icon={ScrollText}
          iconBg="bg-brand-orange/10"
          iconColor="text-brand-orange"
          trend={overview.plans.today}
        />
        <StatCard
          label="Total Deposited"
          value={`$${overview.volume.totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="USDT across all plans"
          icon={DollarSign}
          iconBg="bg-green-500/10"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="BTC Accumulated"
          value={`${overview.volume.totalBtcAccumulated.toFixed(8)}`}
          sub="Total platform-wide"
          icon={Bitcoin}
          iconBg="bg-brand-gold/10"
          iconColor="text-brand-gold"
        />
      </div>

      {/* Execution Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Executions"
          value={overview.executions.total}
          icon={Activity}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
          trend={overview.executions.today}
        />
        <StatCard
          label="Successful"
          value={overview.executions.successful}
          icon={TrendingUp}
          iconBg="bg-green-500/10"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Failed"
          value={overview.executions.failed}
          icon={Activity}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
        />
        <StatCard
          label="Success Rate"
          value={`${overview.executions.successRate}%`}
          icon={BarChart3}
          iconBg="bg-brand-blue/10"
          iconColor="text-brand-blue dark:text-blue-400"
        />
      </div>

      {/* Launch Platform */}
      <Card
        className={`border-0 shadow-lg ${launchStatus?.launched ? 'bg-green-500/5 border-green-500/20' : 'bg-gradient-to-r from-brand-orange/5 to-brand-gold/5'}`}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${launchStatus?.launched ? 'bg-green-500/10' : 'bg-brand-orange/10'}`}
            >
              <Rocket
                className={`h-6 w-6 ${launchStatus?.launched ? 'text-green-500' : 'text-brand-orange'}`}
              />
            </div>
            <div>
              <CardTitle className="font-heading text-foreground">
                {launchStatus?.launched ? 'Platform Launched' : 'Launch Platform'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {launchStatus?.launched
                  ? `Launched on ${new Date(launchStatus.launchedAt!).toLocaleDateString()} — all verified users have dashboard access`
                  : 'Grant dashboard access to all verified users and send launch emails'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {launchStatus?.launched ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Platform is live</p>
                <p className="text-xs text-muted-foreground">
                  {launchStatus.emailProgress.inProgress
                    ? `Sending launch emails: ${launchStatus.emailProgress.sent}/${launchStatus.emailProgress.total}`
                    : `${launchStatus.emailProgress.sent} launch emails sent`}
                  {launchStatus.emailProgress.failed > 0 &&
                    ` (${launchStatus.emailProgress.failed} failed)`}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {launchError && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{launchError}</p>
                </div>
              )}
              {launchSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-600 dark:text-green-400">{launchSuccess}</p>
                </div>
              )}
              <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/30">
                <AlertTriangle className="h-4 w-4 text-brand-orange flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  This will grant{' '}
                  <strong className="text-foreground">{overview.users.total} verified users</strong>{' '}
                  access to the dashboard and send them a launch notification email. This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {confirmLaunch ? (
                  <>
                    <Button
                      onClick={handleLaunch}
                      disabled={launching}
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {launching ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4" />
                          Confirm Launch
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmLaunch(false)}
                      disabled={launching}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleLaunch}
                    className="gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white"
                  >
                    <Rocket className="h-4 w-4" />
                    Launch Platform
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick summary */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">Platform Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-3xl font-heading font-bold text-foreground">
                {overview.users.total}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Registered Users</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-3xl font-heading font-bold text-foreground">
                {overview.plans.active}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Plans</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-3xl font-heading font-bold text-foreground">
                {overview.executions.today}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Executions Today</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-center gap-1">
                <Badge
                  variant="outline"
                  className={
                    overview.executions.successRate >= 90
                      ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-xl font-bold'
                      : overview.executions.successRate >= 70
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xl font-bold'
                        : 'border-red-500/30 bg-red-500/10 text-red-500 text-xl font-bold'
                  }
                >
                  {overview.executions.successRate}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

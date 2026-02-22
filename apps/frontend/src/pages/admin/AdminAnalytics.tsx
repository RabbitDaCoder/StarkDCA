import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi, type ExecutionAnalytics } from '@/services/api/admin';
import { formatCurrency } from '@/lib/utils';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<ExecutionAnalytics[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getExecutionAnalytics(days);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const totalExecs = analytics.reduce((sum, d) => sum + d.total, 0);
  const totalSuccess = analytics.reduce((sum, d) => sum + d.success, 0);
  const totalFailed = analytics.reduce((sum, d) => sum + d.failed, 0);
  const totalVolume = analytics.reduce((sum, d) => sum + d.volume, 0);
  const maxTotal = Math.max(...analytics.map((d) => d.total), 1);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              Execution Analytics
            </h1>
            <p className="text-sm text-muted-foreground">DCA execution performance over time.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Executions</p>
            <p className="text-2xl font-heading font-bold text-foreground">{totalExecs}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Successful</p>
            <p className="text-2xl font-heading font-bold text-green-600 dark:text-green-400">
              {totalSuccess}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-2xl font-heading font-bold text-red-500">{totalFailed}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-heading font-bold text-foreground">
              {formatCurrency(totalVolume)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart (simple bar chart) */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-orange" />
            Daily Execution Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : analytics.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No execution data for this period.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple bar chart */}
              <div className="flex items-end gap-1 h-48">
                {analytics.map((day) => {
                  const height = Math.max((day.total / maxTotal) * 100, 2);
                  const successPct = day.total > 0 ? (day.success / day.total) * 100 : 100;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center"
                      title={`${day.date}: ${day.total} executions (${day.success} success, ${day.failed} failed)`}
                    >
                      <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                        <div
                          className="w-full rounded-t-sm relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ height: `${height}%` }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-green-500"
                            style={{ height: `${successPct}%` }}
                          />
                          <div
                            className="absolute top-0 left-0 right-0 bg-red-400"
                            style={{ height: `${100 - successPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Date labels */}
              <div className="flex gap-1">
                {analytics.map((day, i) => (
                  <div key={day.date} className="flex-1 text-center">
                    {i % Math.ceil(analytics.length / 7) === 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 justify-center pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span className="text-xs text-muted-foreground">Success</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-red-400" />
                  <span className="text-xs text-muted-foreground">Failed</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily breakdown table */}
      {analytics.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="font-heading text-foreground text-sm">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-right py-2 font-medium">Total</th>
                    <th className="text-right py-2 font-medium">Success</th>
                    <th className="text-right py-2 font-medium">Failed</th>
                    <th className="text-right py-2 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analytics].reverse().map((day) => (
                    <tr key={day.date} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-2 text-foreground">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-right text-foreground font-medium">{day.total}</td>
                      <td className="py-2 text-right text-green-600 dark:text-green-400">
                        {day.success}
                      </td>
                      <td className="py-2 text-right text-red-500">{day.failed}</td>
                      <td className="py-2 text-right text-foreground">
                        {formatCurrency(day.volume)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

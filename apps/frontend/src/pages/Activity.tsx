import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, TrendingUp, Clock, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Activity() {
  // Mock data for demonstration
  const recentActivity = [
    {
      id: 1,
      type: 'execution',
      status: 'success',
      amount: '0.0025 BTC',
      date: '2 hours ago',
      txHash: '0x1234...5678',
    },
    {
      id: 2,
      type: 'execution',
      status: 'success',
      amount: '0.0025 BTC',
      date: '1 day ago',
      txHash: '0x8765...4321',
    },
    {
      id: 3,
      type: 'execution',
      status: 'failed',
      amount: '0.0025 BTC',
      date: '2 days ago',
      txHash: '0x9876...1234',
    },
  ];

  const hasActivity = false; // Toggle for demo

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
            <History className="h-6 w-6 text-brand-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-brand-blue">Activity</h1>
            <p className="text-sm text-muted-foreground">View your DCA execution history</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-brand-blue text-brand-blue hover:bg-brand-blue/5"
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful Executions</p>
                <p className="text-3xl font-heading font-bold text-green-600">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Executions</p>
                <p className="text-3xl font-heading font-bold text-red-600">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-brand-gold/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-3xl font-heading font-bold text-brand-gold">$0</p>
              </div>
              <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution History Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-brand-blue to-brand-blue/90 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white font-heading">Execution History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {hasActivity ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">DCA Execution</p>
                      <p className="text-sm text-muted-foreground">{activity.txHash}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-gold">{activity.amount}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                <History className="h-10 w-10 text-brand-blue/40" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-brand-blue mb-2">
                No executions yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Execution logs will appear here once your first DCA plan runs. Create a plan to get
                started.
              </p>
              <Button className="mt-6 bg-brand-orange hover:bg-brand-orange/90">
                Create Your First Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

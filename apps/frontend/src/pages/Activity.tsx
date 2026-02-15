import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Activity() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground">View your DCA execution history.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No executions yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Execution logs will appear here once your first DCA plan runs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

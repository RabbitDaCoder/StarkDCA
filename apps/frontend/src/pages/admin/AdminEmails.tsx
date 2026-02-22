import { useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/services/api/admin';

export default function AdminEmails() {
  const [mode, setMode] = useState<'direct' | 'bulk'>('direct');
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState<'announcement' | 'launch'>('announcement');
  const [bulkFilter, setBulkFilter] = useState<'all' | 'recent'>('all');
  const [recentDays, setRecentDays] = useState(7);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; total: number } | null>(
    null,
  );

  const handleSendDirect = async () => {
    if (!recipients.trim() || !subject.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const emails = recipients
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      const res = await adminApi.sendEmail({ recipients: emails, subject, template });
      setResult(res);
    } catch (err) {
      console.error('Send failed:', err);
    }
    setSending(false);
  };

  const handleSendBulk = async () => {
    if (!subject.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await adminApi.sendBulkEmail({
        filter: bulkFilter,
        recentDays: bulkFilter === 'recent' ? recentDays : undefined,
        subject,
        template,
      });
      setResult(res);
    } catch (err) {
      console.error('Bulk send failed:', err);
    }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
          <Mail className="h-6 w-6 text-brand-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
            Email Broadcast
          </h1>
          <p className="text-sm text-muted-foreground">Send announcements and updates to users.</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2">
        <Button
          variant={mode === 'direct' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setMode('direct');
            setResult(null);
          }}
        >
          Direct Send
        </Button>
        <Button
          variant={mode === 'bulk' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setMode('bulk');
            setResult(null);
          }}
        >
          Bulk Send (Waitlist)
        </Button>
      </div>

      {/* Send Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            {mode === 'direct' ? 'Send to Specific Recipients' : 'Bulk Send to Waitlist'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'direct' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Recipients (comma-separated emails)
              </label>
              <Textarea
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {mode === 'bulk' && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1">Filter</label>
                <Select value={bulkFilter} onValueChange={(v) => setBulkFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Waitlist Users</SelectItem>
                    <SelectItem value="recent">Recent Sign-ups</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {bulkFilter === 'recent' && (
                <div className="w-32">
                  <label className="block text-sm font-medium text-foreground mb-1">Days</label>
                  <Input
                    type="number"
                    value={recentDays}
                    onChange={(e) => setRecentDays(parseInt(e.target.value) || 7)}
                    min={1}
                    max={365}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
            <Input
              placeholder="Email subject line..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Template</label>
            <Select value={template} onValueChange={(v) => setTemplate(v as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="launch">Launch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={mode === 'direct' ? handleSendDirect : handleSendBulk}
            disabled={sending || !subject.trim()}
            className="gap-2 bg-brand-orange hover:bg-brand-orange/90"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Emails
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div className="rounded-lg border border-border p-4 bg-muted/50">
              <p className="text-sm font-medium text-foreground mb-2">Send Result</p>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
                >
                  {result.success} sent
                </Badge>
                {result.failed > 0 && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                    {result.failed} failed
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {result.total} total recipients
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

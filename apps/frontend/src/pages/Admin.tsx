// ─── Admin Dashboard ─────────────────────────────────────────────────
// Premium admin panel for managing waitlist users, analytics and operations.

import { useState, useEffect, ChangeEvent } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Users,
  Mail,
  Download,
  Search,
  Loader2,
  TrendingUp,
  UserPlus,
  Send,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import starkDCALogo from '@/assets/starkDCA.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/auth.store';
import { adminApi } from '@/services/api/admin';

interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  source: string | null;
  createdAt: string;
}

interface AdminStats {
  totalWaitlist: number;
  totalUsers: number;
  waitlistToday: number;
  usersToday: number;
}

const sidebarLinks = [
  { icon: BarChart3, label: 'Overview', active: true },
  { icon: Users, label: 'Users' },
  { icon: DollarSign, label: 'Funding' },
  { icon: TrendingUp, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
];

export default function Admin() {
  const { user, isAuthenticated, logout } = useAuthStore();

  // Protect route - redirect if not admin
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'email'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    filter: 'all' as 'all' | 'recent',
    recentDays: 7,
    subject: '',
    template: 'announcement' as 'announcement' | 'launch',
    content: '',
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: number; failed: number } | null>(null);

  // Fetch data on mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, usersData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getWaitlistUsers({
            page: currentPage,
            limit: 20,
            sortBy,
            sortOrder,
            search: searchQuery || undefined,
          }),
        ]);
        setStats(statsData);
        setWaitlistUsers(usersData.users);
        setTotalPages(usersData.totalPages);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, sortBy, sortOrder, searchQuery]);

  // Handle CSV export
  const handleExportCsv = async () => {
    try {
      const blob = await adminApi.exportWaitlistCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  // Handle bulk email send
  const handleSendBulkEmail = async () => {
    setIsSendingEmail(true);
    setEmailResult(null);

    try {
      const result = await adminApi.sendBulkEmail({
        filter: emailForm.filter,
        recentDays: emailForm.filter === 'recent' ? emailForm.recentDays : undefined,
        subject: emailForm.subject,
        template: emailForm.template,
        variables: {
          title: emailForm.subject,
          content: emailForm.content,
        },
      });
      setEmailResult(result);
    } catch (error) {
      console.error('Failed to send emails:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-brand-gray">
      {/* Sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 flex-col bg-white border-r lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <img src={starkDCALogo} alt="StarkDCA" className="h-9 w-auto" />
          <span className="font-heading text-lg font-bold text-brand-blue">StarkDCA</span>
          <Badge className="ml-auto bg-brand-blue text-white text-xs">Admin</Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.label}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                link.active
                  ? 'bg-brand-blue text-white'
                  : 'text-muted-foreground hover:bg-brand-gray hover:text-brand-blue'
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive hover:border-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div>
            <h1 className="font-heading text-xl font-bold text-brand-blue">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage platform operations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="border-brand-blue/20 hover:border-brand-blue hover:bg-brand-blue/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading text-brand-blue">
                    Send Bulk Email
                  </DialogTitle>
                  <DialogDescription>
                    Send an email to waitlist users using a template.
                  </DialogDescription>
                </DialogHeader>

                {emailResult ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-bold text-gold">
                        {emailResult.success}
                      </p>
                      <p className="text-sm text-muted-foreground">emails sent successfully</p>
                    </div>
                    {emailResult.failed > 0 && (
                      <p className="text-sm text-destructive">
                        {emailResult.failed} failed to send
                      </p>
                    )}
                    <Button
                      onClick={() => {
                        setEmailResult(null);
                        setIsEmailModalOpen(false);
                      }}
                      className="bg-brand-orange hover:bg-brand-orange/90"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-brand-blue">Recipients</Label>
                        <Select
                          value={emailForm.filter}
                          onValueChange={(v: 'all' | 'recent') =>
                            setEmailForm((p) => ({ ...p, filter: v }))
                          }
                        >
                          <SelectTrigger className="border-2 focus:border-brand-orange">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All waitlist users</SelectItem>
                            <SelectItem value="recent">Recent signups only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {emailForm.filter === 'recent' && (
                        <div className="space-y-2">
                          <Label className="text-brand-blue">Last N days</Label>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            value={emailForm.recentDays}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setEmailForm((p) => ({
                                ...p,
                                recentDays: parseInt(e.target.value),
                              }))
                            }
                            className="border-2 focus:border-brand-orange"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-brand-blue">Template</Label>
                        <Select
                          value={emailForm.template}
                          onValueChange={(v: 'announcement' | 'launch') =>
                            setEmailForm((p) => ({ ...p, template: v }))
                          }
                        >
                          <SelectTrigger className="border-2 focus:border-brand-orange">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="launch">Launch Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-brand-blue">Subject</Label>
                        <Input
                          value={emailForm.subject}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setEmailForm((p) => ({ ...p, subject: e.target.value }))
                          }
                          placeholder="Exciting news from StarkDCA!"
                          className="border-2 focus:border-brand-orange"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-brand-blue">Content</Label>
                        <Input
                          value={emailForm.content}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setEmailForm((p) => ({ ...p, content: e.target.value }))
                          }
                          placeholder="We have exciting updates to share..."
                          className="border-2 focus:border-brand-orange"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleSendBulkEmail}
                        disabled={isSendingEmail || !emailForm.subject}
                        className="bg-brand-orange hover:bg-brand-orange/90"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Emails
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Total Waitlist
                      </p>
                      <p className="text-3xl font-heading font-bold text-gold">
                        {isLoading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                        ) : (
                          stats?.totalWaitlist.toLocaleString()
                        )}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />+{stats?.waitlistToday || 0} today
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-brand-blue/10">
                      <Users className="h-6 w-6 text-brand-blue" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Registered Users
                      </p>
                      <p className="text-3xl font-heading font-bold text-gold">
                        {isLoading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                        ) : (
                          stats?.totalUsers.toLocaleString()
                        )}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />+{stats?.usersToday || 0} today
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-brand-orange/10">
                      <UserPlus className="h-6 w-6 text-brand-orange" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Conversion Rate
                      </p>
                      <p className="text-3xl font-heading font-bold text-gold">
                        {stats && stats.totalWaitlist > 0
                          ? ((stats.totalUsers / stats.totalWaitlist) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Waitlist to signup</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-100">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Total Revenue
                      </p>
                      <p className="text-3xl font-heading font-bold text-gold">$0</p>
                      <p className="text-xs text-muted-foreground mt-1">Pre-launch</p>
                    </div>
                    <div className="p-3 rounded-xl bg-brand-gold/10">
                      <DollarSign className="h-6 w-6 text-gold" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Waitlist Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-heading text-xl text-brand-blue">
                      Waitlist Management
                    </CardTitle>
                    <CardDescription>View and manage all waitlist signups</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setSearchQuery(e.target.value)
                        }
                        className="pl-10 w-full sm:w-72 border-2 focus:border-brand-orange"
                      />
                    </div>
                    <Select
                      value={sortBy}
                      onValueChange={(v: 'createdAt' | 'name' | 'email') => setSortBy(v)}
                    >
                      <SelectTrigger className="w-full sm:w-36 border-2">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Joined</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Loading waitlist data...</p>
                  </div>
                ) : waitlistUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No waitlist users found</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-brand-gray/50">
                          <TableHead className="font-heading text-brand-blue">Name</TableHead>
                          <TableHead className="font-heading text-brand-blue">Email</TableHead>
                          <TableHead className="font-heading text-brand-blue">Source</TableHead>
                          <TableHead className="font-heading text-brand-blue">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waitlistUsers.map((user, index) => (
                          <TableRow
                            key={user.id}
                            className="hover:bg-brand-gray/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-brand-gold flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {user.name?.[0]?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-brand-blue/20 text-brand-blue"
                              >
                                {user.source || 'direct'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(user.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page <span className="font-semibold text-brand-blue">{currentPage}</span> of{' '}
                        <span className="font-semibold text-brand-blue">{totalPages}</span>
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="border-brand-blue/20 hover:border-brand-blue"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="border-brand-blue/20 hover:border-brand-blue"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface TodayAttendance {
  id: number;
  name: string;
  employee_id: string;
  department: string;
  status: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getManagerDashboard();
      
      setStats({
        totalEmployees: data.totalEmployees,
        presentToday: parseInt(data.todayStats.present) || 0,
        absentToday: parseInt(data.todayStats.absent) || 0,
        lateToday: parseInt(data.todayStats.late) || 0,
      });

      const todayStatus = await api.getTodayStatus();
      setTodayAttendance(todayStatus.employees);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      present: { variant: "default", label: "Present" },
      absent: { variant: "destructive", label: "Absent" },
      late: { variant: "secondary", label: "Late" },
      "half-day": { variant: "outline", label: "Half Day" },
    };

    const config = variants[status] || variants.present;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manager Dashboard 📊</h1>
          <p className="text-muted-foreground">Team attendance overview and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            colorClass="text-primary"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={CheckCircle}
            colorClass="text-success"
          />
          <StatCard
            title="Absent Today"
            value={stats.absentToday}
            icon={XCircle}
            colorClass="text-destructive"
          />
          <StatCard
            title="Late Today"
            value={stats.lateToday}
            icon={Clock}
            colorClass="text-warning"
          />
        </div>

        {/* Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {record.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{record.name}</p>
                        <p className="text-sm text-muted-foreground">{record.employee_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {record.check_in_time && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.check_in_time), "hh:mm a")}
                        </p>
                      )}
                      {getStatusBadge(record.status || 'absent')}
                    </div>
                  </div>
                ))}

                {todayAttendance.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No attendance records for today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Present</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.totalEmployees > 0
                        ? ((stats.presentToday / stats.totalEmployees) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.totalEmployees > 0 ? (stats.presentToday / stats.totalEmployees) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Late</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.totalEmployees > 0
                        ? ((stats.lateToday / stats.totalEmployees) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-warning h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.totalEmployees > 0 ? (stats.lateToday / stats.totalEmployees) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Absent</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.totalEmployees > 0
                        ? ((stats.absentToday / stats.totalEmployees) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-destructive h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.totalEmployees > 0 ? (stats.absentToday / stats.totalEmployees) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

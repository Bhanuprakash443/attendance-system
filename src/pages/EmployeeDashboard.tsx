import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface AttendanceRecord {
  id: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  total_hours: number | null;
}

interface MonthlyStats {
  present: number;
  absent: number;
  late: number;
  totalHours: number;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    present: 0,
    absent: 0,
    late: 0,
    totalHours: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const data = await api.getEmployeeDashboard();
      setTodayAttendance(data.todayAttendance);
      setMonthlyStats({
        present: parseInt(data.monthlyStats.present) || 0,
        absent: parseInt(data.monthlyStats.absent) || 0,
        late: parseInt(data.monthlyStats.late) || 0,
        totalHours: parseFloat(data.monthlyStats.total_hours) || 0,
      });
      setRecentAttendance(data.recentAttendance);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      await api.checkIn();
      toast.success("Checked in successfully!");
      fetchDashboardData();
    } catch (error: any) {
      console.error("Error checking in:", error);
      toast.error(error.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    if (!user || !todayAttendance) return;

    try {
      await api.checkOut();
      toast.success("Checked out successfully!");
      fetchDashboardData();
    } catch (error: any) {
      console.error("Error checking out:", error);
      toast.error(error.message || "Failed to check out");
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-muted-foreground">Here's your attendance overview for today</p>
          </div>
        </div>

        {/* Quick Action Card */}
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Today's Status</h3>
                {todayAttendance ? (
                  <div className="space-y-2">
                    <p className="text-sm opacity-90">
                      Checked in at {format(new Date(todayAttendance.check_in_time!), "hh:mm a")}
                    </p>
                    {todayAttendance.check_out_time && (
                      <p className="text-sm opacity-90">
                        Checked out at {format(new Date(todayAttendance.check_out_time), "hh:mm a")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm opacity-90">You haven't checked in yet</p>
                )}
              </div>
              <div className="flex gap-2">
                {!todayAttendance && (
                  <Button onClick={handleCheckIn} variant="secondary" size="lg">
                    Check In
                  </Button>
                )}
                {todayAttendance && !todayAttendance.check_out_time && (
                  <Button onClick={handleCheckOut} variant="secondary" size="lg">
                    Check Out
                  </Button>
                )}
                {todayAttendance && todayAttendance.check_out_time && (
                  <div className="text-right">
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs opacity-90">{todayAttendance.total_hours?.toFixed(2)} hours</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Present Days"
            value={monthlyStats.present}
            icon={CheckCircle}
            colorClass="text-success"
            trend="This month"
          />
          <StatCard
            title="Absent Days"
            value={monthlyStats.absent}
            icon={XCircle}
            colorClass="text-destructive"
            trend="This month"
          />
          <StatCard
            title="Late Days"
            value={monthlyStats.late}
            icon={Clock}
            colorClass="text-warning"
            trend="This month"
          />
          <StatCard
            title="Total Hours"
            value={monthlyStats.totalHours.toFixed(1)}
            icon={TrendingUp}
            colorClass="text-primary"
            trend="This month"
          />
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Attendance
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/my-history")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{format(new Date(record.date), "dd")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(record.date), "MMM")}</p>
                    </div>
                    <div>
                      <p className="font-medium">{format(new Date(record.date), "EEEE")}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.check_in_time
                          ? `${format(new Date(record.check_in_time), "hh:mm a")} - ${
                              record.check_out_time ? format(new Date(record.check_out_time), "hh:mm a") : "In Progress"
                            }`
                          : "No check-in"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {record.total_hours && (
                      <p className="text-sm font-medium">{record.total_hours.toFixed(2)}h</p>
                    )}
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))}

              {recentAttendance.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

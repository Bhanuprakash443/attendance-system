import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Calendar, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface AttendanceRecord {
  id: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  total_hours: number | null;
}

export default function MyHistory() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user, selectedMonth]);

  const fetchAttendance = async () => {
    if (!user) return;

    try {
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();
      const { attendance: data } = await api.getMyHistory(month, year);
      setAttendance(data || []);
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      toast.error(error.message || "Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: "bg-success",
      absent: "bg-destructive",
      late: "bg-warning",
      "half-day": "bg-accent",
    };
    return colors[status] || "bg-muted";
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

  const getDaysInMonth = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end });
  };

  const getAttendanceForDate = (date: Date) => {
    return attendance.find((record) => isSameDay(new Date(record.date), date));
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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            My Attendance History
          </h1>
          <p className="text-muted-foreground">View and track your attendance records</p>
        </div>

        {/* Month Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(selectedMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedMonth);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedMonth(newDate);
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(new Date())}
                >
                  Current Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedMonth);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedMonth(newDate);
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((day) => {
                const record = getAttendanceForDate(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`relative aspect-square p-2 border rounded-lg ${
                      isToday ? "border-primary" : "border-border"
                    } ${record ? getStatusColor(record.status) + " bg-opacity-10" : "bg-muted/30"}`}
                  >
                    <div className="text-sm font-medium">{format(day, "d")}</div>
                    {record && (
                      <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${getStatusColor(record.status)}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 mt-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span>Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span>Absent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Detailed Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{format(new Date(record.date), "dd")}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(record.date), "MMM")}</p>
                    </div>
                    <div>
                      <p className="font-medium">{format(new Date(record.date), "EEEE, MMMM dd, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.check_in_time
                          ? `${format(new Date(record.check_in_time), "hh:mm a")} - ${
                              record.check_out_time
                                ? format(new Date(record.check_out_time), "hh:mm a")
                                : "In Progress"
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

              {attendance.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No attendance records for this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

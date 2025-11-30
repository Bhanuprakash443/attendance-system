import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Clock, CheckCircle, LogOut as LogOutIcon } from "lucide-react";
import { format } from "date-fns";

interface TodayAttendance {
  id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  total_hours: number | null;
}

export default function MarkAttendance() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    if (!user) return;

    try {
      const { attendance } = await api.getToday();
      setTodayAttendance(attendance);
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      toast.error(error.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      await api.checkIn();
      toast.success("Checked in successfully!");
      fetchTodayAttendance();
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
      fetchTodayAttendance();
    } catch (error: any) {
      console.error("Error checking out:", error);
      toast.error(error.message || "Failed to check out");
    }
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Mark Attendance ✓</h1>
            <p className="text-muted-foreground">Check in and out for the day</p>
          </div>

          {/* Current Time Display */}
          <Card className="bg-gradient-primary text-white">
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <p className="text-5xl font-bold mb-2">{format(currentTime, "hh:mm:ss")}</p>
              <p className="text-xl opacity-90">{format(currentTime, "a")}</p>
              <p className="text-sm opacity-75 mt-2">{format(currentTime, "EEEE, MMMM dd, yyyy")}</p>
            </CardContent>
          </Card>

          {/* Attendance Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!todayAttendance ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium mb-2">Ready to start your day?</p>
                    <p className="text-sm text-muted-foreground">Click the button below to check in</p>
                  </div>
                  <Button onClick={handleCheckIn} size="lg" className="gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Check In
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Check In Time</p>
                      <p className="text-2xl font-bold">
                        {format(new Date(todayAttendance.check_in_time!), "hh:mm a")}
                      </p>
                    </div>

                    {todayAttendance.check_out_time ? (
                      <>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Check Out Time</p>
                          <p className="text-2xl font-bold">
                            {format(new Date(todayAttendance.check_out_time), "hh:mm a")}
                          </p>
                        </div>

                        <div className="p-4 border rounded-lg md:col-span-2">
                          <p className="text-sm text-muted-foreground mb-1">Total Hours Worked</p>
                          <p className="text-3xl font-bold">
                            {todayAttendance.total_hours?.toFixed(2)} hours
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <p className="text-2xl font-bold capitalize">{todayAttendance.status}</p>
                      </div>
                    )}
                  </div>

                  {!todayAttendance.check_out_time && (
                    <div className="text-center">
                      <Button onClick={handleCheckOut} size="lg" variant="secondary" className="gap-2">
                        <LogOutIcon className="w-5 h-5" />
                        Check Out
                      </Button>
                    </div>
                  )}

                  {todayAttendance.check_out_time && (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 mx-auto text-success mb-2" />
                      <p className="font-medium text-success">Attendance completed for today!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

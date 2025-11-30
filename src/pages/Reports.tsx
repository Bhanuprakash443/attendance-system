import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { FileDown, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AttendanceReport {
  id: number;
  name: string;
  employee_id: string;
  department: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: number | null;
}

export default function Reports() {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { attendance: data } = await api.getAllAttendance({ startDate, endDate });
      setReports(data || []);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error(error.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      await api.exportAttendance({ startDate, endDate });
      toast.success("Report exported successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to export report");
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <FileDown className="w-8 h-8" />
              Attendance Reports
            </h1>
            <p className="text-muted-foreground">Generate and export attendance reports</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={exportToCSV} className="w-full gap-2" disabled={reports.length === 0}>
                  <FileDown className="w-4 h-4" />
                  Export to CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-3xl font-bold mt-2">{reports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-3xl font-bold mt-2 text-success">
                {reports.filter((r) => r.status === "present").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-3xl font-bold mt-2 text-warning">
                {reports.filter((r) => r.status === "late").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-3xl font-bold mt-2 text-primary">
                {reports.reduce((sum, r) => sum + (r.total_hours || 0), 0).toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Employee</th>
                    <th className="text-left p-4 font-medium">Department</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Check In</th>
                    <th className="text-left p-4 font-medium">Check Out</th>
                    <th className="text-left p-4 font-medium">Hours</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No records found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    reports.map((record, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{record.name}</p>
                            <p className="text-sm text-muted-foreground">{record.employee_id || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="p-4">{record.department}</td>
                        <td className="p-4">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                        <td className="p-4">
                          {record.check_in_time
                            ? format(new Date(record.check_in_time), "hh:mm a")
                            : "-"}
                        </td>
                        <td className="p-4">
                          {record.check_out_time
                            ? format(new Date(record.check_out_time), "hh:mm a")
                            : "-"}
                        </td>
                        <td className="p-4">{record.total_hours?.toFixed(2) || "-"}h</td>
                        <td className="p-4">{getStatusBadge(record.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

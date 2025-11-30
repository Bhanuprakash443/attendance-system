import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Users, Search } from "lucide-react";
import { format } from "date-fns";

interface EmployeeAttendance {
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

export default function TeamAttendance() {
  const [attendance, setAttendance] = useState<EmployeeAttendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<EmployeeAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamAttendance();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [searchQuery, statusFilter, attendance]);

  const fetchTeamAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { attendance: data } = await api.getAllAttendance({ date: today });
      setAttendance(data || []);
      setFilteredAttendance(data || []);
    } catch (error: any) {
      console.error("Error fetching team attendance:", error);
      toast.error(error.message || "Failed to load team attendance");
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    let filtered = [...attendance];

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    setFilteredAttendance(filtered);
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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Team Attendance
          </h1>
          <p className="text-muted-foreground">View and manage your team's attendance</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance - {format(new Date(), "MMMM dd, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {record.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-lg">{record.name}</p>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{record.employee_id}</span>
                        <span>•</span>
                        <span>{record.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {record.check_in_time && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Check In</p>
                        <p className="font-medium">{format(new Date(record.check_in_time), "hh:mm a")}</p>
                      </div>
                    )}
                    {record.check_out_time && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Check Out</p>
                        <p className="font-medium">{format(new Date(record.check_out_time), "hh:mm a")}</p>
                      </div>
                    )}
                    {record.total_hours && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Hours</p>
                        <p className="font-medium">{record.total_hours.toFixed(2)}h</p>
                      </div>
                    )}
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))}

              {filteredAttendance.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No attendance records found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { LogOut, Calendar, LayoutDashboard, ClipboardList, Users } from "lucide-react";
import { toast } from "sonner";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                AttendTrack
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>

              {role === "employee" && (
                <>
                  <Link to="/mark-attendance">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Mark Attendance
                    </Button>
                  </Link>
                  <Link to="/my-history">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      My History
                    </Button>
                  </Link>
                </>
              )}

              {role === "manager" && (
                <>
                  <Link to="/team-attendance">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Users className="w-4 h-4" />
                      Team Attendance
                    </Button>
                  </Link>
                  <Link to="/reports">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Reports
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Mock API client for frontend-only deployment
// Data stored in localStorage

const API_URL = '/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  employee_id: string;
  department: string;
}

interface Attendance {
  id: number;
  userId: number;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  totalHours: number | null;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getStorageKey(key: string): string {
    return `attendance_${key}`;
  }

  private getUsers(): User[] {
    const data = localStorage.getItem(this.getStorageKey('users'));
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));
  }

  private getAttendance(): Attendance[] {
    const data = localStorage.getItem(this.getStorageKey('attendance'));
    return data ? JSON.parse(data) : [];
  }

  private saveAttendance(attendance: Attendance[]): void {
    localStorage.setItem(this.getStorageKey('attendance'), JSON.stringify(attendance));
  }

  // Auth
  async register(data: { name: string; email: string; password: string; department: string; role?: string }) {
    const users = this.getUsers();
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      role: data.role || 'employee',
      employee_id: `EMP${String(users.filter(u => u.role === 'employee').length + 1).padStart(3, '0')}`,
      department: data.department,
    };

    users.push(newUser);
    this.saveUsers(users);

    const token = `token_${Date.now()}`;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));

    return { user: newUser, token };
  }

  async login(email: string, password: string) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = `token_${Date.now()}`;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token };
  }

  async getMe() {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    return { user: JSON.parse(userStr) };
  }

  // Attendance - Employee
  async checkIn() {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    const user = JSON.parse(userStr);
    
    const today = new Date().toISOString().split('T')[0];
    const attendance = this.getAttendance();
    
    if (attendance.find(a => a.userId === user.id && a.date === today)) {
      throw new Error('Already checked in today');
    }

    const now = new Date();
    const status = now.getHours() >= 9 && now.getHours() < 12 ? 'late' : 'present';

    const newAttendance: Attendance = {
      id: Date.now(),
      userId: user.id,
      date: today,
      checkInTime: now.toISOString(),
      checkOutTime: null,
      status,
      totalHours: null,
    };

    attendance.push(newAttendance);
    this.saveAttendance(attendance);

    return { attendance: newAttendance };
  }

  async checkOut() {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    const user = JSON.parse(userStr);
    
    const today = new Date().toISOString().split('T')[0];
    const attendance = this.getAttendance();
    const record = attendance.find(a => a.userId === user.id && a.date === today);

    if (!record) throw new Error('No check-in found');
    if (record.checkOutTime) throw new Error('Already checked out');

    const now = new Date();
    const checkInTime = new Date(record.checkInTime!);
    const totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    record.checkOutTime = now.toISOString();
    record.totalHours = totalHours;

    this.saveAttendance(attendance);
    return { attendance: record };
  }

  async getMyHistory(month?: number, year?: number) {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    const user = JSON.parse(userStr);
    
    let attendance = this.getAttendance().filter(a => a.userId === user.id);
    
    if (month && year) {
      attendance = attendance.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
    }

    return { attendance: attendance.sort((a, b) => b.date.localeCompare(a.date)) };
  }

  async getMySummary(month?: number, year?: number) {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    const user = JSON.parse(userStr);
    
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    const attendance = this.getAttendance().filter(a => {
      if (a.userId !== user.id) return false;
      const d = new Date(a.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    });

    const summary = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: 0,
      late: attendance.filter(a => a.status === 'late').length,
      half_day: attendance.filter(a => a.status === 'half-day').length,
      total_hours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    return { summary };
  }

  async getToday() {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    const user = JSON.parse(userStr);
    
    const today = new Date().toISOString().split('T')[0];
    const attendance = this.getAttendance();
    const record = attendance.find(a => a.userId === user.id && a.date === today);

    return { attendance: record || null };
  }

  // Attendance - Manager
  async getAllAttendance(filters?: any) {
    const attendance = this.getAttendance();
    const users = this.getUsers();
    
    let result = attendance.map(a => {
      const user = users.find(u => u.id === a.userId);
      return {
        ...a,
        name: user?.name || '',
        email: user?.email || '',
        employee_id: user?.employee_id || '',
        department: user?.department || '',
      };
    });

    if (filters?.date) {
      result = result.filter(a => a.date === filters.date);
    }
    if (filters?.startDate && filters?.endDate) {
      result = result.filter(a => a.date >= filters.startDate && a.date <= filters.endDate);
    }
    if (filters?.status) {
      result = result.filter(a => a.status === filters.status);
    }

    return { attendance: result.sort((a, b) => b.date.localeCompare(a.date)) };
  }

  async getEmployeeAttendance(id: string, startDate?: string, endDate?: string) {
    const attendance = this.getAttendance();
    const users = this.getUsers();
    
    let result = attendance
      .filter(a => a.userId === parseInt(id))
      .map(a => {
        const user = users.find(u => u.id === a.userId);
        return {
          ...a,
          name: user?.name || '',
          email: user?.email || '',
          employee_id: user?.employee_id || '',
          department: user?.department || '',
        };
      });

    if (startDate && endDate) {
      result = result.filter(a => a.date >= startDate && a.date <= endDate);
    }

    return { attendance: result.slice(0, 30) };
  }

  async getTeamSummary(month?: number, year?: number) {
    const users = this.getUsers().filter(u => u.role === 'employee');
    const attendance = this.getAttendance();
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    return {
      summary: users.map(user => {
        const userAttendance = attendance.filter(a => {
          if (a.userId !== user.id) return false;
          const d = new Date(a.date);
          return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
        });

        return {
          id: user.id,
          name: user.name,
          employee_id: user.employee_id,
          department: user.department,
          present: userAttendance.filter(a => a.status === 'present').length,
          absent: 0,
          late: userAttendance.filter(a => a.status === 'late').length,
          half_day: userAttendance.filter(a => a.status === 'half-day').length,
          total_hours: userAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
        };
      }),
    };
  }

  async exportAttendance(filters?: any) {
    const { attendance } = await this.getAllAttendance(filters);
    
    const csv = [
      ['Employee ID', 'Name', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Total Hours'].join(','),
      ...attendance.map(row => [
        row.employee_id || '',
        row.name || '',
        row.department || '',
        row.date,
        row.checkInTime ? new Date(row.checkInTime).toISOString() : '',
        row.checkOutTime ? new Date(row.checkOutTime).toISOString() : '',
        row.status,
        row.totalHours || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async getTodayStatus() {
    const today = new Date().toISOString().split('T')[0];
    const users = this.getUsers().filter(u => u.role === 'employee');
    const attendance = this.getAttendance().filter(a => a.date === today);

    const employees = users.map(user => {
      const record = attendance.find(a => a.userId === user.id);
      return {
        id: user.id,
        name: user.name,
        employee_id: user.employee_id,
        department: user.department,
        status: record?.status || null,
        check_in_time: record?.checkInTime || null,
        check_out_time: record?.checkOutTime || null,
      };
    });

    const present = employees.filter(e => e.status === 'present' || e.status === 'late').length;
    const absent = employees.filter(e => !e.status).length;
    const late = employees.filter(e => e.status === 'late').length;

    return { today, present, absent, late, employees };
  }

  // Dashboard
  async getEmployeeDashboard() {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    const user = JSON.parse(userStr);
    
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    const attendance = this.getAttendance().filter(a => a.userId === user.id);
    
    const todayAttendance = attendance.find(a => a.date === today) || null;
    
    const monthAttendance = attendance.filter(a => a.date >= firstDayOfMonth);
    const monthlyStats = {
      present: monthAttendance.filter(a => a.status === 'present').length,
      absent: 0,
      late: monthAttendance.filter(a => a.status === 'late').length,
      total_hours: monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    const recentAttendance = attendance.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

    return { todayAttendance, monthlyStats, recentAttendance };
  }

  async getManagerDashboard() {
    const users = this.getUsers().filter(u => u.role === 'employee');
    const today = new Date().toISOString().split('T')[0];
    const attendance = this.getAttendance();
    const todayAttendance = attendance.filter(a => a.date === today);

    const present = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = users.length - todayAttendance.length;
    const late = todayAttendance.filter(a => a.status === 'late').length;

    return {
      totalEmployees: users.length,
      todayStats: { present, absent, late },
      weeklyTrend: [],
      departmentWise: [],
      absentToday: users.filter(u => !todayAttendance.find(a => a.userId === u.id)),
    };
  }
}

export const api = new ApiClient();

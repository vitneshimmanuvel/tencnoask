export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  department: string;
  position: string;
  branch: string;
  joining_date: string;
  location: string;
  phone: string;
  email: string;
}

export interface Task {
  id: string;
  client: string;
  department: string;
  type: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assigned_to: string;
  records_required: number;
  records_completed: number;
  created_at: string;
}

export interface Activity {
  id: number;
  user_id: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: number;
  senderId: string;
  receiverId?: string;
  message: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'seen';
}

export interface LogEntry {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  type?: 'system' | 'user';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'Leave' | 'Permission' | 'On Duty';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
}

export interface QueryRisk {
  id: string;
  userId: string;
  userName: string;
  type: 'Query' | 'Requirement' | 'Risk';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Resolved' | 'Closed';
  createdAt: string;
  replies: {
    id: string;
    sender: string;
    message: string;
    timestamp: string;
  }[];
}

export interface MISRecord {
  id: string;
  clientName: string;
  department: string;
  customerId: string;
  issueType: string;
  responseStatus: string;
  assignedEmployee: string;
  remarks: string;
  lastUpdated: string;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'announcement' | 'chat';
  isRead: number;
  timestamp: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  sender: string;
  timestamp: string;
}

export interface Attendance {
  id: number;
  userId: string;
  date: string;
  loginTime: string;
  logoutTime: string;
  status: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
}

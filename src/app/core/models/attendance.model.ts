export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export interface Attendance {
  id: number;
  scheduleId: number;
  studentId: number;
  studentCode?: string;
  studentName?: string;
  status: AttendanceStatus;
  checkinTime?: string;
  notes?: string;
  student?: {
    id: number;
    studentCode: string;
    fullName: string;
  };
}

export interface AttendanceItemRequest {
  studentId: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface BatchAttendanceRequest {
  scheduleId: number;
  items?: AttendanceItemRequest[];
  records?: AttendanceItemRequest[];
  adminOverride?: boolean;
}

export interface AttendanceStatistics {
  studentId: number;
  studentName: string;
  studentCode: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

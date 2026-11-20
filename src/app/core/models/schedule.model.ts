export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED'
}

export interface Schedule {
  id: number;
  classId: number;
  classCode?: string;
  className?: string;
  courseName?: string;
  teacherId: number;
  teacherCode?: string;
  teacherName?: string;
  sessionNumber?: number;
  studyDate?: string;
  learningDate?: string;
  startTime: string;
  endTime: string;
  room: string;
  topic?: string;
  status: ScheduleStatus;
  centerClass?: {
    id: number;
    name: string;
    classCode?: string;
    hoursPerLesson?: number;
  };
  teacher?: {
    id: number;
    fullName: string;
    teacherCode?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduleRequest {
  classId: number;
  teacherId: number;
  sessionNumber?: number;
  studyDate?: string;
  learningDate?: string;
  startTime: string;
  endTime: string;
  room: string;
  topic?: string;
  status?: ScheduleStatus;
}

export interface UpdateScheduleRequest {
  teacherId?: number;
  sessionNumber?: number;
  studyDate?: string;
  learningDate?: string;
  startTime: string;
  endTime: string;
  room: string;
  topic?: string;
  status: ScheduleStatus;
}

export interface GenerateRecurringScheduleRequest {
  classId: number;
  teacherId?: number;
  room?: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  daysOfWeek: number[]; // 1 = Thứ 2 .. 7 = Chủ Nhật
  totalSessions?: number;
  previewOnly?: boolean;
}

export interface RecurringScheduleItemResponse {
  sessionNumber: number;
  studyDate: string;
  dayOfWeekName: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: number;
  teacherName: string;
  topic: string;
  hasCollision: boolean;
  collisionReason?: string;
  savedScheduleId?: number;
}

export interface GenerateRecurringScheduleResponse {
  classId: number;
  classCode: string;
  className: string;
  totalRequested: number;
  totalGenerated: number;
  conflictCount: number;
  isPreview: boolean;
  success: boolean;
  message: string;
  sessions: RecurringScheduleItemResponse[];
}

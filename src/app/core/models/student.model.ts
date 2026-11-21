export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export enum StudentStatus {
  STUDYING = 'STUDYING',
  ACTIVE = 'ACTIVE',
  RESERVED = 'RESERVED',
  GRADUATED = 'GRADUATED',
  DROPPED = 'DROPPED',
  DROPPED_OUT = 'DROPPED_OUT',
  SUSPENDED = 'SUSPENDED'
}

export interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone: string;
  telegramChatId?: string;
  address?: string;
  enrollmentDate: string;
  status: StudentStatus;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentRequest {
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone: string;
  telegramChatId?: string;
  address?: string;
  enrollmentDate: string;
  status?: StudentStatus;
  username?: string;
  password?: string;
}

export interface UpdateStudentRequest {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone: string;
  telegramChatId?: string;
  address?: string;
  enrollmentDate: string;
  status: StudentStatus;
}

export interface StudentClass {
  classId: number;
  classCode: string;
  className: string;
  courseId: number;
  courseName: string;
  courseLevel?: string;
  teacherId?: number;
  teacherName?: string;
  teacherEmail?: string;
  teacherPhone?: string;
  teacherSpecialization?: string;
  room?: string;
  startDate?: string;
  endDate?: string;
  hoursPerLesson?: number;
  totalLessons?: number;
  classStatus?: string;
  studentStatus?: string;
  enrolledDate?: string;
  completedLessons?: number;
  progressPercent?: number;
  attendedSessions?: number;
  absentSessions?: number;
  excusedSessions?: number;
  lateSessions?: number;
  nextSchedule?: {
    id: number;
    sessionNumber?: number;
    studyDate?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    topic?: string;
    status?: string;
  };
}

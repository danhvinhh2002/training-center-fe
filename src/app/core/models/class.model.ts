export enum ClassStatus {
  PLANNING = 'PLANNING',
  PLANNED = 'PLANNED',
  OPEN = 'OPEN',
  OPENING = 'OPENING',
  IN_PROGRESS = 'IN_PROGRESS',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type ClassStudentStatus = 'ACTIVE' | 'DROPPED' | 'TRANSFERRED' | 'GRADUATED';

export interface CenterClass {
  id: number;
  classCode: string;
  name: string;
  courseId: number;
  courseCode?: string;
  courseName?: string;
  hoursPerLesson?: number;
  totalLessons?: number;
  totalHours?: number;
  teacherId?: number;
  teacherCode?: string;
  teacherName?: string;
  maxStudents: number;
  currentStudents: number;
  startDate: string;
  endDate?: string;
  defaultRoom?: string;
  room?: string;
  status: ClassStatus;
  course?: {
    id: number;
    name: string;
    code?: string;
  };
  teacher?: {
    id: number;
    fullName: string;
    teacherCode?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassRequest {
  classCode: string;
  name: string;
  courseId: number;
  teacherId?: number;
  maxStudents: number;
  startDate: string;
  endDate?: string;
  defaultRoom?: string;
  room?: string;
  hoursPerLesson?: number;
  totalLessons?: number;
  status?: ClassStatus;
}

export interface UpdateClassRequest {
  name: string;
  teacherId?: number;
  maxStudents: number;
  startDate: string;
  endDate?: string;
  defaultRoom?: string;
  room?: string;
  hoursPerLesson?: number;
  totalLessons?: number;
  status: ClassStatus;
}

export interface ClassStudent {
  id: number;
  classId: number;
  classCode?: string;
  className?: string;
  studentId: number;
  studentCode?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  enrolledDate?: string;
  joinedDate?: string;
  droppedDate?: string;
  status: ClassStudentStatus;
  notes?: string;
  student?: {
    id: number;
    studentCode: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
}

export interface AllocateStudentRequest {
  classId?: number;
  studentId: number;
  notes?: string;
}

export interface TransferClassRequest {
  currentClassId: number;
  targetClassId: number;
  notes?: string;
}

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED'
}

export interface Enrollment {
  id: number;
  enrollmentCode: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  courseId: number;
  courseCode?: string;
  courseName?: string;
  classId?: number;
  classCode?: string;
  className?: string;
  tuitionFee: number;
  discountAmount?: number;
  finalAmount?: number;
  status: EnrollmentStatus;
  notes?: string;
  registeredAt?: string;
  enrollmentDate?: string;
  student?: {
    id: number;
    studentCode: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
  course?: {
    id: number;
    code?: string;
    name: string;
  };
  centerClass?: {
    id: number;
    code?: string;
    name: string;
  };
}

export interface CreateEnrollmentRequest {
  studentId: number;
  courseId: number;
  classId?: number;
  discountAmount?: number;
  notes?: string;
}

export interface UpdateEnrollmentStatusRequest {
  status: EnrollmentStatus;
  classId?: number;
  notes?: string;
}

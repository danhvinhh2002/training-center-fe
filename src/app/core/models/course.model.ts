export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Course {
  id: number;
  courseCode: string;
  name: string;
  description?: string;
  totalHours: number;
  hoursPerLesson?: number;
  totalLessons: number;
  standardFee?: number;
  tuitionFee?: number;
  level: CourseLevel;
  status: CourseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseRequest {
  courseCode: string;
  name: string;
  description?: string;
  totalHours: number;
  hoursPerLesson?: number;
  totalLessons?: number;
  standardFee?: number;
  tuitionFee?: number;
  level?: CourseLevel;
  status?: CourseStatus;
}

export interface UpdateCourseRequest {
  name: string;
  description?: string;
  totalHours: number;
  hoursPerLesson?: number;
  totalLessons?: number;
  standardFee?: number;
  tuitionFee?: number;
  level: CourseLevel;
  status: CourseStatus;
}

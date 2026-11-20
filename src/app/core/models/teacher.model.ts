import { Gender } from './student.model';

export enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  RESIGNED = 'RESIGNED'
}

export interface Teacher {
  id: number;
  teacherCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  email: string;
  phone: string;
  specialization: string;
  degree?: string;
  experienceYears?: number;
  bio?: string;
  status: TeacherStatus;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherRequest {
  teacherCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  email: string;
  phone: string;
  specialization: string;
  degree?: string;
  experienceYears?: number;
  bio?: string;
  status?: TeacherStatus;
  username?: string;
  password?: string;
}

export interface UpdateTeacherRequest {
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  email: string;
  phone: string;
  specialization: string;
  degree?: string;
  experienceYears?: number;
  bio?: string;
  status: TeacherStatus;
}

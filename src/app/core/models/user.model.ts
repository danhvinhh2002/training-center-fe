export enum RoleType {
  ADMIN = 'ROLE_ADMIN',
  MANAGER = 'ROLE_MANAGER',
  TEACHER = 'ROLE_TEACHER',
  STUDENT = 'ROLE_STUDENT',
  ACCOUNTANT = 'ROLE_ACCOUNTANT'
}

export interface Role {
  id: number;
  code: RoleType;
  name: string;
  description?: string;
  permissions: string[];
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'portal',
  },
  {
    path: 'portal',
    loadComponent: () =>
      import('./features/public/public-portal/public-portal.component').then((m) => m.PublicPortalComponent),
  },
  {
    path: 'public',
    redirectTo: 'portal',
    pathMatch: 'full',
  },
  {
    path: 'dang-ky',
    redirectTo: 'portal',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TEACHER', 'ROLE_ACCOUNTANT'] },
      },
      // ================= DÀNH CHO HỌC VIÊN =================
      {
        path: 'my-classes',
        loadComponent: () =>
          import('./features/student/my-classes/my-classes.component').then(
            (m) => m.MyClassesComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_STUDENT', 'ROLE_ADMIN'] },
      },
      {
        path: 'my-attendance',
        loadComponent: () =>
          import('./features/student/my-attendance/my-attendance.component').then(
            (m) => m.MyAttendanceComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_STUDENT', 'ROLE_ADMIN'] },
      },
      // ================= QUẢN TRỊ TRUNG TÂM =================
      {
        path: 'students',
        loadComponent: () =>
          import('./features/students/student-list/student-list.component').then(
            (m) => m.StudentListComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./features/teachers/teacher-list/teacher-list.component').then(
            (m) => m.TeacherListComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/courses/course-list/course-list.component').then(
            (m) => m.CourseListComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./features/classes/class-list/class-list.component').then(
            (m) => m.ClassListComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TEACHER'] },
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./features/enrollments/enrollment-list/enrollment-list.component').then(
            (m) => m.EnrollmentListComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT'] },
      },
      {
        path: 'schedules',
        loadComponent: () =>
          import('./features/schedules/schedule-list/schedule-list.component').then(
            (m) => m.ScheduleListComponent
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/attendance-check/attendance-check.component').then(
            (m) => m.AttendanceCheckComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TEACHER'] },
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'portal',
  },
];

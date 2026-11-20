import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  activeClasses: number;
  monthlyRevenue: number;
  attendanceRate: number;
  pendingEnrollments: number;
  todaySessions: number;
  recentClasses: {
    code: string;
    name: string;
    room: string;
    students: string;
    status: string;
    statusColor: string;
  }[];
  recentActivities: {
    desc: string;
    time: string;
    color: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = '/api/v1/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.API_URL}/stats`);
  }
}

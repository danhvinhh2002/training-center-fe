import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Attendance, AttendanceStatistics, BatchAttendanceRequest } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly API_URL = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAttendanceBySchedule(scheduleId: number): Observable<ApiResponse<Attendance[]>> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.API_URL}/by-schedule/${scheduleId}`);
  }

  batchRecordAttendance(request: BatchAttendanceRequest): Observable<ApiResponse<Attendance[]>> {
    return this.http.post<ApiResponse<Attendance[]>>(`${this.API_URL}/batch`, request);
  }

  saveBatchAttendance(request: BatchAttendanceRequest): Observable<Attendance[]> {
    return this.batchRecordAttendance(request).pipe(map(res => res.data));
  }

  getAttendanceHistoryByStudent(studentId: number): Observable<ApiResponse<Attendance[]>> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.API_URL}/history/by-student/${studentId}`);
  }

  getAttendanceStatistics(studentId: number, classId?: number): Observable<ApiResponse<AttendanceStatistics>> {
    let params = new HttpParams().set('studentId', studentId.toString());
    if (classId) {
      params = params.set('classId', classId.toString());
    }

    return this.http.get<ApiResponse<AttendanceStatistics>>(`${this.API_URL}/statistics`, { params });
  }
}

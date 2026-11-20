import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  CreateScheduleRequest,
  GenerateRecurringScheduleRequest,
  GenerateRecurringScheduleResponse,
  Schedule,
  UpdateScheduleRequest
} from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private readonly API_URL = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  getSchedules(
    page = 0,
    size = 10,
    classId?: number,
    teacherId?: number,
    date?: string,
    fromDate?: string,
    toDate?: string,
    status?: string
  ): Observable<ApiResponse<PageResponse<Schedule>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (classId) params = params.set('classId', classId.toString());
    if (teacherId) params = params.set('teacherId', teacherId.toString());
    if (date) params = params.set('date', date);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<PageResponse<Schedule>>>(this.API_URL, { params });
  }

  getSchedulesByClass(classId: number): Observable<ApiResponse<Schedule[]>> {
    return this.http.get<ApiResponse<Schedule[]>>(`${this.API_URL}/by-class/${classId}`);
  }

  getSchedulesByTeacherAndDate(teacherId: number, date: string): Observable<ApiResponse<Schedule[]>> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<Schedule[]>>(`${this.API_URL}/by-teacher/${teacherId}`, { params });
  }

  getSchedulesByDateRange(fromDate: string, toDate: string): Observable<ApiResponse<Schedule[]>> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<ApiResponse<Schedule[]>>(`${this.API_URL}/by-range`, { params });
  }

  getScheduleById(id: number): Observable<ApiResponse<Schedule>> {
    return this.http.get<ApiResponse<Schedule>>(`${this.API_URL}/${id}`);
  }

  createSchedule(request: CreateScheduleRequest): Observable<ApiResponse<Schedule>> {
    return this.http.post<ApiResponse<Schedule>>(this.API_URL, request);
  }

  generateRecurringSchedules(request: GenerateRecurringScheduleRequest): Observable<ApiResponse<GenerateRecurringScheduleResponse>> {
    return this.http.post<ApiResponse<GenerateRecurringScheduleResponse>>(`${this.API_URL}/generate-recurring`, request);
  }

  updateSchedule(id: number, request: UpdateScheduleRequest): Observable<ApiResponse<Schedule>> {
    return this.http.put<ApiResponse<Schedule>>(`${this.API_URL}/${id}`, request);
  }

  deleteSchedule(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}

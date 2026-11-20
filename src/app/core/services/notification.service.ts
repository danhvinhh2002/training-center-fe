import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  sendScheduleNotification(scheduleId: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/schedules/${scheduleId}/send`, {});
  }

  sendAbsentNotification(scheduleId: number, studentId: number, notes?: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.API_URL}/schedules/${scheduleId}/student/${studentId}/send-absent`,
      {},
      { params: notes ? { notes } : {} }
    );
  }

  getNotificationStatus(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/status`);
  }

  sendTestTelegram(message?: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/telegram/test`, { message });
  }
}

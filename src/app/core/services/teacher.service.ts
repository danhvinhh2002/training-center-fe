import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { CreateTeacherRequest, Teacher, TeacherStatus, UpdateTeacherRequest } from '../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly API_URL = `${environment.apiUrl}/teachers`;

  constructor(private http: HttpClient) {}

  getTeachers(page = 0, size = 10, keyword?: string, status?: string): Observable<ApiResponse<PageResponse<Teacher>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PageResponse<Teacher>>>(this.API_URL, { params });
  }

  searchTeachers(keyword?: string, status?: TeacherStatus, page = 0, size = 10): Observable<PageResponse<Teacher>> {
    return this.getTeachers(page, size, keyword, status).pipe(map(res => res.data));
  }

  getTeacherById(id: number): Observable<ApiResponse<Teacher>> {
    return this.http.get<ApiResponse<Teacher>>(`${this.API_URL}/${id}`);
  }

  getMyProfile(): Observable<ApiResponse<Teacher>> {
    return this.http.get<ApiResponse<Teacher>>(`${this.API_URL}/me`);
  }

  createTeacher(request: CreateTeacherRequest): Observable<ApiResponse<Teacher>> {
    return this.http.post<ApiResponse<Teacher>>(this.API_URL, request);
  }

  updateTeacher(id: number, request: UpdateTeacherRequest): Observable<ApiResponse<Teacher>> {
    return this.http.put<ApiResponse<Teacher>>(`${this.API_URL}/${id}`, request);
  }

  deleteTeacher(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  updateStatus(id: number, status: TeacherStatus): Observable<ApiResponse<Teacher>> {
    return this.http.patch<ApiResponse<Teacher>>(`${this.API_URL}/${id}/status`, null, {
      params: { status }
    });
  }
}

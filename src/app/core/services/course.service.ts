import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Course, CourseLevel, CourseStatus, CreateCourseRequest, UpdateCourseRequest } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly API_URL = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getCourses(page = 0, size = 10, keyword?: string, status?: string): Observable<ApiResponse<PageResponse<Course>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PageResponse<Course>>>(this.API_URL, { params });
  }

  searchCourses(keyword?: string, level?: CourseLevel, status?: CourseStatus, page = 0, size = 10): Observable<PageResponse<Course>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) params = params.set('keyword', keyword.trim());
    if (level) params = params.set('level', level);
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<PageResponse<Course>>>(this.API_URL, { params }).pipe(
      map(res => res.data)
    );
  }

  getCourseById(id: number): Observable<ApiResponse<Course>> {
    return this.http.get<ApiResponse<Course>>(`${this.API_URL}/${id}`);
  }

  createCourse(request: CreateCourseRequest): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(this.API_URL, request);
  }

  updateCourse(id: number, request: UpdateCourseRequest): Observable<ApiResponse<Course>> {
    return this.http.put<ApiResponse<Course>>(`${this.API_URL}/${id}`, request);
  }

  deleteCourse(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  updateStatus(id: number, status: CourseStatus): Observable<ApiResponse<Course>> {
    return this.http.patch<ApiResponse<Course>>(`${this.API_URL}/${id}/status`, null, {
      params: { status }
    });
  }
}

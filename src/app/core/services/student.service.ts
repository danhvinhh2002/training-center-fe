import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { CreateStudentRequest, Student, StudentStatus, UpdateStudentRequest } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(page = 0, size = 10, keyword?: string, status?: string): Observable<ApiResponse<PageResponse<Student>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PageResponse<Student>>>(this.API_URL, { params });
  }

  searchStudents(keyword?: string, status?: StudentStatus, page = 0, size = 10): Observable<PageResponse<Student>> {
    return this.getStudents(page, size, keyword, status).pipe(map(res => res.data));
  }

  getStudentById(id: number): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.API_URL}/${id}`);
  }

  createStudent(request: CreateStudentRequest): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(this.API_URL, request);
  }

  updateStudent(id: number, request: UpdateStudentRequest): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.API_URL}/${id}`, request);
  }

  deleteStudent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  updateStatus(id: number, status: StudentStatus): Observable<ApiResponse<Student>> {
    return this.http.patch<ApiResponse<Student>>(`${this.API_URL}/${id}/status`, null, {
      params: { status }
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  AllocateStudentRequest,
  CenterClass,
  ClassStatus,
  ClassStudent,
  CreateClassRequest,
  TransferClassRequest,
  UpdateClassRequest
} from '../models/class.model';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private readonly CLASS_API_URL = `${environment.apiUrl}/classes`;
  private readonly ROSTER_API_URL = `${environment.apiUrl}/class-students`;

  constructor(private http: HttpClient) {}

  getClasses(page = 0, size = 10, keyword?: string, status?: string): Observable<ApiResponse<PageResponse<CenterClass>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<PageResponse<CenterClass>>>(this.CLASS_API_URL, { params });
  }

  searchClasses(keyword?: string, courseId?: number, teacherId?: number, status?: ClassStatus, page = 0, size = 10): Observable<PageResponse<CenterClass>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) params = params.set('keyword', keyword.trim());
    if (courseId) params = params.set('courseId', courseId.toString());
    if (teacherId) params = params.set('teacherId', teacherId.toString());
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<PageResponse<CenterClass>>>(this.CLASS_API_URL, { params }).pipe(
      map(res => res.data)
    );
  }

  getClassById(id: number): Observable<ApiResponse<CenterClass>> {
    return this.http.get<ApiResponse<CenterClass>>(`${this.CLASS_API_URL}/${id}`);
  }

  getClassesByCourse(courseId: number): Observable<ApiResponse<CenterClass[]>> {
    return this.http.get<ApiResponse<CenterClass[]>>(`${this.CLASS_API_URL}/by-course/${courseId}`);
  }

  getClassesByTeacher(teacherId: number): Observable<ApiResponse<CenterClass[]>> {
    return this.http.get<ApiResponse<CenterClass[]>>(`${this.CLASS_API_URL}/by-teacher/${teacherId}`);
  }

  createClass(request: CreateClassRequest): Observable<ApiResponse<CenterClass>> {
    return this.http.post<ApiResponse<CenterClass>>(this.CLASS_API_URL, request);
  }

  updateClass(id: number, request: UpdateClassRequest): Observable<ApiResponse<CenterClass>> {
    return this.http.put<ApiResponse<CenterClass>>(`${this.CLASS_API_URL}/${id}`, request);
  }

  deleteClass(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CLASS_API_URL}/${id}`);
  }

  updateStatus(id: number, status: ClassStatus): Observable<ApiResponse<CenterClass>> {
    return this.http.patch<ApiResponse<CenterClass>>(`${this.CLASS_API_URL}/${id}/status`, null, {
      params: { status }
    });
  }

  getClassStudents(classId: number): Observable<ApiResponse<ClassStudent[]>> {
    return this.http.get<ApiResponse<ClassStudent[]>>(`${this.ROSTER_API_URL}/class/${classId}`);
  }

  allocateStudent(classId: number, request: AllocateStudentRequest): Observable<ApiResponse<ClassStudent>> {
    return this.http.post<ApiResponse<ClassStudent>>(`${this.ROSTER_API_URL}/class/${classId}/allocate`, request);
  }

  removeStudentFromClass(classId: number, studentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.ROSTER_API_URL}/class/${classId}/student/${studentId}`);
  }

  transferClass(request: TransferClassRequest): Observable<ApiResponse<ClassStudent>> {
    return this.http.post<ApiResponse<ClassStudent>>(`${this.ROSTER_API_URL}/transfer`, request);
  }
}

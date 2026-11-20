import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { CreateEnrollmentRequest, Enrollment, EnrollmentStatus, UpdateEnrollmentStatusRequest } from '../models/enrollment.model';
import { AuthService } from './auth.service';
import { RoleType } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly API_URL = `${environment.apiUrl}/enrollments`;
  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getPendingCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/pending-count`).pipe(
      tap(res => {
        if (res.data !== undefined) {
          this.pendingCountSubject.next(res.data);
        }
      })
    );
  }

  refreshPendingCount(): void {
    const user = this.authService.currentUserValue;
    if (!user || !user.roles) {
      this.pendingCountSubject.next(0);
      return;
    }

    // Chỉ ADMIN hoặc MANAGER mới được gọi API đếm số lượng đơn chờ duyệt
    const canView = user.roles.some(r => r.code === RoleType.ADMIN || r.code === RoleType.MANAGER);
    if (!canView) {
      this.pendingCountSubject.next(0);
      return;
    }

    this.getPendingCount().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  getEnrollments(page = 0, size = 10, keyword?: string, status?: string): Observable<ApiResponse<PageResponse<Enrollment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<PageResponse<Enrollment>>>(this.API_URL, { params });
  }

  getAllEnrollments(status?: EnrollmentStatus, page = 0, size = 10): Observable<PageResponse<Enrollment>> {
    return this.getEnrollments(page, size, undefined, status).pipe(map(res => res.data));
  }

  getEnrollmentById(id: number): Observable<ApiResponse<Enrollment>> {
    return this.http.get<ApiResponse<Enrollment>>(`${this.API_URL}/${id}`);
  }

  getEnrollmentsByStudent(studentId: number): Observable<ApiResponse<Enrollment[]>> {
    return this.http.get<ApiResponse<Enrollment[]>>(`${this.API_URL}/by-student/${studentId}`);
  }

  createEnrollment(request: CreateEnrollmentRequest): Observable<ApiResponse<Enrollment>> {
    return this.http.post<ApiResponse<Enrollment>>(this.API_URL, request).pipe(
      tap(() => this.refreshPendingCount())
    );
  }

  updateStatus(id: number, request: UpdateEnrollmentStatusRequest): Observable<ApiResponse<Enrollment>> {
    return this.http.patch<ApiResponse<Enrollment>>(`${this.API_URL}/${id}/status`, request).pipe(
      tap(() => this.refreshPendingCount())
    );
  }

  confirmEnrollment(id: number, classId?: number): Observable<ApiResponse<Enrollment>> {
    return this.updateStatus(id, { status: EnrollmentStatus.CONFIRMED, classId });
  }

  cancelEnrollment(id: number): Observable<ApiResponse<Enrollment>> {
    return this.updateStatus(id, { status: EnrollmentStatus.CANCELLED });
  }
}

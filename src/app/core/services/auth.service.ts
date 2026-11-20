import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, ChangePasswordRequest, LoginRequest, RefreshTokenRequest } from '../models/auth.model';
import { RoleType, User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'tc_access_token';
  private readonly REFRESH_TOKEN_KEY = 'tc_refresh_token';
  private readonly USER_KEY = 'tc_user_info';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.currentUserValue;
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  public hasRole(role: RoleType): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.code === role);
  }

  public hasAnyRole(roles: RoleType[]): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles) return false;
    return user.roles.some(r => roles.includes(r.code));
  }

  public login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, request).pipe(
      map(res => res.data),
      tap(authData => this.saveAuthSession(authData))
    );
  }

  public refreshToken(): Observable<AuthResponse> {
    const token = this.getRefreshToken();
    const body: RefreshTokenRequest = { refreshToken: token || '' };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/refresh-token`, body).pipe(
      map(res => res.data),
      tap(authData => this.saveAuthSession(authData))
    );
  }

  public changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/change-password`, request);
  }

  public logout(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${this.API_URL}/logout`, {}).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  public clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private saveAuthSession(authData: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, authData.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    this.currentUserSubject.next(authData.user);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}

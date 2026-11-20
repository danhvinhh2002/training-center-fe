import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AuthService } from '../../../core/services/auth.service';
import { RoleType } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule
  ],
  template: `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <div class="logo-circle">
            <span nz-icon nzType="book" nzTheme="outline"></span>
          </div>
          <h1>TRUNG TÂM ĐÀO TẠO</h1>
          <p class="subtitle">Đăng nhập cổng thông tin quản trị và học vụ</p>
        </div>

        <nz-alert
          *ngIf="errorMessage"
          nzType="error"
          [nzMessage]="errorMessage"
          nzShowIcon
          nzCloseable
          (nzOnClose)="errorMessage = ''"
          class="alert-box"
        ></nz-alert>

        <form nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Tên đăng nhập hoặc Email</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập tên đăng nhập hoặc email!">
              <nz-input-group [nzPrefix]="userIcon" nzSize="large">
                <input
                  type="text"
                  nz-input
                  formControlName="usernameOrEmail"
                  placeholder="admin hoặc email"
                />
              </nz-input-group>
              <ng-template #userIcon><span nz-icon nzType="user"></span></ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Mật khẩu</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập mật khẩu (tối thiểu 6 ký tự)!">
              <nz-input-group [nzPrefix]="lockIcon" [nzSuffix]="passwordEye" nzSize="large">
                <input
                  [type]="passwordVisible ? 'text' : 'password'"
                  nz-input
                  formControlName="password"
                  placeholder="Nhập mật khẩu"
                />
              </nz-input-group>
              <ng-template #lockIcon><span nz-icon nzType="lock"></span></ng-template>
              <ng-template #passwordEye>
                <span
                  nz-icon
                  [nzType]="passwordVisible ? 'eye-invisible' : 'eye'"
                  (click)="passwordVisible = !passwordVisible"
                  style="cursor: pointer;"
                ></span>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <button
            nz-button
            nzType="primary"
            nzBlock
            nzSize="large"
            [nzLoading]="isLoading"
            type="submit"
            class="submit-btn"
          >
            ĐĂNG NHẬP
          </button>

          <div style="text-align: center; margin-top: 16px;">
            <a routerLink="/portal" style="color: #1890ff; font-weight: 500; font-size: 13px;">
              🌐 Xem danh mục Khóa học & Đăng ký tuyển sinh
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #002140 100%);
      padding: 20px;
    }
    .login-box {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border-radius: 12px;
      padding: 40px 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    .login-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-circle {
      width: 56px;
      height: 56px;
      background: #e6f7ff;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 12px;
      span {
        font-size: 28px;
        color: #1890ff;
      }
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #001529;
      margin: 0 0 6px 0;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.45);
      margin: 0;
    }
    .alert-box {
      margin-bottom: 20px;
    }
    .submit-btn {
      margin-top: 10px;
      height: 44px;
      font-weight: 600;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .demo-credentials {
      margin-top: 24px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
    .demo-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    code {
      color: #1890ff;
      font-weight: 600;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  passwordVisible = false;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.hasRole(RoleType.STUDENT) && !this.authService.hasAnyRole([RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER])) {
        this.router.navigate(['/schedules']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return;
    }

    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        const fullName = response.user?.fullName || response.data?.fullName || 'Người dùng';
        this.msg.success(`Chào mừng trở lại, ${fullName}!`);
        const isStudentOnly = this.authService.hasRole(RoleType.STUDENT) && !this.authService.hasAnyRole([RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER]);
        const targetUrl = (this.returnUrl === '/dashboard' && isStudentOnly) ? '/schedules' : this.returnUrl;
        this.router.navigateByUrl(targetUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      }
    });
  }
}

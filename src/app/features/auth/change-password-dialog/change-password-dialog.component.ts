import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule
  ],
  template: `
    <div style="padding: 4px 0;">
      <nz-alert
        nzType="info"
        nzShowIcon
        nzMessage="Lưu ý bảo mật"
        nzDescription="Sau khi đổi mật khẩu thành công, phiên làm việc hiện tại sẽ kết thúc và bạn cần đăng nhập lại với mật khẩu mới."
        style="margin-bottom: 20px;"
      ></nz-alert>

      <form nz-form [formGroup]="form" (ngSubmit)="submitForm()" nzLayout="vertical">
        <nz-form-item>
          <nz-form-label nzRequired>Mật khẩu hiện tại</nz-form-label>
          <nz-form-control [nzErrorTip]="oldPasswordErrorTpl">
            <nz-input-group [nzSuffix]="oldPasswordTpl">
              <input
                nz-input
                [type]="showOldPassword ? 'text' : 'password'"
                formControlName="oldPassword"
                placeholder="Nhập mật khẩu đang dùng"
              />
            </nz-input-group>
            <ng-template #oldPasswordTpl>
              <span
                nz-icon
                [nzType]="showOldPassword ? 'eye-invisible' : 'eye'"
                (click)="showOldPassword = !showOldPassword"
                style="cursor: pointer; color: #8c8c8c;"
              ></span>
            </ng-template>
            <ng-template #oldPasswordErrorTpl let-control>
              <ng-container *ngIf="control.hasError('required')">Vui lòng nhập mật khẩu hiện tại!</ng-container>
            </ng-template>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Mật khẩu mới</nz-form-label>
          <nz-form-control [nzErrorTip]="newPasswordErrorTpl">
            <nz-input-group [nzSuffix]="newPasswordTpl">
              <input
                nz-input
                [type]="showNewPassword ? 'text' : 'password'"
                formControlName="newPassword"
                placeholder="Tối thiểu 6 ký tự"
              />
            </nz-input-group>
            <ng-template #newPasswordTpl>
              <span
                nz-icon
                [nzType]="showNewPassword ? 'eye-invisible' : 'eye'"
                (click)="showNewPassword = !showNewPassword"
                style="cursor: pointer; color: #8c8c8c;"
              ></span>
            </ng-template>
            <ng-template #newPasswordErrorTpl let-control>
              <ng-container *ngIf="control.hasError('required')">Vui lòng nhập mật khẩu mới!</ng-container>
              <ng-container *ngIf="control.hasError('minlength')">Mật khẩu mới phải có tối thiểu 6 ký tự!</ng-container>
              <ng-container *ngIf="control.hasError('sameAsOld')">Mật khẩu mới không được trùng mật khẩu cũ!</ng-container>
            </ng-template>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Xác nhận mật khẩu mới</nz-form-label>
          <nz-form-control [nzErrorTip]="confirmPasswordErrorTpl">
            <nz-input-group [nzSuffix]="confirmPasswordTpl">
              <input
                nz-input
                [type]="showConfirmPassword ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
              />
            </nz-input-group>
            <ng-template #confirmPasswordTpl>
              <span
                nz-icon
                [nzType]="showConfirmPassword ? 'eye-invisible' : 'eye'"
                (click)="showConfirmPassword = !showConfirmPassword"
                style="cursor: pointer; color: #8c8c8c;"
              ></span>
            </ng-template>
            <ng-template #confirmPasswordErrorTpl let-control>
              <ng-container *ngIf="control.hasError('required')">Vui lòng nhập lại mật khẩu mới!</ng-container>
              <ng-container *ngIf="control.hasError('mustMatch')">Mật khẩu xác nhận không khớp!</ng-container>
            </ng-template>
          </nz-form-control>
        </nz-form-item>

        <div class="modal-footer-custom">
          <button nz-button nzType="default" type="button" (click)="destroyModal()">Hủy</button>
          <button nz-button nzType="primary" [nzLoading]="isSubmitting" type="submit">
            <span nz-icon nzType="check"></span>
            <span>Xác nhận đổi mật khẩu</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .modal-footer-custom {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  `]
})
export class ChangePasswordDialogComponent {
  form: FormGroup;
  isSubmitting = false;

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private authService: AuthService,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: [this.passwordMatchValidator, this.notSameAsOldValidator]
      }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mustMatch: true });
      return { mustMatch: true };
    }
    return null;
  }

  notSameAsOldValidator(control: AbstractControl): ValidationErrors | null {
    const oldPassword = control.get('oldPassword')?.value;
    const newPassword = control.get('newPassword')?.value;
    if (oldPassword && newPassword && oldPassword === newPassword) {
      control.get('newPassword')?.setErrors({ sameAsOld: true });
      return { sameAsOld: true };
    }
    return null;
  }

  submitForm(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmitting = true;
    const { oldPassword, newPassword, confirmPassword } = this.form.value;

    this.authService.changePassword({ oldPassword, newPassword, confirmPassword }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.msg.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', { nzDuration: 4000 });
        this.modalRef.close(true);
        setTimeout(() => {
          this.authService.clearSession();
        }, 1200);
      },
      error: (err) => {
        this.isSubmitting = false;
        const errMsg = err?.error?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!';
        this.msg.error(errMsg);
      }
    });
  }

  destroyModal(): void {
    this.modalRef.destroy();
  }
}

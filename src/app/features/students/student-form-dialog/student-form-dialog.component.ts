import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Student } from '../../../core/models/student.model';
import { CodeGenerator } from '../../../core/utils/code-generator.util';

@Component({
  selector: 'app-student-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzToolTipModule
  ],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()" nzLayout="vertical">
      <!-- Khối thiết lập tài khoản đăng nhập khi tạo mới -->
      <div *ngIf="!isEdit" style="background: #e6f7ff; border: 1px solid #91d5ff; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-weight: 600; color: #096dd9; display: flex; align-items: center; gap: 6px;">
            <span nz-icon nzType="user-add"></span>
            <span>Tài khoản đăng nhập cho Học Viên</span>
          </div>
          <span style="font-size: 12px; color: #1890ff; font-weight: 500;">(Tự nhập hoặc để trống để tạo tự động)</span>
        </div>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item style="margin-bottom: 8px;">
              <nz-form-label>Tên đăng nhập (Username)</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="username" placeholder="Mặc định: theo mã HV (chữ thường)" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item style="margin-bottom: 8px;">
              <nz-form-label>Mật khẩu khởi tạo</nz-form-label>
              <nz-form-control>
                <input nz-input type="text" formControlName="password" placeholder="Mặc định: password123" />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <div style="font-size: 12px; color: #595959; margin-top: 4px;">
          💡 <em>Ghi chú: Nếu để trống, học viên có thể đăng nhập bằng <strong>Mã học viên / Email</strong> với mật khẩu <strong>password123</strong>.</em>
        </div>
      </div>

      <nz-form-item *ngIf="!isEdit">
        <nz-form-label nzRequired>Mã Học Viên (Tự động sinh)</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập mã học viên!">
          <nz-input-group [nzSuffix]="reloadStudentCodeTpl">
            <input nz-input formControlName="studentCode" placeholder="VD: HV261024" />
          </nz-input-group>
          <ng-template #reloadStudentCodeTpl>
            <span
              nz-icon
              nzType="reload"
              (click)="regenerateCode()"
              nz-tooltip
              nzTooltipTitle="Sinh mã ngẫu nhiên mới"
              style="cursor: pointer; color: #1890ff;"
            ></span>
          </ng-template>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired>Họ và Tên</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập họ và tên đầy đủ!">
          <input nz-input formControlName="fullName" placeholder="VD: Nguyễn Văn An" />
        </nz-form-control>
      </nz-form-item>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Ngày Sinh</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng chọn ngày sinh!">
              <nz-date-picker formControlName="dateOfBirth" nzFormat="dd/MM/yyyy" style="width: 100%;"></nz-date-picker>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Giới Tính</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="gender">
                <nz-option nzValue="MALE" nzLabel="Nam"></nz-option>
                <nz-option nzValue="FEMALE" nzLabel="Nữ"></nz-option>
                <nz-option nzValue="OTHER" nzLabel="Khác"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Email</nz-form-label>
            <nz-form-control nzErrorTip="Email không đúng định dạng!">
              <input nz-input formControlName="email" type="email" placeholder="example@email.com" />
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Số Điện Thoại</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập số điện thoại!">
              <input nz-input formControlName="phone" placeholder="0901234567" />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <nz-form-item>
        <nz-form-label [nzTooltipTitle]="'Chat ID Telegram cá nhân của học viên hoặc phụ huynh để nhận tin nhắn lịch học và cảnh báo vắng 1-1 riêng tư (lấy từ bot @userinfobot)'">
          Telegram Chat ID (Nhận tin nhắn riêng 1-1)
        </nz-form-label>
        <nz-form-control>
          <input nz-input formControlName="telegramChatId" placeholder="VD: 123456789 (tùy chọn để gửi tin riêng)" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label>Địa Chỉ Thường Trú</nz-form-label>
        <nz-form-control>
          <input nz-input formControlName="address" placeholder="Nhập địa chỉ liên hệ" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item *ngIf="isEdit">
        <nz-form-label nzRequired>Trạng Thái Học Tập</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="status">
            <nz-option nzValue="STUDYING" nzLabel="Đang theo học (STUDYING)"></nz-option>
            <nz-option nzValue="RESERVED" nzLabel="Bảo lưu (RESERVED)"></nz-option>
            <nz-option nzValue="GRADUATED" nzLabel="Đã tốt nghiệp (GRADUATED)"></nz-option>
            <nz-option nzValue="DROPPED" nzLabel="Thôi học / Bỏ học (DROPPED)"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" type="button" (click)="destroyModal()">Hủy</button>
        <button nz-button nzType="primary" [nzLoading]="isSubmitting" type="submit">
          {{ isEdit ? 'Cập Nhật' : 'Lưu Học Viên' }}
        </button>
      </div>
    </form>
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
export class StudentFormDialogComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA, { optional: true });
  @Input() student?: Student;
  @Input() isEdit = false;

  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    if (this.nzModalData) {
      if (this.nzModalData.student) this.student = this.nzModalData.student;
      if (this.nzModalData.isEdit !== undefined) this.isEdit = this.nzModalData.isEdit;
    }

    this.form = this.fb.group({
      studentCode: [this.student?.studentCode || CodeGenerator.generateStudentCode(), !this.isEdit ? [Validators.required] : []],
      fullName: [this.student?.fullName || '', [Validators.required]],
      dateOfBirth: [this.student?.dateOfBirth ? new Date(this.student.dateOfBirth) : null, [Validators.required]],
      gender: [this.student?.gender || 'MALE', [Validators.required]],
      email: [this.student?.email || '', [Validators.required, Validators.email]],
      phone: [this.student?.phone || '', [Validators.required]],
      username: [''],
      password: [''],
      telegramChatId: [this.student?.telegramChatId || ''],
      address: [this.student?.address || ''],
      status: [this.student?.status || 'STUDYING']
    });
  }

  regenerateCode(): void {
    this.form.patchValue({ studentCode: CodeGenerator.generateStudentCode() });
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

    const val = this.form.value;
    const today = this.formatDate(new Date());
    const payload = {
      ...val,
      dateOfBirth: val.dateOfBirth ? this.formatDate(val.dateOfBirth) : null,
      enrollmentDate: this.student?.enrollmentDate || today
    };

    this.modalRef.close(payload);
  }

  destroyModal(): void {
    this.modalRef.destroy();
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

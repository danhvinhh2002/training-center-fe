import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { Teacher } from '../../../core/models/teacher.model';
import { CodeGenerator } from '../../../core/utils/code-generator.util';

@Component({
  selector: 'app-teacher-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzToolTipModule,
    NzAlertModule,
    NzInputNumberModule
  ],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()" nzLayout="vertical">
      <!-- Khối thiết lập tài khoản đăng nhập khi tạo mới -->
      <div *ngIf="!isEdit" style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-weight: 600; color: #389e0d; display: flex; align-items: center; gap: 6px;">
            <span nz-icon nzType="user-add"></span>
            <span>Tài khoản đăng nhập hệ thống</span>
          </div>
          <span style="font-size: 12px; color: #52c41a; font-weight: 500;">(Tự nhập hoặc để trống để tạo tự động)</span>
        </div>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item style="margin-bottom: 8px;">
              <nz-form-label>Tên đăng nhập (Username)</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="username" placeholder="Mặc định: theo mã GV (chữ thường)" />
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
          💡 <em>Ghi chú: Nếu bạn không nhập, hệ thống sẽ tự động dùng <strong>Mã GV / Email</strong> và mật khẩu <strong>password123</strong>.</em>
        </div>
      </div>

      <nz-form-item *ngIf="!isEdit">
        <nz-form-label nzRequired>Mã Giáo Viên (Tự động sinh)</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập mã giáo viên!">
          <nz-input-group [nzSuffix]="reloadTeacherCodeTpl">
            <input nz-input formControlName="teacherCode" placeholder="VD: GV261024" />
          </nz-input-group>
          <ng-template #reloadTeacherCodeTpl>
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

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="16">
          <nz-form-item>
            <nz-form-label nzRequired>Họ và Tên</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập họ và tên!">
              <input nz-input formControlName="fullName" placeholder="VD: ThS. John Smith" />
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="8">
          <nz-form-item>
            <nz-form-label nzRequired>Giới Tính</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng chọn giới tính!">
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
        <div nz-col [nzSpan]="10">
          <nz-form-item>
            <nz-form-label nzRequired>Chuyên Môn</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập chuyên môn giảng dạy!">
              <input nz-input formControlName="specialization" placeholder="VD: IELTS, Tiếng Anh Giao tiếp" />
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="8">
          <nz-form-item>
            <nz-form-label>Học Vị / Trình Độ</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="degree">
                <nz-option nzValue="Cử nhân" nzLabel="Cử nhân"></nz-option>
                <nz-option nzValue="Thạc sĩ" nzLabel="Thạc sĩ"></nz-option>
                <nz-option nzValue="Tiến sĩ" nzLabel="Tiến sĩ"></nz-option>
                <nz-option nzValue="Chứng chỉ TESOL/CELTA" nzLabel="Chứng chỉ TESOL/CELTA"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="6">
          <nz-form-item>
            <nz-form-label>Kinh Nghiệm</nz-form-label>
            <nz-form-control>
              <nz-input-number formControlName="experienceYears" [nzMin]="0" [nzMax]="50" nzPlaceHolder="Năm" style="width: 100%;"></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Email</nz-form-label>
            <nz-form-control nzErrorTip="Email không hợp lệ!">
              <input nz-input formControlName="email" type="email" placeholder="teacher@center.edu.vn" />
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Số Điện Thoại</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập số điện thoại!">
              <input nz-input formControlName="phone" placeholder="0987654321" />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <nz-form-item>
        <nz-form-label>Tiểu Sử / Kinh Nghiệm</nz-form-label>
        <nz-form-control>
          <textarea nz-input formControlName="bio" rows="3" placeholder="Kinh nghiệm giảng dạy, chứng chỉ IELTS 8.5..."></textarea>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item *ngIf="isEdit">
        <nz-form-label nzRequired>Trạng Thái</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="status">
            <nz-option nzValue="ACTIVE" nzLabel="Đang giảng dạy (ACTIVE)"></nz-option>
            <nz-option nzValue="ON_LEAVE" nzLabel="Nghỉ phép (ON_LEAVE)"></nz-option>
            <nz-option nzValue="RESIGNED" nzLabel="Đã nghỉ việc (RESIGNED)"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" type="button" (click)="destroyModal()">Hủy</button>
        <button nz-button nzType="primary" [nzLoading]="isSubmitting" type="submit">
          {{ isEdit ? 'Cập Nhật' : 'Lưu Giáo Viên' }}
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
export class TeacherFormDialogComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA, { optional: true });
  @Input() teacher?: Teacher;
  @Input() isEdit = false;

  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    if (this.nzModalData) {
      if (this.nzModalData.teacher) this.teacher = this.nzModalData.teacher;
      if (this.nzModalData.isEdit !== undefined) this.isEdit = this.nzModalData.isEdit;
    }

    this.form = this.fb.group({
      teacherCode: [this.teacher?.teacherCode || CodeGenerator.generateTeacherCode(), !this.isEdit ? [Validators.required] : []],
      fullName: [this.teacher?.fullName || '', [Validators.required]],
      gender: [this.teacher?.gender || 'MALE', [Validators.required]],
      specialization: [this.teacher?.specialization || '', [Validators.required]],
      degree: [this.teacher?.degree || 'Cử nhân'],
      experienceYears: [this.teacher?.experienceYears ?? 0],
      email: [this.teacher?.email || '', [Validators.required, Validators.email]],
      phone: [this.teacher?.phone || '', [Validators.required]],
      username: [''],
      password: [''],
      bio: [this.teacher?.bio || ''],
      status: [this.teacher?.status || 'ACTIVE']
    });
  }

  regenerateCode(): void {
    this.form.patchValue({ teacherCode: CodeGenerator.generateTeacherCode() });
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
    this.modalRef.close(this.form.value);
  }

  destroyModal(): void {
    this.modalRef.destroy();
  }
}

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Course } from '../../../core/models/course.model';
import { CodeGenerator } from '../../../core/utils/code-generator.util';

@Component({
  selector: 'app-course-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzToolTipModule
  ],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()" nzLayout="vertical">
      <nz-form-item *ngIf="!isEdit">
        <nz-form-label nzRequired>Mã Khóa Học (Tự động sinh)</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập mã khóa học!">
          <nz-input-group [nzSuffix]="reloadCourseCodeTpl">
            <input nz-input formControlName="courseCode" placeholder="VD: KH261024" />
          </nz-input-group>
          <ng-template #reloadCourseCodeTpl>
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
        <nz-form-label nzRequired>Tên Khóa Học</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập tên khóa học!">
          <input nz-input formControlName="name" placeholder="VD: Luyện thi IELTS 6.5+ Toàn diện" />
        </nz-form-control>
      </nz-form-item>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Tổng Số Giờ Học</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập số giờ học!">
              <nz-input-number formControlName="totalHours" [nzMin]="1" [nzStep]="1" style="width: 100%;"></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Tổng Số Buổi</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập số buổi học!">
              <nz-input-number formControlName="totalLessons" [nzMin]="1" [nzStep]="1" style="width: 100%;"></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <nz-form-item>
        <nz-form-label nzRequired>Học Phí Tiêu Chuẩn (VNĐ)</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập mức học phí!">
          <nz-input-number
            formControlName="tuitionFee"
            [nzMin]="0"
            [nzStep]="500000"
            [nzFormatter]="formatterVND"
            [nzParser]="parserVND"
            style="width: 100%;"
          ></nz-input-number>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label>Mô Tả / Mục Tiêu Đạt Chuẩn Đầu Ra</nz-form-label>
        <nz-form-control>
          <textarea nz-input formControlName="description" rows="3" placeholder="Mục tiêu khóa học, giáo trình sử dụng..."></textarea>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item *ngIf="isEdit">
        <nz-form-label nzRequired>Trạng Thái</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="status">
            <nz-option nzValue="ACTIVE" nzLabel="Đang tuyển sinh & mở lớp (ACTIVE)"></nz-option>
            <nz-option nzValue="INACTIVE" nzLabel="Tạm ngưng tuyển sinh (INACTIVE)"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" type="button" (click)="destroyModal()">Hủy</button>
        <button nz-button nzType="primary" [nzLoading]="isSubmitting" type="submit">
          {{ isEdit ? 'Cập Nhật' : 'Lưu Khóa Học' }}
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
export class CourseFormDialogComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA, { optional: true });
  @Input() course?: Course;
  @Input() isEdit = false;

  form!: FormGroup;
  isSubmitting = false;

  formatterVND = (value: number): string => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  parserVND = (value: string): string => value.replace(/\$\s?|(,*)/g, '');

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    if (this.nzModalData) {
      if (this.nzModalData.course) this.course = this.nzModalData.course;
      if (this.nzModalData.isEdit !== undefined) this.isEdit = this.nzModalData.isEdit;
    }

    this.form = this.fb.group({
      courseCode: [this.course?.courseCode || CodeGenerator.generateCourseCode(), !this.isEdit ? [Validators.required] : []],
      name: [this.course?.name || '', [Validators.required]],
      totalHours: [this.course?.totalHours || 60, [Validators.required, Validators.min(1)]],
      totalLessons: [this.course?.totalLessons || 24, [Validators.required, Validators.min(1)]],
      tuitionFee: [this.course?.tuitionFee || this.course?.standardFee || 5000000, [Validators.required, Validators.min(0)]],
      description: [this.course?.description || ''],
      status: [this.course?.status || 'ACTIVE']
    });
  }

  regenerateCode(): void {
    this.form.patchValue({ courseCode: CodeGenerator.generateCourseCode() });
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

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CenterClass } from '../../../core/models/class.model';
import { Course } from '../../../core/models/course.model';
import { Teacher } from '../../../core/models/teacher.model';
import { CourseService } from '../../../core/services/course.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { CodeGenerator } from '../../../core/utils/code-generator.util';

@Component({
  selector: 'app-class-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzToolTipModule
  ],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()" nzLayout="vertical">
      <nz-form-item *ngIf="!isEdit">
        <nz-form-label nzRequired>Mã Lớp Học (Tự động sinh)</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập mã lớp!">
          <nz-input-group [nzSuffix]="reloadClassCodeTpl">
            <input nz-input formControlName="classCode" placeholder="VD: LH261024" />
          </nz-input-group>
          <ng-template #reloadClassCodeTpl>
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
        <nz-form-label nzRequired>Tên Lớp Học</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập tên lớp học!">
          <input nz-input formControlName="name" placeholder="VD: Lớp IELTS 6.5+ Buổi Tối 2-4-6" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item *ngIf="!isEdit">
        <nz-form-label nzRequired>Khóa Học</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng chọn khóa học tương ứng!">
          <nz-select formControlName="courseId" nzPlaceHolder="-- Chọn khóa học --" nzShowSearch>
            <nz-option *ngFor="let c of courses" [nzValue]="c.id" [nzLabel]="c.name + ' (' + c.courseCode + ')'"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired>Giáo Viên Phụ Trách</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng phân công giáo viên!">
          <nz-select formControlName="teacherId" nzPlaceHolder="-- Chọn giảng viên --" nzShowSearch>
            <nz-option *ngFor="let t of teachers" [nzValue]="t.id" [nzLabel]="t.fullName + ' - ' + t.specialization"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Ngày Bắt Đầu</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng chọn ngày khai giảng!">
              <nz-date-picker formControlName="startDate" nzFormat="dd/MM/yyyy" style="width: 100%;"></nz-date-picker>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>Ngày Kết Thúc Dự Kiến</nz-form-label>
            <nz-form-control>
              <nz-date-picker formControlName="endDate" nzFormat="dd/MM/yyyy" style="width: 100%;"></nz-date-picker>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Sĩ Số Tối Đa</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập sĩ số tối đa!">
              <nz-input-number formControlName="maxStudents" [nzMin]="1" [nzMax]="100" style="width: 100%;"></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>Phòng Học Mặc Định</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="room" placeholder="VD: Phòng 302 - Lab A" />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <nz-form-item *ngIf="isEdit">
        <nz-form-label nzRequired>Trạng Thái Lớp Học</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="status">
            <nz-option nzValue="PLANNING" nzLabel="Lên kế hoạch / Tuyển sinh (PLANNING)"></nz-option>
            <nz-option nzValue="OPEN" nzLabel="Đang mở đăng ký (OPEN)"></nz-option>
            <nz-option nzValue="IN_PROGRESS" nzLabel="Đang giảng dạy (IN_PROGRESS)"></nz-option>
            <nz-option nzValue="COMPLETED" nzLabel="Đã kết thúc khóa (COMPLETED)"></nz-option>
            <nz-option nzValue="CANCELLED" nzLabel="Hủy lớp (CANCELLED)"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" type="button" (click)="destroyModal()">Hủy</button>
        <button nz-button nzType="primary" [nzLoading]="isSubmitting" type="submit">
          {{ isEdit ? 'Cập Nhật' : 'Tạo Lớp Học' }}
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
export class ClassFormDialogComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA, { optional: true });
  @Input() centerClass?: CenterClass;
  @Input() isEdit = false;

  form!: FormGroup;
  isSubmitting = false;

  courses: Course[] = [];
  teachers: Teacher[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private courseService: CourseService,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    if (this.nzModalData) {
      if (this.nzModalData.centerClass) this.centerClass = this.nzModalData.centerClass;
      if (this.nzModalData.isEdit !== undefined) this.isEdit = this.nzModalData.isEdit;
    }

    this.form = this.fb.group({
      classCode: [this.centerClass?.classCode || CodeGenerator.generateClassCode(), !this.isEdit ? [Validators.required] : []],
      name: [this.centerClass?.name || '', [Validators.required]],
      courseId: [this.centerClass?.course?.id || this.centerClass?.courseId || null, !this.isEdit ? [Validators.required] : []],
      teacherId: [this.centerClass?.teacher?.id || this.centerClass?.teacherId || null, [Validators.required]],
      startDate: [this.centerClass?.startDate ? new Date(this.centerClass.startDate) : null, [Validators.required]],
      endDate: [this.centerClass?.endDate ? new Date(this.centerClass.endDate) : null],
      maxStudents: [this.centerClass?.maxStudents || 25, [Validators.required, Validators.min(1)]],
      room: [this.centerClass?.room || this.centerClass?.defaultRoom || ''],
      status: [this.centerClass?.status || 'PLANNING']
    });

    this.loadDropdownData();
  }

  regenerateCode(): void {
    this.form.patchValue({ classCode: CodeGenerator.generateClassCode() });
  }

  loadDropdownData(): void {
    this.courseService.getCourses(0, 100, undefined, 'ACTIVE').subscribe(res => {
      this.courses = res.data.content;
    });
    this.teacherService.getTeachers(0, 100, undefined, 'ACTIVE').subscribe(res => {
      this.teachers = res.data.content;
    });
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
    const payload = {
      ...val,
      startDate: val.startDate ? this.formatDate(val.startDate) : null,
      endDate: val.endDate ? this.formatDate(val.endDate) : null
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

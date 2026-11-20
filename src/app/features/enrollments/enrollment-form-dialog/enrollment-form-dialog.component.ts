import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { Student } from '../../../core/models/student.model';
import { Course } from '../../../core/models/course.model';
import { CenterClass } from '../../../core/models/class.model';
import { StudentService } from '../../../core/services/student.service';
import { CourseService } from '../../../core/services/course.service';
import { ClassService } from '../../../core/services/class.service';

@Component({
  selector: 'app-enrollment-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzButtonModule,
    NzGridModule
  ],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()" nzLayout="vertical">
      <nz-form-item>
        <nz-form-label nzRequired>Chọn Học Viên Đăng Ký</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng chọn học viên!">
          <nz-select formControlName="studentId" nzPlaceHolder="-- Tìm theo mã, tên hoặc SĐT --" nzShowSearch>
            <nz-option
              *ngFor="let s of students"
              [nzValue]="s.id"
              [nzLabel]="s.studentCode + ' - ' + s.fullName + ' (' + s.phone + ')'"
            ></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired>Chọn Khóa Học</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng chọn khóa học!">
          <nz-select
            formControlName="courseId"
            (ngModelChange)="onCourseChange($event)"
            nzPlaceHolder="-- Chọn chương trình đào tạo --"
            nzShowSearch
          >
            <nz-option
              *ngFor="let c of courses"
              [nzValue]="c.id"
              [nzLabel]="c.name + ' - Học phí: ' + ((c.tuitionFee || c.standardFee || 0) | number) + ' đ'"
            ></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label>Xếp Lớp Trực Tiếp (Tùy chọn)</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="classId" nzPlaceHolder="-- Chọn lớp học mở cho khóa này (nếu có) --">
            <nz-option [nzValue]="null" nzLabel="-- Chưa xếp lớp (Xếp lớp sau) --"></nz-option>
            <nz-option
              *ngFor="let cl of availableClasses"
              [nzValue]="cl.id"
              [nzLabel]="cl.classCode + ' - ' + cl.name + ' (' + cl.currentStudents + '/' + cl.maxStudents + ' HV)'"
            ></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Học Phí Áp Dụng (VNĐ)</nz-form-label>
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
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>Giảm Giá / Học Bổng (VNĐ)</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="discountAmount"
                [nzMin]="0"
                [nzStep]="100000"
                [nzFormatter]="formatterVND"
                [nzParser]="parserVND"
                style="width: 100%;"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <nz-form-item>
        <nz-form-label>Ghi Chú Đăng Ký</nz-form-label>
        <nz-form-control>
          <textarea nz-input formControlName="note" rows="2" placeholder="Ghi chú tư vấn, chính sách ưu đãi..."></textarea>
        </nz-form-control>
      </nz-form-item>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" type="button" (click)="destroyModal()">Hủy</button>
        <button nz-button nzType="primary" [nzLoading]="isSubmitting" type="submit">
          Xác Nhận Đăng Ký
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
export class EnrollmentFormDialogComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  students: Student[] = [];
  courses: Course[] = [];
  availableClasses: CenterClass[] = [];

  formatterVND = (value: number): string => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  parserVND = (value: string): string => value.replace(/\$\s?|(,*)/g, '');

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private studentService: StudentService,
    private courseService: CourseService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      studentId: [null, [Validators.required]],
      courseId: [null, [Validators.required]],
      classId: [null],
      tuitionFee: [0, [Validators.required, Validators.min(0)]],
      discountAmount: [0, [Validators.min(0)]],
      note: ['']
    });

    this.loadData();
  }

  loadData(): void {
    this.studentService.getStudents(0, 200, undefined, 'STUDYING').subscribe(res => {
      this.students = res.data.content;
    });
    this.courseService.getCourses(0, 100, undefined, 'ACTIVE').subscribe(res => {
      this.courses = res.data.content;
    });
  }

  onCourseChange(courseId: number): void {
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      this.form.patchValue({
        tuitionFee: course.tuitionFee || course.standardFee || 0
      });

      this.classService.getClasses(0, 100, undefined, 'OPEN').subscribe(res => {
        this.availableClasses = res.data.content.filter(cl => (cl.course?.id || cl.courseId) === courseId);
      });
    }
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

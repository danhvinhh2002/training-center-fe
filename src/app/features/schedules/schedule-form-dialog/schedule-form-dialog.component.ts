import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Schedule } from '../../../core/models/schedule.model';
import { CenterClass } from '../../../core/models/class.model';
import { Teacher } from '../../../core/models/teacher.model';
import { ClassService } from '../../../core/services/class.service';
import { TeacherService } from '../../../core/services/teacher.service';

@Component({
  selector: 'app-schedule-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzToolTipModule
  ],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()" nzLayout="vertical">
      <nz-form-item *ngIf="!isEdit">
        <nz-form-label nzRequired>Lớp Học</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng chọn lớp học!">
          <nz-select
            formControlName="classId"
            (ngModelChange)="onClassChange($event)"
            nzPlaceHolder="-- Chọn lớp học --"
            nzShowSearch
          >
            <nz-option *ngFor="let c of classes" [nzValue]="c.id" [nzLabel]="c.classCode + ' - ' + c.name"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzRequired>Giáo Viên Đứng Lớp</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng chọn giảng viên!">
          <nz-select formControlName="teacherId" nzPlaceHolder="-- Chọn giảng viên --" nzShowSearch>
            <nz-option *ngFor="let t of teachers" [nzValue]="t.id" [nzLabel]="t.fullName + ' (' + t.specialization + ')'"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Ngày Học</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng chọn ngày học!">
              <nz-date-picker formControlName="learningDate" nzFormat="dd/MM/yyyy" style="width: 100%;"></nz-date-picker>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label>Buổi Số (tùy chọn)</nz-form-label>
            <nz-form-control>
              <input nz-input type="number" min="1" formControlName="sessionNumber" placeholder="Tự động tính nếu để trống" />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <nz-form-item>
        <nz-form-label nzRequired>Phòng Học</nz-form-label>
        <nz-form-control nzErrorTip="Vui lòng nhập phòng học!">
          <input nz-input formControlName="room" placeholder="VD: P.301" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label>Loại Buổi Học</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="sessionType" (ngModelChange)="onSessionTypeChange($event)">
            <nz-option nzValue="REGULAR" [nzLabel]="'Buổi học chính quy (' + currentHoursPerLesson + 'h/buổi)'"></nz-option>
            <nz-option nzValue="MIDTERM" nzLabel="Kiểm tra giữa kỳ (Midterm Test - 1.5h)"></nz-option>
            <nz-option nzValue="FINAL_EXAM" nzLabel="Thi kết thúc khóa (Final Exam - 2.0h)"></nz-option>
            <nz-option nzValue="TUTORING" nzLabel="Phụ đạo / Học bù (1.0h)"></nz-option>
            <nz-option nzValue="CUSTOM" nzLabel="Tự nhập thời lượng tùy chỉnh"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Giờ Bắt Đầu</nz-form-label>
            <nz-form-control nzErrorTip="VD: 18:00:00">
              <input nz-input formControlName="startTime" placeholder="18:00:00" />
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Giờ Kết Thúc</nz-form-label>
            <nz-form-control nzErrorTip="VD: 20:00:00">
              <nz-input-group [nzSuffix]="resetEndTpl">
                <input nz-input formControlName="endTime" (input)="onEndTimeManualInput()" placeholder="20:00:00" />
              </nz-input-group>
              <ng-template #resetEndTpl>
                <span
                  nz-icon
                  nzType="sync"
                  (click)="resetEndTimeToAuto()"
                  nz-tooltip
                  nzTooltipTitle="Tự động tính lại theo loại buổi học"
                  style="cursor: pointer; color: #1890ff;"
                ></span>
              </ng-template>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>
      <div style="margin: -8px 0 16px 0; font-size: 12px; color: #1890ff;">
        ⏱ <i>Giờ kết thúc được tự động tính (<b>{{ getEffectiveDuration() }} giờ</b>). Bạn có thể tự chỉnh lại giờ kết thúc nếu cần thiết.</i>
      </div>

      <nz-form-item>
        <nz-form-label>Nội Dung Giảng Dạy / Chủ Đề Buổi Học</nz-form-label>
        <nz-form-control>
          <input nz-input formControlName="topic" placeholder="VD: Unit 3 - Reading & Writing Skills" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item *ngIf="isEdit">
        <nz-form-label nzRequired>Trạng Thái Buổi Học</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="status">
            <nz-option nzValue="SCHEDULED" nzLabel="Theo lịch (SCHEDULED)"></nz-option>
            <nz-option nzValue="COMPLETED" nzLabel="Đã diễn ra (COMPLETED)"></nz-option>
            <nz-option nzValue="CANCELLED" nzLabel="Đã hủy (CANCELLED)"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" type="button" (click)="destroyModal()">Hủy</button>
        <button nz-button nzType="primary" [nzLoading]="isSubmitting" type="submit">
          {{ isEdit ? 'Cập Nhật' : 'Lưu Lịch Học' }}
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
export class ScheduleFormDialogComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA, { optional: true });
  @Input() schedule?: Schedule;
  @Input() isEdit = false;

  form!: FormGroup;
  isSubmitting = false;

  classes: CenterClass[] = [];
  teachers: Teacher[] = [];
  currentHoursPerLesson = 2.0;
  sessionType: 'REGULAR' | 'MIDTERM' | 'FINAL_EXAM' | 'TUTORING' | 'CUSTOM' = 'REGULAR';
  isEndTimeManual = false;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private classService: ClassService,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    if (this.nzModalData) {
      if (this.nzModalData.schedule) this.schedule = this.nzModalData.schedule;
      if (this.nzModalData.isEdit !== undefined) this.isEdit = this.nzModalData.isEdit;
    }

    if (this.schedule?.centerClass?.hoursPerLesson) {
      this.currentHoursPerLesson = this.schedule.centerClass.hoursPerLesson;
    }

    const initialDate = this.schedule?.learningDate || this.schedule?.studyDate || this.nzModalData?.initialDate;

    this.form = this.fb.group({
      classId: [this.schedule?.centerClass?.id || this.schedule?.classId || null, !this.isEdit ? [Validators.required] : []],
      teacherId: [this.schedule?.teacher?.id || this.schedule?.teacherId || null, [Validators.required]],
      sessionNumber: [this.schedule?.sessionNumber || null],
      learningDate: [initialDate ? new Date(initialDate) : null, [Validators.required]],
      startTime: [this.schedule?.startTime || '18:00:00', [Validators.required]],
      endTime: [this.schedule?.endTime || '20:00:00', [Validators.required]],
      room: [this.schedule?.room || '', [Validators.required]],
      topic: [this.schedule?.topic || ''],
      sessionType: [this.isEdit ? 'CUSTOM' : 'REGULAR'],
      status: [this.schedule?.status || 'SCHEDULED']
    });

    if (this.isEdit) {
      this.sessionType = 'CUSTOM';
      this.isEndTimeManual = true;
    }

    this.form.get('startTime')?.valueChanges.subscribe(() => {
      if (!this.isEndTimeManual) {
        this.autoCalculateEndTime();
      }
    });

    this.loadData();
  }

  getEffectiveDuration(): number {
    switch (this.sessionType) {
      case 'MIDTERM': return 1.5;
      case 'FINAL_EXAM': return 2.0;
      case 'TUTORING': return 1.0;
      case 'CUSTOM': {
        const start = this.form?.get('startTime')?.value;
        const end = this.form?.get('endTime')?.value;
        if (start && end) {
          const sParts = start.split(':');
          const eParts = end.split(':');
          if (sParts.length >= 2 && eParts.length >= 2) {
            const diff = (parseInt(eParts[0], 10) * 60 + parseInt(eParts[1], 10)) - (parseInt(sParts[0], 10) * 60 + parseInt(sParts[1], 10));
            if (diff > 0) return Math.round((diff / 60) * 10) / 10;
          }
        }
        return this.currentHoursPerLesson;
      }
      default: return this.currentHoursPerLesson;
    }
  }

  onEndTimeManualInput(): void {
    this.isEndTimeManual = true;
    this.sessionType = 'CUSTOM';
  }

  resetEndTimeToAuto(): void {
    this.isEndTimeManual = false;
    this.sessionType = 'REGULAR';
    this.autoCalculateEndTime();
  }

  onSessionTypeChange(type: 'REGULAR' | 'MIDTERM' | 'FINAL_EXAM' | 'TUTORING' | 'CUSTOM'): void {
    this.sessionType = type;
    this.isEndTimeManual = (type === 'CUSTOM');
    if (type === 'MIDTERM') {
      if (!this.form.get('topic')?.value) {
        this.form.patchValue({ topic: 'Kiểm tra giữa kỳ (Midterm Test)' });
      }
    } else if (type === 'FINAL_EXAM') {
      if (!this.form.get('topic')?.value) {
        this.form.patchValue({ topic: 'Thi kết thúc khóa học (Final Exam)' });
      }
    } else if (type === 'TUTORING') {
      if (!this.form.get('topic')?.value) {
        this.form.patchValue({ topic: 'Buổi học bù / Phụ đạo kiến thức' });
      }
    }
    this.autoCalculateEndTime();
  }

  autoCalculateEndTime(): void {
    if (this.isEndTimeManual) return;
    const startTimeStr = this.form.get('startTime')?.value;
    const duration = this.getEffectiveDuration();
    if (!startTimeStr || !duration) return;

    const parts = startTimeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const totalMinutes = Math.round(hours * 60 + minutes + duration * 60);
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMins = totalMinutes % 60;
        const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;
        this.form.patchValue({ endTime: formattedEndTime }, { emitEvent: false });
      }
    }
  }

  loadData(): void {
    this.classService.getClasses(0, 100, undefined, 'OPENING').subscribe(res => {
      this.classes = res.data.content;
      const initialClassId = this.form.get('classId')?.value;
      if (initialClassId) {
        const found = this.classes.find(c => c.id === initialClassId);
        if (found?.hoursPerLesson) {
          this.currentHoursPerLesson = found.hoursPerLesson;
        }
      }
    });
    this.teacherService.getTeachers(0, 100, undefined, 'ACTIVE').subscribe(res => {
      this.teachers = res.data.content;
    });
  }

  onClassChange(classId: number): void {
    const cls = this.classes.find(c => c.id === classId);
    if (cls) {
      if (cls.hoursPerLesson) {
        this.currentHoursPerLesson = cls.hoursPerLesson;
      }
      const teacherId = cls.teacher?.id || cls.teacherId;
      if (teacherId) {
        this.form.patchValue({ teacherId });
      }
      const room = cls.room || cls.defaultRoom;
      if (room) {
        this.form.patchValue({ room });
      }
      this.autoCalculateEndTime();
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

    const val = { ...this.form.value };
    delete val.sessionType;
    const formattedDate = val.learningDate ? this.formatDate(val.learningDate) : null;
    const payload = {
      ...val,
      studyDate: formattedDate,
      learningDate: formattedDate,
      sessionNumber: val.sessionNumber ? Number(val.sessionNumber) : undefined
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

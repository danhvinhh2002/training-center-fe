import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CenterClass } from '../../../core/models/class.model';
import { Teacher } from '../../../core/models/teacher.model';
import { ClassService } from '../../../core/services/class.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import {
  GenerateRecurringScheduleRequest,
  GenerateRecurringScheduleResponse,
  RecurringScheduleItemResponse
} from '../../../core/models/schedule.model';

@Component({
  selector: 'app-recurring-schedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzTagModule,
    NzAlertModule,
    NzTableModule
  ],
  template: `
    <div class="recurring-dialog-container">
      <form nz-form [formGroup]="form" nzLayout="vertical">
        <nz-form-item>
          <nz-form-label nzRequired>Chọn Lớp Học Cần Xếp Lịch</nz-form-label>
          <nz-form-control nzErrorTip="Vui lòng chọn lớp học!">
            <nz-select
              formControlName="classId"
              (ngModelChange)="onClassChange($event)"
              nzPlaceHolder="-- Chọn lớp học --"
              nzShowSearch
            >
              <nz-option
                *ngFor="let c of classes"
                [nzValue]="c.id"
                [nzLabel]="c.classCode + ' - ' + c.name + ' (' + (c.totalLessons || 30) + ' buổi)'"
              ></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzXs]="24" [nzSm]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Giảng Viên Phụ Trách</nz-form-label>
              <nz-form-control nzErrorTip="Vui lòng chọn giảng viên!">
                <nz-select formControlName="teacherId" nzPlaceHolder="-- Chọn giảng viên --" nzShowSearch>
                  <nz-option *ngFor="let t of teachers" [nzValue]="t.id" [nzLabel]="t.fullName + ' (' + t.specialization + ')'"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzXs]="24" [nzSm]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Phòng Học</nz-form-label>
              <nz-form-control nzErrorTip="Vui lòng nhập phòng học!">
                <input nz-input formControlName="room" placeholder="VD: Phòng 301" />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzXs]="24" [nzSm]="8">
            <nz-form-item>
              <nz-form-label nzRequired>Ngày Bắt Đầu</nz-form-label>
              <nz-form-control nzErrorTip="Vui lòng chọn ngày bắt đầu!">
                <nz-date-picker formControlName="startDate" nzFormat="dd/MM/yyyy" style="width: 100%;"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzXs]="24" [nzSm]="8">
            <nz-form-item>
              <nz-form-label nzRequired>Giờ Bắt Đầu</nz-form-label>
              <nz-form-control nzErrorTip="VD: 18:00:00">
                <input nz-input formControlName="startTime" (ngModelChange)="autoCalculateEndTime()" placeholder="18:00:00" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzXs]="24" [nzSm]="8">
            <nz-form-item>
              <nz-form-label nzRequired>Giờ Kết Thúc</nz-form-label>
              <nz-form-control nzErrorTip="VD: 20:00:00">
                <input nz-input formControlName="endTime" placeholder="20:00:00" />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <!-- Chọn thứ trong tuần -->
        <nz-form-item>
          <nz-form-label nzRequired>Lịch Học Định Kỳ Trong Tuần</nz-form-label>
          <nz-form-control>
            <div class="preset-buttons">
              <button nz-button nzType="dashed" nzSize="small" type="button" (click)="applyPreset([1, 3, 5])">Thứ 2 - 4 - 6</button>
              <button nz-button nzType="dashed" nzSize="small" type="button" (click)="applyPreset([2, 4, 6])">Thứ 3 - 5 - 7</button>
              <button nz-button nzType="dashed" nzSize="small" type="button" (click)="applyPreset([6, 7])">Cuối tuần (T7 - CN)</button>
              <button nz-button nzType="dashed" nzSize="small" type="button" (click)="applyPreset([1, 2, 3, 4, 5])">T2 đến T6</button>
            </div>
            <div class="days-checkbox-group">
              <label
                *ngFor="let day of weekDays"
                class="day-chip"
                [class.selected]="selectedDays.includes(day.value)"
                (click)="toggleDay(day.value)"
              >
                {{ day.label }}
              </label>
            </div>
          </nz-form-control>
        </nz-form-item>

        <div nz-row [nzGutter]="16" nzAlign="middle">
          <div nz-col [nzXs]="24" [nzSm]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Tổng Số Buổi Cần Xếp Lịch</nz-form-label>
              <nz-form-control nzErrorTip="Vui lòng nhập số buổi!">
                <nz-input-number formControlName="totalSessions" [nzMin]="1" [nzMax]="120" style="width: 100%;"></nz-input-number>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzXs]="24" [nzSm]="12" style="padding-top: 10px;">
            <button
              nz-button
              nzType="default"
              type="button"
              [nzLoading]="isPreviewing"
              (click)="onPreviewSchedule()"
              style="width: 100%; border-color: #1890ff; color: #1890ff;"
            >
              <span nz-icon nzType="eye"></span>
              <span>Kiểm Tra Trùng Lịch & Xem Trước</span>
            </button>
          </div>
        </div>
      </form>

      <!-- Preview Section -->
      <div *ngIf="previewResult" class="preview-section">
        <nz-alert
          *ngIf="previewResult.conflictCount === 0"
          nzType="success"
          nzShowIcon
          [nzMessage]="'Hợp lệ! ' + previewResult.totalGenerated + ' buổi học đều sẵn sàng, không bị trùng phòng học hay giáo viên.'"
        ></nz-alert>

        <nz-alert
          *ngIf="previewResult.conflictCount > 0"
          nzType="error"
          nzShowIcon
          [nzMessage]="'Phát hiện ' + previewResult.conflictCount + ' buổi học bị xung đột! Vui lòng xem chi tiết bên dưới để điều chỉnh.'"
        ></nz-alert>

        <div style="max-height: 260px; overflow-y: auto; margin-top: 12px; border: 1px solid #f0f0f0; border-radius: 6px;">
          <nz-table
            #previewTable
            [nzData]="previewResult.sessions"
            [nzShowPagination]="false"
            nzSize="small"
          >
            <thead>
              <tr>
                <th nzWidth="60px">Buổi</th>
                <th>Thứ & Ngày Học</th>
                <th>Giờ Học</th>
                <th>Phòng</th>
                <th>Chủ Đề</th>
                <th nzWidth="140px">Kiểm Tra</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of previewTable.data" [style.background]="s.hasCollision ? '#fff1f0' : 'inherit'">
                <td><strong>#{{ s.sessionNumber }}</strong></td>
                <td>
                  <span style="font-weight: 500;">{{ s.dayOfWeekName }}</span>, {{ s.studyDate | date:'dd/MM/yyyy' }}
                </td>
                <td>{{ s.startTime }} - {{ s.endTime }}</td>
                <td>{{ s.room }}</td>
                <td><span style="font-size: 12px; color: #595959;">{{ s.topic }}</span></td>
                <td>
                  <nz-tag *ngIf="!s.hasCollision" nzColor="success">
                    <span nz-icon nzType="check"></span> Hợp lệ
                  </nz-tag>
                  <nz-tag *ngIf="s.hasCollision" nzColor="error" [title]="s.collisionReason">
                    <span nz-icon nzType="warning"></span> {{ s.collisionReason }}
                  </nz-tag>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>
      </div>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" type="button" (click)="destroyModal()">Đóng</button>
        <button
          nz-button
          nzType="primary"
          [nzLoading]="isSubmitting"
          [disabled]="!previewResult || previewResult.conflictCount > 0"
          type="button"
          (click)="onSubmitRecurring()"
        >
          <span nz-icon nzType="save"></span>
          <span>Lưu Toàn Bộ Lịch Học ({{ previewResult?.totalGenerated || 0 }} buổi)</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .recurring-dialog-container {
      max-height: 75vh;
      overflow-y: auto;
      padding-right: 4px;
    }
    .preset-buttons {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .days-checkbox-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .day-chip {
      padding: 5px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s;
      background: #fafafa;

      &:hover {
        border-color: #1890ff;
        color: #1890ff;
      }

      &.selected {
        background: #1890ff;
        color: #ffffff;
        border-color: #1890ff;
        font-weight: 500;
      }
    }
    .preview-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed #d9d9d9;
    }
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
export class RecurringScheduleDialogComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA, { optional: true });

  form!: FormGroup;
  classes: CenterClass[] = [];
  teachers: Teacher[] = [];

  currentHoursPerLesson = 2.0;
  selectedDays: number[] = [1, 3, 5]; // Mặc định 2 - 4 - 6

  weekDays = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 7, label: 'Chủ Nhật' }
  ];

  isPreviewing = false;
  isSubmitting = false;
  previewResult: GenerateRecurringScheduleResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private classService: ClassService,
    private teacherService: TeacherService,
    private scheduleService: ScheduleService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    // Khai giảng sau 3 ngày
    const nextStart = new Date();
    nextStart.setDate(today.getDate() + 3);

    this.form = this.fb.group({
      classId: [null, [Validators.required]],
      teacherId: [null, [Validators.required]],
      room: ['', [Validators.required]],
      startDate: [nextStart, [Validators.required]],
      startTime: ['18:00:00', [Validators.required]],
      endTime: ['20:00:00', [Validators.required]],
      totalSessions: [30, [Validators.required, Validators.min(1)]]
    });

    this.loadData();
  }

  loadData(): void {
    this.classService.getClasses(0, 100, undefined, 'OPENING').subscribe(res => {
      this.classes = res.data.content;
      if (this.nzModalData?.classId) {
        this.form.patchValue({ classId: this.nzModalData.classId });
        this.onClassChange(this.nzModalData.classId);
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
      if (cls.totalLessons) {
        this.form.patchValue({ totalSessions: cls.totalLessons });
      }
      const teacherId = cls.teacher?.id || cls.teacherId;
      if (teacherId) {
        this.form.patchValue({ teacherId });
      }
      const room = cls.room || cls.defaultRoom;
      if (room) {
        this.form.patchValue({ room });
      }
      if (cls.startDate) {
        this.form.patchValue({ startDate: new Date(cls.startDate) });
      }
      this.autoCalculateEndTime();
      this.previewResult = null;
    }
  }

  applyPreset(days: number[]): void {
    this.selectedDays = [...days];
    this.previewResult = null;
  }

  toggleDay(day: number): void {
    if (this.selectedDays.includes(day)) {
      if (this.selectedDays.length > 1) {
        this.selectedDays = this.selectedDays.filter(d => d !== day);
      } else {
        this.msg.warning('Phải chọn ít nhất một thứ trong tuần!');
      }
    } else {
      this.selectedDays = [...this.selectedDays, day].sort((a, b) => a - b);
    }
    this.previewResult = null;
  }

  autoCalculateEndTime(): void {
    const startTimeStr = this.form.get('startTime')?.value;
    if (!startTimeStr || !this.currentHoursPerLesson) return;

    const parts = startTimeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const totalMinutes = Math.round(hours * 60 + minutes + this.currentHoursPerLesson * 60);
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMins = totalMinutes % 60;
        const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;
        this.form.patchValue({ endTime: formattedEndTime }, { emitEvent: false });
      }
    }
    this.previewResult = null;
  }

  private buildPayload(previewOnly: boolean): GenerateRecurringScheduleRequest | null {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return null;
    }

    if (this.selectedDays.length === 0) {
      this.msg.warning('Vui lòng chọn ít nhất một thứ trong tuần!');
      return null;
    }

    const val = this.form.value;
    const formattedStartDate = this.formatDate(val.startDate);

    return {
      classId: val.classId,
      teacherId: val.teacherId,
      room: val.room,
      startDate: formattedStartDate,
      startTime: val.startTime,
      endTime: val.endTime,
      daysOfWeek: this.selectedDays,
      totalSessions: Number(val.totalSessions),
      previewOnly
    };
  }

  onPreviewSchedule(): void {
    const payload = this.buildPayload(true);
    if (!payload) return;

    this.isPreviewing = true;
    this.scheduleService.generateRecurringSchedules(payload).subscribe({
      next: res => {
        this.isPreviewing = false;
        this.previewResult = res.data;
        if (res.data.conflictCount === 0) {
          this.msg.success(res.data.message);
        } else {
          this.msg.error(res.data.message);
        }
      },
      error: err => {
        this.isPreviewing = false;
        this.msg.error(err.error?.message || 'Lỗi khi kiểm tra lịch học');
      }
    });
  }

  onSubmitRecurring(): void {
    const payload = this.buildPayload(false);
    if (!payload) return;

    this.isSubmitting = true;
    this.scheduleService.generateRecurringSchedules(payload).subscribe({
      next: res => {
        this.isSubmitting = false;
        this.msg.success(res.data.message);
        this.modalRef.close(res.data);
      },
      error: err => {
        this.isSubmitting = false;
        this.msg.error(err.error?.message || 'Lỗi khi lưu lịch học tự động');
      }
    });
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AttendanceService } from '../../../core/services/attendance.service';
import { StudentService } from '../../../core/services/student.service';
import { Attendance, AttendanceStatistics, AttendanceStatus } from '../../../core/models/attendance.model';
import { StudentClass } from '../../../core/models/student.model';

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzProgressModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzAlertModule,
    NzEmptyModule,
    NzSpinModule
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-title">
          <h2>Chuyên Cần & Báo Cáo Điểm Danh</h2>
          <p>Theo dõi tỷ lệ chuyên cần qua từng buổi học và gửi đơn xin nghỉ phép trực tuyến</p>
        </div>
        <div class="header-actions">
          <button nz-button nzType="primary" (click)="openLeaveRequestModal()">
            <span nz-icon nzType="form"></span>
            <span>Gửi Đơn Xin Nghỉ Phép</span>
          </button>
        </div>
      </div>

      <!-- Absence Warning Alert -->
      <nz-alert
        *ngIf="stats && stats.absentCount >= 3"
        nzType="error"
        nzShowIcon
        nzCloseable
        class="warning-alert"
        [nzMessage]="'Cảnh báo chuyên cần: Bạn đã vắng ' + stats.absentCount + ' buổi học!'"
        nzDescription="Quy định trung tâm yêu cầu học viên không vắng quá 20% tổng số buổi để đủ điều kiện làm đồ án và thi cấp chứng chỉ tốt nghiệp. Vui lòng gửi đơn xin nghỉ phép nếu có việc bận đột xuất."
      ></nz-alert>

      <!-- Stats Row -->
      <div class="stats-row" *ngIf="stats">
        <!-- Attendance Rate Card -->
        <div class="stat-card rate-card">
          <div class="rate-content">
            <nz-progress
              [nzPercent]="stats.attendanceRate"
              [nzStrokeColor]="getRateColor(stats.attendanceRate)"
              nzType="circle"
              [nzWidth]="80"
            ></nz-progress>
            <div class="rate-text">
              <span class="rate-label">Tỷ lệ chuyên cần</span>
              <span class="rate-value" [style.color]="getRateColor(stats.attendanceRate)">
                {{ stats.attendanceRate }}%
              </span>
              <span class="total-sessions">Đã học: {{ stats.totalSessions }} buổi</span>
            </div>
          </div>
        </div>

        <!-- Present Card -->
        <div class="stat-card count-card present">
          <div class="stat-icon-wrapper">
            <span nz-icon nzType="check-circle" nzTheme="outline"></span>
          </div>
          <div class="stat-details">
            <span class="count">{{ stats.presentCount }}</span>
            <span class="label">Buổi có mặt</span>
          </div>
        </div>

        <!-- Late Card -->
        <div class="stat-card count-card late">
          <div class="stat-icon-wrapper">
            <span nz-icon nzType="clock-circle" nzTheme="outline"></span>
          </div>
          <div class="stat-details">
            <span class="count">{{ stats.lateCount }}</span>
            <span class="label">Buổi đi muộn</span>
          </div>
        </div>

        <!-- Excused Card -->
        <div class="stat-card count-card excused">
          <div class="stat-icon-wrapper">
            <span nz-icon nzType="file-text" nzTheme="outline"></span>
          </div>
          <div class="stat-details">
            <span class="count">{{ stats.excusedCount }}</span>
            <span class="label">Vắng có phép</span>
          </div>
        </div>

        <!-- Absent Card -->
        <div class="stat-card count-card absent">
          <div class="stat-icon-wrapper">
            <span nz-icon nzType="close-circle" nzTheme="outline"></span>
          </div>
          <div class="stat-details">
            <span class="count">{{ stats.absentCount }}</span>
            <span class="label">Vắng không phép</span>
          </div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">Lọc theo lớp học:</span>
          <nz-select
            [(ngModel)]="selectedClassId"
            (ngModelChange)="onClassFilterChange()"
            class="class-select"
            nzPlaceHolder="Tất cả các lớp"
          >
            <nz-option [nzValue]="null" nzLabel="Tất cả các lớp của tôi"></nz-option>
            <nz-option
              *ngFor="let c of myClasses"
              [nzValue]="c.classId"
              [nzLabel]="c.classCode + ' - ' + c.className"
            ></nz-option>
          </nz-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">Trạng thái:</span>
          <nz-select
            [(ngModel)]="selectedStatus"
            (ngModelChange)="filterAttendanceHistory()"
            class="status-select"
          >
            <nz-option nzValue="ALL" nzLabel="Tất cả trạng thái"></nz-option>
            <nz-option nzValue="PRESENT" nzLabel="Có mặt"></nz-option>
            <nz-option nzValue="LATE" nzLabel="Đi muộn"></nz-option>
            <nz-option nzValue="EXCUSED" nzLabel="Vắng có phép"></nz-option>
            <nz-option nzValue="ABSENT" nzLabel="Vắng không phép"></nz-option>
          </nz-select>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-container">
        <nz-table
          #attendanceTable
          [nzData]="filteredAttendance"
          [nzLoading]="loading"
          [nzPageSize]="10"
          nzBordered
          class="custom-table"
        >
          <thead>
            <tr>
              <th nzWidth="120px">Ngày học</th>
              <th nzWidth="130px">Khung giờ</th>
              <th nzWidth="90px" nzAlign="center">Buổi số</th>
              <th>Lớp học</th>
              <th>Giáo viên / Phòng</th>
              <th>Chủ đề bài học</th>
              <th nzWidth="150px" nzAlign="center">Trạng thái</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of attendanceTable.data">
              <td>
                <span class="date-text">
                  {{ record.studyDate ? (record.studyDate | date:'dd/MM/yyyy') : (record.checkinTime | date:'dd/MM/yyyy') }}
                </span>
              </td>
              <td>
                <span class="time-text" *ngIf="record.startTime && record.endTime">
                  {{ record.startTime }} - {{ record.endTime }}
                </span>
                <span *ngIf="!record.startTime">-</span>
              </td>
              <td nzAlign="center">
                <span class="session-badge" *ngIf="record.sessionNumber">
                  #{{ record.sessionNumber }}
                </span>
                <span *ngIf="!record.sessionNumber">-</span>
              </td>
              <td>
                <div class="class-cell">
                  <strong>{{ record.className || 'Lớp học' }}</strong>
                  <span class="code" *ngIf="record.classCode">{{ record.classCode }}</span>
                </div>
              </td>
              <td>
                <div class="teacher-cell">
                  <span>{{ record.teacherName || '-' }}</span>
                  <nz-tag *ngIf="record.room" nzColor="default" class="room-tag">{{ record.room }}</nz-tag>
                </div>
              </td>
              <td>
                <span class="topic-text">{{ record.topic || '-' }}</span>
              </td>
              <td nzAlign="center">
                <ng-container [ngSwitch]="record.status">
                  <nz-tag *ngSwitchCase="'PRESENT'" nzColor="success">
                    <span nz-icon nzType="check"></span> Có mặt
                  </nz-tag>
                  <nz-tag *ngSwitchCase="'LATE'" nzColor="warning">
                    <span nz-icon nzType="clock-circle"></span> Đi muộn
                  </nz-tag>
                  <nz-tag *ngSwitchCase="'EXCUSED'" nzColor="processing">
                    <span nz-icon nzType="file-text"></span> Vắng có phép
                  </nz-tag>
                  <nz-tag *ngSwitchCase="'ABSENT'" nzColor="error">
                    <span nz-icon nzType="close-circle"></span> Vắng không phép
                  </nz-tag>
                  <nz-tag *ngSwitchDefault>{{ record.status }}</nz-tag>
                </ng-container>
              </td>
              <td>
                <span class="notes-text" [class.leave-note]="record.notes && record.notes.includes('Đơn xin nghỉ')">
                  {{ record.notes || '-' }}
                </span>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <!-- Leave Request Modal -->
      <nz-modal
        [(nzVisible)]="isLeaveModalVisible"
        nzTitle="Gửi Đơn Xin Nghỉ Phép Buổi Học"
        (nzOnCancel)="closeLeaveModal()"
        [nzOkLoading]="isSubmittingLeave"
        (nzOnOk)="submitLeaveRequest()"
        nzOkText="Xác Nhận Gửi Đơn"
        nzCancelText="Hủy Bỏ"
      >
        <ng-container *nzModalContent>
          <p class="modal-instruction">
            Chọn ca học sắp tới của bạn và nhập lý do xin phép nghỉ. Hệ thống sẽ tự động cập nhật trạng thái
            <strong>Vắng có phép (EXCUSED)</strong> để giáo viên phụ trách nắm được khi điểm danh lớp.
          </p>

          <form nz-form [formGroup]="leaveForm" nzLayout="vertical">
            <nz-form-item>
              <nz-form-label nzRequired>Chọn buổi học cần xin nghỉ</nz-form-label>
              <nz-form-control nzErrorTip="Vui lòng chọn buổi học!">
                <nz-select
                  formControlName="scheduleId"
                  nzPlaceHolder="Chọn ca học sắp diễn ra..."
                  [nzLoading]="loadingSchedules"
                >
                  <nz-option
                    *ngFor="let s of upcomingSchedules"
                    [nzValue]="s.id"
                    [nzLabel]="(s.studyDate | date:'dd/MM/yyyy') + ' (' + s.startTime + ' - ' + s.endTime + ') | ' + s.className + ' | Phòng: ' + s.room"
                  ></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>Lý do xin nghỉ</nz-form-label>
              <nz-form-control nzErrorTip="Vui lòng nhập lý do (tối thiểu 5 ký tự)!">
                <textarea
                  nz-input
                  formControlName="reason"
                  rows="4"
                  placeholder="Ví dụ: Em bị ốm phải đi khám bác sĩ, xin phép thầy/cô cho em nghỉ buổi học này và mượn vở bạn ghi chép lại bài sau ạ..."
                ></textarea>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 4px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .header-title h2 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
    }

    .header-title p {
      color: #64748b;
      margin: 0;
      font-size: 13px;
    }

    .warning-alert {
      margin-bottom: 20px;
      border-radius: 8px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 16px 20px;
      border: 1px solid #f0f0f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
    }

    .rate-card {
      grid-column: span 1;
    }

    .rate-content {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .rate-text {
      display: flex;
      flex-direction: column;
      .rate-label {
        font-size: 12px;
        color: #64748b;
      }
      .rate-value {
        font-size: 22px;
        font-weight: 700;
      }
      .total-sessions {
        font-size: 11px;
        color: #94a3b8;
      }
    }

    .count-card {
      gap: 14px;
    }

    .stat-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 22px;
    }

    .stat-details {
      display: flex;
      flex-direction: column;
      .count {
        font-size: 22px;
        font-weight: 700;
        line-height: 1.1;
      }
      .label {
        font-size: 12px;
        color: #64748b;
      }
    }

    .count-card.present {
      .stat-icon-wrapper { background: #f6ffed; color: #52c41a; }
      .count { color: #52c41a; }
    }

    .count-card.late {
      .stat-icon-wrapper { background: #fffbe6; color: #faad14; }
      .count { color: #faad14; }
    }

    .count-card.excused {
      .stat-icon-wrapper { background: #e6f7ff; color: #1890ff; }
      .count { color: #1890ff; }
    }

    .count-card.absent {
      .stat-icon-wrapper { background: #fff2f0; color: #ff4d4f; }
      .count { color: #ff4d4f; }
    }

    .filter-bar {
      display: flex;
      gap: 20px;
      background: white;
      padding: 16px 20px;
      border-radius: 10px;
      border: 1px solid #f0f0f0;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filter-label {
      font-size: 13px;
      font-weight: 500;
      color: #475569;
    }

    .class-select {
      min-width: 260px;
    }

    .status-select {
      min-width: 160px;
    }

    .table-container {
      background: white;
      border-radius: 10px;
      border: 1px solid #f0f0f0;
      overflow: hidden;
    }

    .date-text {
      font-weight: 600;
      color: #1e293b;
    }

    .time-text {
      font-size: 12px;
      color: #64748b;
    }

    .session-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .class-cell {
      display: flex;
      flex-direction: column;
      .code {
        font-size: 11px;
        color: #1890ff;
      }
    }

    .teacher-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .room-tag {
        width: fit-content;
        margin-top: 2px;
        font-size: 11px;
      }
    }

    .topic-text {
      font-size: 13px;
      color: #334155;
    }

    .notes-text {
      font-size: 12px;
      color: #64748b;
    }

    .leave-note {
      color: #1890ff;
      font-weight: 500;
    }

    .modal-instruction {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 16px;
      line-height: 1.5;
    }
  `]
})
export class MyAttendanceComponent implements OnInit {
  stats: AttendanceStatistics | null = null;
  attendanceHistory: Attendance[] = [];
  filteredAttendance: Attendance[] = [];
  myClasses: StudentClass[] = [];
  upcomingSchedules: any[] = [];

  loading = false;
  loadingSchedules = false;
  selectedClassId: number | null = null;
  selectedStatus = 'ALL';

  // Leave Request Dialog state
  isLeaveModalVisible = false;
  isSubmittingLeave = false;
  leaveForm!: FormGroup;

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initLeaveForm();
    this.loadMyClasses();

    // Check if classId queryParam is present
    this.route.queryParams.subscribe(params => {
      if (params['classId']) {
        this.selectedClassId = +params['classId'];
      }
      this.loadAttendanceData();
    });
  }

  initLeaveForm(): void {
    this.leaveForm = this.fb.group({
      scheduleId: [null, [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  loadMyClasses(): void {
    this.studentService.getMyClasses().subscribe({
      next: (res) => {
        this.myClasses = res.data || [];
      },
      error: () => {}
    });
  }

  loadAttendanceData(): void {
    this.loading = true;

    // Load statistics
    this.attendanceService.getMyAttendanceStatistics(this.selectedClassId || undefined).subscribe({
      next: (res) => {
        this.stats = res.data;
      },
      error: () => {}
    });

    // Load history
    this.attendanceService.getMyAttendanceHistory().subscribe({
      next: (res) => {
        this.loading = false;
        this.attendanceHistory = res.data || [];
        this.filterAttendanceHistory();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onClassFilterChange(): void {
    // Reload stats specifically for this class
    this.attendanceService.getMyAttendanceStatistics(this.selectedClassId || undefined).subscribe({
      next: (res) => {
        this.stats = res.data;
      },
      error: () => {}
    });
    this.filterAttendanceHistory();
  }

  filterAttendanceHistory(): void {
    let result = [...this.attendanceHistory];

    if (this.selectedClassId) {
      result = result.filter(item => item.classId === this.selectedClassId);
    }

    if (this.selectedStatus !== 'ALL') {
      result = result.filter(item => item.status === this.selectedStatus);
    }

    this.filteredAttendance = result;
  }

  getRateColor(rate: number): string {
    if (rate >= 90) return '#52c41a';
    if (rate >= 75) return '#1890ff';
    if (rate >= 60) return '#faad14';
    return '#ff4d4f';
  }

  openLeaveRequestModal(): void {
    this.isLeaveModalVisible = true;
    this.leaveForm.reset();
    this.loadingSchedules = true;

    this.studentService.getMyUpcomingSchedules().subscribe({
      next: (res) => {
        this.loadingSchedules = false;
        this.upcomingSchedules = res.data || [];
      },
      error: () => {
        this.loadingSchedules = false;
      }
    });
  }

  closeLeaveModal(): void {
    this.isLeaveModalVisible = false;
    this.leaveForm.reset();
  }

  submitLeaveRequest(): void {
    if (this.leaveForm.invalid) {
      Object.values(this.leaveForm.controls).forEach(c => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmittingLeave = true;
    this.attendanceService.submitLeaveRequest(this.leaveForm.value).subscribe({
      next: () => {
        this.isSubmittingLeave = false;
        this.isLeaveModalVisible = false;
        this.msg.success('Đơn xin nghỉ phép của bạn đã được ghi nhận thành công!');
        this.loadAttendanceData();
      },
      error: (err) => {
        this.isSubmittingLeave = false;
        this.msg.error(err.error?.message || 'Có lỗi xảy ra khi gửi đơn xin nghỉ phép.');
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ClassService } from '../../../core/services/class.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleType } from '../../../core/models/user.model';
import { CenterClass, ClassStudent } from '../../../core/models/class.model';
import { Schedule } from '../../../core/models/schedule.model';
import { Attendance, AttendanceStatus } from '../../../core/models/attendance.model';

interface AttendanceRow {
  studentId: number;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus;
  notes: string;
}

@Component({
  selector: 'app-attendance-check',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzInputModule,
    NzRadioModule,
    NzTagModule,
    NzGridModule,
    NzAlertModule,
    NzSwitchModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>Điểm Danh Buổi Học</h2>
          <p>Thực hiện kiểm diện chuyên cần theo buổi học của lớp phụ trách (chỉ mở trong khoảng giờ học)</p>
        </div>
        <div class="page-actions" *ngIf="selectedScheduleId && rows.length > 0">
          <button
            nz-button
            nzType="primary"
            [disabled]="!isAttendanceAllowed()"
            [nzLoading]="isSubmitting"
            (click)="saveAttendance()"
          >
            <span nz-icon nzType="save"></span>
            <span>Lưu Điểm Danh & Báo Vắng</span>
          </button>
        </div>
      </div>

      <!-- Selection Filter -->
      <div class="filter-card">
        <div nz-row [nzGutter]="16" nzAlign="middle">
          <div nz-col [nzXs]="24" [nzSm]="12">
            <label style="font-weight: 500; display: block; margin-bottom: 6px;">1. Chọn Lớp Học</label>
            <nz-select
              [(ngModel)]="selectedClassId"
              (ngModelChange)="onClassChange($event)"
              nzPlaceHolder="-- Chọn lớp học --"
              nzShowSearch
              style="width: 100%;"
            >
              <nz-option *ngFor="let c of classes" [nzValue]="c.id" [nzLabel]="c.classCode + ' - ' + c.name"></nz-option>
            </nz-select>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="12">
            <label style="font-weight: 500; display: block; margin-bottom: 6px;">2. Chọn Buổi Học Cần Điểm Danh</label>
            <nz-select
              [(ngModel)]="selectedScheduleId"
              (ngModelChange)="onScheduleChange($event)"
              [nzDisabled]="!selectedClassId || schedules.length === 0"
              nzPlaceHolder="-- Chọn buổi học --"
              style="width: 100%;"
            >
              <nz-option
                *ngFor="let s of schedules"
                [nzValue]="s.id"
                [nzLabel]="getScheduleOptionLabel(s)"
              ></nz-option>
            </nz-select>
          </div>
        </div>
      </div>

      <!-- Schedule Timing Status Banner -->
      <div *ngIf="selectedScheduleTiming" style="margin-top: 16px; margin-bottom: 16px;">
        <nz-alert
          [nzType]="selectedScheduleTiming.alertType"
          nzShowIcon
          [nzMessage]="selectedScheduleTiming.title"
          [nzDescription]="selectedScheduleTiming.message"
        ></nz-alert>

        <!-- Admin Override Toggle if not current session -->
        <div
          *ngIf="isAdminOrManager && selectedScheduleTiming.status !== 'CURRENT'"
          style="margin-top: 10px; padding: 10px 16px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;"
        >
          <div>
            <span nz-icon nzType="safety-certificate" style="color: #faad14; margin-right: 8px; font-size: 16px;"></span>
            <strong>Quyền Quản Trị Viên / Quản Lý:</strong>
            <span style="color: #595959; margin-left: 6px;">Bật quyền ghi đè để điều chỉnh dữ liệu điểm danh ngoài khung giờ học.</span>
          </div>
          <nz-switch [(ngModel)]="adminOverrideEnabled" nzCheckedChildren="Bật ghi đè" nzUnCheckedChildren="Tắt"></nz-switch>
        </div>
      </div>

      <!-- Notification Note -->
      <nz-alert
        *ngIf="rows.length > 0 && isAttendanceAllowed()"
        nzType="info"
        nzShowIcon
        nzMessage="Kênh thông báo tự động (Miễn phí 100%)"
        nzDescription="Hệ thống tự động kích hoạt gửi cảnh báo vắng học tới Email của học viên/phụ huynh và gửi tin nhắn cảnh báo tức thì vào nhóm Telegram Quản lý ngay khi lưu điểm danh VẮNG (ABSENT)."
        style="margin-bottom: 16px;"
      ></nz-alert>

      <!-- Quick Set Buttons Bar -->
      <div *ngIf="rows.length > 0" class="quick-bar">
        <div class="quick-title">
          <span>Sĩ số lớp: <strong>{{ rows.length }}</strong> học viên</span>
          <span *ngIf="!isAttendanceAllowed()" style="margin-left: 12px; color: #ff4d4f; font-weight: 500;">
            🔒 Chế độ xem lịch sử (Chỉ mở lưu điểm danh trong khoảng giờ học)
          </span>
        </div>
        <div class="quick-actions">
          <span>Gán nhanh tất cả:</span>
          <button nz-button nzSize="small" nzType="default" [disabled]="!isAttendanceAllowed()" (click)="setAllStatus(AttendanceStatus.PRESENT)">
            Có mặt (P)
          </button>
          <button nz-button nzSize="small" nzType="default" [disabled]="!isAttendanceAllowed()" (click)="setAllStatus(AttendanceStatus.ABSENT)">
            Vắng (A)
          </button>
          <button nz-button nzSize="small" nzType="default" [disabled]="!isAttendanceAllowed()" (click)="setAllStatus(AttendanceStatus.LATE)">
            Đi muộn (L)
          </button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card" *ngIf="rows.length > 0">
        <nz-table #attTable [nzData]="rows" [nzLoading]="loading" [nzShowPagination]="false" nzSize="middle">
          <thead>
            <tr>
              <th nzWidth="60px">STT</th>
              <th nzWidth="120px">Mã HV</th>
              <th>Họ và Tên</th>
              <th nzWidth="380px" nzAlign="center">Trạng Thái Chuyên Cần</th>
              <th>Ghi Chú / Lý Do</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of attTable.data; let idx = index">
              <td>{{ idx + 1 }}</td>
              <td><strong>{{ row.studentCode }}</strong></td>
              <td><span style="font-weight: 500;">{{ row.studentName }}</span></td>
              <td nzAlign="center">
                <nz-radio-group [(ngModel)]="row.status" [nzDisabled]="!isAttendanceAllowed()" nzButtonStyle="solid">
                  <label nz-radio-button [nzValue]="AttendanceStatus.PRESENT" class="radio-present">
                    <span nz-icon nzType="check"></span> Có mặt
                  </label>
                  <label nz-radio-button [nzValue]="AttendanceStatus.LATE" class="radio-late">
                    <span nz-icon nzType="clock-circle"></span> Muộn
                  </label>
                  <label nz-radio-button [nzValue]="AttendanceStatus.EXCUSED" class="radio-excused">
                    <span nz-icon nzType="file-text"></span> Có phép
                  </label>
                  <label nz-radio-button [nzValue]="AttendanceStatus.ABSENT" class="radio-absent">
                    <span nz-icon nzType="close"></span> Vắng
                  </label>
                </nz-radio-group>
              </td>
              <td>
                <input
                  nz-input
                  [(ngModel)]="row.notes"
                  [disabled]="!isAttendanceAllowed()"
                  placeholder="Lý do đi muộn, xin phép..."
                  style="font-size: 13px;"
                />
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!selectedScheduleId" style="margin-top: 24px;">
        <nz-alert
          nzType="info"
          nzMessage="Hướng dẫn điểm danh"
          nzDescription="Vui lòng chọn Lớp học và Buổi học ở bộ lọc phía trên để hiển thị danh sách học viên cần điểm danh."
          nzShowIcon
        ></nz-alert>
      </div>
    </div>
  `,
  styles: [`
    .quick-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      margin-bottom: 16px;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
    }
    .quick-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .radio-present.ant-radio-button-wrapper-checked {
      background: #52c41a !important;
      border-color: #52c41a !important;
    }
    .radio-late.ant-radio-button-wrapper-checked {
      background: #faad14 !important;
      border-color: #faad14 !important;
    }
    .radio-excused.ant-radio-button-wrapper-checked {
      background: #1890ff !important;
      border-color: #1890ff !important;
    }
    .radio-absent.ant-radio-button-wrapper-checked {
      background: #ff4d4f !important;
      border-color: #ff4d4f !important;
    }
  `]
})
export class AttendanceCheckComponent implements OnInit {
  AttendanceStatus = AttendanceStatus;

  classes: CenterClass[] = [];
  schedules: Schedule[] = [];
  selectedClassId: number | null = null;
  selectedScheduleId: number | null = null;

  isAdminOrManager = false;
  adminOverrideEnabled = false;

  rows: AttendanceRow[] = [];
  loading = false;
  isSubmitting = false;

  constructor(
    private classService: ClassService,
    private scheduleService: ScheduleService,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.isAdminOrManager = this.authService.hasAnyRole([RoleType.ADMIN, RoleType.MANAGER]);

    this.classService.getClasses(0, 100).subscribe(res => {
      this.classes = res.data.content;

      this.route.queryParams.subscribe(params => {
        if (params['scheduleId']) {
          this.selectedScheduleId = +params['scheduleId'];
          this.loadScheduleDetail(this.selectedScheduleId);
        }
      });
    });
  }

  get selectedSchedule(): Schedule | undefined {
    return this.schedules.find(s => s.id === this.selectedScheduleId);
  }

  get selectedScheduleTiming() {
    if (!this.selectedSchedule) return null;
    return this.getScheduleTiming(this.selectedSchedule);
  }

  getScheduleTiming(s: Schedule): {
    status: 'CURRENT' | 'UPCOMING' | 'PAST';
    label: string;
    tagColor: string;
    alertType: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
  } {
    const dateStr = s.learningDate || s.studyDate;
    if (!dateStr || !s.startTime || !s.endTime) {
      return {
        status: 'PAST',
        label: 'Không xác định',
        tagColor: 'default',
        alertType: 'info',
        title: 'Thông tin buổi học',
        message: 'Chưa có thông tin ngày giờ học cụ thể'
      };
    }

    const dParts = dateStr.split('-');
    const sParts = s.startTime.split(':');
    const eParts = s.endTime.split(':');

    const start = new Date(+dParts[0], +dParts[1] - 1, +dParts[2], +sParts[0], +sParts[1], +sParts[2] || 0);
    const end = new Date(+dParts[0], +dParts[1] - 1, +dParts[2], +eParts[0], +eParts[1], +eParts[2] || 0);

    const allowedStart = new Date(start.getTime() - 15 * 60 * 1000); // Mở trước 15 phút
    const allowedEnd = new Date(end.getTime() + 30 * 60 * 1000);     // Khép lại sau 30 phút

    const now = new Date();
    const formattedDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : dateStr;
    const startWindowStr = `${String(allowedStart.getHours()).padStart(2, '0')}:${String(allowedStart.getMinutes()).padStart(2, '0')}`;
    const endWindowStr = `${String(allowedEnd.getHours()).padStart(2, '0')}:${String(allowedEnd.getMinutes()).padStart(2, '0')}`;

    if (now < allowedStart) {
      return {
        status: 'UPCOMING',
        label: '⏳ Chưa đến giờ',
        tagColor: 'orange',
        alertType: 'warning',
        title: 'Chưa Đến Giờ Học (Chưa Cho Phép Điểm Danh)',
        message: `Buổi học diễn ra từ ${s.startTime} đến ${s.endTime} ngày ${formattedDate}. Hệ thống chỉ mở cổng điểm danh trong khoảng giờ học (từ ${startWindowStr}). Bảng danh sách đang ở chế độ xem trước.`
      };
    } else if (now > allowedEnd) {
      return {
        status: 'PAST',
        label: '⚪ Đã qua',
        tagColor: 'default',
        alertType: 'warning',
        title: 'Buổi Học Đã Kết Thúc (Hết Hạn Điểm Danh)',
        message: `Buổi học diễn ra từ ${s.startTime} đến ${s.endTime} ngày ${formattedDate}. Cổng điểm danh đã khép lại lúc ${endWindowStr}. Bảng danh sách đang ở chế độ xem lịch sử (Read-only).`
      };
    } else {
      return {
        status: 'CURRENT',
        label: '🟢 Đang trong giờ học',
        tagColor: 'success',
        alertType: 'success',
        title: 'Đang Trong Khung Giờ Học (Cho Phép Điểm Danh)',
        message: `Buổi học đang diễn ra (${s.startTime} - ${s.endTime}) ngày hôm nay. Giáo viên vui lòng kiểm diện học viên và lưu kết quả điểm danh.`
      };
    }
  }

  getScheduleOptionLabel(s: Schedule): string {
    const timing = this.getScheduleTiming(s);
    const dateStr = s.learningDate || s.studyDate;
    const dParts = (dateStr || '').split('-');
    const formattedDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : dateStr;
    return `[${timing.label}] ${formattedDate} (${s.startTime} - ${s.endTime}) - ${s.topic || s.room || 'Buổi học'}`;
  }

  isAttendanceAllowed(): boolean {
    if (!this.selectedScheduleId) return false;
    const schedule = this.schedules.find(s => s.id === this.selectedScheduleId);
    if (!schedule) return false;
    const timing = this.getScheduleTiming(schedule);
    if (timing.status === 'CURRENT') return true;
    return this.isAdminOrManager && this.adminOverrideEnabled;
  }

  loadScheduleDetail(scheduleId: number): void {
    this.scheduleService.getScheduleById(scheduleId).subscribe(res => {
      const schedule = res.data;
      this.selectedClassId = schedule.centerClass?.id || schedule.classId;
      if (this.selectedClassId) {
        this.onClassChange(this.selectedClassId, scheduleId);
      }
    });
  }

  onClassChange(classId: number, autoSelectScheduleId?: number): void {
    this.selectedClassId = classId;
    this.selectedScheduleId = autoSelectScheduleId || null;
    this.rows = [];
    this.adminOverrideEnabled = false;

    this.scheduleService.getSchedules(0, 100, classId).subscribe(res => {
      this.schedules = res.data.content;
      if (autoSelectScheduleId) {
        this.onScheduleChange(autoSelectScheduleId);
      } else if (this.schedules.length > 0) {
        // Tự động tìm buổi đang trong giờ học nếu có
        const currentSession = this.schedules.find(s => this.getScheduleTiming(s).status === 'CURRENT');
        if (currentSession) {
          this.onScheduleChange(currentSession.id);
        }
      }
    });
  }

  onScheduleChange(scheduleId: number): void {
    this.selectedScheduleId = scheduleId;
    this.adminOverrideEnabled = false;
    this.loadAttendanceRoster();
  }

  loadAttendanceRoster(): void {
    if (!this.selectedClassId || !this.selectedScheduleId) return;

    this.loading = true;
    this.attendanceService.getAttendanceBySchedule(this.selectedScheduleId).subscribe(res => {
      const existingRecords: Attendance[] = res.data;

      this.classService.getClassStudents(this.selectedClassId!).subscribe(rosterRes => {
        const classStudents: ClassStudent[] = rosterRes.data;

        this.rows = classStudents.map(cs => {
          const studentId = cs.student?.id || cs.studentId;
          const studentCode = cs.student?.studentCode || cs.studentCode || '';
          const studentName = cs.student?.fullName || cs.studentName || '';
          const rec = existingRecords.find(r => (r.student?.id || r.studentId) === studentId);
          return {
            studentId,
            studentCode,
            studentName,
            status: rec ? rec.status : AttendanceStatus.PRESENT,
            notes: rec?.notes || ''
          };
        });

        this.loading = false;
      });
    });
  }

  setAllStatus(status: AttendanceStatus): void {
    if (!this.isAttendanceAllowed()) return;
    this.rows.forEach(r => r.status = status);
  }

  saveAttendance(): void {
    if (!this.selectedScheduleId || this.rows.length === 0 || !this.isAttendanceAllowed()) return;

    this.isSubmitting = true;
    const records = this.rows.map(r => ({
      studentId: r.studentId,
      status: r.status,
      notes: r.notes
    }));

    this.attendanceService.batchRecordAttendance({
      scheduleId: this.selectedScheduleId,
      items: records,
      records: records,
      adminOverride: this.isAdminOrManager && this.adminOverrideEnabled
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        const absentCount = this.rows.filter(r => r.status === AttendanceStatus.ABSENT).length;
        if (absentCount > 0) {
          this.msg.success(`Đã lưu điểm danh & tự động kích hoạt thông báo ${absentCount} học viên vắng mặt qua Telegram Bot & Email!`);
        } else {
          this.msg.success('Đã lưu dữ liệu điểm danh thành công!');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.msg.error(err.error?.message || 'Lỗi khi lưu điểm danh');
      }
    });
  }
}

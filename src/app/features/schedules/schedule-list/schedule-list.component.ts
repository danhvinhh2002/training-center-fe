import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ClassService } from '../../../core/services/class.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Schedule, ScheduleStatus } from '../../../core/models/schedule.model';
import { CenterClass } from '../../../core/models/class.model';
import { Teacher } from '../../../core/models/teacher.model';
import { RoleType } from '../../../core/models/user.model';
import { ScheduleFormDialogComponent } from '../schedule-form-dialog/schedule-form-dialog.component';
import { RecurringScheduleDialogComponent } from '../recurring-schedule-dialog/recurring-schedule-dialog.component';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTagModule,
    NzPopconfirmModule,
    NzModalModule,
    NzGridModule,
    NzDividerModule,
    NzCalendarModule,
    NzBadgeModule,
    NzRadioModule,
    NzDrawerModule,
    NzToolTipModule,
    NzSpinModule,
    NzEmptyModule,
    NzCheckboxModule
  ],
  template: `
    <div class="page-container">
      <!-- Header Bar -->
      <div class="page-header">
        <div class="page-title">
          <h2>Thời Khóa Biểu & Lịch Giảng Dạy</h2>
          <p>Xem thời khóa biểu dạng lịch, quản lý lịch dạy của giáo viên và ca học toàn trung tâm</p>
        </div>
        <div class="page-actions">
          <nz-radio-group [(ngModel)]="viewMode" (ngModelChange)="onViewModeChange($event)" nzButtonStyle="solid">
            <label nz-radio-button nzValue="CALENDAR">
              <span nz-icon nzType="calendar"></span> Lịch Biểu
            </label>
            <label nz-radio-button nzValue="TABLE">
              <span nz-icon nzType="table"></span> Bảng Danh Sách
            </label>
          </nz-radio-group>

          <ng-container *ngIf="canManage">
            <button nz-button nzType="default" (click)="openRecurringModal()" style="border-color: #13c2c2; color: #13c2c2;">
              <span nz-icon nzType="schedule"></span>
              <span>Sinh Lịch Tự Động Theo Tuần</span>
            </button>
            <button nz-button nzType="primary" (click)="openCreateModal()">
              <span nz-icon nzType="plus"></span>
              <span>Thêm Buổi Học Mới</span>
            </button>
          </ng-container>
        </div>
      </div>

      <!-- Filter Card -->
      <div class="filter-card">
        <div nz-row [nzGutter]="[16, 12]" nzAlign="middle">
          <!-- Filter by Teacher (Ẩn đối với học viên) -->
          <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="6" *ngIf="!isStudent">
            <nz-select
              [(ngModel)]="selectedTeacherId"
              (ngModelChange)="onFilterChange()"
              nzPlaceHolder="-- Lọc theo giáo viên --"
              nzShowSearch
              nzAllowClear
              style="width: 100%;"
            >
              <nz-option [nzValue]="null" nzLabel="-- Tất cả giáo viên --"></nz-option>
              <nz-option *ngFor="let t of teachers" [nzValue]="t.id" [nzLabel]="t.teacherCode + ' - ' + t.fullName"></nz-option>
            </nz-select>
          </div>

          <!-- Filter by Class -->
          <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="isStudent ? 12 : 6">
            <nz-select
              [(ngModel)]="selectedClassId"
              (ngModelChange)="onFilterChange()"
              [nzPlaceHolder]="isStudent ? '-- Lớp học của tôi --' : '-- Lọc theo lớp học --'"
              nzShowSearch
              nzAllowClear
              style="width: 100%;"
            >
              <nz-option [nzValue]="null" [nzLabel]="isStudent ? '-- Tất cả lớp của tôi --' : '-- Tất cả các lớp --'"></nz-option>
              <nz-option *ngFor="let c of classes" [nzValue]="c.id" [nzLabel]="c.classCode + ' - ' + c.name"></nz-option>
            </nz-select>
          </div>

          <!-- Filter by Status -->
          <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="5">
            <nz-select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              nzPlaceHolder="-- Trạng thái --"
              nzAllowClear
              style="width: 100%;"
            >
              <nz-option [nzValue]="null" nzLabel="-- Tất cả trạng thái --"></nz-option>
              <nz-option [nzValue]="ScheduleStatus.SCHEDULED" nzLabel="Theo lịch"></nz-option>
              <nz-option [nzValue]="ScheduleStatus.COMPLETED" nzLabel="Đã học"></nz-option>
              <nz-option [nzValue]="ScheduleStatus.CANCELLED" nzLabel="Đã hủy"></nz-option>
            </nz-select>
          </div>

          <!-- Date Filter (for Table view) -->
          <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="4" *ngIf="viewMode === 'TABLE'">
            <nz-date-picker
              [(ngModel)]="selectedDate"
              (ngModelChange)="onFilterChange()"
              nzFormat="dd/MM/yyyy"
              nzPlaceHolder="Lọc ngày cụ thể"
              style="width: 100%;"
            ></nz-date-picker>
          </div>

          <!-- Action Buttons / Teacher Checkbox -->
          <div nz-col [nzXs]="24" [nzSm]="24" [nzMd]="viewMode === 'TABLE' ? 3 : 7" style="text-align: right;">
            <label nz-checkbox *ngIf="isTeacher && currentTeacher" [(ngModel)]="onlyMySchedule" (ngModelChange)="onOnlyMyScheduleChange($event)" style="margin-right: 12px; font-weight: 500; color: #1890ff;">
              <span nz-icon nzType="user"></span> Lịch dạy của tôi
            </label>
            <button nz-button nzType="default" (click)="resetFilters()">
              <span nz-icon nzType="reload"></span>
              <span>Đặt lại</span>
            </button>
          </div>
        </div>
      </div>

      <!-- CALENDAR VIEW -->
      <div *ngIf="viewMode === 'CALENDAR'" class="calendar-card">
        <nz-spin [nzSpinning]="calendarLoading">
          <div class="calendar-legend">
            <span class="legend-item"><nz-badge nzStatus="processing"></nz-badge> Theo lịch (Sắp diễn ra)</span>
            <span class="legend-item"><nz-badge nzStatus="success"></nz-badge> Đã hoàn thành</span>
            <span class="legend-item"><nz-badge nzStatus="error"></nz-badge> Đã hủy</span>
            <span class="legend-hint"><span nz-icon nzType="info-circle"></span> Bấm vào ngày hoặc buổi học để xem chi tiết & điểm danh</span>
          </div>

          <nz-calendar
            [(ngModel)]="calendarSelectedDate"
            [(nzMode)]="calendarMode"
            (nzSelectChange)="onCalendarSelect($event)"
          >
            <!-- Date Cell rendering matching NG-ZORRO Notice Calendar -->
            <ul *nzDateCell="let date" class="events">
              <li
                *ngFor="let item of getSchedulesForDate(date)"
                (click)="openSessionDrawer(date, item, $event)"
                [nz-tooltip]="getEventTooltip(item)"
              >
                <nz-badge [nzStatus]="getBadgeStatus(item)" [nzText]="formatEventText(item)"></nz-badge>
              </li>
            </ul>

            <!-- Month Cell rendering for Year mode -->
            <div *nzMonthCell="let date" class="notes-month">
              <ng-container *ngIf="getMonthSessionCount(date) as count">
                <section>{{ count }}</section>
                <span>buổi học</span>
              </ng-container>
            </div>
          </nz-calendar>
        </nz-spin>
      </div>

      <!-- TABLE VIEW -->
      <div *ngIf="viewMode === 'TABLE'" class="table-card">
        <nz-table
          #scheduleTable
          [nzData]="schedules"
          [nzLoading]="loading"
          [nzTotal]="totalElements"
          [nzPageIndex]="pageIndex"
          [nzPageSize]="pageSize"
          [nzShowSizeChanger]="true"
          [nzPageSizeOptions]="[10, 20, 50]"
          (nzPageIndexChange)="onPageIndexChange($event)"
          (nzPageSizeChange)="onPageSizeChange($event)"
          nzSize="middle"
          [nzFrontPagination]="false"
        >
          <thead>
            <tr>
              <th nzWidth="110px">Ngày Học</th>
              <th>Khung Giờ</th>
              <th>Lớp Học</th>
              <th>Giáo Viên</th>
              <th>Phòng Học</th>
              <th>Nội Dung Giảng Dạy</th>
              <th>Trạng Thái</th>
              <th nzWidth="220px" nzAlign="center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of scheduleTable.data">
              <td><strong>{{ (s.learningDate || s.studyDate) | date:'dd/MM/yyyy' }}</strong></td>
              <td><span style="color: #1890ff; font-weight: 500;">{{ s.startTime }} - {{ s.endTime }}</span></td>
              <td>{{ s.centerClass?.name || s.className }}</td>
              <td>{{ s.teacher?.fullName || s.teacherName }}</td>
              <td><nz-tag nzColor="blue">{{ s.room }}</nz-tag></td>
              <td>{{ s.topic || '-' }}</td>
              <td>
                <nz-tag [nzColor]="getStatusColor(s)">
                  {{ getStatusLabel(s) }}
                </nz-tag>
              </td>
              <td nzAlign="center">
                <ng-container *ngIf="!isStudent">
                  <a (click)="sendScheduleNotification(s.id)" style="color: #722ed1;" title="Gửi thông báo lịch học qua Telegram & Email">
                    <span nz-icon nzType="send"></span> Báo lịch
                  </a>
                  <nz-divider nzType="vertical"></nz-divider>
                  <a [routerLink]="['/attendance']" [queryParams]="{ scheduleId: s.id }" style="color: #52c41a;">
                    <span nz-icon nzType="check-square"></span> Điểm danh
                  </a>
                  <ng-container *ngIf="canManage">
                    <nz-divider nzType="vertical"></nz-divider>
                    <a (click)="openEditModal(s)" style="color: #1890ff;">
                      <span nz-icon nzType="edit"></span> Sửa
                    </a>
                    <nz-divider nzType="vertical"></nz-divider>
                    <a
                      nz-popconfirm
                      nzPopconfirmTitle="Xác nhận hủy buổi học này?"
                      nzOkText="Đồng ý"
                      nzOkDanger="true"
                      nzCancelText="Không"
                      (nzOnConfirm)="deleteSchedule(s.id)"
                      style="color: #ff4d4f;"
                    >
                      <span nz-icon nzType="delete"></span>
                    </a>
                  </ng-container>
                </ng-container>
                <span *ngIf="isStudent" style="color: #8c8c8c; font-size: 13px;">Chỉ xem</span>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <!-- DRAWER: Chi tiết buổi học trong ngày -->
      <nz-drawer
        [nzClosable]="true"
        [nzVisible]="drawerVisible"
        nzPlacement="right"
        [nzTitle]="drawerTitle"
        [nzWidth]="480"
        (nzOnClose)="closeDrawer()"
      >
        <ng-container *nzDrawerContent>
          <div class="drawer-header-actions" *ngIf="canManage">
            <button nz-button nzType="dashed" nzBlock (click)="openCreateModal(selectedDateForDrawer)">
              <span nz-icon nzType="plus"></span> Thêm Buổi Học Vào Ngày Này
            </button>
          </div>

          <div *ngIf="selectedDateSessions.length === 0" style="padding: 40px 0; text-align: center;">
            <nz-empty nzNotFoundImage="simple" nzNotFoundContent="Không có ca học nào trong ngày này"></nz-empty>
          </div>

          <div class="session-list" *ngIf="selectedDateSessions.length > 0">
            <div
              class="session-card"
              *ngFor="let s of selectedDateSessions"
              [class.cancelled]="s.status === ScheduleStatus.CANCELLED"
            >
              <div class="session-top">
                <div class="session-time">
                  <span nz-icon nzType="clock-circle"></span>
                  <strong>{{ s.startTime }} - {{ s.endTime }}</strong>
                </div>
                <div class="session-badges">
                  <nz-tag nzColor="blue"><span nz-icon nzType="home"></span> {{ s.room }}</nz-tag>
                  <nz-tag [nzColor]="getStatusColor(s)">{{ getStatusLabel(s) }}</nz-tag>
                </div>
              </div>

              <div class="session-body">
                <div class="session-info-row">
                  <span class="info-label">Lớp học:</span>
                  <strong class="info-value" style="color: #1890ff;">
                    {{ s.centerClass?.name || s.className }}
                    <span *ngIf="s.centerClass?.classCode || s.classCode">({{ s.centerClass?.classCode || s.classCode }})</span>
                  </strong>
                </div>
                <div class="session-info-row">
                  <span class="info-label">Giáo viên:</span>
                  <span class="info-value">
                    <span nz-icon nzType="user" style="color: #52c41a;"></span>
                    {{ s.teacher?.fullName || s.teacherName }}
                  </span>
                </div>
                <div class="session-info-row" *ngIf="s.topic">
                  <span class="info-label">Chủ đề:</span>
                  <span class="info-value" style="color: #595959;">{{ s.topic }}</span>
                </div>
              </div>

              <div class="session-actions" *ngIf="!isStudent">
                <a
                  nz-button
                  nzType="primary"
                  nzSize="small"
                  [routerLink]="['/attendance']"
                  [queryParams]="{ scheduleId: s.id }"
                  style="background-color: #52c41a; border-color: #52c41a;"
                >
                  <span nz-icon nzType="check-square"></span> Điểm danh ngay
                </a>

                <button
                  nz-button
                  nzType="default"
                  nzSize="small"
                  (click)="sendScheduleNotification(s.id)"
                  style="color: #722ed1; border-color: #d3adf7;"
                  title="Gửi thông báo lịch học đến học viên qua Telegram/Email"
                >
                  <span nz-icon nzType="send"></span> Báo lịch
                </button>

                <ng-container *ngIf="canManage">
                  <button nz-button nzType="default" nzSize="small" (click)="openEditModal(s)">
                    <span nz-icon nzType="edit"></span> Sửa
                  </button>
                  <button
                    nz-button
                    nzType="default"
                    nzDanger
                    nzSize="small"
                    nz-popconfirm
                    nzPopconfirmTitle="Xác nhận hủy buổi học này?"
                    nzOkText="Đồng ý hủy"
                    nzOkDanger="true"
                    nzCancelText="Không"
                    (nzOnConfirm)="deleteSchedule(s.id)"
                  >
                    <span nz-icon nzType="delete"></span>
                  </button>
                </ng-container>
              </div>
            </div>
          </div>
        </ng-container>
      </nz-drawer>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-title h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
    .page-title p {
      margin: 4px 0 0;
      color: #8c8c8c;
      font-size: 13px;
    }
    .page-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .filter-card {
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .calendar-card {
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .calendar-legend {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 16px;
      padding: 10px 16px;
      background-color: #fafafa;
      border-radius: 6px;
      flex-wrap: wrap;
      font-size: 13px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-hint {
      margin-left: auto;
      color: #8c8c8c;
      font-size: 12px;
    }
    .events {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 85px;
      overflow-y: auto;
    }
    .events li {
      margin-bottom: 2px;
      border-radius: 3px;
      padding: 1px 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .events li:hover {
      background-color: #e6f7ff;
    }
    .events .ant-badge-status {
      overflow: hidden;
      white-space: nowrap;
      width: 100%;
      text-overflow: ellipsis;
      font-size: 12px;
      display: flex;
      align-items: center;
    }
    .notes-month {
      text-align: center;
      font-size: 16px;
    }
    .notes-month section {
      font-size: 22px;
      font-weight: 600;
      color: #1890ff;
    }
    .drawer-header-actions {
      margin-bottom: 16px;
    }
    .session-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .session-card {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 14px;
      background: #fff;
      transition: all 0.2s;
    }
    .session-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-color: #91d5ff;
    }
    .session-card.cancelled {
      background: #fff1f0;
      border-color: #ffa39e;
      opacity: 0.8;
    }
    .session-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #f0f0f0;
    }
    .session-time {
      color: #1890ff;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .session-badges {
      display: flex;
      gap: 6px;
    }
    .session-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
    }
    .session-info-row {
      display: flex;
      gap: 8px;
    }
    .info-label {
      color: #8c8c8c;
      min-width: 70px;
    }
    .session-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #f0f0f0;
      flex-wrap: wrap;
    }
    .table-card {
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
  `]
})
export class ScheduleListComponent implements OnInit {
  ScheduleStatus = ScheduleStatus;

  viewMode: 'CALENDAR' | 'TABLE' = 'CALENDAR';
  calendarMode: 'month' | 'year' = 'month';
  calendarSelectedDate: Date = new Date();
  calendarLoading = false;

  canManage = false;
  isTeacher = false;
  isStudent = false;
  currentTeacher: Teacher | null = null;
  onlyMySchedule = false;

  classes: CenterClass[] = [];
  teachers: Teacher[] = [];

  // Filters
  selectedClassId: number | null = null;
  selectedTeacherId: number | null = null;
  selectedStatus: ScheduleStatus | null = null;
  selectedDate: Date | null = null;

  // Calendar event cache
  calendarSchedules: Schedule[] = [];
  schedulesByDateMap = new Map<string, Schedule[]>();

  // Table pagination
  schedules: Schedule[] = [];
  totalElements = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;

  // Drawer
  drawerVisible = false;
  selectedDateForDrawer: Date = new Date();
  selectedDateSessions: Schedule[] = [];

  get drawerTitle(): string {
    const d = this.formatDate(this.selectedDateForDrawer);
    const count = this.selectedDateSessions.length;
    return `Chi Tiết Lịch Học Ngày ${d} (${count} ca học)`;
  }

  constructor(
    private scheduleService: ScheduleService,
    private classService: ClassService,
    private teacherService: TeacherService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private modal: NzModalService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.canManage = this.authService.hasAnyRole([RoleType.ADMIN, RoleType.MANAGER]);
    this.isTeacher = this.authService.hasRole(RoleType.TEACHER);
    this.isStudent = this.authService.hasRole(RoleType.STUDENT);

    this.loadClasses();
    if (!this.isStudent) {
      this.loadTeachers();
    }

    if (this.isTeacher) {
      this.teacherService.getMyProfile().subscribe({
        next: (res) => {
          this.currentTeacher = res.data;
          this.selectedTeacherId = res.data.id;
          this.onlyMySchedule = true;
          this.loadCalendarData();
          this.loadSchedules();
        },
        error: () => {
          this.loadCalendarData();
          this.loadSchedules();
        }
      });
    } else {
      this.loadCalendarData();
      this.loadSchedules();
    }
  }

  loadClasses(): void {
    this.classService.getClasses(0, 100).subscribe({
      next: (res) => {
        this.classes = res.data.content;
      }
    });
  }

  loadTeachers(): void {
    this.teacherService.getTeachers(0, 100).subscribe({
      next: (res) => {
        this.teachers = res.data.content;
      }
    });
  }

  onViewModeChange(mode: 'CALENDAR' | 'TABLE'): void {
    if (mode === 'CALENDAR') {
      this.loadCalendarData();
    } else {
      this.loadSchedules();
    }
  }

  onFilterChange(): void {
    if (this.viewMode === 'CALENDAR') {
      this.loadCalendarData();
    } else {
      this.pageIndex = 1;
      this.loadSchedules();
    }
  }

  onOnlyMyScheduleChange(checked: boolean): void {
    if (checked && this.currentTeacher) {
      this.selectedTeacherId = this.currentTeacher.id;
    } else {
      this.selectedTeacherId = null;
    }
    this.onFilterChange();
  }

  resetFilters(): void {
    this.selectedClassId = null;
    this.selectedStatus = null;
    this.selectedDate = null;
    if (this.isTeacher && this.currentTeacher) {
      this.selectedTeacherId = this.currentTeacher.id;
      this.onlyMySchedule = true;
    } else {
      this.selectedTeacherId = null;
      this.onlyMySchedule = false;
    }
    this.pageIndex = 1;
    this.loadCalendarData();
    this.loadSchedules();
  }

  // CALENDAR DATA LOADING
  loadCalendarData(): void {
    this.calendarLoading = true;
    const current = this.calendarSelectedDate || new Date();
    const fromDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const toDate = new Date(current.getFullYear(), current.getMonth() + 2, 0);

    const fromDateStr = this.formatDate(fromDate);
    const toDateStr = this.formatDate(toDate);

    this.scheduleService
      .getSchedules(
        0,
        1000,
        this.selectedClassId || undefined,
        this.selectedTeacherId || undefined,
        undefined,
        fromDateStr,
        toDateStr,
        this.selectedStatus || undefined
      )
      .subscribe({
        next: (res) => {
          this.calendarSchedules = res.data.content;
          this.buildSchedulesMap();
          if (this.drawerVisible) {
            this.selectedDateSessions = this.getSchedulesForDate(this.selectedDateForDrawer);
          }
          this.calendarLoading = false;
        },
        error: () => {
          this.calendarLoading = false;
        }
      });
  }

  private buildSchedulesMap(): void {
    this.schedulesByDateMap.clear();
    for (const s of this.calendarSchedules) {
      const dateStr = s.studyDate || s.learningDate;
      if (!dateStr) continue;
      const key = dateStr.substring(0, 10);
      const list = this.schedulesByDateMap.get(key) || [];
      list.push(s);
      this.schedulesByDateMap.set(key, list);
    }
  }

  getSchedulesForDate(date: Date): Schedule[] {
    const key = this.formatDate(date);
    return this.schedulesByDateMap.get(key) || [];
  }

  getMonthSessionCount(date: Date): number {
    const y = date.getFullYear();
    const m = date.getMonth();
    return this.calendarSchedules.filter((s) => {
      const d = s.studyDate || s.learningDate;
      if (!d) return false;
      const sessionDate = new Date(d);
      return sessionDate.getFullYear() === y && sessionDate.getMonth() === m;
    }).length;
  }

  onCalendarSelect(date: Date): void {
    // If month changed, reload calendar range
    const oldMonth = this.selectedDateForDrawer?.getMonth();
    const newMonth = date.getMonth();
    const oldYear = this.selectedDateForDrawer?.getFullYear();
    const newYear = date.getFullYear();

    this.selectedDateForDrawer = date;
    this.selectedDateSessions = this.getSchedulesForDate(date);
    this.drawerVisible = true;

    if (oldMonth !== newMonth || oldYear !== newYear) {
      this.loadCalendarData();
    }
  }

  openSessionDrawer(date: Date, item: Schedule, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDateForDrawer = date;
    this.selectedDateSessions = this.getSchedulesForDate(date);
    this.drawerVisible = true;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
  }

  formatEventText(item: Schedule): string {
    const time = item.startTime ? item.startTime.substring(0, 5) : '';
    const cls = item.centerClass?.classCode || item.className || 'Lớp';
    const room = item.room ? `(${item.room})` : '';
    return `${time} ${cls} ${room}`;
  }

  isSessionEnded(item: Schedule): boolean {
    if (item.status === ScheduleStatus.COMPLETED) return true;
    if (item.status === ScheduleStatus.CANCELLED) return false;
    const dateStr = item.learningDate || item.studyDate;
    if (!dateStr) return false;
    const endTime = item.endTime || '23:59:59';
    try {
      const sessionEnd = new Date(`${dateStr.substring(0, 10)}T${endTime}`);
      return sessionEnd.getTime() < Date.now();
    } catch {
      return false;
    }
  }

  getEffectiveStatus(item: Schedule | ScheduleStatus): ScheduleStatus {
    if (typeof item === 'string') {
      return item as ScheduleStatus;
    }
    if (item.status === ScheduleStatus.CANCELLED) {
      return ScheduleStatus.CANCELLED;
    }
    if (item.status === ScheduleStatus.COMPLETED || this.isSessionEnded(item)) {
      return ScheduleStatus.COMPLETED;
    }
    return ScheduleStatus.SCHEDULED;
  }

  getEventTooltip(item: Schedule): string {
    const cls = item.centerClass?.name || item.className || '';
    const teacher = item.teacher?.fullName || item.teacherName || '';
    const statusLabel = this.getStatusLabel(item);
    const topic = item.topic ? ` - Chủ đề: ${item.topic}` : '';
    return `${cls} | ${item.startTime}-${item.endTime} | GV: ${teacher} | Phòng: ${item.room} | Trạng thái: ${statusLabel}${topic}`;
  }

  getBadgeStatus(item: Schedule): 'processing' | 'success' | 'error' | 'default' | 'warning' {
    const status = this.getEffectiveStatus(item);
    switch (status) {
      case ScheduleStatus.SCHEDULED: return 'processing';
      case ScheduleStatus.COMPLETED: return 'success';
      case ScheduleStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  }

  // TABLE DATA LOADING
  loadSchedules(): void {
    this.loading = true;
    const dateStr = this.selectedDate ? this.formatDate(this.selectedDate) : undefined;

    this.scheduleService
      .getSchedules(
        this.pageIndex - 1,
        this.pageSize,
        this.selectedClassId || undefined,
        this.selectedTeacherId || undefined,
        dateStr,
        undefined,
        undefined,
        this.selectedStatus || undefined
      )
      .subscribe({
        next: (res) => {
          this.schedules = res.data.content;
          this.totalElements = res.data.totalElements;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  onPageIndexChange(page: number): void {
    this.pageIndex = page;
    this.loadSchedules();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadSchedules();
  }

  // ACTIONS
  sendScheduleNotification(scheduleId: number): void {
    this.msg.loading('Đang gửi thông báo lịch học qua Telegram Bot & Email...', { nzDuration: 1500 });
    this.notificationService.sendScheduleNotification(scheduleId).subscribe({
      next: () => {
        this.msg.success('Đã gửi thông báo lịch học đến Email học viên & Telegram thành công!');
      },
      error: (err) => {
        this.msg.error(err.error?.message || 'Không thể gửi thông báo lịch học');
      }
    });
  }

  openRecurringModal(classId?: number): void {
    const modalRef = this.modal.create({
      nzTitle: 'Sinh Lịch Học Tự Động Định Kỳ Theo Tuần',
      nzContent: RecurringScheduleDialogComponent,
      nzData: { classId: classId || this.selectedClassId },
      nzFooter: null,
      nzWidth: 720
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.loadCalendarData();
        this.loadSchedules();
      }
    });
  }

  openCreateModal(initialDate?: Date): void {
    const dateStr = initialDate ? this.formatDate(initialDate) : undefined;
    const modalRef = this.modal.create({
      nzTitle: 'Lên Lịch Buổi Học Mới',
      nzContent: ScheduleFormDialogComponent,
      nzData: { isEdit: false, initialDate: dateStr },
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.scheduleService.createSchedule(result).subscribe({
          next: () => {
            this.msg.success('Lên lịch học thành công!');
            this.loadCalendarData();
            this.loadSchedules();
          },
          error: (err) => {
            this.msg.error(err.error?.message || 'Không thể tạo lịch học (kiểm tra trùng phòng/giáo viên)');
          }
        });
      }
    });
  }

  openEditModal(schedule: Schedule): void {
    const className = schedule.centerClass?.name || schedule.className || '';
    const modalRef = this.modal.create({
      nzTitle: `Cập Nhật Buổi Học: ${className}`,
      nzContent: ScheduleFormDialogComponent,
      nzData: { schedule, isEdit: true },
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.scheduleService.updateSchedule(schedule.id, result).subscribe({
          next: () => {
            this.msg.success('Cập nhật lịch học thành công!');
            this.loadCalendarData();
            this.loadSchedules();
          }
        });
      }
    });
  }

  deleteSchedule(id: number): void {
    this.scheduleService.deleteSchedule(id).subscribe({
      next: () => {
        this.msg.success('Đã hủy buổi học!');
        this.loadCalendarData();
        this.loadSchedules();
      }
    });
  }

  getStatusColor(item: Schedule | ScheduleStatus): string {
    const status = this.getEffectiveStatus(item);
    switch (status) {
      case ScheduleStatus.SCHEDULED: return 'processing';
      case ScheduleStatus.COMPLETED: return 'success';
      case ScheduleStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(item: Schedule | ScheduleStatus): string {
    const status = this.getEffectiveStatus(item);
    switch (status) {
      case ScheduleStatus.SCHEDULED: return 'Theo lịch (Sắp diễn ra)';
      case ScheduleStatus.COMPLETED: return 'Đã hoàn thành';
      case ScheduleStatus.CANCELLED: return 'Đã hủy';
      default: return status;
    }
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

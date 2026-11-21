import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { StudentService } from '../../../core/services/student.service';
import { Student, StudentClass } from '../../../core/models/student.model';

@Component({
  selector: 'app-my-classes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzProgressModule,
    NzAvatarModule,
    NzEmptyModule,
    NzSpinModule,
    NzInputModule,
    NzSelectModule,
    NzBadgeModule,
    NzToolTipModule
  ],
  template: `
    <div class="page-container">
      <!-- Welcome Header -->
      <div class="welcome-banner">
        <div class="banner-content">
          <div class="banner-text">
            <h2>Lớp Học Của Tôi</h2>
            <p *ngIf="studentProfile">
              Xin chào <strong>{{ studentProfile.fullName }}</strong> (Mã HV: <code>{{ studentProfile.studentCode }}</code>). 
              Theo dõi tiến độ học tập, lịch học sắp tới và giảng viên phụ trách của từng lớp.
            </p>
            <p *ngIf="!studentProfile">Theo dõi tiến độ học tập, lịch học sắp tới và giảng viên phụ trách của từng lớp.</p>
          </div>
          <div class="banner-stats" *ngIf="classes.length > 0">
            <div class="stat-pill">
              <span class="label">Tổng số lớp</span>
              <span class="value">{{ classes.length }}</span>
            </div>
            <div class="stat-pill active">
              <span class="label">Đang theo học</span>
              <span class="value">{{ activeClassesCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <nz-input-group [nzPrefix]="searchIcon" class="search-input">
          <input
            type="text"
            nz-input
            placeholder="Tìm theo mã lớp, tên lớp hoặc giảng viên..."
            [(ngModel)]="searchKeyword"
            (ngModelChange)="filterClasses()"
          />
        </nz-input-group>
        <ng-template #searchIcon>
          <span nz-icon nzType="search"></span>
        </ng-template>

        <nz-select [(ngModel)]="statusFilter" (ngModelChange)="filterClasses()" class="status-select">
          <nz-option nzValue="ALL" nzLabel="Tất cả trạng thái"></nz-option>
          <nz-option nzValue="ACTIVE" nzLabel="Đang học (ACTIVE)"></nz-option>
          <nz-option nzValue="COMPLETED" nzLabel="Đã kết thúc"></nz-option>
        </nz-select>
      </div>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading">
        <nz-spin nzTip="Đang tải danh sách lớp học của bạn..."></nz-spin>
      </div>

      <!-- Empty State -->
      <nz-empty
        *ngIf="!loading && filteredClasses.length === 0"
        nzNotFoundImage="simple"
        nzNotFoundContent="Bạn hiện chưa có lớp học nào hoặc không tìm thấy kết quả phù hợp."
      >
      </nz-empty>

      <!-- Class Cards Grid -->
      <div class="cards-grid" *ngIf="!loading && filteredClasses.length > 0">
        <div class="class-card" *ngFor="let item of filteredClasses">
          <!-- Card Header -->
          <div class="card-header">
            <div class="code-and-level">
              <span class="class-code">{{ item.classCode }}</span>
              <nz-tag [nzColor]="getLevelColor(item.courseLevel)">
                {{ item.courseLevel || 'TIÊU CHUẨN' }}
              </nz-tag>
            </div>
            <nz-tag [nzColor]="getStatusColor(item.classStatus)">
              {{ getStatusLabel(item.classStatus) }}
            </nz-tag>
          </div>

          <!-- Class Title -->
          <h3 class="class-title">{{ item.className }}</h3>
          <p class="course-name">
            <span nz-icon nzType="book" nzTheme="outline"></span>
            {{ item.courseName }}
          </p>

          <!-- Progress Section -->
          <div class="progress-section">
            <div class="progress-info">
              <span class="progress-label">Tiến độ khóa học:</span>
              <span class="progress-numbers">
                <strong>{{ item.completedLessons || 0 }}</strong> / {{ item.totalLessons || 0 }} buổi ({{ item.progressPercent || 0 }}%)
              </span>
            </div>
            <nz-progress
              [nzPercent]="item.progressPercent || 0"
              [nzStrokeColor]="getProgressColor(item.progressPercent || 0)"
              [nzShowInfo]="false"
              nzSize="small"
            ></nz-progress>
          </div>

          <!-- Upcoming Next Schedule Highlight -->
          <div class="next-schedule-box" *ngIf="item.nextSchedule">
            <div class="box-title">
              <span nz-icon nzType="clock-circle" nzTheme="outline"></span>
              <span>Buổi học tiếp theo:</span>
            </div>
            <div class="schedule-details">
              <div class="schedule-date-time">
                <span class="date">{{ item.nextSchedule.studyDate | date:'dd/MM/yyyy' }}</span>
                <span class="time">{{ item.nextSchedule.startTime }} - {{ item.nextSchedule.endTime }}</span>
              </div>
              <div class="schedule-room" *ngIf="item.nextSchedule.room">
                <nz-tag nzColor="blue">Phòng: {{ item.nextSchedule.room }}</nz-tag>
              </div>
            </div>
            <div class="schedule-topic" *ngIf="item.nextSchedule.topic">
              <em>Chủ đề: {{ item.nextSchedule.topic }}</em>
            </div>
          </div>

          <div class="no-upcoming-box" *ngIf="!item.nextSchedule">
            <span nz-icon nzType="check-circle" nzTheme="outline"></span>
            <span>Chưa có lịch buổi học tiếp theo</span>
          </div>

          <!-- Teacher Details -->
          <div class="teacher-section" *ngIf="item.teacherName">
            <nz-avatar
              nzIcon="user"
              [nzText]="getAvatarText(item.teacherName)"
              class="teacher-avatar"
            ></nz-avatar>
            <div class="teacher-info">
              <div class="teacher-name">
                <strong>{{ item.teacherName }}</strong>
                <span class="specialization" *ngIf="item.teacherSpecialization"> - {{ item.teacherSpecialization }}</span>
              </div>
              <div class="teacher-contacts">
                <a *ngIf="item.teacherEmail" [href]="'mailto:' + item.teacherEmail" class="contact-link" nz-tooltip="Gửi Email">
                  <span nz-icon nzType="mail"></span> {{ item.teacherEmail }}
                </a>
                <span *ngIf="item.teacherPhone" class="contact-item">
                  <span nz-icon nzType="phone"></span> {{ item.teacherPhone }}
                </span>
              </div>
            </div>
          </div>

          <!-- Attendance Summary in Class -->
          <div class="attendance-mini-stats">
            <div class="mini-stat present">
              <span class="count">{{ item.attendedSessions || 0 }}</span>
              <span class="label">Có mặt</span>
            </div>
            <div class="mini-stat late">
              <span class="count">{{ item.lateSessions || 0 }}</span>
              <span class="label">Đi muộn</span>
            </div>
            <div class="mini-stat excused">
              <span class="count">{{ item.excusedSessions || 0 }}</span>
              <span class="label">Có phép</span>
            </div>
            <div class="mini-stat absent">
              <span class="count">{{ item.absentSessions || 0 }}</span>
              <span class="label">Vắng</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-actions">
            <button
              nz-button
              nzType="default"
              (click)="viewClassSchedules(item.classId)"
              class="action-btn"
            >
              <span nz-icon nzType="calendar"></span>
              <span>Thời khóa biểu</span>
            </button>
            <button
              nz-button
              nzType="primary"
              (click)="viewClassAttendance(item.classId)"
              class="action-btn"
            >
              <span nz-icon nzType="check-square"></span>
              <span>Chuyên cần</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 4px;
    }

    .welcome-banner {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      border-radius: 12px;
      padding: 24px 28px;
      color: white;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(24, 144, 255, 0.25);
    }

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .banner-text h2 {
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 6px 0;
    }

    .banner-text p {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-size: 14px;
      code {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        color: #fff;
      }
    }

    .banner-stats {
      display: flex;
      gap: 12px;
    }

    .stat-pill {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(4px);
      padding: 10px 18px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 90px;
      .label {
        font-size: 11px;
        opacity: 0.85;
      }
      .value {
        font-size: 20px;
        font-weight: 700;
      }
    }

    .stat-pill.active {
      background: rgba(82, 196, 26, 0.35);
      border: 1px solid rgba(82, 196, 26, 0.5);
    }

    .filter-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 260px;
      max-width: 450px;
    }

    .status-select {
      width: 180px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .class-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #f0f0f0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        border-color: #d9e8ff;
        transform: translateY(-2px);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .code-and-level {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .class-code {
      font-weight: 700;
      font-size: 14px;
      color: #1890ff;
      background: #e6f7ff;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .class-title {
      font-size: 17px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 6px 0;
      line-height: 1.4;
    }

    .course-name {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .progress-section {
      background: #fafafa;
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 14px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
      .progress-label {
        color: #64748b;
      }
      .progress-numbers {
        color: #0f172a;
      }
    }

    .next-schedule-box {
      background: #f0fdf4;
      border: 1px dashed #86efac;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 14px;
    }

    .no-upcoming-box {
      background: #f8fafc;
      border: 1px dashed #e2e8f0;
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 14px;
      color: #94a3b8;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .box-title {
      font-size: 12px;
      font-weight: 600;
      color: #15803d;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }

    .schedule-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .schedule-date-time {
      font-size: 13px;
      .date {
        font-weight: 700;
        color: #166534;
        margin-right: 8px;
      }
      .time {
        color: #475569;
        font-size: 12px;
      }
    }

    .schedule-topic {
      font-size: 12px;
      color: #334155;
      margin-top: 4px;
    }

    .teacher-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 14px;
    }

    .teacher-avatar {
      background: #722ed1;
      color: #fff;
      font-weight: 600;
      flex-shrink: 0;
    }

    .teacher-info {
      flex: 1;
      overflow: hidden;
    }

    .teacher-name {
      font-size: 13px;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .specialization {
        color: #64748b;
        font-size: 12px;
        font-weight: normal;
      }
    }

    .teacher-contacts {
      display: flex;
      gap: 12px;
      font-size: 12px;
      margin-top: 2px;
      flex-wrap: wrap;
    }

    .contact-link {
      color: #1890ff;
      &:hover {
        text-decoration: underline;
      }
    }

    .contact-item {
      color: #64748b;
    }

    .attendance-mini-stats {
      display: flex;
      justify-content: space-around;
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .mini-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      .count {
        font-size: 15px;
        font-weight: 700;
      }
      .label {
        font-size: 11px;
        color: #64748b;
      }
    }

    .mini-stat.present .count { color: #52c41a; }
    .mini-stat.late .count { color: #faad14; }
    .mini-stat.excused .count { color: #1890ff; }
    .mini-stat.absent .count { color: #ff4d4f; }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
    }

    .action-btn {
      flex: 1;
      border-radius: 6px;
      font-weight: 500;
    }
  `]
})
export class MyClassesComponent implements OnInit {
  studentProfile: Student | null = null;
  classes: StudentClass[] = [];
  filteredClasses: StudentClass[] = [];
  loading = false;
  searchKeyword = '';
  statusFilter = 'ALL';

  constructor(
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadMyClasses();
  }

  loadProfile(): void {
    this.studentService.getMyProfile().subscribe({
      next: (res) => {
        if (res.data) {
          this.studentProfile = res.data;
        }
      },
      error: () => {}
    });
  }

  loadMyClasses(): void {
    this.loading = true;
    this.studentService.getMyClasses().subscribe({
      next: (res) => {
        this.loading = false;
        this.classes = res.data || [];
        this.filterClasses();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get activeClassesCount(): number {
    return this.classes.filter(c => c.classStatus === 'IN_PROGRESS' || c.classStatus === 'PLANNED').length;
  }

  filterClasses(): void {
    let result = [...this.classes];

    if (this.statusFilter === 'ACTIVE') {
      result = result.filter(c => c.classStatus === 'IN_PROGRESS' || c.classStatus === 'PLANNED');
    } else if (this.statusFilter === 'COMPLETED') {
      result = result.filter(c => c.classStatus === 'COMPLETED');
    }

    if (this.searchKeyword && this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      result = result.filter(c =>
        c.className.toLowerCase().includes(kw) ||
        c.classCode.toLowerCase().includes(kw) ||
        (c.courseName && c.courseName.toLowerCase().includes(kw)) ||
        (c.teacherName && c.teacherName.toLowerCase().includes(kw))
      );
    }

    this.filteredClasses = result;
  }

  getLevelColor(level?: string): string {
    switch (level) {
      case 'BEGINNER': return 'green';
      case 'INTERMEDIATE': return 'blue';
      case 'ADVANCED': return 'purple';
      default: return 'cyan';
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'PLANNED': return 'orange';
      case 'IN_PROGRESS': return 'processing';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'PLANNED': return 'Sắp mở';
      case 'IN_PROGRESS': return 'Đang học';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status || '';
    }
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return '#52c41a';
    if (percent >= 50) return '#1890ff';
    return '#fa8c16';
  }

  getAvatarText(name?: string): string {
    if (!name) return 'GV';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].substring(0, 1).toUpperCase();
  }

  viewClassSchedules(classId: number): void {
    this.router.navigate(['/schedules'], { queryParams: { classId } });
  }

  viewClassAttendance(classId: number): void {
    this.router.navigate(['/my-attendance'], { queryParams: { classId } });
  }
}

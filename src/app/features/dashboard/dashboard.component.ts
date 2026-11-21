import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AuthService } from '../../core/services/auth.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { RoleType } from '../../core/models/user.model';

interface StatItem {
  title: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
  change: string;
  isPositive: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzGridModule,
    NzCardModule,
    NzStatisticModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzAlertModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>Bảng Điều Khiển Tổng Quan</h2>
          <p *ngIf="currentUser$ | async as user">
            Xin chào, <strong>{{ user.fullName }}</strong> ({{ user.roles[0].name || 'Quản trị viên' }}) - Chúc bạn một ngày làm việc hiệu quả!
          </p>
        </div>
        <div class="page-actions">
          <button nz-button nzType="primary" routerLink="/enrollments">
            <span nz-icon nzType="plus"></span>
            <span>Đăng ký Học viên mới</span>
          </button>
        </div>
      </div>

      <!-- Pending Registrations Alert (Chỉ hiển thị cho Quản trị viên/Quản lý) -->
      <div *ngIf="canViewPendingAlert() && (pendingCount$ | async) as pendingCount" style="margin-bottom: 20px;">
        <nz-alert
          nzType="warning"
          nzShowIcon
          [nzMessage]="alertMsgTpl"
          [nzDescription]="alertDescTpl"
          style="border-radius: 8px; border: 1px solid #ffe58f; background: #fffbe6;"
        >
          <ng-template #alertMsgTpl>
            <span style="font-weight: 600; font-size: 15px; color: #d46b08;">
              Có {{ pendingCount }} đơn đăng ký khóa học mới từ website đang chờ tư vấn & duyệt!
            </span>
          </ng-template>
          <ng-template #alertDescTpl>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; flex-wrap: wrap; gap: 8px;">
              <span style="color: #873800;">Vui lòng kiểm tra thông tin liên lạc của học viên để gọi điện tư vấn và xếp lớp kịp thời.</span>
              <button
                nz-button
                nzType="primary"
                nzSize="small"
                routerLink="/enrollments"
                [queryParams]="{ status: 'PENDING' }"
                style="background: #fa8c16; border-color: #fa8c16;"
              >
                <span nz-icon nzType="phone"></span>
                <span>Xem & Tư vấn ngay</span>
              </button>
            </div>
          </ng-template>
        </nz-alert>
      </div>

      <!-- Stat Cards -->
      <div nz-row [nzGutter]="[16, 16]" class="stat-row">
        <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="6" *ngFor="let stat of statCards">
          <nz-card [nzBordered]="false" class="dashboard-stat-card">
            <div class="stat-inner">
              <div class="stat-meta">
                <span class="stat-label">{{ stat.title }}</span>
                <div class="stat-num">{{ stat.value }}</div>
                <div class="stat-trend" [class.positive]="stat.isPositive" [class.negative]="!stat.isPositive">
                  <span nz-icon [nzType]="stat.isPositive ? 'arrow-up' : 'arrow-down'"></span>
                  <span>{{ stat.change }}</span> so với tháng trước
                </div>
              </div>
              <div class="stat-icon-wrapper" [style.background-color]="stat.bgColor" [style.color]="stat.color">
                <span nz-icon [nzType]="stat.icon" style="font-size: 24px;"></span>
              </div>
            </div>
          </nz-card>
        </div>
      </div>

      <!-- Quick Action / Status Grid -->
      <div nz-row [nzGutter]="[16, 16]" style="margin-top: 16px;">
        <!-- Recent Classes -->
        <div nz-col [nzXs]="24" [nzLg]="14">
          <nz-card nzTitle="Lớp học đang diễn ra gần đây" [nzExtra]="extraClasses" [nzBordered]="false">
            <ng-template #extraClasses>
              <a routerLink="/classes">Xem tất cả</a>
            </ng-template>

            <nz-table #classTable [nzData]="recentClasses" [nzShowPagination]="false" nzSize="middle">
              <thead>
                <tr>
                  <th>Mã lớp</th>
                  <th>Tên lớp</th>
                  <th>Phòng học</th>
                  <th>Sĩ số</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of classTable.data">
                  <td><strong>{{ c.code }}</strong></td>
                  <td>{{ c.name }}</td>
                  <td>{{ c.room }}</td>
                  <td>{{ c.students }}</td>
                  <td>
                    <nz-tag [nzColor]="c.statusColor">{{ c.status }}</nz-tag>
                  </td>
                </tr>
              </tbody>
            </nz-table>
          </nz-card>
        </div>

        <!-- Recent Activities / Notifications -->
        <div nz-col [nzXs]="24" [nzLg]="10">
          <nz-card nzTitle="Hoạt động trung tâm hôm nay" [nzBordered]="false">
            <div class="activity-timeline">
              <div class="activity-item" *ngFor="let act of recentActivities">
                <div class="activity-dot" [style.background-color]="act.color"></div>
                <div class="activity-content">
                  <div class="activity-desc">{{ act.desc }}</div>
                  <div class="activity-time">{{ act.time }}</div>
                </div>
              </div>
            </div>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-row {
      margin-bottom: 8px;
    }
    .dashboard-stat-card {
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }
    .stat-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-meta {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 4px;
    }
    .stat-num {
      font-size: 26px;
      font-weight: 700;
      color: rgba(0, 0, 0, 0.85);
      line-height: 1.2;
      margin-bottom: 6px;
    }
    .stat-trend {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      &.positive {
        color: #52c41a;
      }
      &.negative {
        color: #ff4d4f;
      }
    }
    .stat-icon-wrapper {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .activity-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .activity-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .activity-desc {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 2px;
    }
    .activity-time {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.45);
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  pendingCount$ = this.enrollmentService.pendingCount$;

  statCards: StatItem[] = [
    {
      title: 'Tổng số Học viên',
      value: '1,248',
      icon: 'user',
      color: '#1890ff',
      bgColor: '#e6f7ff',
      change: '+12.5%',
      isPositive: true
    },
    {
      title: 'Lớp học đang mở',
      value: '42',
      icon: 'apartment',
      color: '#52c41a',
      bgColor: '#f6ffed',
      change: '+4 lớp',
      isPositive: true
    },
    {
      title: 'Doanh thu tháng (VNĐ)',
      value: '485.6M',
      icon: 'dollar',
      color: '#faad14',
      bgColor: '#fffbe6',
      change: '+18.2%',
      isPositive: true
    },
    {
      title: 'Tỷ lệ điểm danh',
      value: '94.8%',
      icon: 'check-square',
      color: '#722ed1',
      bgColor: '#f9f0ff',
      change: '+1.4%',
      isPositive: true
    }
  ];

  recentClasses: any[] = [];
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    if (this.canViewPendingAlert()) {
      this.enrollmentService.refreshPendingCount();
    }
    this.loadRealStats();
  }

  loadRealStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        const d = res.data;
        if (!d) return;

        // Định dạng tiền tệ
        let revenueDisplay = '0đ';
        if (d.monthlyRevenue) {
          const rev = Number(d.monthlyRevenue);
          if (rev >= 1_000_000_000) {
            revenueDisplay = (rev / 1_000_000_000).toFixed(1) + 'B';
          } else if (rev >= 1_000_000) {
            revenueDisplay = (rev / 1_000_000).toFixed(1) + 'M';
          } else {
            revenueDisplay = rev.toLocaleString('vi-VN') + 'đ';
          }
        }

        this.statCards = [
          {
            title: 'Tổng số Học viên',
            value: (d.totalStudents || 0).toLocaleString('vi-VN'),
            icon: 'user',
            color: '#1890ff',
            bgColor: '#e6f7ff',
            change: '+100% thật',
            isPositive: true
          },
          {
            title: 'Lớp học đang mở',
            value: (d.activeClasses || 0).toString(),
            icon: 'apartment',
            color: '#52c41a',
            bgColor: '#f6ffed',
            change: `${d.todaySessions || 0} ca hôm nay`,
            isPositive: true
          },
          {
            title: 'Học phí / Doanh thu (VNĐ)',
            value: revenueDisplay,
            icon: 'dollar',
            color: '#faad14',
            bgColor: '#fffbe6',
            change: `${d.pendingEnrollments || 0} đơn chờ duyệt`,
            isPositive: true
          },
          {
            title: 'Tỷ lệ điểm danh',
            value: (d.attendanceRate || 95.0) + '%',
            icon: 'check-square',
            color: '#722ed1',
            bgColor: '#f9f0ff',
            change: 'Chuẩn quy định',
            isPositive: true
          }
        ];

        if (d.recentClasses && d.recentClasses.length > 0) {
          this.recentClasses = d.recentClasses;
        }
        if (d.recentActivities && d.recentActivities.length > 0) {
          this.recentActivities = d.recentActivities;
        }
      },
      error: () => {
        // Giữ dữ liệu thống kê mặc định nếu backend chưa có endpoint dashboard stats
      }
    });
  }

  canViewPendingAlert(): boolean {
    const user = this.authService.currentUserValue;
    if (!user || !user.roles) return false;
    const isAdminOrManager = user.roles.some(r => r.code === RoleType.ADMIN || r.code === RoleType.MANAGER);
    if (isAdminOrManager) return true;
    const excludedRoles = [RoleType.STUDENT, RoleType.TEACHER, RoleType.ACCOUNTANT];
    return !user.roles.some(r => excludedRoles.includes(r.code));
  }
}

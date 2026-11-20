import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../core/services/auth.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { Enrollment } from '../../core/models/enrollment.model';
import { RoleType } from '../../core/models/user.model';
import { ChangePasswordDialogComponent } from '../../features/auth/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTagModule,
    NzSpinModule,
    NzModalModule,
    ChangePasswordDialogComponent
  ],
  template: `
    <div class="header-container">
      <div class="header-left">
        <button nz-button nzType="text" class="trigger-btn" (click)="toggleCollapse()">
          <span nz-icon [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'"></span>
        </button>
        <div class="header-brand">
          <span class="system-title">HỆ THỐNG QUẢN LÝ TRUNG TÂM ĐÀO TẠO</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Link sang trang tuyển sinh công khai -->
        <a routerLink="/portal" target="_blank" class="portal-nav-link" title="Xem trang giới thiệu khóa học & đăng ký">
          <span nz-icon nzType="book" nzTheme="outline"></span>
          <span>Cổng tuyển sinh</span>
        </a>

        <!-- Notifications Bell (Bấm vào hiển thị danh sách người đăng ký mới - chỉ cho Admin & Manager) -->
        <div
          *ngIf="canViewNotifications()"
          class="notif-bell-trigger"
          nz-dropdown
          [nzDropdownMenu]="notifMenu"
          nzTrigger="click"
          nzPlacement="bottomRight"
          [(nzVisible)]="notifDropdownOpen"
          (nzVisibleChange)="onNotifVisibleChange($event)"
          title="Thông báo đơn đăng ký khóa học mới"
        >
          <nz-badge [nzCount]="(pendingCount$ | async) || 0" [nzOverflowCount]="99" class="header-badge">
            <button nz-button nzType="text" nzShape="circle" type="button" class="bell-btn">
              <span nz-icon nzType="bell" nzTheme="outline" style="font-size: 19px; color: #595959;"></span>
            </button>
          </nz-badge>
        </div>

        <!-- Menu dropdown danh sách người đăng ký khóa học -->
        <nz-dropdown-menu #notifMenu="nzDropdownMenu">
          <div class="notif-dropdown-card">
            <div class="notif-header">
              <div class="notif-title-group">
                <span nz-icon nzType="bell" nzTheme="outline" class="notif-header-icon"></span>
                <span class="notif-title">Đơn đăng ký khóa học mới</span>
              </div>
              <nz-tag nzColor="orange" *ngIf="(pendingCount$ | async) as count" style="margin: 0;">
                {{ count }} đơn chờ duyệt
              </nz-tag>
            </div>

            <div class="notif-body">
              <div *ngIf="loadingNotifs" class="notif-loading">
                <nz-spin nzSimple></nz-spin>
                <span>Đang tải thông báo...</span>
              </div>

              <div *ngIf="!loadingNotifs && pendingRegistrations.length > 0" class="notif-list">
                <div
                  *ngFor="let reg of pendingRegistrations"
                  class="notif-item"
                  (click)="goToPendingEnrollments()"
                >
                  <nz-avatar
                    nzIcon="user"
                    [nzSize]="36"
                    style="background-color: #e6f7ff; color: #1890ff; flex-shrink: 0; margin-top: 2px;"
                  ></nz-avatar>

                  <div class="notif-item-content">
                    <div class="notif-item-top">
                      <strong class="student-name">{{ reg.student?.fullName || reg.studentName }}</strong>
                      <span class="notif-time">{{ (reg.registeredAt || reg.enrollmentDate) | date:'HH:mm dd/MM' }}</span>
                    </div>

                    <div class="notif-item-course">
                      <span class="course-label">Đăng ký:</span>
                      <span class="course-name">{{ reg.course?.name || reg.courseName }}</span>
                    </div>

                    <div class="notif-item-bottom">
                      <span class="student-contact" *ngIf="reg.studentPhone || reg.student?.phone">
                        <span nz-icon nzType="phone" style="font-size: 11px; margin-right: 3px;"></span>
                        {{ reg.studentPhone || reg.student?.phone }}
                      </span>
                      <nz-tag nzColor="warning" style="margin: 0; font-size: 11px; line-height: 18px; height: 20px;">
                        Chờ duyệt
                      </nz-tag>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="!loadingNotifs && pendingRegistrations.length === 0" class="notif-empty">
                <span nz-icon nzType="check-circle" nzTheme="outline" class="empty-icon"></span>
                <p class="empty-title">Không có đơn đăng ký mới</p>
                <p class="empty-desc">Tất cả các phiếu đăng ký khóa học đã được duyệt hoặc xử lý.</p>
              </div>
            </div>

            <div class="notif-footer">
              <button nz-button nzType="link" (click)="goToPendingEnrollments()" class="view-all-btn">
                <span>Xem tất cả phiếu đăng ký</span>
                <span nz-icon nzType="right"></span>
              </button>
            </div>
          </div>
        </nz-dropdown-menu>

        <!-- User profile dropdown -->
        <div *ngIf="currentUser$ | async as user" class="user-profile" nz-dropdown [nzDropdownMenu]="userMenu" nzPlacement="bottomRight">
          <nz-avatar nzIcon="user" [nzSize]="34" style="background-color: #1890ff; cursor: pointer;"></nz-avatar>
          <div class="user-meta">
            <span class="user-name">{{ user.fullName }}</span>
            <span class="user-role">{{ user.roles[0].name || 'Thành viên' }}</span>
          </div>
          <span nz-icon nzType="down" style="font-size: 11px; color: #8c8c8c; margin-left: 6px;"></span>
        </div>

        <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu nzSelectable="false">
            <li nz-menu-item routerLink="/dashboard">
              <span nz-icon nzType="dashboard" style="margin-right: 8px;"></span>
              <span>Bảng điều khiển</span>
            </li>
            <li nz-menu-item (click)="openChangePasswordModal()">
              <span nz-icon nzType="key" style="margin-right: 8px; color: #faad14;"></span>
              <span>Đổi mật khẩu</span>
            </li>
            <li nz-menu-divider></li>
            <li nz-menu-item (click)="onLogout()" nzDanger>
              <span nz-icon nzType="logout" style="margin-right: 8px;"></span>
              <span>Đăng xuất</span>
            </li>
          </ul>
        </nz-dropdown-menu>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 64px;
      line-height: normal;
    }
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      line-height: normal;
      padding: 0 24px;
      background: #ffffff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      position: relative;
      z-index: 10;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      line-height: normal;
    }
    .trigger-btn {
      font-size: 18px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .system-title {
      font-size: 16px;
      font-weight: 600;
      color: #001529;
      letter-spacing: 0.3px;
      line-height: normal;
    }
    .header-right {
      display: flex;
      align-items: center;
      height: 100%;
      gap: 16px;
      line-height: normal;
    }
    .notif-bell-trigger {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      line-height: normal;
      flex-shrink: 0;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      line-height: normal;
      flex-shrink: 0;
    }
    .bell-btn {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      &:hover {
        background: #f0f0f0;
      }
    }
    .portal-nav-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      line-height: 1;
      padding: 0 12px;
      border-radius: 6px;
      background: #e6f7ff;
      color: #1890ff;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      border: 1px solid #91d5ff;
      box-sizing: border-box;
      flex-shrink: 0;

      &:hover {
        background: #bae7ff;
        color: #096dd9;
      }
    }
    .user-profile {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      height: 40px;
      padding: 0 8px;
      border-radius: 6px;
      transition: background 0.3s;
      line-height: normal;
      flex-shrink: 0;

      &:hover {
        background: #f5f5f5;
      }
    }
    .user-meta {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 8px;
      text-align: left;
      line-height: 1.2;
    }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      line-height: 1.3;
      white-space: nowrap;
      margin: 0;
      padding: 0;
    }
    .user-role {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.45);
      line-height: 1.2;
      white-space: nowrap;
      margin: 0;
      padding: 0;
    }

    /* =======================================================
       NOTIFICATION DROPDOWN CARD STYLES
       ======================================================= */
    .notif-dropdown-card {
      width: 380px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
      border: 1px solid #e8e8e8;
      overflow: hidden;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;
    }
    .notif-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .notif-header-icon {
      color: #1890ff;
      font-size: 16px;
    }
    .notif-title {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
    }
    .notif-body {
      max-height: 360px;
      overflow-y: auto;
    }
    .notif-loading {
      padding: 36px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: #8c8c8c;
      font-size: 13px;
    }
    .notif-list {
      display: flex;
      flex-direction: column;
    }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f6ffed;
      }
      &:last-child {
        border-bottom: none;
      }
    }
    .notif-item-content {
      flex: 1;
      min-width: 0;
    }
    .notif-item-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 3px;
    }
    .student-name {
      font-size: 13.5px;
      font-weight: 600;
      color: #1f1f1f;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 190px;
    }
    .notif-time {
      font-size: 11px;
      color: #8c8c8c;
    }
    .notif-item-course {
      font-size: 12.5px;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .course-label {
      color: #8c8c8c;
      margin-right: 4px;
    }
    .course-name {
      color: #1890ff;
      font-weight: 500;
    }
    .notif-item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2px;
    }
    .student-contact {
      font-size: 11.5px;
      color: #595959;
    }
    .notif-empty {
      padding: 40px 20px;
      text-align: center;
    }
    .empty-icon {
      font-size: 36px;
      color: #52c41a;
      margin-bottom: 8px;
    }
    .empty-title {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 4px 0;
    }
    .empty-desc {
      font-size: 12px;
      color: #8c8c8c;
      margin: 0;
    }
    .notif-footer {
      padding: 8px 16px;
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
      text-align: center;
    }
    .view-all-btn {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #1890ff;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() isCollapsedChange = new EventEmitter<boolean>();

  currentUser$ = this.authService.currentUser$;
  pendingCount$ = this.enrollmentService.pendingCount$;

  pendingRegistrations: Enrollment[] = [];
  loadingNotifs = false;
  notifDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private router: Router,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    if (this.canViewNotifications()) {
      this.loadPendingRegistrations();
    }
  }

  canViewNotifications(): boolean {
    const user = this.authService.currentUserValue;
    if (!user || !user.roles) return false;
    // Admin hoặc Manager có quyền xem và duyệt thông báo
    const isAdminOrManager = user.roles.some(r => r.code === RoleType.ADMIN || r.code === RoleType.MANAGER);
    if (isAdminOrManager) return true;

    // Không hiển thị cho Học viên, Giáo viên, Kế toán
    const excludedRoles = [RoleType.STUDENT, RoleType.TEACHER, RoleType.ACCOUNTANT];
    const isExcluded = user.roles.some(r => excludedRoles.includes(r.code));
    return !isExcluded;
  }

  onNotifVisibleChange(visible: boolean): void {
    this.notifDropdownOpen = visible;
    if (visible && this.canViewNotifications()) {
      this.loadPendingRegistrations();
    }
  }

  loadPendingRegistrations(): void {
    if (!this.canViewNotifications()) {
      return;
    }
    this.loadingNotifs = true;
    this.enrollmentService.getEnrollments(0, 6, undefined, 'PENDING').subscribe({
      next: (res) => {
        this.pendingRegistrations = res.data?.content || [];
        this.loadingNotifs = false;
      },
      error: () => {
        this.loadingNotifs = false;
      }
    });
    this.enrollmentService.refreshPendingCount();
  }

  goToPendingEnrollments(keyword?: string): void {
    this.notifDropdownOpen = false;
    const queryParams: any = { status: 'PENDING' };
    if (keyword) {
      queryParams.keyword = keyword;
    }
    this.router.navigate(['/enrollments'], { queryParams });
  }

  goToEnrollments(): void {
    this.notifDropdownOpen = false;
    this.router.navigate(['/enrollments']);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }

  openChangePasswordModal(): void {
    this.modal.create({
      nzTitle: 'Đổi Mật Khẩu Cá Nhân',
      nzContent: ChangePasswordDialogComponent,
      nzFooter: null,
      nzWidth: 460
    });
  }

  onLogout(): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận đăng xuất',
      nzContent: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý?',
      nzOkText: 'Đăng xuất',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => this.authService.logout()
    });
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../core/services/auth.service';
import { RoleType } from '../../core/models/user.model';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  roles?: RoleType[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NzMenuModule, NzIconModule],
  template: `
    <div class="sidebar-logo">
      <span nz-icon nzType="book" nzTheme="outline" class="logo-icon"></span>
      <span class="logo-title" *ngIf="!isCollapsed">EDU CENTER</span>
    </div>

    <ul nz-menu nzMode="inline" [nzInlineCollapsed]="isCollapsed" class="sidebar-menu">
      <ng-container *ngFor="let item of menuItems">
        <li
          nz-menu-item
          [routerLink]="item.route"
          routerLinkActive="ant-menu-item-selected"
          *ngIf="canAccess(item)"
        >
          <span nz-icon [nzType]="item.icon"></span>
          <span>{{ item.title }}</span>
        </li>
      </ng-container>
    </ul>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .sidebar-logo {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 12px;
      color: #1890ff;
      background: white;
      overflow: hidden;
      white-space: nowrap;
    }
    .logo-icon {
      font-size: 24px;
      color: #1890ff;
    }
    .logo-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #1890ff;
    }
    .sidebar-menu {
      flex: 1;
      border-right: none;
      overflow-y: auto;
      overflow-x: hidden;
    }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  menuItems: MenuItem[] = [
    {
      title: 'Bảng điều khiển',
      icon: 'dashboard',
      route: '/dashboard',
      roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER, RoleType.ACCOUNTANT]
    },
    {
      title: 'Quản lý Học viên',
      icon: 'user',
      route: '/students',
      roles: [RoleType.ADMIN, RoleType.MANAGER]
    },
    {
      title: 'Quản lý Giáo viên',
      icon: 'team',
      route: '/teachers',
      roles: [RoleType.ADMIN, RoleType.MANAGER]
    },
    {
      title: 'Quản lý Khóa học',
      icon: 'book',
      route: '/courses',
      roles: [RoleType.ADMIN, RoleType.MANAGER]
    },
    {
      title: 'Quản lý Lớp học',
      icon: 'apartment',
      route: '/classes',
      roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER]
    },
    {
      title: 'Đăng ký Khóa học',
      icon: 'idcard',
      route: '/enrollments',
      roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.ACCOUNTANT]
    },
    {
      title: 'Lịch học & Phòng',
      icon: 'calendar',
      route: '/schedules',
      roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER, RoleType.STUDENT]
    },
    {
      title: 'Điểm danh buổi học',
      icon: 'check-square',
      route: '/attendance',
      roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER]
    },
    // {
    //   title: 'Hóa đơn học phí',
    //   icon: 'file-text',
    //   route: '/invoices',
    //   roles: [RoleType.ADMIN, RoleType.ACCOUNTANT, RoleType.STUDENT]
    // },
    // {
    //   title: 'Lịch sử thanh toán',
    //   icon: 'dollar',
    //   route: '/payments',
    //   roles: [RoleType.ADMIN, RoleType.ACCOUNTANT, RoleType.STUDENT]
    // },
    // {
    //   title: 'Báo cáo thống kê',
    //   icon: 'bar-chart',
    //   route: '/reports',
    //   roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.ACCOUNTANT]
    // }
  ];

  constructor(
    private authService: AuthService
  ) {}

  canAccess(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasAnyRole(item.roles);
  }
}

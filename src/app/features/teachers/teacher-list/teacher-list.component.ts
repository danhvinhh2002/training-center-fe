import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { TeacherService } from '../../../core/services/teacher.service';
import { Teacher, TeacherStatus } from '../../../core/models/teacher.model';
import { TeacherFormDialogComponent } from '../teacher-form-dialog/teacher-form-dialog.component';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzPopconfirmModule,
    NzModalModule,
    NzGridModule,
    NzDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>Quản Lý Giáo Viên</h2>
          <p>Danh sách hồ sơ giảng viên và chuyên môn đào tạo</p>
        </div>
        <div class="page-actions">
          <button nz-button nzType="primary" (click)="openCreateModal()">
            <span nz-icon nzType="plus"></span>
            <span>Thêm Giáo Viên Mới</span>
          </button>
        </div>
      </div>

      <!-- Filter Card -->
      <div class="filter-card">
        <div nz-row [nzGutter]="16" nzAlign="middle">
          <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="10">
            <nz-input-group [nzPrefix]="searchIcon" [nzSuffix]="clearSearch">
              <input
                type="text"
                nz-input
                placeholder="Tìm theo mã, tên, chuyên môn, email..."
                [(ngModel)]="searchKeyword"
                (keyup.enter)="loadTeachers()"
              />
            </nz-input-group>
            <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
            <ng-template #clearSearch>
              <span
                *ngIf="searchKeyword"
                nz-icon
                nzType="close-circle"
                (click)="searchKeyword = ''; loadTeachers()"
                style="cursor: pointer; color: #bfbfbf;"
              ></span>
            </ng-template>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="8" [nzMd]="6">
            <nz-select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="loadTeachers()"
              nzPlaceHolder="Lọc theo trạng thái"
              style="width: 100%;"
            >
              <nz-option nzValue="" nzLabel="-- Tất cả trạng thái --"></nz-option>
              <nz-option [nzValue]="TeacherStatus.ACTIVE" nzLabel="Đang dạy (ACTIVE)"></nz-option>
              <nz-option [nzValue]="TeacherStatus.ON_LEAVE" nzLabel="Nghỉ phép (ON_LEAVE)"></nz-option>
              <nz-option [nzValue]="TeacherStatus.RESIGNED" nzLabel="Đã nghỉ (RESIGNED)"></nz-option>
            </nz-select>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="4" [nzMd]="8" style="text-align: right;">
            <button nz-button nzType="default" (click)="loadTeachers()">
              <span nz-icon nzType="reload"></span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <nz-table
          #teacherTable
          [nzData]="teachers"
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
              <th nzWidth="120px">Mã GV</th>
              <th>Họ và Tên</th>
              <th nzWidth="90px">Giới Tính</th>
              <th>Chuyên Môn</th>
              <th>Học Vị</th>
              <th>Số Điện Thoại</th>
              <th>Email</th>
              <th>Trạng Thái</th>
              <th nzWidth="150px" nzAlign="center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of teacherTable.data">
              <td><strong>{{ t.teacherCode }}</strong></td>
              <td><span style="font-weight: 500;">{{ t.fullName }}</span></td>
              <td>
                <nz-tag [nzColor]="t.gender === 'MALE' ? 'blue' : (t.gender === 'FEMALE' ? 'magenta' : 'default')">
                  {{ t.gender === 'MALE' ? 'Nam' : (t.gender === 'FEMALE' ? 'Nữ' : 'Khác') }}
                </nz-tag>
              </td>
              <td><nz-tag nzColor="cyan">{{ t.specialization }}</nz-tag></td>
              <td>{{ t.degree || '-' }}</td>
              <td>{{ t.phone }}</td>
              <td>{{ t.email }}</td>
              <td>
                <nz-tag [nzColor]="getStatusColor(t.status)">
                  {{ getStatusLabel(t.status) }}
                </nz-tag>
              </td>
              <td nzAlign="center">
                <a (click)="openEditModal(t)" style="color: #1890ff;">
                  <span nz-icon nzType="edit"></span> Sửa
                </a>
                <nz-divider nzType="vertical"></nz-divider>
                <a
                  nz-popconfirm
                  nzPopconfirmTitle="Bạn có chắc chắn muốn xóa giáo viên này?"
                  nzOkText="Xóa"
                  nzOkDanger="true"
                  nzCancelText="Hủy"
                  (nzOnConfirm)="deleteTeacher(t.id)"
                  style="color: #ff4d4f;"
                >
                  <span nz-icon nzType="delete"></span> Xóa
                </a>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>
    </div>
  `
})
export class TeacherListComponent implements OnInit {
  TeacherStatus = TeacherStatus;

  teachers: Teacher[] = [];
  totalElements = 0;
  pageIndex = 1;
  pageSize = 10;
  searchKeyword = '';
  selectedStatus: TeacherStatus | '' = '';
  loading = false;

  constructor(
    private teacherService: TeacherService,
    private modal: NzModalService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.loading = true;
    this.teacherService
      .getTeachers(
        this.pageIndex - 1,
        this.pageSize,
        this.searchKeyword || undefined,
        this.selectedStatus || undefined
      )
      .subscribe({
        next: (res) => {
          this.teachers = res.data.content;
          this.totalElements = res.data.totalElements;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onPageIndexChange(page: number): void {
    this.pageIndex = page;
    this.loadTeachers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadTeachers();
  }

  openCreateModal(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Thêm Mới Giáo Viên',
      nzContent: TeacherFormDialogComponent,
      nzData: { isEdit: false },
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.teacherService.createTeacher(result).subscribe({
          next: () => {
            const loginUser = result.username && result.username.trim()
              ? result.username.trim()
              : (result.teacherCode ? result.teacherCode.toLowerCase() : result.email);
            const loginPass = result.password && result.password.trim() ? result.password.trim() : 'password123';
            this.msg.success(`Thêm giáo viên thành công! Tài khoản: ${loginUser} | Mật khẩu: ${loginPass}`, { nzDuration: 6000 });
            this.loadTeachers();
          }
        });
      }
    });
  }

  openEditModal(teacher: Teacher): void {
    const modalRef = this.modal.create({
      nzTitle: `Cập Nhật Giáo Viên: ${teacher.fullName}`,
      nzContent: TeacherFormDialogComponent,
      nzData: { teacher, isEdit: true },
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.teacherService.updateTeacher(teacher.id, result).subscribe({
          next: () => {
            this.msg.success('Cập nhật thông tin giáo viên thành công!');
            this.loadTeachers();
          }
        });
      }
    });
  }

  deleteTeacher(id: number): void {
    this.teacherService.deleteTeacher(id).subscribe({
      next: () => {
        this.msg.success('Đã xóa giáo viên!');
        this.loadTeachers();
      }
    });
  }

  getStatusColor(status: TeacherStatus): string {
    switch (status) {
      case TeacherStatus.ACTIVE: return 'success';
      case TeacherStatus.ON_LEAVE: return 'warning';
      case TeacherStatus.RESIGNED: return 'default';
      default: return 'default';
    }
  }

  getStatusLabel(status: TeacherStatus): string {
    switch (status) {
      case TeacherStatus.ACTIVE: return 'Đang dạy';
      case TeacherStatus.ON_LEAVE: return 'Nghỉ phép';
      case TeacherStatus.RESIGNED: return 'Đã nghỉ việc';
      default: return status;
    }
  }
}

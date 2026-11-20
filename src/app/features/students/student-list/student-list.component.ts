import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { StudentService } from '../../../core/services/student.service';
import { Student, StudentStatus } from '../../../core/models/student.model';
import { StudentFormDialogComponent } from '../student-form-dialog/student-form-dialog.component';

@Component({
  selector: 'app-student-list',
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
    NzToolTipModule,
    NzPopconfirmModule,
    NzModalModule,
    NzGridModule,
    NzDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>Quản Lý Học Viên</h2>
          <p>Danh sách và thông tin hồ sơ học viên toàn hệ thống</p>
        </div>
        <div class="page-actions">
          <button nz-button nzType="primary" (click)="openCreateModal()">
            <span nz-icon nzType="plus"></span>
            <span>Thêm Học Viên Mới</span>
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
                placeholder="Tìm kiếm theo mã, họ tên, email, sđt..."
                [(ngModel)]="searchKeyword"
                (keyup.enter)="loadStudents()"
              />
            </nz-input-group>
            <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
            <ng-template #clearSearch>
              <span
                *ngIf="searchKeyword"
                nz-icon
                nzType="close-circle"
                (click)="searchKeyword = ''; loadStudents()"
                style="cursor: pointer; color: #bfbfbf;"
              ></span>
            </ng-template>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="8" [nzMd]="6">
            <nz-select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="loadStudents()"
              nzPlaceHolder="Lọc theo trạng thái"
              style="width: 100%;"
            >
              <nz-option nzValue="" nzLabel="-- Tất cả trạng thái --"></nz-option>
              <nz-option [nzValue]="StudentStatus.STUDYING" nzLabel="Đang học (STUDYING)"></nz-option>
              <nz-option [nzValue]="StudentStatus.RESERVED" nzLabel="Bảo lưu (RESERVED)"></nz-option>
              <nz-option [nzValue]="StudentStatus.GRADUATED" nzLabel="Đã tốt nghiệp (GRADUATED)"></nz-option>
              <nz-option [nzValue]="StudentStatus.DROPPED" nzLabel="Thôi học (DROPPED)"></nz-option>
            </nz-select>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="4" [nzMd]="8" style="text-align: right;">
            <button nz-button nzType="default" (click)="loadStudents()">
              <span nz-icon nzType="reload"></span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <nz-table
          #studentTable
          [nzData]="students"
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
              <th nzWidth="120px">Mã HV</th>
              <th>Họ và Tên</th>
              <th>Giới tính</th>
              <th>Ngày sinh</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th nzWidth="150px" nzAlign="center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of studentTable.data">
              <td><strong>{{ s.studentCode }}</strong></td>
              <td>
                <span style="font-weight: 500;">{{ s.fullName }}</span>
                <span *ngIf="s.telegramChatId" nz-icon nzType="send" style="color: #1890ff; margin-left: 6px;" nzTooltipTitle="Đã liên kết Telegram nhận tin riêng: {{ s.telegramChatId }}" nz-tooltip></span>
              </td>
              <td>{{ getGenderLabel(s.gender) }}</td>
              <td>{{ s.dateOfBirth | date:'dd/MM/yyyy' }}</td>
              <td>{{ s.phone }}</td>
              <td>{{ s.email }}</td>
              <td>
                <nz-tag [nzColor]="getStatusTagColor(s.status)">
                  {{ getStatusLabel(s.status) }}
                </nz-tag>
              </td>
              <td nzAlign="center">
                <a (click)="openEditModal(s)" style="color: #1890ff;">
                  <span nz-icon nzType="edit"></span> Sửa
                </a>
                <nz-divider nzType="vertical"></nz-divider>
                <a
                  nz-popconfirm
                  nzPopconfirmTitle="Bạn có chắc chắn muốn xóa học viên này?"
                  nzOkText="Xóa"
                  nzOkDanger="true"
                  nzCancelText="Hủy"
                  (nzOnConfirm)="deleteStudent(s.id)"
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
export class StudentListComponent implements OnInit {
  StudentStatus = StudentStatus;

  students: Student[] = [];
  totalElements = 0;
  pageIndex = 1;
  pageSize = 10;
  searchKeyword = '';
  selectedStatus: StudentStatus | '' = '';
  loading = false;

  constructor(
    private studentService: StudentService,
    private modal: NzModalService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService
      .getStudents(
        this.pageIndex - 1,
        this.pageSize,
        this.searchKeyword || undefined,
        this.selectedStatus || undefined
      )
      .subscribe({
        next: (res) => {
          this.students = res.data.content;
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
    this.loadStudents();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadStudents();
  }

  openCreateModal(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Thêm Mới Học Viên',
      nzContent: StudentFormDialogComponent,
      nzData: { isEdit: false },
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.studentService.createStudent(result).subscribe({
          next: () => {
            const loginUser = result.username && result.username.trim()
              ? result.username.trim()
              : (result.studentCode ? result.studentCode.toLowerCase() : result.email);
            const loginPass = result.password && result.password.trim() ? result.password.trim() : 'password123';
            this.msg.success(`Thêm học viên thành công! Tài khoản: ${loginUser} | Mật khẩu: ${loginPass}`, { nzDuration: 6000 });
            this.loadStudents();
          }
        });
      }
    });
  }

  openEditModal(student: Student): void {
    const modalRef = this.modal.create({
      nzTitle: `Cập Nhật Học Viên: ${student.fullName}`,
      nzContent: StudentFormDialogComponent,
      nzData: { student, isEdit: true },
      nzFooter: null,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.studentService.updateStudent(student.id, result).subscribe({
          next: () => {
            this.msg.success('Cập nhật học viên thành công!');
            this.loadStudents();
          }
        });
      }
    });
  }

  deleteStudent(id: number): void {
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.msg.success('Đã xóa học viên thành công!');
        this.loadStudents();
      }
    });
  }

  getStatusTagColor(status: StudentStatus): string {
    switch (status) {
      case StudentStatus.STUDYING:
      case StudentStatus.ACTIVE: return 'success';
      case StudentStatus.RESERVED:
      case StudentStatus.SUSPENDED: return 'warning';
      case StudentStatus.GRADUATED: return 'blue';
      case StudentStatus.DROPPED:
      case StudentStatus.DROPPED_OUT: return 'default';
      default: return 'default';
    }
  }

  getStatusLabel(status: StudentStatus): string {
    switch (status) {
      case StudentStatus.STUDYING:
      case StudentStatus.ACTIVE: return 'Đang học';
      case StudentStatus.RESERVED:
      case StudentStatus.SUSPENDED: return 'Bảo lưu';
      case StudentStatus.GRADUATED: return 'Tốt nghiệp';
      case StudentStatus.DROPPED:
      case StudentStatus.DROPPED_OUT: return 'Thôi học';
      default: return status;
    }
  }

  getGenderLabel(gender: string): string {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      default: return 'Khác';
    }
  }
}

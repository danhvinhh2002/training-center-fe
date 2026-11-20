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
import { ClassService } from '../../../core/services/class.service';
import { CenterClass, ClassStatus } from '../../../core/models/class.model';
import { ClassFormDialogComponent } from '../class-form-dialog/class-form-dialog.component';
import { ClassRosterDialogComponent } from '../class-roster-dialog/class-roster-dialog.component';
import { RecurringScheduleDialogComponent } from '../../schedules/recurring-schedule-dialog/recurring-schedule-dialog.component';

@Component({
  selector: 'app-class-list',
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
          <h2>Quản Lý Lớp Học</h2>
          <p>Điều phối lớp học, phân công giảng viên, quản lý sĩ số và xếp lớp</p>
        </div>
        <div class="page-actions">
          <button nz-button nzType="primary" (click)="openCreateModal()">
            <span nz-icon nzType="plus"></span>
            <span>Mở Lớp Học Mới</span>
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
                placeholder="Tìm theo mã lớp, tên lớp, phòng học..."
                [(ngModel)]="searchKeyword"
                (keyup.enter)="loadClasses()"
              />
            </nz-input-group>
            <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
            <ng-template #clearSearch>
              <span
                *ngIf="searchKeyword"
                nz-icon
                nzType="close-circle"
                (click)="searchKeyword = ''; loadClasses()"
                style="cursor: pointer; color: #bfbfbf;"
              ></span>
            </ng-template>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="8" [nzMd]="6">
            <nz-select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="loadClasses()"
              nzPlaceHolder="Lọc theo trạng thái"
              style="width: 100%;"
            >
              <nz-option nzValue="" nzLabel="-- Tất cả trạng thái --"></nz-option>
              <nz-option [nzValue]="ClassStatus.PLANNED" nzLabel="Lên kế hoạch (PLANNED)"></nz-option>
              <nz-option [nzValue]="ClassStatus.OPENING" nzLabel="Đang tuyển sinh (OPENING)"></nz-option>
              <nz-option [nzValue]="ClassStatus.ONGOING" nzLabel="Đang học (ONGOING)"></nz-option>
              <nz-option [nzValue]="ClassStatus.COMPLETED" nzLabel="Đã kết thúc (COMPLETED)"></nz-option>
              <nz-option [nzValue]="ClassStatus.CANCELLED" nzLabel="Đã hủy (CANCELLED)"></nz-option>
            </nz-select>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="4" [nzMd]="8" style="text-align: right;">
            <button nz-button nzType="default" (click)="loadClasses()">
              <span nz-icon nzType="reload"></span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <nz-table
          #classTable
          [nzData]="classes"
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
              <th nzWidth="130px">Mã Lớp</th>
              <th>Tên Lớp Học</th>
              <th>Khóa Học</th>
              <th>Giáo Viên</th>
              <th>Phòng</th>
              <th>Sĩ Số</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th nzWidth="200px" nzAlign="center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of classTable.data">
              <td><strong>{{ c.classCode }}</strong></td>
              <td><span style="font-weight: 500;">{{ c.name }}</span></td>
              <td>
                <div>{{ c.course?.name || c.courseName }}</div>
                <div style="font-size: 11px; color: #8c8c8c;">{{ c.totalLessons || 30 }} buổi ({{ c.hoursPerLesson || 2 }}h/buổi)</div>
              </td>
              <td><span style="color: #1890ff;">{{ c.teacher?.fullName || c.teacherName }}</span></td>
              <td>{{ c.room || c.defaultRoom || '-' }}</td>
              <td>
                <span [style.color]="c.currentStudents >= c.maxStudents ? '#f5222d' : '#52c41a'" style="font-weight: 600;">
                  {{ c.currentStudents }} / {{ c.maxStudents }}
                </span>
              </td>
              <td>{{ c.startDate | date:'dd/MM/yyyy' }}</td>
              <td>
                <nz-tag [nzColor]="getStatusColor(c.status)">
                  {{ getStatusLabel(c.status) }}
                </nz-tag>
              </td>
              <td nzAlign="center">
                <a (click)="openRosterModal(c)" style="color: #52c41a;">
                  <span nz-icon nzType="team"></span> DS Lớp
                </a>
                <nz-divider nzType="vertical"></nz-divider>
                <a (click)="openRecurringScheduleModal(c)" style="color: #13c2c2;">
                  <span nz-icon nzType="calendar"></span> Lên lịch
                </a>
                <nz-divider nzType="vertical"></nz-divider>
                <a (click)="openEditModal(c)" style="color: #1890ff;">
                  <span nz-icon nzType="edit"></span> Sửa
                </a>
                <nz-divider nzType="vertical"></nz-divider>
                <a
                  nz-popconfirm
                  nzPopconfirmTitle="Bạn có chắc muốn xóa lớp học này?"
                  nzOkText="Xóa"
                  nzOkDanger="true"
                  nzCancelText="Hủy"
                  (nzOnConfirm)="deleteClass(c.id)"
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
export class ClassListComponent implements OnInit {
  ClassStatus = ClassStatus;

  classes: CenterClass[] = [];
  totalElements = 0;
  pageIndex = 1;
  pageSize = 10;
  searchKeyword = '';
  selectedStatus: ClassStatus | '' = '';
  loading = false;

  constructor(
    private classService: ClassService,
    private modal: NzModalService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    this.classService
      .getClasses(
        this.pageIndex - 1,
        this.pageSize,
        this.searchKeyword || undefined,
        this.selectedStatus || undefined
      )
      .subscribe({
        next: (res) => {
          this.classes = res.data.content;
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
    this.loadClasses();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadClasses();
  }

  openCreateModal(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Mở Lớp Học Mới',
      nzContent: ClassFormDialogComponent,
      nzData: { isEdit: false },
      nzFooter: null,
      nzWidth: 620
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.classService.createClass(result).subscribe({
          next: () => {
            this.msg.success('Mở lớp học thành công!');
            this.loadClasses();
          }
        });
      }
    });
  }

  openEditModal(centerClass: CenterClass): void {
    const modalRef = this.modal.create({
      nzTitle: `Cập Nhật Lớp: ${centerClass.name}`,
      nzContent: ClassFormDialogComponent,
      nzData: { centerClass, isEdit: true },
      nzFooter: null,
      nzWidth: 620
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.classService.updateClass(centerClass.id, result).subscribe({
          next: () => {
            this.msg.success('Cập nhật lớp học thành công!');
            this.loadClasses();
          }
        });
      }
    });
  }

  openRosterModal(centerClass: CenterClass): void {
    const modalRef = this.modal.create({
      nzTitle: `Danh Sách Học Viên: ${centerClass.classCode} - ${centerClass.name}`,
      nzContent: ClassRosterDialogComponent,
      nzData: { centerClass },
      nzFooter: null,
      nzWidth: 780
    });

    modalRef.afterClose.subscribe(() => {
      this.loadClasses();
    });
  }

  openRecurringScheduleModal(centerClass: CenterClass): void {
    const modalRef = this.modal.create({
      nzTitle: `Sinh Lịch Học Tự Động: ${centerClass.classCode} - ${centerClass.name}`,
      nzContent: RecurringScheduleDialogComponent,
      nzData: { classId: centerClass.id },
      nzFooter: null,
      nzWidth: 720
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.msg.success(`Đã sinh thành công ${result.totalGenerated} buổi học cho lớp ${centerClass.classCode}!`);
      }
    });
  }

  deleteClass(id: number): void {
    this.classService.deleteClass(id).subscribe({
      next: () => {
        this.msg.success('Đã xóa lớp học!');
        this.loadClasses();
      }
    });
  }

  getStatusColor(status: ClassStatus): string {
    switch (status) {
      case ClassStatus.PLANNED:
      case ClassStatus.PLANNING: return 'blue';
      case ClassStatus.OPENING:
      case ClassStatus.OPEN: return 'cyan';
      case ClassStatus.ONGOING:
      case ClassStatus.IN_PROGRESS: return 'processing';
      case ClassStatus.COMPLETED: return 'success';
      case ClassStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(status: ClassStatus): string {
    switch (status) {
      case ClassStatus.PLANNED:
      case ClassStatus.PLANNING: return 'Lên KH';
      case ClassStatus.OPENING:
      case ClassStatus.OPEN: return 'Tuyển sinh';
      case ClassStatus.ONGOING:
      case ClassStatus.IN_PROGRESS: return 'Đang học';
      case ClassStatus.COMPLETED: return 'Hoàn thành';
      case ClassStatus.CANCELLED: return 'Đã hủy';
      default: return status;
    }
  }
}

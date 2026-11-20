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
import { CourseService } from '../../../core/services/course.service';
import { Course, CourseStatus } from '../../../core/models/course.model';
import { CourseFormDialogComponent } from '../course-form-dialog/course-form-dialog.component';

@Component({
  selector: 'app-course-list',
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
          <h2>Quản Lý Khóa Học</h2>
          <p>Chương trình đào tạo, thời lượng và khung học phí tiêu chuẩn</p>
        </div>
        <div class="page-actions">
          <button nz-button nzType="primary" (click)="openCreateModal()">
            <span nz-icon nzType="plus"></span>
            <span>Thêm Khóa Học Mới</span>
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
                placeholder="Tìm khóa học theo mã hoặc tên..."
                [(ngModel)]="searchKeyword"
                (keyup.enter)="loadCourses()"
              />
            </nz-input-group>
            <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
            <ng-template #clearSearch>
              <span
                *ngIf="searchKeyword"
                nz-icon
                nzType="close-circle"
                (click)="searchKeyword = ''; loadCourses()"
                style="cursor: pointer; color: #bfbfbf;"
              ></span>
            </ng-template>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="8" [nzMd]="6">
            <nz-select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="loadCourses()"
              nzPlaceHolder="Lọc theo trạng thái"
              style="width: 100%;"
            >
              <nz-option nzValue="" nzLabel="-- Tất cả trạng thái --"></nz-option>
              <nz-option [nzValue]="CourseStatus.ACTIVE" nzLabel="Đang mở (ACTIVE)"></nz-option>
              <nz-option [nzValue]="CourseStatus.INACTIVE" nzLabel="Tạm ngưng (INACTIVE)"></nz-option>
            </nz-select>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="4" [nzMd]="8" style="text-align: right;">
            <button nz-button nzType="default" (click)="loadCourses()">
              <span nz-icon nzType="reload"></span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <nz-table
          #courseTable
          [nzData]="courses"
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
              <th nzWidth="130px">Mã Khóa</th>
              <th>Tên Khóa Học</th>
              <th>Thời Lượng</th>
              <th>Tổng Buổi Học</th>
              <th>Học Phí</th>
              <th>Trạng Thái</th>
              <th nzWidth="150px" nzAlign="center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of courseTable.data">
              <td><strong>{{ c.courseCode }}</strong></td>
              <td><span style="font-weight: 500;">{{ c.name }}</span></td>
              <td>
                <span>{{ c.totalHours }} giờ</span>
                <span style="display: block; font-size: 11px; color: #8c8c8c;">({{ c.hoursPerLesson || 2 }}h/buổi)</span>
              </td>
              <td><strong>{{ c.totalLessons }}</strong> buổi</td>
              <td><strong style="color: #fa8c16;">{{ (c.tuitionFee || c.standardFee || 0) | number }} đ</strong></td>
              <td>
                <nz-tag [nzColor]="c.status === CourseStatus.ACTIVE ? 'success' : 'default'">
                  {{ c.status === CourseStatus.ACTIVE ? 'Đang mở' : 'Tạm ngưng' }}
                </nz-tag>
              </td>
              <td nzAlign="center">
                <a (click)="openEditModal(c)" style="color: #1890ff;">
                  <span nz-icon nzType="edit"></span> Sửa
                </a>
                <nz-divider nzType="vertical"></nz-divider>
                <a
                  nz-popconfirm
                  nzPopconfirmTitle="Bạn có chắc chắn muốn xóa khóa học này?"
                  nzOkText="Xóa"
                  nzOkDanger="true"
                  nzCancelText="Hủy"
                  (nzOnConfirm)="deleteCourse(c.id)"
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
export class CourseListComponent implements OnInit {
  CourseStatus = CourseStatus;

  courses: Course[] = [];
  totalElements = 0;
  pageIndex = 1;
  pageSize = 10;
  searchKeyword = '';
  selectedStatus: CourseStatus | '' = '';
  loading = false;

  constructor(
    private courseService: CourseService,
    private modal: NzModalService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService
      .getCourses(
        this.pageIndex - 1,
        this.pageSize,
        this.searchKeyword || undefined,
        this.selectedStatus || undefined
      )
      .subscribe({
        next: (res) => {
          this.courses = res.data.content;
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
    this.loadCourses();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadCourses();
  }

  openCreateModal(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Thêm Mới Khóa Học',
      nzContent: CourseFormDialogComponent,
      nzData: { isEdit: false },
      nzFooter: null,
      nzWidth: 560
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.courseService.createCourse(result).subscribe({
          next: () => {
            this.msg.success('Thêm khóa học thành công!');
            this.loadCourses();
          }
        });
      }
    });
  }

  openEditModal(course: Course): void {
    const modalRef = this.modal.create({
      nzTitle: `Cập Nhật Khóa Học: ${course.name}`,
      nzContent: CourseFormDialogComponent,
      nzData: { course, isEdit: true },
      nzFooter: null,
      nzWidth: 560
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.courseService.updateCourse(course.id, result).subscribe({
          next: () => {
            this.msg.success('Cập nhật khóa học thành công!');
            this.loadCourses();
          }
        });
      }
    });
  }

  deleteCourse(id: number): void {
    this.courseService.deleteCourse(id).subscribe({
      next: () => {
        this.msg.success('Đã xóa khóa học!');
        this.loadCourses();
      }
    });
  }
}

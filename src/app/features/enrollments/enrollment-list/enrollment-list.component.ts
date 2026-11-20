import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ClassService } from '../../../core/services/class.service';
import { Enrollment, EnrollmentStatus } from '../../../core/models/enrollment.model';
import { CenterClass } from '../../../core/models/class.model';
import { EnrollmentFormDialogComponent } from '../enrollment-form-dialog/enrollment-form-dialog.component';

@Component({
  selector: 'app-enrollment-list',
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
    NzDividerModule,
    NzDescriptionsModule,
    NzAvatarModule,
    NzToolTipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>Đăng Ký Khóa Học</h2>
          <p>Hồ sơ đăng ký học viên, học phí và trạng thái phê duyệt</p>
        </div>
        <div class="page-actions">
          <button nz-button nzType="primary" (click)="openCreateModal()">
            <span nz-icon nzType="plus"></span>
            <span>Tạo Phiếu Đăng Ký Mới</span>
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
                placeholder="Tìm theo mã học viên, tên học viên..."
                [(ngModel)]="searchKeyword"
                (keyup.enter)="loadEnrollments()"
              />
            </nz-input-group>
            <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
            <ng-template #clearSearch>
              <span
                *ngIf="searchKeyword"
                nz-icon
                nzType="close-circle"
                (click)="searchKeyword = ''; loadEnrollments()"
                style="cursor: pointer; color: #bfbfbf;"
              ></span>
            </ng-template>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="8" [nzMd]="6">
            <nz-select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="loadEnrollments()"
              nzPlaceHolder="Lọc theo trạng thái"
              style="width: 100%;"
            >
              <nz-option nzValue="" nzLabel="-- Tất cả trạng thái --"></nz-option>
              <nz-option [nzValue]="EnrollmentStatus.PENDING" nzLabel="Chờ duyệt (PENDING)"></nz-option>
              <nz-option [nzValue]="EnrollmentStatus.CONFIRMED" nzLabel="Đã xác nhận (CONFIRMED)"></nz-option>
              <nz-option [nzValue]="EnrollmentStatus.COMPLETED" nzLabel="Đã hoàn thành (COMPLETED)"></nz-option>
              <nz-option [nzValue]="EnrollmentStatus.CANCELLED" nzLabel="Đã hủy (CANCELLED)"></nz-option>
              <nz-option [nzValue]="EnrollmentStatus.REFUNDED" nzLabel="Đã hoàn tiền (REFUNDED)"></nz-option>
            </nz-select>
          </div>

          <div nz-col [nzXs]="24" [nzSm]="4" [nzMd]="8" style="text-align: right;">
            <button nz-button nzType="default" (click)="loadEnrollments()">
              <span nz-icon nzType="reload"></span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <nz-table
          #enrollmentTable
          [nzData]="enrollments"
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
              <th nzWidth="100px">Mã ĐK</th>
              <th>Học Viên</th>
              <th>Khóa Học</th>
              <th>Lớp Xếp</th>
              <th>Ngày ĐK</th>
              <th>Học Phí</th>
              <th>Miễn Giảm</th>
              <th>Trạng Thái</th>
              <th nzWidth="210px" nzAlign="center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of enrollmentTable.data">
              <td><strong>#{{ item.id }}</strong></td>
              <td>
                <span style="font-weight: 500;">{{ item.student?.fullName || item.studentName }}</span>
                <div style="font-size: 11px; color: #8c8c8c; display: flex; align-items: center; gap: 8px;">
                  <span>{{ item.student?.studentCode || item.studentCode }}</span>
                  <a
                    *ngIf="item.student?.phone || item.studentPhone"
                    [href]="'tel:' + (item.student?.phone || item.studentPhone)"
                    style="color: #096dd9;"
                    title="Bấm để gọi điện"
                  >
                    <span nz-icon nzType="phone" style="font-size: 11px;"></span>
                    {{ item.student?.phone || item.studentPhone }}
                  </a>
                </div>
              </td>
              <td>{{ item.course?.name || item.courseName }}</td>
              <td>
                <nz-tag *ngIf="item.centerClass || item.className" nzColor="blue">{{ item.centerClass?.name || item.className }}</nz-tag>
                <span *ngIf="!item.centerClass && !item.className" style="color: #bfbfbf; font-style: italic;">Chưa xếp</span>
              </td>
              <td>{{ (item.enrollmentDate || item.registeredAt) | date:'dd/MM/yyyy' }}</td>
              <td><strong>{{ item.tuitionFee | number }} đ</strong></td>
              <td><span style="color: #52c41a;">-{{ item.discountAmount | number }} đ</span></td>
              <td>
                <nz-tag [nzColor]="getStatusColor(item.status)">
                  {{ getStatusLabel(item.status) }}
                </nz-tag>
              </td>
              <td nzAlign="center">
                <a (click)="openDetailModal(item)" style="color: #1890ff; font-weight: 500;">
                  <span nz-icon nzType="eye"></span> Xem
                </a>
                <nz-divider nzType="vertical"></nz-divider>
                <a
                  *ngIf="item.status === EnrollmentStatus.PENDING"
                  (click)="onApproveClick(item)"
                  style="color: #52c41a; font-weight: 500;"
                >
                  <span nz-icon nzType="check"></span> Duyệt & Xếp lớp
                </a>
                <nz-divider *ngIf="item.status === EnrollmentStatus.PENDING" nzType="vertical"></nz-divider>
                <a
                  *ngIf="item.status !== EnrollmentStatus.CANCELLED"
                  nz-popconfirm
                  nzPopconfirmTitle="Bạn có chắc chắn muốn hủy đăng ký này?"
                  nzOkText="Đồng ý hủy"
                  nzOkDanger="true"
                  nzCancelText="Không"
                  (nzOnConfirm)="cancelEnrollment(item.id)"
                  style="color: #ff4d4f;"
                >
                  <span nz-icon nzType="close"></span> Hủy
                </a>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <!-- Modal Chi tiết thông tin liên lạc & đơn đăng ký -->
      <nz-modal
        [(nzVisible)]="isDetailModalVisible"
        [nzTitle]="detailTitleTpl"
        [nzContent]="detailContentTpl"
        [nzFooter]="detailFooterTpl"
        (nzOnCancel)="closeDetailModal()"
        [nzWidth]="680"
      >
        <ng-template #detailTitleTpl>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span nz-icon nzType="solution" style="color: #1890ff; font-size: 18px;"></span>
            <span>Chi Tiết Đơn Đăng Ký Khóa Học #{{ selectedEnrollment?.id }}</span>
          </div>
        </ng-template>

        <ng-template #detailContentTpl>
          <div *ngIf="selectedEnrollment" class="enrollment-detail-body">
            <!-- Box hồ sơ liên lạc học viên -->
            <div class="contact-header-card">
              <nz-avatar nzIcon="user" [nzSize]="52" style="background-color: #1890ff; flex-shrink: 0;"></nz-avatar>
              <div class="contact-header-info">
                <div class="contact-name-row">
                  <h3 style="margin: 0; font-size: 17px; font-weight: 600;">
                    {{ selectedEnrollment.student?.fullName || selectedEnrollment.studentName }}
                  </h3>
                  <nz-tag [nzColor]="getStatusColor(selectedEnrollment.status)">
                    {{ getStatusLabel(selectedEnrollment.status) }}
                  </nz-tag>
                </div>
                <div class="contact-badges-row">
                  <span class="contact-badge" *ngIf="selectedEnrollment.student?.phone || selectedEnrollment.studentPhone">
                    <span nz-icon nzType="phone" style="color: #52c41a;"></span>
                    <a [href]="'tel:' + (selectedEnrollment.student?.phone || selectedEnrollment.studentPhone)" style="font-weight: 600; color: #1890ff;">
                      {{ selectedEnrollment.student?.phone || selectedEnrollment.studentPhone }}
                    </a>
                  </span>
                  <span class="contact-badge" *ngIf="selectedEnrollment.student?.email || selectedEnrollment.studentEmail">
                    <span nz-icon nzType="mail" style="color: #1890ff;"></span>
                    <a [href]="'mailto:' + (selectedEnrollment.student?.email || selectedEnrollment.studentEmail)">
                      {{ selectedEnrollment.student?.email || selectedEnrollment.studentEmail }}
                    </a>
                  </span>
                  <span class="contact-badge">
                    <span nz-icon nzType="idcard" style="color: #8c8c8c;"></span>
                    <span>Mã HV: {{ selectedEnrollment.student?.studentCode || selectedEnrollment.studentCode || 'Chưa tạo' }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Bảng thông tin chi tiết -->
            <nz-descriptions nzBordered [nzColumn]="2" nzSize="small" style="margin-top: 16px;">
              <nz-descriptions-item nzTitle="Khóa học đăng ký">
                <strong style="color: #1890ff;">{{ selectedEnrollment.course?.name || selectedEnrollment.courseName }}</strong>
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Lớp học chỉ định">
                <span *ngIf="selectedEnrollment.centerClass || selectedEnrollment.className" style="font-weight: 500;">
                  {{ selectedEnrollment.centerClass?.name || selectedEnrollment.className }}
                </span>
                <span *ngIf="!selectedEnrollment.centerClass && !selectedEnrollment.className" style="color: #bfbfbf; font-style: italic;">
                  Chưa xếp vào lớp
                </span>
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Số điện thoại liên lạc">
                <div *ngIf="selectedEnrollment.student?.phone || selectedEnrollment.studentPhone; else noPhone">
                  <a [href]="'tel:' + (selectedEnrollment.student?.phone || selectedEnrollment.studentPhone)" style="font-weight: 600; font-size: 14px; color: #1890ff;">
                    <span nz-icon nzType="phone" style="margin-right: 4px; color: #52c41a;"></span>
                    {{ selectedEnrollment.student?.phone || selectedEnrollment.studentPhone }}
                  </a>
                </div>
                <ng-template #noPhone><span style="color: #bfbfbf; font-style: italic;">Chưa cung cấp</span></ng-template>
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Email liên lạc">
                <div *ngIf="selectedEnrollment.student?.email || selectedEnrollment.studentEmail; else noEmail">
                  <a [href]="'mailto:' + (selectedEnrollment.student?.email || selectedEnrollment.studentEmail)">
                    <span nz-icon nzType="mail" style="margin-right: 4px; color: #1890ff;"></span>
                    {{ selectedEnrollment.student?.email || selectedEnrollment.studentEmail }}
                  </a>
                </div>
                <ng-template #noEmail><span style="color: #bfbfbf; font-style: italic;">Chưa cung cấp</span></ng-template>
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Ngày tạo đăng ký">
                {{ (selectedEnrollment.enrollmentDate || selectedEnrollment.registeredAt) | date:'dd/MM/yyyy HH:mm' }}
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Trạng thái">
                <nz-tag [nzColor]="getStatusColor(selectedEnrollment.status)">
                  {{ getStatusLabel(selectedEnrollment.status) }}
                </nz-tag>
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Học phí gốc">
                {{ selectedEnrollment.tuitionFee | number }} đ
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Mức giảm giá">
                <span style="color: #52c41a;">-{{ (selectedEnrollment.discountAmount || 0) | number }} đ</span>
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Tổng tiền học viên đóng" [nzSpan]="2">
                <span style="font-size: 16px; font-weight: 700; color: #cf1322;">
                  {{ (selectedEnrollment.finalAmount || (selectedEnrollment.tuitionFee - (selectedEnrollment.discountAmount || 0))) | number }} đ
                </span>
              </nz-descriptions-item>

              <nz-descriptions-item nzTitle="Ghi chú / Nhu cầu tư vấn" [nzSpan]="2">
                <div style="white-space: pre-line; color: #595959; min-height: 40px; padding: 4px 0;">
                  {{ selectedEnrollment.notes || 'Không có ghi chú thêm từ học viên' }}
                </div>
              </nz-descriptions-item>
            </nz-descriptions>
          </div>
        </ng-template>

        <ng-template #detailFooterTpl>
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div>
              <a
                *ngIf="selectedEnrollment?.student?.phone || selectedEnrollment?.studentPhone"
                nz-button
                nzType="default"
                [href]="'tel:' + (selectedEnrollment?.student?.phone || selectedEnrollment?.studentPhone)"
              >
                <span nz-icon nzType="phone" style="color: #52c41a;"></span>
                <span>Gọi điện</span>
              </a>
            </div>
            <div style="display: flex; gap: 8px;">
              <button
                *ngIf="selectedEnrollment?.status === EnrollmentStatus.PENDING"
                nz-button
                nzType="primary"
                (click)="onApproveClick(selectedEnrollment!)"
                style="background-color: #52c41a; border-color: #52c41a;"
              >
                <span nz-icon nzType="check"></span>
                <span>Duyệt & Xếp lớp</span>
              </button>
              <button nz-button nzType="default" (click)="closeDetailModal()">
                Đóng
              </button>
            </div>
          </div>
        </ng-template>
      </nz-modal>

      <!-- MODAL DUYỆT ĐƠN & XẾP LỚP -->
      <nz-modal
        [(nzVisible)]="approvalModalVisible"
        nzTitle="Phê Duyệt Đơn Đăng Ký & Xếp Lớp Học Viên"
        (nzOnCancel)="approvalModalVisible = false"
        (nzOnOk)="submitApproval()"
        [nzOkLoading]="approvalLoading"
        nzOkText="Xác nhận duyệt & Xếp lớp"
        nzCancelText="Hủy"
        [nzWidth]="540"
      >
        <ng-container *nzModalContent>
          <div *ngIf="approvingEnrollment" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 12px 16px; border-radius: 6px;">
              <div>Học viên: <strong style="color: #1890ff;">{{ approvingEnrollment.studentName }}</strong> ({{ approvingEnrollment.studentCode }})</div>
              <div>Khóa học đăng ký: <strong>{{ approvingEnrollment.courseName }}</strong></div>
              <div>Mã đơn đăng ký: <code>{{ approvingEnrollment.enrollmentCode }}</code></div>
            </div>

            <div>
              <label style="font-weight: 500; display: block; margin-bottom: 6px;">
                Chọn lớp học cho học viên:
              </label>
              <nz-select
                [(ngModel)]="selectedApprovalClassId"
                nzPlaceHolder="-- Chọn lớp học đang mở --"
                style="width: 100%;"
                nzShowSearch
                [nzLoading]="loadingClasses"
              >
                <nz-option
                  *ngFor="let c of availableClasses"
                  [nzValue]="c.id"
                  [nzLabel]="c.name + ' (' + c.classCode + ' - ' + (c.room || 'Chưa xếp phòng') + ')'"
                ></nz-option>
              </nz-select>
              <div *ngIf="availableClasses.length === 0 && !loadingClasses" style="color: #fa8c16; font-size: 12px; margin-top: 4px;">
                Chưa có lớp học nào đang mở cho khóa học này. Hệ thống vẫn sẽ duyệt đơn và kích hoạt tài khoản học viên.
              </div>
            </div>

            <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 10px 14px; border-radius: 6px; font-size: 13px; color: #0050b3;">
              💡 <strong>Lưu ý:</strong> Khi duyệt đơn, hệ thống sẽ tự động tạo tài khoản học viên (vai trò <code>ROLE_STUDENT</code>, mật khẩu mặc định <code>password123</code>), xếp học viên vào lớp và gửi email/Telegram thông báo lịch học.
            </div>
          </div>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .contact-header-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
      background: #f0f7ff;
      border: 1px solid #bae0ff;
      border-radius: 8px;
    }
    .contact-header-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .contact-name-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .contact-badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 13px;
    }
    .contact-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #595959;
    }
  `]
})
export class EnrollmentListComponent implements OnInit {
  EnrollmentStatus = EnrollmentStatus;

  enrollments: Enrollment[] = [];
  totalElements = 0;
  pageIndex = 1;
  pageSize = 10;
  searchKeyword = '';
  selectedStatus: EnrollmentStatus | '' = '';
  loading = false;

  // Detail Modal
  isDetailModalVisible = false;
  selectedEnrollment: Enrollment | null = null;

  // Approval & Class Allocation Modal
  approvingEnrollment: Enrollment | null = null;
  approvalModalVisible = false;
  availableClasses: CenterClass[] = [];
  selectedApprovalClassId: number | null = null;
  loadingClasses = false;
  approvalLoading = false;

  constructor(
    private enrollmentService: EnrollmentService,
    private classService: ClassService,
    private modal: NzModalService,
    private msg: NzMessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = (params['status'] as EnrollmentStatus) || '';
      this.searchKeyword = params['keyword'] || '';
      this.pageIndex = 1;
      this.loadEnrollments();
    });
  }

  loadEnrollments(): void {
    this.loading = true;
    this.enrollmentService
      .getEnrollments(
        this.pageIndex - 1,
        this.pageSize,
        this.searchKeyword || undefined,
        this.selectedStatus || undefined
      )
      .subscribe({
        next: (res) => {
          this.enrollments = res.data.content;
          this.totalElements = res.data.totalElements;
          this.loading = false;
          this.enrollmentService.refreshPendingCount();
        },
        error: () => this.loading = false
      });
  }

  onPageIndexChange(page: number): void {
    this.pageIndex = page;
    this.loadEnrollments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadEnrollments();
  }

  openCreateModal(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Đăng Ký Khóa Học Mới',
      nzContent: EnrollmentFormDialogComponent,
      nzFooter: null,
      nzWidth: 620
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.enrollmentService.createEnrollment(result).subscribe({
          next: () => {
            this.msg.success('Đăng ký khóa học thành công!');
            this.loadEnrollments();
          }
        });
      }
    });
  }

  onApproveClick(item: Enrollment): void {
    this.approvingEnrollment = item;
    this.selectedApprovalClassId = item.classId || null;
    this.availableClasses = [];

    if (item.courseId) {
      this.loadingClasses = true;
      this.classService.getClassesByCourse(item.courseId).subscribe({
        next: (res) => {
          this.loadingClasses = false;
          this.availableClasses = (res.data || []).filter(c => c.status !== 'CANCELLED' && c.status !== 'COMPLETED');
          if (!this.selectedApprovalClassId && this.availableClasses.length > 0) {
            this.selectedApprovalClassId = this.availableClasses[0].id;
          }
          this.approvalModalVisible = true;
        },
        error: () => {
          this.loadingClasses = false;
          this.availableClasses = [];
          this.approvalModalVisible = true;
        }
      });
    } else {
      this.approvalModalVisible = true;
    }
  }

  submitApproval(): void {
    if (!this.approvingEnrollment) return;
    this.approvalLoading = true;
    this.enrollmentService.confirmEnrollment(this.approvingEnrollment.id, this.selectedApprovalClassId || undefined).subscribe({
      next: () => {
        this.approvalLoading = false;
        this.approvalModalVisible = false;
        this.msg.success('Đã duyệt đơn đăng ký, kích hoạt tài khoản học viên và xếp lớp thành công!');
        this.loadEnrollments();
        if (this.isDetailModalVisible) {
          this.closeDetailModal();
        }
      },
      error: (err) => {
        this.approvalLoading = false;
        this.msg.error(err.error?.message || 'Có lỗi xảy ra khi duyệt đơn đăng ký!');
      }
    });
  }

  confirmEnrollment(id: number): void {
    const item = this.enrollments.find(e => e.id === id);
    if (item) {
      this.onApproveClick(item);
    } else {
      this.enrollmentService.confirmEnrollment(id).subscribe({
        next: () => {
          this.msg.success('Đã xác nhận phê duyệt đăng ký!');
          this.loadEnrollments();
        }
      });
    }
  }

  cancelEnrollment(id: number): void {
    this.enrollmentService.cancelEnrollment(id).subscribe({
      next: () => {
        this.msg.success('Đã hủy phiếu đăng ký!');
        this.loadEnrollments();
      }
    });
  }

  openDetailModal(item: Enrollment): void {
    this.selectedEnrollment = item;
    this.isDetailModalVisible = true;
    if (item.id) {
      this.enrollmentService.getEnrollmentById(item.id).subscribe({
        next: (res) => {
          if (res.data) {
            this.selectedEnrollment = { ...this.selectedEnrollment, ...res.data };
          }
        }
      });
    }
  }

  closeDetailModal(): void {
    this.isDetailModalVisible = false;
    this.selectedEnrollment = null;
  }

  confirmEnrollmentFromDetail(): void {
    if (!this.selectedEnrollment) return;
    const id = this.selectedEnrollment.id;
    this.confirmEnrollment(id);
    this.closeDetailModal();
  }

  getStatusColor(status: EnrollmentStatus): string {
    switch (status) {
      case EnrollmentStatus.PENDING: return 'warning';
      case EnrollmentStatus.CONFIRMED: return 'success';
      case EnrollmentStatus.COMPLETED: return 'blue';
      case EnrollmentStatus.CANCELLED: return 'error';
      case EnrollmentStatus.REFUNDED: return 'default';
      default: return 'default';
    }
  }

  getStatusLabel(status: EnrollmentStatus): string {
    switch (status) {
      case EnrollmentStatus.PENDING: return 'Chờ duyệt';
      case EnrollmentStatus.CONFIRMED: return 'Đã xác nhận';
      case EnrollmentStatus.COMPLETED: return 'Đã hoàn thành';
      case EnrollmentStatus.CANCELLED: return 'Đã hủy';
      case EnrollmentStatus.REFUNDED: return 'Đã hoàn tiền';
      default: return status;
    }
  }
}

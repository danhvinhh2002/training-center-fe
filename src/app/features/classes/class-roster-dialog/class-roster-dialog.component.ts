import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { CenterClass, ClassStudent } from '../../../core/models/class.model';
import { Student } from '../../../core/models/student.model';
import { ClassService } from '../../../core/services/class.service';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-class-roster-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzPopconfirmModule,
    NzGridModule,
    NzAlertModule
  ],
  template: `
    <div class="roster-container">
      <nz-alert
        nzType="info"
        [nzMessage]="capacityText"
        nzShowIcon
        style="margin-bottom: 16px;"
      ></nz-alert>
      <ng-template #capacityText>
        Sĩ số hiện tại: <strong>{{ students.length }} / {{ centerClass.maxStudents }}</strong> học viên
      </ng-template>

      <!-- Add Student to Roster Form -->
      <div class="add-student-bar">
        <div nz-row [nzGutter]="12" nzAlign="middle">
          <div nz-col [nzSpan]="18">
            <nz-select
              [(ngModel)]="selectedStudentId"
              nzPlaceHolder="-- Chọn học viên cần xếp vào lớp --"
              nzShowSearch
              style="width: 100%;"
            >
              <nz-option
                *ngFor="let s of availableStudents"
                [nzValue]="s.id"
                [nzLabel]="s.studentCode + ' - ' + s.fullName + ' (' + s.phone + ')'"
              ></nz-option>
            </nz-select>
          </div>
          <div nz-col [nzSpan]="6">
            <button
              nz-button
              nzType="primary"
              [disabled]="!selectedStudentId || isFull"
              [nzLoading]="isAdding"
              (click)="addStudentToClass()"
              nzBlock
            >
              <span nz-icon nzType="plus"></span> Xếp Lớp
            </button>
          </div>
        </div>
      </div>

      <!-- Students Table -->
      <nz-table
        #rosterTable
        [nzData]="students"
        [nzLoading]="loading"
        nzSize="small"
        [nzShowPagination]="students.length > 5"
        [nzPageSize]="5"
        style="margin-top: 16px;"
      >
        <thead>
          <tr>
            <th>Mã HV</th>
            <th>Họ và Tên</th>
            <th>Số Điện Thoại</th>
            <th>Email</th>
            <th>Ngày Xếp Lớp</th>
            <th nzAlign="center">Xóa Khỏi Lớp</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of rosterTable.data">
            <td><strong>{{ item.student?.studentCode || item.studentCode }}</strong></td>
            <td>{{ item.student?.fullName || item.studentName }}</td>
            <td>{{ item.student?.phone || item.studentPhone || '-' }}</td>
            <td>{{ item.student?.email || item.studentEmail || '-' }}</td>
            <td>{{ (item.joinedDate || item.enrolledDate) | date:'dd/MM/yyyy' }}</td>
            <td nzAlign="center">
              <a
                nz-popconfirm
                nzPopconfirmTitle="Xác nhận đưa học viên ra khỏi lớp này?"
                nzOkText="Đồng ý"
                nzOkDanger="true"
                nzCancelText="Hủy"
                (nzOnConfirm)="removeStudentFromClass(item.student?.id || item.studentId)"
                style="color: #ff4d4f;"
              >
                <span nz-icon nzType="delete"></span>
              </a>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <div class="modal-footer-custom">
        <button nz-button nzType="default" (click)="destroyModal()">Đóng</button>
      </div>
    </div>
  `,
  styles: [`
    .add-student-bar {
      background: #fafafa;
      padding: 12px;
      border: 1px solid #f0f0f0;
      border-radius: 6px;
    }
    .modal-footer-custom {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
  `]
})
export class ClassRosterDialogComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA, { optional: true });
  @Input() centerClass!: CenterClass;

  students: ClassStudent[] = [];
  availableStudents: Student[] = [];
  selectedStudentId: number | null = null;
  loading = false;
  isAdding = false;

  get isFull(): boolean {
    return this.students.length >= (this.centerClass?.maxStudents || 0);
  }

  constructor(
    private classService: ClassService,
    private studentService: StudentService,
    private modalRef: NzModalRef,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.nzModalData?.centerClass) {
      this.centerClass = this.nzModalData.centerClass;
    }
    this.loadRoster();
    this.loadAvailableStudents();
  }

  loadRoster(): void {
    if (!this.centerClass?.id) return;
    this.loading = true;
    this.classService.getClassStudents(this.centerClass.id).subscribe({
      next: (res) => {
        this.students = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadAvailableStudents(): void {
    this.studentService.getStudents(0, 200, undefined, 'STUDYING').subscribe(res => {
      this.availableStudents = res.data.content;
    });
  }

  addStudentToClass(): void {
    if (!this.selectedStudentId || !this.centerClass?.id) return;

    this.isAdding = true;
    this.classService.allocateStudent(this.centerClass.id, { classId: this.centerClass.id, studentId: this.selectedStudentId }).subscribe({
      next: () => {
        this.isAdding = false;
        this.msg.success('Đã xếp học viên vào lớp thành công!');
        this.selectedStudentId = null;
        this.loadRoster();
      },
      error: (err) => {
        this.isAdding = false;
        this.msg.error(err.error?.message || 'Không thể xếp học viên vào lớp!');
      }
    });
  }

  removeStudentFromClass(studentId: number): void {
    this.classService.removeStudentFromClass(this.centerClass.id, studentId).subscribe({
      next: () => {
        this.msg.success('Đã đưa học viên ra khỏi lớp!');
        this.loadRoster();
      }
    });
  }

  destroyModal(): void {
    this.modalRef.destroy();
  }
}

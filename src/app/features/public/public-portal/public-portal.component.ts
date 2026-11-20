import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// NG-ZORRO Modules
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Course, CourseLevel } from '../../../core/models/course.model';
import { PublicPortalService, PublicRegistrationResult } from '../../../core/services/public-portal.service';

@Component({
  selector: 'app-public-portal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTagModule,
    NzBadgeModule,
    NzIconModule,
    NzSpinModule,
    NzAlertModule,
    NzModalModule,
    NzDividerModule,
    NzRadioModule
  ],
  templateUrl: './public-portal.component.html',
  styleUrls: ['./public-portal.component.scss']
})
export class PublicPortalComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loadingCourses = false;

  // Bộ lọc
  selectedLevel = 'ALL';
  searchKeyword = '';

  // Form đăng ký
  registrationForm!: FormGroup;
  isSubmitting = false;

  // Modal chi tiết khóa học
  detailModalVisible = false;
  selectedCourseForDetail: Course | null = null;

  // Modal đăng ký thành công
  successModalVisible = false;
  registrationResult: PublicRegistrationResult | null = null;

  // Floating AI Chatbot (Chỉ giải đáp thông tin trung tâm & khóa học)
  chatOpen = false;
  chatInput = '';
  isSendingChat = false;
  chatMessages: Array<{ role: 'user' | 'assistant'; text: string; time: string }> = [
    {
      role: 'assistant',
      text: 'Xin chào bạn! 👋 Tôi là Trợ lý AI Tuyển sinh của Trung tâm Đào tạo. Tôi chỉ hỗ trợ giải đáp các câu hỏi về: Khóa học, Học phí, Lộ trình đào tạo và Hướng dẫn đăng ký của trung tâm. Bạn đang quan tâm đến khóa học nào ạ?',
      time: 'Vừa xong'
    }
  ];

  suggestedQuestions: string[] = [
    'Trung tâm có những khóa học nào?',
    'Học phí các khóa học ra sao?',
    'Khóa học cho người mới bắt đầu?',
    'Thời gian học và quyền lợi học viên?'
  ];

  constructor(
    private fb: FormBuilder,
    private publicPortalService: PublicPortalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  private initForm(): void {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(/^(0|\+84)[0-9]{9,10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      courseId: [null, [Validators.required]],
      gender: ['OTHER'],
      dateOfBirth: [null],
      address: [''],
      telegramChatId: [''],
      notes: ['']
    });
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.publicPortalService.getFeaturedCourses().subscribe({
      next: (res) => {
        this.loadingCourses = false;
        if (res.data) {
          this.courses = res.data;
          this.applyFilter();
        }
      },
      error: () => {
        this.loadingCourses = false;
        this.message.error('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
      }
    });
  }

  applyFilter(): void {
    let result = [...this.courses];

    // Lọc theo cấp độ
    if (this.selectedLevel !== 'ALL') {
      result = result.filter(c => c.level === this.selectedLevel);
    }

    // Lọc theo từ khóa
    if (this.searchKeyword && this.searchKeyword.trim() !== '') {
      const kw = this.searchKeyword.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(kw) ||
        c.courseCode.toLowerCase().includes(kw) ||
        (c.description && c.description.toLowerCase().includes(kw))
      );
    }

    this.filteredCourses = result;
  }

  onLevelChange(level: string): void {
    this.selectedLevel = level;
    this.applyFilter();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  // Chọn khóa học trực tiếp từ thẻ khóa học
  selectCourse(course: Course): void {
    this.registrationForm.patchValue({ courseId: course.id });
    this.message.success(`Đã chọn khóa học: ${course.name}`);
    this.scrollToRegister();
  }

  // Xem chi tiết khóa học trong popup
  viewCourseDetail(course: Course): void {
    this.selectedCourseForDetail = course;
    this.detailModalVisible = true;
  }

  closeDetailModal(): void {
    this.detailModalVisible = false;
    this.selectedCourseForDetail = null;
  }

  enrollFromDetailModal(): void {
    if (this.selectedCourseForDetail) {
      this.selectCourse(this.selectedCourseForDetail);
      this.closeDetailModal();
    }
  }

  scrollToRegister(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const el = document.getElementById('register-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToCourses(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const el = document.getElementById('courses-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToBenefits(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const el = document.getElementById('benefits-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getSelectedCourseName(): string {
    const id = this.registrationForm.get('courseId')?.value;
    if (!id) return '';
    const found = this.courses.find(c => c.id === id);
    return found ? `${found.name} (${this.formatCurrency(found.standardFee || 0)})` : '';
  }

  formatCurrency(value?: number): string {
    if (value === undefined || value === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  getLevelColor(level: CourseLevel): string {
    switch (level) {
      case 'BEGINNER': return 'green';
      case 'INTERMEDIATE': return 'blue';
      case 'ADVANCED': return 'purple';
      default: return 'cyan';
    }
  }

  getLevelLabel(level: CourseLevel): string {
    switch (level) {
      case 'BEGINNER': return 'Cơ bản';
      case 'INTERMEDIATE': return 'Trung cấp';
      case 'ADVANCED': return 'Nâng cao';
      default: return 'Mọi trình độ';
    }
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      Object.values(this.registrationForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.warning('Vui lòng kiểm tra lại các thông tin bắt buộc trong biểu mẫu!');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.registrationForm.value;

    const payload = {
      ...formValue,
      dateOfBirth: formValue.dateOfBirth
        ? new Date(formValue.dateOfBirth).toISOString().split('T')[0]
        : null
    };

    this.publicPortalService.registerCourse(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.data) {
          this.registrationResult = res.data;
          this.successModalVisible = true;
          this.registrationForm.reset({
            gender: 'OTHER'
          });
        } else {
          this.message.success(res.message || 'Đăng ký khóa học thành công!');
        }
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  closeSuccessModal(): void {
    this.successModalVisible = false;
    this.registrationResult = null;
  }

  // Phương thức điều khiển Chatbot AI
  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen) {
      setTimeout(() => this.scrollChatToBottom(), 100);
    }
  }

  sendChatMessage(customText?: string): void {
    const textToSend = customText || this.chatInput;
    if (!textToSend || textToSend.trim() === '' || this.isSendingChat) {
      return;
    }

    const userMsg = textToSend.trim();
    this.chatMessages.push({
      role: 'user',
      text: userMsg,
      time: this.getCurrentTime()
    });
    this.chatInput = '';
    this.isSendingChat = true;
    setTimeout(() => this.scrollChatToBottom(), 50);

    this.publicPortalService.chatWithAi(userMsg, this.chatMessages, this.courses).subscribe({
      next: (res) => {
        this.isSendingChat = false;
        const replyText = res.data?.reply || res.message || 'Dạ tôi đã ghi nhận câu hỏi. Bạn có thể hỏi thêm thông tin về các khóa học nhé!';
        this.chatMessages.push({
          role: 'assistant',
          text: replyText,
          time: this.getCurrentTime()
        });
        setTimeout(() => this.scrollChatToBottom(), 50);
      },
      error: () => {
        this.isSendingChat = false;
        this.chatMessages.push({
          role: 'assistant',
          text: 'Dạ hiện tại kết nối đến Trợ lý AI đang bận. Bạn vui lòng thử lại sau giây lát hoặc liên hệ trực tiếp Hotline: 0987.654.321 nhé!',
          time: this.getCurrentTime()
        });
        setTimeout(() => this.scrollChatToBottom(), 50);
      }
    });
  }

  sendSuggestedQuestion(q: string): void {
    this.sendChatMessage(q);
  }

  getCurrentTime(): string {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  scrollChatToBottom(): void {
    const container = document.getElementById('chatbot-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}

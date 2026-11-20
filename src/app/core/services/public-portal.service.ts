import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Course } from '../models/course.model';

export interface PublicRegistrationPayload {
  fullName: string;
  phone: string;
  email: string;
  courseId: number;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  telegramChatId?: string;
  notes?: string;
}

export interface PublicRegistrationResult {
  enrollmentCode: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  courseId: number;
  courseName: string;
  tuitionFee: number;
  status: string;
  registeredAt: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicPortalService {
  private readonly apiUrl = `${environment.apiUrl}/public`;
  private readonly groqUrl = environment.groqApiUrl || 'https://api.groq.com/openai/v1/chat/completions';
  private readonly groqKey = environment.groqApiKey;
  private readonly groqModel = environment.groqModel || 'openai/gpt-oss-120b';

  constructor(private http: HttpClient) {}

  getFeaturedCourses(): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/courses`);
  }

  getCourseDetail(id: number): Observable<ApiResponse<Course>> {
    return this.http.get<ApiResponse<Course>>(`${this.apiUrl}/courses/${id}`);
  }

  registerCourse(payload: PublicRegistrationPayload): Observable<ApiResponse<PublicRegistrationResult>> {
    return this.http.post<ApiResponse<PublicRegistrationResult>>(`${this.apiUrl}/register`, payload);
  }

  /**
   * Gọi trực tiếp Groq API không qua Backend
   * @param message Câu hỏi của người dùng
   * @param history Lịch sử trò chuyện
   * @param availableCourses Danh sách khóa học để cung cấp ngữ cảnh chính xác
   */
  chatWithAi(
    message: string,
    history: Array<{ role: 'user' | 'assistant'; text: string }> = [],
    availableCourses: Course[] = []
  ): Observable<ApiResponse<{ reply: string }>> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.groqKey}`,
      'Content-Type': 'application/json'
    });

    // Chuẩn bị danh sách khóa học thực tế để AI nắm thông tin chính xác
    let courseContext = '';
    if (availableCourses && availableCourses.length > 0) {
      courseContext = '\n[DANH SÁCH KHÓA HỌC HIỆN CÓ CỦA TRUNG TÂM]:\n' +
        availableCourses.map(c => `- Khóa học: ${c.name} (Mã: ${c.courseCode}) | Thời lượng: ${c.totalHours} giờ (${c.totalLessons} buổi) | Học phí: ${(c.tuitionFee || c.standardFee || 0).toLocaleString('vi-VN')} VNĐ | Cấp độ: ${c.level} | Chi tiết: ${c.description || 'Chương trình chuẩn quốc tế'}`).join('\n');
    }

    const systemPrompt = `Bạn là Trợ lý AI Tư vấn Tuyển sinh & Đào tạo trực tuyến của "Trung Tâm Đào Tạo EduCenter".
Nhiệm vụ:
1. Giải đáp thắc mắc về khóa học, lộ trình học tập, lịch học, học phí và chính sách ưu đãi của trung tâm.
2. Trả lời bằng tiếng Việt lịch sự, thân thiện, rõ ràng, gãy gọn (có thể dùng icon, gạch đầu dòng dễ nhìn).
3. Nếu học viên quan tâm, hãy hướng dẫn họ điền form "Đăng Ký Khóa Học" ngay trên trang web hoặc liên hệ Hotline: 0987.654.321.
4. Chỉ tập trung tư vấn nội dung liên quan đến giáo dục, đào tạo của trung tâm.
${courseContext}`;

    const messagesPayload: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Đưa tối đa 6 tin nhắn trước đó vào ngữ cảnh hội thoại
    const recentHistory = (history || []).slice(-6);
    for (const h of recentHistory) {
      messagesPayload.push({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.text
      });
    }

    // Đưa câu hỏi hiện tại
    messagesPayload.push({ role: 'user', content: message });

    const requestBody = {
      model: this.groqModel,
      messages: messagesPayload,
      temperature: 0.6,
      max_tokens: 800
    };

    return this.http.post<any>(this.groqUrl, requestBody, { headers }).pipe(
      map(res => {
        const reply = res.choices?.[0]?.message?.content?.trim() || 'Dạ tôi đã ghi nhận câu hỏi. Bạn vui lòng liên hệ thêm hotline hoặc điền form đăng ký để được hỗ trợ chi tiết nhé!';
        return {
          success: true,
          code: 200,
          message: 'Thành công',
          data: { reply },
          timestamp: new Date().toISOString()
        } as ApiResponse<{ reply: string }>;
      }),
      catchError(err => {
        console.error('Lỗi khi gọi Groq API:', err);
        return of({
          success: false,
          code: 500,
          message: 'Fallback',
          data: {
            reply: 'Dạ hiện tại kết nối đến Trợ lý AI đang bận. Bạn vui lòng thử lại sau giây lát hoặc liên hệ trực tiếp Hotline: 0987.654.321 để được tư vấn ngay nhé!'
          },
          timestamp: new Date().toISOString()
        } as ApiResponse<{ reply: string }>);
      })
    );
  }
}

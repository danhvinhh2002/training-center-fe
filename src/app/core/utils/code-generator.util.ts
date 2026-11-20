/**
 * Utility sinh mã tự động cho toàn hệ thống đào tạo
 * Định dạng chuẩn: [TIỀN_TỐ][2 số cuối năm][4 chữ số ngẫu nhiên]
 * Ví dụ:
 * - Học viên:  HV261024
 * - Giáo viên: GV263912
 * - Khóa học:  KH267801
 * - Lớp học:   LH265543
 * - Đăng ký:   DK269123
 */
export class CodeGenerator {
  static generate(prefix: string): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${year}${randomDigits}`;
  }

  static generateStudentCode(): string {
    return this.generate('HV');
  }

  static generateTeacherCode(): string {
    return this.generate('GV');
  }

  static generateCourseCode(): string {
    return this.generate('KH');
  }

  static generateClassCode(): string {
    return this.generate('LH');
  }

  static generateEnrollmentCode(): string {
    return this.generate('DK');
  }
}

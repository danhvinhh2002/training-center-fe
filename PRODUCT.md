# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Users (Nghiệp vụ vận hành trung tâm)**:
  - **Quản trị viên (Admin)**: Thiết lập cấu hình hệ thống, quản lý tài khoản, phân quyền người dùng (RBAC), kiểm soát toàn bộ cơ sở dữ liệu.
  - **Quản lý học vụ (Training Manager)**: Quản lý danh mục khóa học ngoại ngữ (IELTS, TOEIC, giao tiếp, ngoại ngữ thiếu nhi), quản lý lớp học, phân công giáo viên, điều phối học viên, xếp lịch học và giám sát tình hình điểm danh.
  - **Kế toán học vụ (Accountant)**: Lập hóa đơn học phí, ghi nhận các đợt thanh toán (tiền mặt, chuyển khoản, cổng trực tuyến), theo dõi công nợ, quản lý chính sách học bổng / miễn giảm và xuất báo cáo tài chính.
- **Secondary Users (Cổng dịch vụ)**:
  - **Giáo viên (Teacher)**: Tra cứu lịch giảng dạy theo ca, điểm danh sĩ số lớp học từng buổi, xem hồ sơ danh sách học viên trong lớp phụ trách.
  - **Học viên / Phụ huynh (Student)**: Tra cứu khóa học, lịch học, lịch sử điểm danh, thông tin hóa đơn và trạng thái đóng học phí.

## Product Purpose

Cung cấp nền tảng quản trị và vận hành toàn diện cho Trung tâm Ngoại ngữ và Luyện thi chứng chỉ quốc tế. Hệ thống giải quyết các bài toán cốt lõi: tự động hóa quy trình tuyển sinh - xếp lớp, ngăn ngừa xung đột lịch dạy/phòng học, kiểm soát chặt chẽ doanh thu học phí và công nợ, đồng thời nâng cao tính chuyên nghiệp, minh bạch trong công tác đào tạo.

## Positioning

Hệ thống quản lý chuyên sâu cho Trung tâm Ngoại ngữ với cơ chế xác thực đa vai trò chặt chẽ (RBAC), kiểm soát xung đột tài nguyên theo thời gian thực (Teacher & Room collision detection), quy trình xếp lớp và quản lý công nợ học phí nhiều đợt linh hoạt, thiết kế chuẩn mực theo phong cách công sở chuyên nghiệp (Operate-first).

## Operating Context

- **Môi trường sử dụng**: Trình duyệt web trên máy tính để bàn (Desktop / Laptop) với màn hình tỷ lệ chuẩn (1366x768 đến 1920x1080), hỗ trợ máy tính bảng cho giáo viên khi điểm danh tại lớp học.
- **Tác vụ thường nhật**: Xử lý dữ liệu dạng bảng lớn (data tables), tìm kiếm nhanh theo mã học viên/lớp học, lọc nhiều điều kiện, nhập liệu form biểu mẫu, kiểm tra tính khả dụng của phòng học/giảng viên, in phiếu thu và hóa đơn học phí.

## Capabilities and Constraints

- **Năng lực cốt lõi**:
  - Quản lý vòng đời đào tạo: Khóa học -> Lớp học -> Học viên -> Điểm danh -> Đánh giá.
  - Thuật toán kiểm tra lịch: Phát hiện và ngăn chặn trùng ca dạy của giáo viên hoặc trùng phòng học trong cùng khung giờ.
  - Quản lý tài chính: Hóa đơn đa mục, thanh toán một phần (partial payments), tính toán tự động số tiền còn nợ (`remaining_amount`), cập nhật trạng thái hóa đơn (`PAID`, `PARTIAL`, `UNPAID`).
  - Phân quyền theo vai trò: `ADMIN`, `MANAGER`, `TEACHER`, `STUDENT`, `ACCOUNTANT`.
- **Ràng buộc kỹ thuật**:
  - Frontend: Angular 17+, Angular Material Design, RxJS, Reactive Forms, JWT HttpInterceptor.
  - Backend: Java 21, Spring Boot 3.3.5, Spring Security 6, Spring Data JPA / Hibernate, MySQL 8.
  - Kiến trúc phân lớp Layered Architecture, RESTful APIs với Swagger/OpenAPI 3.

## Brand Commitments

- **Tên sản phẩm**: Hệ thống Quản trị Trung tâm Đào tạo Ngoại ngữ (Language Center Management System).
- **Định hình phong cách**: Tông màu quản trị trang nhã (Navy Blue / Deep Slate kết hợp điểm nhấn Teal / Sapphire), đường nét dứt khoát, typography cân bằng, không sử dụng hiệu ứng màu mè gây phân tâm.

## Evidence on Hand

- Mã nguồn Backend Spring Boot hoàn chỉnh cấu trúc phân tầng: Entities, Repositories, Services, Controllers, Security JWT, DDL migration scripts (`V1__initial_schema.sql`).
- Mã nguồn Frontend Angular 17+: Cấu hình layout (Sidebar, Header, MainLayout), AuthGuard, RoleGuard, các module quản lý Học viên, Giáo viên, Khóa học, Lớp học, Lịch học, Điểm danh.
- Docker Compose thiết lập sẵn MySQL 8.0 và phpMyAdmin.

## Product Principles

1. **Chính xác là ưu tiên số một**: Mọi số liệu về công nợ học phí, sĩ số lớp học và điểm danh phải được kiểm tra ràng buộc chặt chẽ, không để xảy ra sai lệch dữ liệu.
2. **Operate-first - Tối ưu hiệu suất thao tác**: Giao diện hướng đến việc giảm tối đa số lần nhấp chuột, phím tắt tìm kiếm tiện lợi, phân trang mượt mà, phản hồi ngay lập tức cho người dùng nội bộ.
3. **Minh bạch và bảo vệ dữ liệu**: Phân quyền chi tiết (Least Privilege), dữ liệu nhạy cảm như doanh thu và tài khoản quản trị chỉ hiển thị đúng vai trò được phép.
4. **Phòng ngừa lỗi chủ động (Poka-Yoke)**: Hệ thống chủ động chặn xếp trùng phòng/lịch dạy, cảnh báo vượt sĩ số tối đa trước khi ghi nhận thay vì báo lỗi sau khi lưu.

## Accessibility & Inclusion

- Chuẩn độ tương phản văn bản tối thiểu WCAG 2.1 AA (≥ 4.5:1 cho text thông thường, ≥ 3:1 cho tiêu đề lớn).
- Hỗ trợ thao tác hoàn toàn bằng bàn phím (Tab navigation, Enter để xác nhận, Escape để đóng modal).
- Thông báo lỗi form nhập liệu rõ ràng, chỉ rõ trường vi phạm và hướng dẫn khắc phục cụ thể.

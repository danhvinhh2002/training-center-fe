import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private message: NzMessageService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Không hiển thị popup lỗi toàn cục nếu là Groq API (sẽ do service xử lý)
    if (request.url.includes('api.groq.com')) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Không thể kết nối đến máy chủ Backend.';
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện chức năng này.';
        }

        // Hiển thị thông báo qua NzMessageService
        this.message.error(errorMessage, { nzDuration: 4000 });

        return throwError(() => error);
      })
    );
  }
}

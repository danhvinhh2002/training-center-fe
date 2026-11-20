import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import {
  DashboardOutline,
  UserOutline,
  TeamOutline,
  BookOutline,
  ScheduleOutline,
  CheckCircleOutline,
  DollarOutline,
  FileTextOutline,
  SettingOutline,
  LogoutOutline,
  LockOutline,
  MailOutline,
  PhoneOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  SearchOutline,
  ReloadOutline,
  FilterOutline,
  EyeOutline,
  DownOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  CheckOutline,
  CloseOutline,
  ExclamationCircleOutline,
  ExportOutline,
  IdcardOutline,
  ApartmentOutline,
  CalendarOutline,
  BarChartOutline,
  AuditOutline,
  CheckSquareOutline,
  BellOutline,
  KeyOutline
} from '@ant-design/icons-angular/icons';
import { routes } from './app.routes';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzModalModule } from 'ng-zorro-antd/modal';

registerLocaleData(vi);

const icons = [
  DashboardOutline,
  UserOutline,
  TeamOutline,
  BookOutline,
  ScheduleOutline,
  CheckCircleOutline,
  DollarOutline,
  FileTextOutline,
  SettingOutline,
  LogoutOutline,
  LockOutline,
  MailOutline,
  PhoneOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  SearchOutline,
  ReloadOutline,
  FilterOutline,
  EyeOutline,
  DownOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  CheckOutline,
  CloseOutline,
  ExclamationCircleOutline,
  ExportOutline,
  IdcardOutline,
  ApartmentOutline,
  CalendarOutline,
  BarChartOutline,
  AuditOutline,
  CheckSquareOutline,
  BellOutline,
  KeyOutline
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideNzI18n(vi_VN),
    { provide: NZ_ICONS, useValue: icons },
    importProvidersFrom(NzMessageModule, NzNotificationModule, NzModalModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
};

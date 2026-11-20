import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleType } from '../models/user.model';
import { NzMessageService } from 'ng-zorro-antd/message';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  const expectedRoles = route.data?.['roles'] as RoleType[];

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(expectedRoles)) {
    return true;
  }

  message.warning('Bạn không có quyền truy cập trang này!', { nzDuration: 3500 });

  router.navigate(['/dashboard']);
  return false;
};

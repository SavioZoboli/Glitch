import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';

export const authExpirationInterceptor: HttpInterceptorFn = (req, next) => {
  const authSessionService = inject(AuthSessionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error?.status === 401;
      const isRotaPublicaLogin = req.url.includes('/api/usuario/login');

      if (isUnauthorized && !isRotaPublicaLogin) {
        authSessionService.redirecionarParaLoginPorSessaoExpirada(
          'Sua sessão expirou. Faça login novamente.',
        );
      }

      return throwError(() => error);
    }),
  );
};


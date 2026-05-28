import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateChildFn = () => {
  const router = inject(Router);
  const authSessionService = inject(AuthSessionService);

  const token = localStorage.getItem('token');
  const tokenValido = authSessionService.tokenValido(token);

  if (tokenValido) return true;

  authSessionService.redirecionarParaLoginPorSessaoExpirada(
    token
      ? 'Sua sessão expirou. Faça login novamente.'
      : 'Faça login para acessar esta página.',
  );

  return router.parseUrl('/login');
};


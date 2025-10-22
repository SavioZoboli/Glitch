// 1. Mude o import para incluir o provedor zoneless
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'; 
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // 2. Use o provedor que corresponde à sua arquitetura
    provideZonelessChangeDetection(), 

    provideHttpClient(),

    MatIconRegistry
  ]
};
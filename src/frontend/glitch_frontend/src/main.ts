import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

fetch('/assets/config.json')
  .then((response) => response.json())
  .then((config) => {
    // 2. Sobrescrevemos o valor do environment em memória
    if (config.apiUrl) {
      environment.apiURL = config.apiUrl;
    }

    // 3. Somente AGORA iniciamos o Angular de fato
    bootstrapApplication(App, appConfig).catch((err) => console.error(err));
  })
  .catch((err) => {
    console.error('Erro ao carregar o arquivo de configuração:', err);
    // Inicia o app mesmo assim como fallback (opcional)
    bootstrapApplication(App, appConfig);
  });

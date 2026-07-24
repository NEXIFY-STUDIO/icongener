

import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { appConfig } from './src/app/app.config';
import { AppComponent } from './src/app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideProtractorTestingSupport(), // Optional, for e2e testing setup
    ...appConfig.providers,
  ],
}).catch((err) => console.error(err));
    

// AI Studio always uses an `index.tsx` file for all project types.

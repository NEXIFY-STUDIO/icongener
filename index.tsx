

import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideProtractorTestingSupport(), // Optional, for e2e testing setup
  ],
}).catch((err) => console.error(err));
    

// AI Studio always uses an `index.tsx` file for all project types.

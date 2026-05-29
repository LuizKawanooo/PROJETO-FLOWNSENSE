import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { ReactiveFormsModule } from '@angular/forms';
import {
  trash,
  cloudUpload,
  search,
  water,
  arrowBack,
  camera,
  pencil,
  checkmark,
  close,
  logOut,
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Register all Ionicons used in the application
addIcons({
  trash,
  cloudUpload,
  search,
  water,
  arrowBack,
  camera,
  pencil,
  checkmark,
  close,
  logOut,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
});

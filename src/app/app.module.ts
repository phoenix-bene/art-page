import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {GalleriaResponsiveComponent} from './galleria/components/galleria-responsive.component';
import {PhotoService} from './galleria/services/photo.service';
import {CommonModule, NgFor, NgOptimizedImage} from '@angular/common';
import {HomeComponent} from './home/containers/home.component';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MenuComponent} from './menu/menu.component';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {PrimengImportsModule} from './primeng-import';
import {definePreset} from '@primeng/themes';

const Bronze = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#f9ebe1",
      100: "#f4decd",
      200: "#ecc3a4",
      300: "#e3a87c",
      400: "#db8d53",
      500: "#d1732c",
      600: "#a85d24",
      700: "#80461b",
      800: "#573013",
      900: "#2f1a0a",
      950: "#1b0f06"
    }
  }
});

const routes: Routes = [
  {path: '',
    children: [
      {path: 'home', component: HomeComponent},
      {path: 'galerie', component: GalleriaResponsiveComponent},
      {path: '**', redirectTo: 'home'}
    ]
  },
  {path: '**', redirectTo: 'home', pathMatch: 'full'}
];


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MenuComponent,
    GalleriaResponsiveComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    PrimengImportsModule,
    RouterModule.forRoot(routes, {useHash: false}),
    NgOptimizedImage,
    NgFor
  ],
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Bronze,
        options: {
          prefix: 'art',
          cssLayer: {
            name: 'primeng',
            order: 'app-styles, primeng'
          }
        }
      }
    }),
    PhotoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}

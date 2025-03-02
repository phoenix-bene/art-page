import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {GalleriaResponsiveComponent} from './galleria/components/galleria-responsive.component';
import {PhotoService} from './galleria/services/photo.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {HomeComponent} from './home/components/home.component';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MenuComponent} from './menu/menu.component';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {PrimengImportsModule} from './primeng-import';

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
    GalleriaResponsiveComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    PrimengImportsModule,
    RouterModule.forRoot(routes, {useHash: false}),
    NgOptimizedImage
  ],
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    PhotoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}

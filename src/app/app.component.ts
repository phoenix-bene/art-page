import {Component} from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'art-page';

  showMenu: boolean;

  constructor(private location: Location) {
    this.showMenu = !location.path().includes('home');
  }
}

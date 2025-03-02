import {Component, OnInit} from '@angular/core';
import {MegaMenuItem, MenuItem} from 'primeng/api';

@Component({
  selector: 'menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Kunst',
        items: [{
          label: 'Galerie',
          route: '/galerie'
        },{
          label: 'Kugel',
          route: '/kugel'
        },{
          label: 'Feuer',
          route: '/feuer'
        }]
      }
    ];
  }
}

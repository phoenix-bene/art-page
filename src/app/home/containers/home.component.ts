import {Component, OnInit} from '@angular/core';
import {HomeTile} from '../model/home-tile.interface';

@Component({
  selector: 'home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  topTiles: HomeTile[] = [];
  middleTopTiles: HomeTile[] = [];
  middleBottomTiles: HomeTile[] = [];
  bottomTiles: HomeTile[] = [];

  ngOnInit(): void {
    this.topTiles = [{
      title: 'Termine'
    }, {
      title: 'alte'
    }, {
      title: 'empty'
    }];

    this.middleTopTiles = [{
      title: 'Garten'
    }, {
      title: 'Feuer'
    }, {
      title: 'Wasser'
    }, {
      title: 'Stahl'
    }, {
      title: 'Möbel'
    }, {
      title: 'Figuren'
    }];

    this.middleBottomTiles = [{
      title: 'Teamentwicklung'
    }, {
      title: 'Kursausschreibung'
    }, {
      title: 'Übersicht'
    }, {
      title: 'Daten'
    }, {
      title: 'individuell'
    }, {
      title: 'Kontakt'
    }];

    this.bottomTiles = [{
      title: 'Über mich'
    }, {
      title: 'empty'
    }, {
      title: 'empty'
    }];
  }
}

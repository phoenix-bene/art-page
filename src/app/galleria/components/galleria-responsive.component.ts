import {Component, OnInit} from '@angular/core';
import {PhotoService} from '../services/photo.service';
import {Post} from '../model/post.interface';

@Component({
  selector: 'galleria-responsive',
  standalone: false,
  templateUrl: './galleria-responsive.component.html'
})
export class GalleriaResponsiveComponent implements OnInit {
  images: Post[] = [];

  responsiveOptions: any[] = [
    {
      breakpoint: '1300px',
      numVisible: 4
    },
    {
      breakpoint: '575px',
      numVisible: 1
    }
  ];

  constructor(private photoService: PhotoService) {
  }

  ngOnInit() {
    this.photoService.getImages().subscribe((images) => this.images = images);
  }
}

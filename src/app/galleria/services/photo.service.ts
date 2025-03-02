import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Post} from '../model/post.interface';
import posts from '../../../../public/posts.json';

@Injectable()
export class PhotoService {

  getImages(): Observable<Post[]> {
      return of(this.getData());
  }

  private getData(): Post[] {
    return posts;
  }
}

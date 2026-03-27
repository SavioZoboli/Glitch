import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type Caroussel = {
  img: string;
  href: string | null;
};

@Component({
  selector: 'app-carrousel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './carrousel.html',
  styleUrl: './carrousel.scss',
})
export class Carrousel {
  carrousels: Caroussel[] = [
    { img: 'imgs/slideshow_1.jpg', href: null },
    { img: 'imgs/slideshow_2.png', href: null },
    { img: 'imgs/slideshow_3.jpg', href: null },
    { img: 'imgs/slideshow_4.jpg', href: null },
    { img: 'imgs/slideshow_5.jpg', href: null },
  ];

  currentIndex = 0;

  get anterior(): Caroussel {
    const i =
      (this.currentIndex - 1 + this.carrousels.length) % this.carrousels.length;
    return this.carrousels[i];
  }

  get atual(): Caroussel {
    return this.carrousels[this.currentIndex];
  }

  get proximo(): Caroussel {
    const i = (this.currentIndex + 1) % this.carrousels.length;
    return this.carrousels[i];
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.carrousels.length) % this.carrousels.length;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.carrousels.length;
  }
}

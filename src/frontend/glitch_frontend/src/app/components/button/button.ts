import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class ButtonComponent {
  @Input() label: string = 'Enviar';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() size: 'small' | 'medium' | 'big' = 'medium';
  @Input() routerLink?: string | any[];
  @Input() color:
    | 'primary'
    | 'secundary'
    | 'accent'
    | 'warn'
    | 'refuse'
    | 'selected'
    | 'notSelected'
    | 'cancel'
    | 'accept' = 'accent';

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}

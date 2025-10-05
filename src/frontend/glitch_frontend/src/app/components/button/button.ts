import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
   standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss']  
})
export class ButtonComponent {
  @Input() label: string = 'Enviar';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
}

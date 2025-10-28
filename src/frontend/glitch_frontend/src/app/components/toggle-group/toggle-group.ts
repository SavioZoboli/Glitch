import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-competitor-level',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './toggle-group.html',
  styleUrls: ['./toggle-group.scss']
})
export class CompetitorLevelComponent {
@Input() options: string[] = [];
@Input() control!: FormControl;
@Input() title: string = 'Título';
@Input() width: string = '360px';

  selectOption(option: string) {
    this.control.setValue(option);
  }

  isSelected(option: string) {
    return this.control.value === option;
  }
}

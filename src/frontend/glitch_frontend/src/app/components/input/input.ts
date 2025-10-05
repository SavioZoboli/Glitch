import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from './lucide-icons.module';

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideIconsModule
  ]
})
export class InputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() control!: FormControl;
  @Input() customStyles: { [klass: string]: any } = {};
  @Input() icon?: string;

  inputId = `input-${Math.random().toString(36)}`;
}

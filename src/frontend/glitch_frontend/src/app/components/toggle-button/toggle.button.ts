import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.html',
  styleUrls: ['./toggle-button.scss'],
  imports: [NgClass]
})
export class ToggleButtonComponent {
  @Input() label: string = '';
  @Input() control!: FormControl;
  @Input() disabled: boolean = false

  toggle() {
    if (!this.disabled) {
      this.control.setValue(!this.control.value);
    }

  }

  get isActive() {
    return this.control?.value;
  }
}

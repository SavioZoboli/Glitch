import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.html',
  styleUrls: ['./toggle-button.scss']
})
export class ToggleButtonComponent {
  @Input() label: string = '';
  @Input() control!: FormControl;

  toggle() {
    this.control.setValue(!this.control.value);
  }

  get isActive() {
    return this.control?.value;
  }
}

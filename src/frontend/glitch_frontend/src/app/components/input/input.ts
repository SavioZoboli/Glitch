import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  standalone: true,
  imports:[
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()] ,
  styleUrl:'./input.scss',
})
export class InputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() control!: FormControl;
  @Input() customStyles: { [klass: string]: any } = {};
  @Input() icon?: string;
   protected Validators = Validators;
   @Input() mask?: string;


  inputId = `input-${Math.random().toString(36)}`;
}

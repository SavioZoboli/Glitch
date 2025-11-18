import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
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
export class InputComponent implements OnInit{
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() control!: FormControl;
  @Input() customStyles: { [klass: string]: any } = {};
  @Input() icon?: string;
   protected Validators = Validators;
   @Input() mask?: string;
  @Input() disabled:boolean = false

  //Mudar depois para um componente App-Select, por enquanto para o MVP podemos usar o mesmo componente
  @Input() defaultValue:string = ''
  @Input() options:any[] = []

  inputId = `input-${Math.random().toString(36)}`;

  ngOnInit(): void {
    if(this.disabled){
      this.control.disable()
    }
  }
}

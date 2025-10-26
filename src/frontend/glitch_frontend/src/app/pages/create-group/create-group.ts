import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { InputComponent } from "../../components/input/input";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from "../../components/button/button";

@Component({
  selector: 'app-create-group',
  imports: [Navigation, InputComponent, ButtonComponent],
  templateUrl: './create-group.html',
  styleUrl: './create-group.scss'
})
export class CreateGroup {


  form:FormGroup = new FormGroup({
    nome:new FormControl('',Validators.required),
  })

  get nomeControl():FormControl{return this.form.get('nome') as FormControl}

}

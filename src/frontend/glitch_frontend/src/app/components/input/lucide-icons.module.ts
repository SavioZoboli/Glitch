import { NgModule } from '@angular/core';
import { LucideAngularModule, User, Mail, Phone, CreditCard, Calendar, MapPin, SquareUserRound, Cake, MapPinHouse } from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({ User, Mail, Phone, SquareUserRound, Calendar, Cake, MapPinHouse })
  ],
  exports: [LucideAngularModule]
})
export class LucideIconsModule { }

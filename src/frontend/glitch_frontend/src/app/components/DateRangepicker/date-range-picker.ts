import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.scss'
})
export class DateRangePickerComponent implements OnInit {
  @Input() placeholderStart = 'Data inicial';
  @Input() placeholderEnd = 'Data final (opcional)';
  @Input() startControl?: FormControl;
  @Input() endControl?: FormControl;
  @Output() rangeChange = new EventEmitter<DateRangeValue>();

  isOpen = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  hoverDate: Date | null = null;
  selecting: 'start' | 'end' = 'start';

  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();

  weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: (Date | null)[] = [];

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.buildCalendar();
    if (this.startControl?.value)
      this.startDate = new Date(this.startControl.value);
    if (this.endControl?.value) this.endDate = new Date(this.endControl.value);
  }

  get monthLabel(): string {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${months[this.viewMonth]} ${this.viewYear}`;
  }

  buildCalendar() {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const last = new Date(this.viewYear, this.viewMonth + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++)
      days.push(new Date(this.viewYear, this.viewMonth, d));

    this.calendarDays = days;
  }

  prevMonth() {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else this.viewMonth--;
    this.buildCalendar();
  }

  nextMonth() {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else this.viewMonth++;
    this.buildCalendar();
  }

  toggleCalendar() {
    this.isOpen = !this.isOpen;
  }

  selectDay(day: Date) {
    if (this.selecting === 'start' || (this.startDate && this.endDate)) {
      this.startDate = day;
      this.endDate = null;
      this.selecting = 'end';
    } else {
      if (day < this.startDate!) {
        this.endDate = this.startDate;
        this.startDate = day;
      } else {
        this.endDate = day;
      }
      this.selecting = 'start';
    }
  }

  hoverDay(day: Date) {
    if (this.selecting === 'end') this.hoverDate = day;
  }

  isToday(day: Date): boolean {
    const t = new Date();
    return day.toDateString() === t.toDateString();
  }

  isStart(day: Date): boolean {
    return (
      !!this.startDate && day.toDateString() === this.startDate.toDateString()
    );
  }

  isEnd(day: Date): boolean {
    return !!this.endDate && day.toDateString() === this.endDate.toDateString();
  }

  isInRange(day: Date): boolean {
    const end =
      this.endDate || (this.selecting === 'end' ? this.hoverDate : null);
    if (!this.startDate || !end) return false;
    return day > this.startDate && day < end;
  }

  isDisabled(_day: Date): boolean {
    return false;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  apply() {
    if (this.startControl) this.startControl.setValue(this.startDate);
    if (this.endControl) this.endControl.setValue(this.endDate);
    this.rangeChange.emit({ start: this.startDate, end: this.endDate });
    this.isOpen = false;
  }

  clear() {
    this.startDate = null;
    this.endDate = null;
    this.hoverDate = null;
    this.selecting = 'start';
    if (this.startControl) this.startControl.setValue(null);
    if (this.endControl) this.endControl.setValue(null);
    this.rangeChange.emit({ start: null, end: null });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}

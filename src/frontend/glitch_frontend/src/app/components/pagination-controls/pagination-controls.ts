import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-controls.html',
  styleUrls: ['./pagination-controls.scss'],
})
export class PaginationControlsComponent {
  @Input() paginaAtual: number = 1;
  @Input() totalPaginas: number = 1;
  @Input() desabilitado: boolean = false;

  @Output() paginaChange = new EventEmitter<number>();

  get paginaAtualExibicao(): number {
    return this.totalPaginas > 0 ? this.paginaAtual : 0;
  }

  get podeIrParaAnterior(): boolean {
    return !this.desabilitado && this.paginaAtual > 1;
  }

  get podeIrParaProxima(): boolean {
    return (
      !this.desabilitado &&
      this.totalPaginas > 0 &&
      this.paginaAtual < this.totalPaginas
    );
  }

  irParaAnterior(): void {
    if (!this.podeIrParaAnterior) return;
    this.paginaChange.emit(this.paginaAtual - 1);
  }

  irParaProxima(): void {
    if (!this.podeIrParaProxima) return;
    this.paginaChange.emit(this.paginaAtual + 1);
  }
}

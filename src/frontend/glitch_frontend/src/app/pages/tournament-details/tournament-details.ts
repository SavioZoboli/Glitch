import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../components/button/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { SystemNotificationService } from '../../services/misc/system-notification-service';
import { TournamentService } from '../../services/tournament-service';

@Component({
  selector: 'app-tournament-details',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatIconModule],
  providers: [DatePipe],
  templateUrl: './tournament-details.html',
  styleUrls: ['./tournament-details.scss'],
})
export class TournamentDetails implements OnInit {
  private id: string = '';
  carregando: boolean = true;
  torneio: any = null;
  readonly naoEspecificado: string = 'Não especificado';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService,
    private systemNotificationService: SystemNotificationService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
  ) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    this.buscarDadosTorneio();
  }

  get tituloPagina(): string {
    return this.texto(this.torneio?.nome);
  }

  goToEdit(): void {
    if (!this.id) return;
    this.router.navigate(['/update-tournament', this.id]);
  }

  goToList(): void {
    this.router.navigate(['/tournaments']);
  }

  private buscarDadosTorneio(): void {
    if (!this.id) {
      this.carregando = false;
      this.systemNotificationService.notificar(
        'erro',
        'Codigo do torneio invalido.',
      );
      this.goToList();
      return;
    }

    this.tournamentService
      .getTorneioById(this.id)
      .pipe(
        finalize(() => {
          // Garante que o loading seja finalizado em qualquer fluxo.
          this.carregando = false;
        }),
      )
      .subscribe({
        next: (res) => {
          this.torneio = res ?? {};
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.carregando = false;
          this.systemNotificationService.notificar(
            'erro',
            'Erro ao carregar os detalhes do torneio.',
          );
          this.goToList();
        },
      });
  }

  texto(valor: unknown): string {
    if (valor === null || valor === undefined) return this.naoEspecificado;
    const texto = String(valor).trim();
    return texto.length > 0 ? texto : this.naoEspecificado;
  }

  data(valor: string | Date | null | undefined): string {
    if (!valor) return this.naoEspecificado;
    return this.datePipe.transform(valor, 'dd/MM/yyyy') ?? this.naoEspecificado;
  }

  moeda(valor: unknown): string {
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return this.naoEspecificado;
    }

    const numeroNormalizado = this.normalizarNumero(valor);
    if (numeroNormalizado === null) return this.texto(valor);

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(numeroNormalizado);
  }

  booleano(
    valor: boolean | null | undefined,
    textoVerdadeiro: string = 'Sim',
    textoFalso: string = 'Nao',
  ): string {
    if (valor === null || valor === undefined) return this.naoEspecificado;
    return valor ? textoVerdadeiro : textoFalso;
  }

  get inscricaoDisponivelLabel(): string {
    const dataLimite = this.torneio?.configuracao_inscricao?.dt_fim;
    const status = this.calcularStatusInscricao(dataLimite);
    return this.booleano(status, 'Aberta', 'Encerrada');
  }

  get enderecoCompleto(): string {
    const endereco = this.torneio?.endereco;
    if (!endereco) return this.naoEspecificado;

    const partes = [
      endereco?.rua,
      endereco?.numero,
      endereco?.bairro,
      endereco?.cidade,
      endereco?.estado,
      endereco?.cep,
    ]
      .map((valor: unknown) => (valor ? String(valor).trim() : ''))
      .filter((valor: string) => valor.length > 0);

    if (partes.length === 0) return this.naoEspecificado;
    return partes.join(', ');
  }

  private calcularStatusInscricao(
    dataLimite: string | Date | null | undefined,
  ): boolean | null {
    if (!dataLimite) return null;

    const hoje = new Date();
    const limite = new Date(dataLimite);

    hoje.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);

    return limite >= hoje;
  }

  private normalizarNumero(valor: unknown): number | null {
    if (typeof valor === 'number') {
      return Number.isFinite(valor) ? valor : null;
    }

    if (typeof valor !== 'string') return null;

    const textoLimpo = valor
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');

    if (!textoLimpo) return null;

    const numero = Number(textoLimpo);
    return Number.isFinite(numero) ? numero : null;
  }
}

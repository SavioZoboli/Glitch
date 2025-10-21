import { Component } from '@angular/core';
import { Navigation } from "../../components/navigation/navigation";
import { ButtonComponent } from "../../components/button/button";
import { Footer } from '../../components/footer/footer';
import { ThemeToggler } from '../../components/theme-toggler/theme-toggler';

@Component({
  selector: 'app-create-tournament',
  imports: [Navigation, ButtonComponent, Footer, ThemeToggler],
  templateUrl: './create-tournament.html',
  styleUrls: ['./create-tournament.scss']
})
export class CreateTournament {
  criarTorneio() {
    const nome = (document.getElementById('nome') as HTMLInputElement).value;
    const jogo = (document.getElementById('jogo') as HTMLInputElement).value;
    const data = (document.getElementById('data') as HTMLInputElement).value;
    const endereco = (document.getElementById('endereco') as HTMLInputElement).value;
    const minimo = (document.getElementById('minimo') as HTMLInputElement).value;
    const maximo = (document.getElementById('maximo') as HTMLInputElement).value;
    const dataLimite = (document.getElementById('dataLimite') as HTMLInputElement).value;
    const valorIngresso = (document.getElementById('valorIngresso') as HTMLInputElement).value;
    const premiacao = (document.getElementById('premiacao') as HTMLInputElement).value;

    if (!nome || !jogo || !data) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const torneio = {
      nome,
      jogo,
      data,
      endereco,
      minimo,
      maximo,
      dataLimite,
      valorIngresso,
      premiacao
    };

    console.log('Torneio criado:', torneio);
    alert('Torneio criado com sucesso!');
    this.limparCampos();
  }

  limparCampos() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => (input.value = ''));
  }
}

import { CreateTournament } from './create-tournament';

describe('CreateTournament', () => {
  let component: CreateTournament;

  beforeEach(() => {
    component = new CreateTournament();
    document.body.innerHTML = `
      <input id="nome" />
      <input id="jogo" />
      <input id="data" />
      <input id="endereco" />
      <input id="minimo" />
      <input id="maximo" />
      <input id="dataLimite" />
      <input id="valorIngresso" />
      <input id="premiacao" />
    `;
  });

  it('deve exibir alerta se campos obrigatórios não forem preenchidos', () => {
    spyOn(window, 'alert');
    component.criarTorneio();
    expect(window.alert).toHaveBeenCalledWith('Preencha todos os campos obrigatórios!');
  });

  it('deve criar o torneio com sucesso quando os campos obrigatórios forem preenchidos', () => {
    spyOn(window, 'alert');
    (document.getElementById('nome') as HTMLInputElement).value = 'Torneio CS';
    (document.getElementById('jogo') as HTMLInputElement).value = 'CS2';
    (document.getElementById('data') as HTMLInputElement).value = '2025-10-21T10:00';

    component.criarTorneio();

    expect(window.alert).toHaveBeenCalledWith('Torneio criado com sucesso!');
  });

  it('deve limpar todos os campos ao chamar limparCampos()', () => {
    (document.getElementById('nome') as HTMLInputElement).value = 'Teste';
    (document.getElementById('jogo') as HTMLInputElement).value = 'CS2';

    component.limparCampos();

    const nome = (document.getElementById('nome') as HTMLInputElement).value;
    const jogo = (document.getElementById('jogo') as HTMLInputElement).value;

    expect(nome).toBe('');
    expect(jogo).toBe('');
  });
});

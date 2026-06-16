import torneioService from "../services/torneio.service";

let timeoutAgendado: NodeJS.Timeout | null = null;

const proximaMeiaNoite = (): Date => {
  const agora = new Date();
  const proximoHorario = new Date(agora);
  proximoHorario.setHours(24, 0, 0, 0);
  return proximoHorario;
};

const agendarExecucaoDiaria = (): void => {
  const horarioExecucao = proximaMeiaNoite();
  const delay = horarioExecucao.getTime() - Date.now();

  timeoutAgendado = setTimeout(async () => {
    timeoutAgendado = null;

    const qtdEncerrados = await torneioService.executarEncerramentoAutomatico();
    console.log(
      `[JOB] Encerramento automatico de torneios executado. Total encerrado: ${qtdEncerrados}.`,
    );

    agendarExecucaoDiaria();
  }, delay);

  console.log(
    `[JOB] Proximo encerramento automatico de torneios agendado para ${horarioExecucao.toLocaleString("pt-BR")}.`,
  );
};

export const iniciarJobEncerramentoAutomaticoTorneios = (): void => {
  if (timeoutAgendado) {
    return;
  }

  agendarExecucaoDiaria();
};

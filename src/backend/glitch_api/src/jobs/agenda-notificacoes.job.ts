import agendaService from "../services/agenda.service";

let intervalCincoMinutos: NodeJS.Timeout | null = null;
let executandoCincoMinutos = false;

const processarLembretesCincoMinutos = async (): Promise<void> => {
  if (executandoCincoMinutos) return;

  executandoCincoMinutos = true;
  try {
    const totalGeradas = await agendaService.processarLembretesCincoMinutosAntes();
    if (totalGeradas > 0) {
      console.log(
        `[JOB] Lembretes de 5 minutos executados. Total criado: ${totalGeradas}.`,
      );
    }
  } catch (error) {
    console.error("[JOB] Erro ao executar lembretes de 5 minutos:", error);
  } finally {
    executandoCincoMinutos = false;
  }
};

export const iniciarJobAgendaNotificacoes = (): void => {
  if (!intervalCincoMinutos) {
    setTimeout(() => {
      processarLembretesCincoMinutos();
    }, 5000);

    intervalCincoMinutos = setInterval(() => {
      processarLembretesCincoMinutos();
    }, 60 * 1000);

    console.log(
      "[JOB] Verificacao de lembretes de 5 minutos iniciada (intervalo de 1 minuto).",
    );
  }
};

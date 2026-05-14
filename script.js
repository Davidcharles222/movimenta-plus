/* =========================================
   CONTROLE DE SESSÃO
========================================= */

const usuarioLogado = localStorage.getItem("usuarioLogado");
const tempoLogin = localStorage.getItem("tempoLogin");

const limiteSessao = 30 * 60 * 1000;

if (
  !usuarioLogado ||
  !tempoLogin ||
  Date.now() - Number(tempoLogin) > limiteSessao
) {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("tempoLogin");

  window.location.href = "login.html";
}

/* =========================================
   VARIÁVEIS PRINCIPAIS DO TREINO
========================================= */

let tempoInicial = 30;
let tempo = tempoInicial;
let timer = null;

let series = 0;
let calorias = 0;
let tempoAtivo = 0;

let exercicioAtual = 0;
let intensidadeAtual = "leve";

const totalCirculo = 565;

/* =========================================
   LISTA DE EXERCÍCIOS
========================================= */

const exercicios = [
  "Alongamento de braços",
  "Caminhada leve",
  "Elevação de joelhos",
  "Agachamento assistido",
  "Exercício no simulador de caminhada",
  "Rotação de ombros",
  "Subida no step baixo",
  "Alongamento de pernas",
];

/* =========================================
   ELEMENTOS DO HTML
========================================= */

const tempoElemento = document.getElementById("tempo");
const seriesElemento = document.getElementById("series");
const miniSeries = document.getElementById("miniSeries");

const caloriasElemento = document.getElementById("caloriasGastas");
const tempoAtivoElemento = document.getElementById("tempoAtivo");

const metaDiaria = document.getElementById("metaDiaria");
const nomeExercicio = document.getElementById("nomeExercicio");

const progresso = document.getElementById("progresso");

/* =========================================
   ATUALIZA CRONÔMETRO E CÍRCULO
========================================= */

function atualizarTempo() {
  tempoElemento.innerText = tempo;

  let porcentagem = tempo / tempoInicial;

  progresso.style.strokeDashoffset = totalCirculo - totalCirculo * porcentagem;
}

/* =========================================
   AVANÇAR EXERCICIO
========================================= */

function avancarExercicio() {
  exercicioAtual++;

  if (exercicioAtual >= exercicios.length) {
    exercicioAtual = 0;
  }

  nomeExercicio.innerText = exercicios[exercicioAtual];

  salvarProgresso();
  atualizarFeedbackMovimento();
}

/* =========================================
   INICIAR CRONÔMETRO
========================================= */

function iniciar() {
  if (timer !== null) {
    return;
  }

  timer = setInterval(() => {
    tempo--;

    atualizarTempo();
    atualizarFeedbackMovimento();

    if (tempo <= 0) {
      clearInterval(timer);

      timer = null;

      series++;

      registrarDiaTreinado();

      tempoAtivo += tempoInicial / 60;

      calorias += calcularCalorias();

      caloriasElemento.innerText = calorias;

      tempoAtivoElemento.innerText = tempoAtivo.toFixed(1);

      seriesElemento.innerText = series;
      miniSeries.innerText = series;

      atualizarMetaDiaria();

      avancarExercicio();

      tempo = tempoInicial;

      atualizarTempo();
      atualizarFeedbackMovimento();

      salvarProgresso();

      document.getElementById("somNotificacao").play();

      if (Notification.permission === "granted") {
        new Notification("Movimenta+", {
          body: "Parabéns! Série concluída 💪",
          icon: "https://cdn-icons-png.flaticon.com/512/1048/1048941.png",
        });
      }

      mostrarToast("Série concluída! Próximo exercício.");
    }
  }, 1000);
}

/* =========================================
   PAUSAR CRONÔMETRO
========================================= */

function pausar() {
  clearInterval(timer);

  timer = null;
}

/* =========================================
   RESETAR CRONÔMETRO
========================================= */

function resetar() {
  clearInterval(timer);

  timer = null;

  tempo = tempoInicial;

  progresso.style.strokeDashoffset = 0;

  atualizarTempo();
  atualizarFeedbackMovimento();
}

/* =========================================
   REGISTRA DIA TREINADO NO CALENDÁRIO
========================================= */

function registrarDiaTreinado() {
  const hoje = new Date().getDate();

  const usuario = localStorage.getItem("usuarioLogado");

  let diasTreinados =
    JSON.parse(localStorage.getItem("diasTreinados_" + usuario)) || [];

  if (!diasTreinados.includes(hoje)) {
    diasTreinados.push(hoje);

    localStorage.setItem(
      "diasTreinados_" + usuario,
      JSON.stringify(diasTreinados),
    );
  }
}

/* =========================================
   SALVAR PROGRESSO DO USUÁRIO
========================================= */

function salvarProgresso() {
  const usuario = localStorage.getItem("usuarioLogado");

  localStorage.setItem("series_" + usuario, series);
  localStorage.setItem("exercicioAtual_" + usuario, exercicioAtual);
  localStorage.setItem("calorias_" + usuario, calorias);
  localStorage.setItem("tempoAtivo_" + usuario, tempoAtivo);
  localStorage.setItem(
    "nomeExercicioAtual_" + usuario,
    nomeExercicio.innerText,
  );
}

/* =========================================
   CARREGAR PROGRESSO DO USUÁRIO
========================================= */

function carregarProgresso() {
  const usuario = localStorage.getItem("usuarioLogado");

  const seriesSalvas = localStorage.getItem("series_" + usuario);
  const exercicioSalvo = localStorage.getItem("exercicioAtual_" + usuario);
  const caloriasSalvas = localStorage.getItem("calorias_" + usuario);
  const tempoAtivoSalvo = localStorage.getItem("tempoAtivo_" + usuario);

  if (seriesSalvas !== null) {
    series = Number(seriesSalvas);

    seriesElemento.innerText = series;
    miniSeries.innerText = series;
  }

  if (exercicioSalvo !== null) {
    exercicioAtual = Number(exercicioSalvo);

    nomeExercicio.innerText = exercicios[exercicioAtual];
  }

  if (caloriasSalvas !== null) {
    calorias = Number(caloriasSalvas);

    caloriasElemento.innerText = calorias;
  }

  if (tempoAtivoSalvo !== null) {
    tempoAtivo = Number(tempoAtivoSalvo);

    tempoAtivoElemento.innerText = tempoAtivo.toFixed(1);
  }
}

/* =========================================
   ABRIR PÁGINA DE EVOLUÇÃO
========================================= */

function abrirEvolucao() {
  window.location.href = "evolucao.html";
}

/* =========================================
   APLICAR PRÓXIMO TREINO
========================================= */

function iniciarTreinoSuperior() {
  clearInterval(timer);

  timer = null;

  avancarExercicio();

  tempo = calcularTempoAdaptado();
  tempoInicial = tempo;

  progresso.style.strokeDashoffset = 0;

  atualizarTempo();

  mostrarToast("Próxima atividade aplicada 💪");
}

/* =========================================
   ATUALIZAR META DIÁRIA
========================================= */

function atualizarMetaDiaria() {
  const meta = 5;

  metaDiaria.innerText = series + "/" + meta;

  const porcentagem = Math.min((series / meta) * 100, 100);

  document.getElementById("progressoMeta").style.width = porcentagem + "%";

  document.getElementById("porcentagemMeta").innerText =
    Math.round(porcentagem) + "%";
}

/* =========================================
   FRASES MOTIVACIONAIS
========================================= */

const frasesMotivacionais = [
  "Cada movimento é um passo para uma vida mais saudável 💜",
  "Seu ritmo é o melhor ritmo para evoluir 🌿",
  "Movimentar-se hoje é cuidar do amanhã ✨",
  "Pequenos passos geram grandes resultados 💪",
  "Você está evoluindo a cada atividade 🚶",
  "Cuidar da saúde também é um ato de amor 💜",
];

function carregarFraseMotivacional() {
  const frase =
    frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];

  document.getElementById("fraseMotivacional").innerText = frase;
}

/* =========================================
   CALCULAR TEMPO ADAPTADO
========================================= */

function calcularTempoAdaptado() {
  const intensidade = document.getElementById("intensidade").value;

  intensidadeAtual = intensidade;

  const idade = document.getElementById("idadeUsuario").value;

  const condicionamento = document.getElementById(
    "condicionamentoUsuario",
  ).value;

  const objetivo = document.getElementById("objetivoUsuario").value;

  let novoTempo = 30;

  if (intensidade === "leve") {
    novoTempo = 40;
  }

  if (intensidade === "moderado") {
    novoTempo = 30;
  }

  if (intensidade === "intenso") {
    novoTempo = 20;
  }

  if (condicionamento === "Iniciante") {
    novoTempo += 5;
  }

  if (condicionamento === "Avançado") {
    novoTempo -= 5;
  }

  if (idade === "60+" || idade === "70+") {
    novoTempo += 5;
  }

  if (idade === "10+") {
    novoTempo += 5;
  }

  if (objetivo === "forca") {
    exercicios[0] = "Agachamento assistido";
  }

  if (objetivo === "resistencia") {
    exercicios[0] = "Caminhada contínua";
  }

  if (objetivo === "flexibilidade") {
    exercicios[0] = "Alongamento corporal";
  }

  if (novoTempo < 15) {
    novoTempo = 15;
  }

  if (novoTempo > 60) {
    novoTempo = 60;
  }

  return novoTempo;
}

/* =========================================
   FUNÇÕES CHAMADAS PELOS SELECTS DO HTML
========================================= */

function alterarIntensidade() {
  atualizarConfiguracoesTreino();
}

function aplicarPerfilUsuario() {
  atualizarConfiguracoesTreino();
}

function aplicarObjetivoUsuario() {
  atualizarConfiguracoesTreino();
}

/* =========================================
   APLICAR CONFIGURAÇÕES DO TREINO
========================================= */

function atualizarConfiguracoesTreino() {
  tempo = calcularTempoAdaptado();

  tempoInicial = tempo;

  progresso.style.strokeDashoffset = 0;

  atualizarTempo();
  atualizarFeedbackMovimento();
  atualizarProximoTreino();

  salvarProgresso();
}

/* =========================================
   FEEDBACK DE MOVIMENTO
========================================= */

function atualizarFeedbackMovimento() {
  const feedback = document.getElementById("feedbackMovimento");

  const atividade = nomeExercicio.innerText;

  if (atividade.includes("Alongamento")) {
    feedback.innerText =
      "Faça movimentos lentos, sem forçar as articulações. Respire fundo durante o alongamento.";
  } else if (atividade.includes("Caminhada")) {
    feedback.innerText =
      "Mantenha a postura ereta, olhe para frente e caminhe em ritmo confortável.";
  } else if (atividade.includes("Agachamento")) {
    feedback.innerText =
      "Flexione os joelhos devagar, mantenha as costas retas e use apoio se necessário.";
  } else {
    feedback.innerText =
      "Mantenha movimentos leves e controlados. Se sentir dor ou tontura, pare e descanse.";
  }
}

/* =========================================
   ATUALIZAR CARD PRÓXIMO TREINO
========================================= */

function atualizarProximoTreino() {
  const objetivo = document.getElementById("objetivoUsuario").value;

  const titulo = document.getElementById("tituloProximoTreino");
  const categoria = document.getElementById("categoriaTreino");

  if (objetivo === "forca") {
    titulo.innerText = "Treino Funcional";
    categoria.innerText = "Força • Equilíbrio";
  } else if (objetivo === "resistencia") {
    titulo.innerText = "Caminhada Ativa";
    categoria.innerText = "Resistência • Cardio";
  } else if (objetivo === "flexibilidade") {
    titulo.innerText = "Alongamento Guiado";
    categoria.innerText = "Mobilidade • Flexibilidade";
  }
}

/* =========================================
   FOTO DO PERFIL NO TOPO
========================================= */

const fotoTopo = document.getElementById("fotoTopo");
const iconeTopo = document.getElementById("iconeTopo");

const usuarioAtual = localStorage.getItem("usuarioLogado");

const fotoPerfilTopo =
  localStorage.getItem("fotoPerfil_" + usuarioAtual) ||
  localStorage.getItem("fotoPerfil");

if (fotoPerfilTopo) {
  fotoTopo.src = fotoPerfilTopo;

  fotoTopo.style.display = "block";

  iconeTopo.style.display = "none";
}

/* =========================================
   PERMISSÃO DE NOTIFICAÇÃO
========================================= */

function solicitarPermissaoNotificacao() {
  const permissaoJaPedida = localStorage.getItem("permissaoNotificacaoPedida");

  if (permissaoJaPedida === "sim") {
    return;
  }

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();

    localStorage.setItem("permissaoNotificacaoPedida", "sim");
  }
}

/* =========================================
   LEMBRETE DE TREINO
========================================= */

function abrirLembrete() {
  const minutos = prompt("Definir lembrete em quantos minutos?");

  if (!minutos) {
    return;
  }

  mostrarToast("Lembrete criado com sucesso 🔔");

  setTimeout(
    () => {
      document.getElementById("somNotificacao").play();

      mostrarToast("Hora de se movimentar 🌿💪");

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Movimenta+", {
          body: "Hora de se movimentar 🌿💪",
          icon: "https://cdn-icons-png.flaticon.com/512/1048/1048941.png",
        });
      }
    },
    Number(minutos) * 60000,
  );
}

/* =========================================
   CALCULAR CALORIAS
========================================= */

function calcularCalorias() {
  let caloriasPorMinuto = 3;

  if (intensidadeAtual === "leve") {
    caloriasPorMinuto = 2;
  }

  if (intensidadeAtual === "moderado") {
    caloriasPorMinuto = 3;
  }

  if (intensidadeAtual === "intenso") {
    caloriasPorMinuto = 5;
  }

  return Math.round(caloriasPorMinuto * (tempoInicial / 60));
}

/* =========================================
   TOAST / MENSAGEM TEMPORÁRIA
========================================= */

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");

  const texto = document.getElementById("toastMensagem");

  texto.innerText = mensagem;

  toast.classList.add("ativo");

  setTimeout(() => {
    toast.classList.remove("ativo");
  }, 3000);
}

/* =========================================
   INICIALIZAÇÃO DO APP
========================================= */

carregarProgresso();

tempo = calcularTempoAdaptado();
tempoInicial = tempo;

atualizarTempo();
atualizarFeedbackMovimento();
atualizarMetaDiaria();
atualizarProximoTreino();

carregarFraseMotivacional();

solicitarPermissaoNotificacao();

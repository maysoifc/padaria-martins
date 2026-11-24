
<script setup>
import {
  computed,
  onMounted,
  onBeforeUnmount,
  ref
} from "vue";

import { useFidelidade } from "@/composables/useFidelidade";

import "@/assets/css/resgate-premio.css";

const emit = defineEmits(["resgatado"]);

// =========================================================
// FIDELIDADE
// =========================================================

const {
  cupons,
  cuponsDisponiveis,
  cuponsUtilizados,
  carregando,
  erro: erroCarteira,
  recarregar,
  cupomFoiUtilizado
} = useFidelidade();

// =========================================================
// ESTADOS
// =========================================================

const codigoCupom = ref("");
const mensagemCopiado = ref("");
const erro = ref("");

let intervaloMensagem = null;

// =========================================================
// PRÊMIOS
// =========================================================

const premios = [
  {
    id: 1,
    tipo: "produto",
    icone: "fa-solid fa-cake-candles",
    titulo: "Torta grátis",
    descricao: "Ganhe uma torta por nossa conta."
  },
  {
    id: 2,
    tipo: "desconto",
    icone: "fa-solid fa-ticket",
    titulo: "R$ 10 de desconto",
    descricao: "Use seu desconto em uma próxima compra."
  },
  {
    id: 3,
    tipo: "desconto",
    icone: "fa-solid fa-ticket",
    titulo: "R$ 25 de desconto",
    descricao: "Use seu desconto em uma próxima compra."
  },
  {
    id: 4,
    tipo: "desconto",
    icone: "fa-solid fa-ticket",
    titulo: "R$ 50 de desconto",
    descricao: "Use seu desconto em uma próxima compra."
  },
  {
    id: 5,
    tipo: "produto",
    icone: "fa-solid fa-bread-slice",
    titulo: "Pão grátis",
    descricao: "Ganhe um pão na sua próxima compra."
  },
  {
    id: 6,
    tipo: "produto",
    icone: "fa-solid fa-mug-hot",
    titulo: "Café grátis",
    descricao: "Ganhe um café por nossa conta."
  },
  {
    id: 7,
    tipo: "produto",
    icone: "fa-solid fa-cookie-bite",
    titulo: "Doce grátis",
    descricao: "Escolha um doce participante."
  }
];

// =========================================================
// IDENTIFICAR PRÊMIO PELO CUPOM
// =========================================================

const identificarPremio = (cupom) => {
  if (!cupom) return null;

  // O backend pode informar o tipo e o título
  // diretamente no objeto do cupom.

  const titulo = String(
    cupom.titulo || ""
  ).trim().toLowerCase();

  const tipo = String(
    cupom.tipo || ""
  ).trim().toLowerCase();

  const premioEncontrado = premios.find((item) => {
    return (
      item.titulo.toLowerCase() === titulo
    );
  });

  if (premioEncontrado) {
    return premioEncontrado;
  }

  // Compatibilidade caso o backend envie
  // somente o título ou o tipo do prêmio.

  if (titulo) {
    return {
      id: cupom.id,
      tipo: tipo || "produto",
      icone: tipo === "desconto"
        ? "fa-solid fa-ticket"
        : "fa-solid fa-gift",
      titulo: cupom.titulo,
      descricao: cupom.descricao || "Uma recompensa especial da Padaria Martins."
    };
  }

  return null;
};

// =========================================================
// CUPOM ATUAL
// =========================================================

const todosCupons = computed(() => {
  return [
    ...cuponsDisponiveis.value,
    ...cuponsUtilizados.value
  ];
});

const cupomAtual = computed(() => {
  if (!codigoCupom.value) return null;

  return (
    todosCupons.value.find(
      (item) => item.codigo === codigoCupom.value
    ) || null
  );
});

const premio = computed(() => {
  return identificarPremio(cupomAtual.value);
});

const utilizado = computed(() => {
  return cupomFoiUtilizado(cupomAtual.value);
});

// O cupom disponível pode ser visualizado.
// Visualizar não significa consumir ou utilizar.

const resgatado = computed(() => {
  return Boolean(cupomAtual.value);
});

// =========================================================
// SELECIONAR CUPOM
// =========================================================

const selecionarCupom = () => {
  const lista = todosCupons.value;

  if (!lista.length) {
    codigoCupom.value = "";
    return;
  }

  // Prioriza um cupom ainda disponível.
  const disponivel = lista.find(
    (item) => !cupomFoiUtilizado(item)
  );

  const selecionado = disponivel || lista[0];

  codigoCupom.value = selecionado.codigo || "";
};

// =========================================================
// ATUALIZAR CARTEIRA
// =========================================================

const atualizarPremio = async () => {
  erro.value = "";

  const sucesso = await recarregar();

  if (!sucesso) {
    erro.value =
      erroCarteira.value ||
      "Não foi possível carregar seus cupons.";

    return;
  }

  // Mantém o cupom selecionado se ele ainda existir.
  if (codigoCupom.value) {
    const continuaExistindo = todosCupons.value.some(
      (item) => item.codigo === codigoCupom.value
    );

    if (continuaExistindo) {
      return;
    }
  }

  selecionarCupom();
};

// =========================================================
// TEXTOS E ESTADOS
// =========================================================

const tituloBotao = computed(() => {
  if (utilizado.value) {
    return "Cupom já utilizado";
  }

  if (resgatado.value) {
    return "Prêmio disponível";
  }

  return "Prêmio indisponível";
});

const textoStatus = computed(() => {
  if (utilizado.value) {
    return "Este cupom já foi utilizado e não pode ser usado novamente.";
  }

  if (resgatado.value) {
    return "Seu prêmio está disponível. Guarde o código para utilizá-lo.";
  }

  return "Você ainda não possui um prêmio disponível.";
});

// =========================================================
// COPIAR CÓDIGO
// =========================================================

const copiarCodigo = async () => {
  if (!codigoCupom.value) return;

  erro.value = "";
  mensagemCopiado.value = "";

  try {
    await navigator.clipboard.writeText(
      codigoCupom.value
    );

    mensagemCopiado.value =
      "Código copiado com sucesso!";

    clearTimeout(intervaloMensagem);

    intervaloMensagem = setTimeout(() => {
      mensagemCopiado.value = "";
    }, 3000);

  } catch {
    erro.value =
      "Não foi possível copiar automaticamente. Selecione o código e copie manualmente.";
  }
};

// =========================================================
// RESGATAR / VISUALIZAR PRÊMIO
// =========================================================

// Não gera código, não cria cupom e não altera
// o status do cupom. O uso é controlado pelo Django.

const resgatar = () => {
  if (!cupomAtual.value || utilizado.value) {
    return;
  }

  emit("resgatado", cupomAtual.value);
};

// =========================================================
// ATUALIZAÇÃO DE STATUS
// =========================================================

const verificarAtualizacao = () => {
  atualizarPremio();
};

// =========================================================
// CICLO DE VIDA
// =========================================================

onMounted(async () => {
  await atualizarPremio();

  window.addEventListener(
    "storage",
    verificarAtualizacao
  );

  window.addEventListener(
    "focus",
    verificarAtualizacao
  );

  window.addEventListener(
    "cupons-atualizados",
    verificarAtualizacao
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "storage",
    verificarAtualizacao
  );

  window.removeEventListener(
    "focus",
    verificarAtualizacao
  );

  window.removeEventListener(
    "cupons-atualizados",
    verificarAtualizacao
  );

  clearTimeout(intervaloMensagem);
});
</script>

<template>
  <section class="resgate-premio">

    <!-- CABEÇALHO -->
    <div class="resgate-premio__cabecalho">
      <span class="resgate-premio__icone-cabecalho">
        <i
          class="fa-solid fa-gift"
          aria-hidden="true"
        ></i>
      </span>

      <div>
        <p class="resgate-premio__sobretitulo">
          Programa de fidelidade
        </p>

        <h2>Seu prêmio especial</h2>

        <p class="resgate-premio__introducao">
          Uma recompensa da Padaria Martins para você.
        </p>
      </div>
    </div>

    <!-- CARREGAMENTO -->
    <div
      v-if="carregando && !cupomAtual"
      class="resgate-premio__carregando"
      role="status"
    >
      <i class="fa-solid fa-spinner fa-spin"></i>
      Carregando seus prêmios...
    </div>

    <!-- ERRO -->
    <div
      v-else-if="erro"
      class="resgate-premio__carregando"
      role="alert"
    >
      <i class="fa-solid fa-circle-exclamation"></i>

      <p>{{ erro }}</p>

      <button
        type="button"
        @click="atualizarPremio"
        :disabled="carregando"
      >
        Tentar novamente
      </button>
    </div>

    <!-- SEM CUPONS -->
    <div
      v-else-if="!cupomAtual || !premio"
      class="resgate-premio__carregando"
    >
      <i class="fa-solid fa-gift"></i>

      <strong>
        Nenhum prêmio disponível no momento.
      </strong>

      <p>
        Complete seu cartão de fidelidade com 10 selos
        para receber uma recompensa.
      </p>
    </div>

    <!-- PRÊMIO -->
    <div
      v-else
      class="resgate-premio__cartao"
      :class="{
        'resgate-premio__cartao--utilizado': utilizado
      }"
    >

      <!-- ÍCONE -->
      <div class="resgate-premio__icone-premio">
        <i
          :class="premio.icone"
          aria-hidden="true"
        ></i>
      </div>

      <!-- CATEGORIA -->
      <span class="resgate-premio__etiqueta">
        {{
          premio.tipo === "desconto"
            ? "Prêmio em desconto"
            : "Prêmio em produto"
        }}
      </span>

      <!-- TÍTULO -->
      <h3>{{ premio.titulo }}</h3>

      <p class="resgate-premio__descricao">
        {{ premio.descricao }}
      </p>

      <!-- STATUS -->
      <div
        class="resgate-premio__status"
        :class="{
          'status-disponivel': !utilizado,
          'status-utilizado': utilizado
        }"
        role="status"
      >
        <i
          :class="utilizado
            ? 'fa-solid fa-circle-check'
            : 'fa-solid fa-gift'"
          aria-hidden="true"
        ></i>

        <div>
          <strong>
            {{
              utilizado
                ? "Já utilizado"
                : "Prêmio disponível"
            }}
          </strong>

          <span>{{ textoStatus }}</span>
        </div>
      </div>

      <!-- CÓDIGO -->
      <div class="resgate-premio__cupom">
        <span>Código do prêmio</span>

        <strong>{{ codigoCupom }}</strong>

        <button
          v-if="codigoCupom"
          type="button"
          class="resgate-premio__copiar"
          @click="copiarCodigo"
        >
          <i
            class="fa-regular fa-copy"
            aria-hidden="true"
          ></i>

          Copiar código
        </button>

        <p
          v-if="mensagemCopiado"
          class="resgate-premio__copiado"
          role="status"
        >
          <i class="fa-solid fa-check"></i>
          {{ mensagemCopiado }}
        </p>
      </div>

      <!-- SUCESSO -->
      <p
        v-if="!utilizado"
        class="resgate-premio__sucesso"
      >
        <i class="fa-solid fa-circle-check"></i>
        Seu prêmio está disponível. Apresente o código
        conforme as condições de utilização.
      </p>

      <!-- UTILIZADO -->
      <p
        v-if="utilizado"
        class="resgate-premio__utilizado"
        role="status"
      >
        <i class="fa-solid fa-circle-check"></i>
        Este código já foi utilizado.
      </p>

      <!-- ERRO -->
      <p
        v-if="erro"
        class="resgate-premio__erro"
        role="alert"
      >
        {{ erro }}
      </p>

      <!-- BOTÃO -->
      <button
        class="resgate-premio__botao"
        :class="{
          'botao-utilizado': utilizado
        }"
        type="button"
        :disabled="utilizado"
        @click="resgatar"
      >
        <i
          :class="utilizado
            ? 'fa-solid fa-check'
            : 'fa-solid fa-gift'"
          aria-hidden="true"
        ></i>

        {{ tituloBotao }}
      </button>

    </div>

  </section>
</template>

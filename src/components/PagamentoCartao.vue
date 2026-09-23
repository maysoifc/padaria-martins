<script setup>
import { computed, ref, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  valor: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  "update:modelValue",
  "validado"
]);

const CHAVE_CARTOES = "cartoesPagamento";
const JUROS_MENSAL = 0.02;

const cartoesSalvos = ref([]);
const cartaoSelecionado = ref(null);
const mostrarNovoCartao = ref(false);
const indiceCartao = ref(0);

const dados = ref({
  numero: "",
  nome: "",
  validade: "",
  cvv: "",
  parcelas: "1"
});

const parcelasSelecionadas = ref("1");

const mostrarNumero = ref(false);
const mostrarCvv = ref(false);
const tentouValidar = ref(false);

const carregarCartoes = () => {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE_CARTOES);

    if (!dadosSalvos) {
      cartoesSalvos.value = [];
      return;
    }

    const parsed = JSON.parse(dadosSalvos);

    cartoesSalvos.value = Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    cartoesSalvos.value = [];
  }
};

const cartoesFormatados = computed(() => {
  return cartoesSalvos.value.map(cartao => ({
    ...cartao,
    final: cartao.final || "",
    titular: cartao.titular || cartao.nome || "TITULAR",
    validade: cartao.validade || ""
  }));
});

const cartaoAtual = computed(() => {
  if (!cartoesFormatados.value.length) {
    return null;
  }

  return (
    cartoesFormatados.value[indiceCartao.value] ||
    cartoesFormatados.value[0]
  );
});

const bandeiraCartao = (cartao) => {
  return String(
    cartao?.bandeira || "CARD"
  ).toUpperCase();
};

const valorNumerico = computed(() => {
  const valor = Number(props.valor);

  return Number.isFinite(valor) && valor >= 0
    ? valor
    : 0;
});

const calcularParcela = (valor, quantidade) => {
  const numeroParcelas = Number(quantidade);

  if (
    !Number.isFinite(numeroParcelas) ||
    numeroParcelas <= 3
  ) {
    return {
      valorParcela: valor / Math.max(numeroParcelas, 1),
      juros: 0,
      total: valor
    };
  }

  const total =
    valor *
    Math.pow(
      1 + JUROS_MENSAL,
      numeroParcelas
    );

  const valorParcela =
    total / numeroParcelas;

  const juros = total - valor;

  return {
    valorParcela,
    juros,
    total
  };
};

const formatarMoeda = (valor) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

const opcoesParcelas = computed(() => {
  const valor = valorNumerico.value;
  const opcoes = [];

  const adicionarOpcao = (
    quantidade,
    comJuros = false
  ) => {
    const calculo = calcularParcela(
      valor,
      quantidade
    );

    opcoes.push({
      valor: String(quantidade),
      quantidade,
      comJuros,
      valorParcela: calculo.valorParcela,
      juros: comJuros ? calculo.juros : 0,
      total: comJuros ? calculo.total : valor,
      texto: comJuros
        ? `${quantidade}x de ${formatarMoeda(calculo.valorParcela)} • juros: ${formatarMoeda(calculo.juros)}`
        : `${quantidade}x de ${formatarMoeda(calculo.valorParcela)} sem juros`
    });
  };

  if (valor < 100) {
    adicionarOpcao(1, false);
    return opcoes;
  }

  if (valor < 150) {
    adicionarOpcao(1, false);
    adicionarOpcao(2, false);
    return opcoes;
  }

  adicionarOpcao(1, false);
  adicionarOpcao(2, false);
  adicionarOpcao(3, false);

  if (valor > 150) {
    for (let i = 4; i <= 10; i++) {
      adicionarOpcao(i, true);
    }
  }

  return opcoes;
});

const parcelaAtual = computed(() => {
  return (
    opcoesParcelas.value.find(
      parcela =>
        parcela.valor ===
        String(parcelasSelecionadas.value)
    ) ||
    opcoesParcelas.value[0] ||
    null
  );
});

const valorParcelaAtual = computed(() => {
  return parcelaAtual.value?.valorParcela || 0;
});

const jurosAtual = computed(() => {
  return parcelaAtual.value?.juros || 0;
});

const totalComJurosAtual = computed(() => {
  return (
    parcelaAtual.value?.total ||
    valorNumerico.value
  );
});

const parcelaAtualValida = computed(() => {
  return opcoesParcelas.value.some(
    parcela =>
      parcela.valor ===
      String(parcelasSelecionadas.value)
  );
});

const sincronizarParcelas = () => {
  if (!opcoesParcelas.value.length) {
    parcelasSelecionadas.value = "1";
  } else if (!parcelaAtualValida.value) {
    parcelasSelecionadas.value =
      opcoesParcelas.value[0].valor;
  }

  dados.value.parcelas =
    String(parcelasSelecionadas.value);
};

watch(
  () => props.valor,
  () => {
    sincronizarParcelas();
  },
  { immediate: true }
);

watch(
  parcelasSelecionadas,
  valor => {
    dados.value.parcelas = String(valor);
    atualizar();
  }
);

const selecionarCartaoSalvo = (cartao) => {
  if (!cartao) {
    return;
  }

  cartaoSelecionado.value = cartao;
  mostrarNovoCartao.value = false;
  tentouValidar.value = false;

  sincronizarParcelas();

  emit("update:modelValue", {
    ...cartao,
    salvo: true,
    parcelas: String(parcelasSelecionadas.value),
    valorParcela: valorParcelaAtual.value,
    juros: jurosAtual.value,
    totalComJuros: totalComJurosAtual.value
  });

  emit("validado", true);
};

const selecionarCartaoAtual = () => {
  if (cartaoAtual.value) {
    selecionarCartaoSalvo(
      cartaoAtual.value
    );
  }
};

const novoCartao = () => {
  cartaoSelecionado.value = null;
  mostrarNovoCartao.value = true;
  tentouValidar.value = false;

  dados.value = {
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
    parcelas:
      String(parcelasSelecionadas.value || "1")
  };

  emit("update:modelValue", null);
  emit("validado", false);
};

const atualizar = () => {
  if (mostrarNovoCartao.value) {
    emit("update:modelValue", {
      ...dados.value,
      novo: true,
      salvo: false,
      parcelas: String(
        parcelasSelecionadas.value
      ),
      valorParcela: valorParcelaAtual.value,
      juros: jurosAtual.value,
      totalComJuros:
        totalComJurosAtual.value
    });

    return;
  }

  if (cartaoSelecionado.value) {
    emit("update:modelValue", {
      ...cartaoSelecionado.value,
      salvo: true,
      parcelas: String(
        parcelasSelecionadas.value
      ),
      valorParcela: valorParcelaAtual.value,
      juros: jurosAtual.value,
      totalComJuros:
        totalComJurosAtual.value
    });
  }
};

watch(
  dados,
  () => {
    if (mostrarNovoCartao.value) {
      atualizar();
    }
  },
  {
    deep: true
  }
);

watch(
  () => props.modelValue,
  novoValor => {
    if (!novoValor) {
      return;
    }

    if (novoValor.salvo || novoValor.id) {
      cartaoSelecionado.value = novoValor;
      mostrarNovoCartao.value = false;

      parcelasSelecionadas.value =
        String(novoValor.parcelas || "1");

      sincronizarParcelas();

      return;
    }

    if (
      novoValor.numero ||
      novoValor.nome ||
      novoValor.validade
    ) {
      dados.value = {
        numero: novoValor.numero || "",
        nome: novoValor.nome || "",
        validade: novoValor.validade || "",
        cvv: novoValor.cvv || "",
        parcelas:
          String(novoValor.parcelas || "1")
      };

      parcelasSelecionadas.value =
        String(novoValor.parcelas || "1");

      mostrarNovoCartao.value = true;

      sincronizarParcelas();
    }
  },
  {
    deep: true
  }
);

const numeroFormatado = computed(() => {
  const numero =
    dados.value.numero.replace(/\D/g, "");

  return numero
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
});

const numeroExibicao = computed(() => {
  if (mostrarNumero.value) {
    return numeroFormatado.value;
  }

  const numero =
    dados.value.numero.replace(/\D/g, "");

  if (!numero) {
    return "";
  }

  const ultimos = numero.slice(-4);
  const quantidade =
    Math.max(numero.length - 4, 0);

  const blocos = [];

  for (
    let i = 0;
    i < quantidade;
    i += 4
  ) {
    blocos.push(
      "*".repeat(
        Math.min(4, quantidade - i)
      )
    );
  }

  return `${blocos.join(" ")} ${ultimos}`.trim();
});

const nomeCartao = computed(() => {
  return (
    dados.value.nome
      .trim()
      .toUpperCase() ||
    "NOME DO TITULAR"
  );
});

const validadeCartao = computed(() => {
  return dados.value.validade || "MM/AA";
});

const bandeira = computed(() => {
  const numero =
    dados.value.numero.replace(/\D/g, "");

  if (/^4/.test(numero)) {
    return "VISA";
  }

  if (
    /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]))/.test(
      numero
    )
  ) {
    return "MASTERCARD";
  }

  if (/^3[47]/.test(numero)) {
    return "AMEX";
  }

  if (/^(6011|65|64[4-9])/.test(numero)) {
    return "ELO";
  }

  return "CARD";
});

const formatarNumero = event => {
  dados.value.numero =
    event.target.value
      .replace(/\D/g, "")
      .slice(0, 16);
};

const formatarNome = event => {
  dados.value.nome =
    event.target.value
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
      .slice(0, 60);
};

const formatarValidade = event => {
  let valor =
    event.target.value
      .replace(/\D/g, "")
      .slice(0, 4);

  if (valor.length > 2) {
    valor =
      valor.slice(0, 2) +
      "/" +
      valor.slice(2);
  }

  dados.value.validade = valor;
};

const formatarCvv = event => {
  dados.value.cvv =
    event.target.value
      .replace(/\D/g, "")
      .slice(0, 4);
};

const numeroValido = computed(() => {
  const numero =
    dados.value.numero.replace(/\D/g, "");

  if (
    numero.length < 13 ||
    numero.length > 16
  ) {
    return false;
  }

  let soma = 0;
  let alternar = false;

  for (
    let i = numero.length - 1;
    i >= 0;
    i--
  ) {
    let digito = Number(numero[i]);

    if (alternar) {
      digito *= 2;

      if (digito > 9) {
        digito -= 9;
      }
    }

    soma += digito;
    alternar = !alternar;
  }

  return soma % 10 === 0;
});

const nomeValido = computed(() => {
  return dados.value.nome.trim().length >= 3;
});

const validadeValida = computed(() => {
  const valor = dados.value.validade;

  if (!/^\d{2}\/\d{2}$/.test(valor)) {
    return false;
  }

  const [mes, ano] =
    valor.split("/").map(Number);

  if (mes < 1 || mes > 12) {
    return false;
  }

  const agora = new Date();
  const anoAtual =
    agora.getFullYear() % 100;
  const mesAtual =
    agora.getMonth() + 1;

  if (ano < anoAtual) {
    return false;
  }

  if (
    ano === anoAtual &&
    mes < mesAtual
  ) {
    return false;
  }

  return true;
});

const cvvValido = computed(() => {
  return /^\d{3,4}$/.test(
    dados.value.cvv
  );
});

const cartaoValido = computed(() => {
  return (
    numeroValido.value &&
    nomeValido.value &&
    validadeValida.value &&
    cvvValido.value
  );
});

const erroNumero = computed(() => {
  if (!tentouValidar.value) {
    return "";
  }

  if (!dados.value.numero) {
    return "Informe o número do cartão.";
  }

  if (!numeroValido.value) {
    return "Número de cartão inválido.";
  }

  return "";
});

const erroNome = computed(() => {
  if (!tentouValidar.value) {
    return "";
  }

  if (!dados.value.nome.trim()) {
    return "Informe o nome do titular.";
  }

  if (!nomeValido.value) {
    return "Informe o nome completo do titular.";
  }

  return "";
});

const erroValidade = computed(() => {
  if (!tentouValidar.value) {
    return "";
  }

  if (!dados.value.validade) {
    return "Informe a validade.";
  }

  if (!validadeValida.value) {
    return "Validade inválida.";
  }

  return "";
});

const erroCvv = computed(() => {
  if (!tentouValidar.value) {
    return "";
  }

  if (!dados.value.cvv) {
    return "Informe o CVV.";
  }

  if (!cvvValido.value) {
    return "CVV inválido.";
  }

  return "";
});

const selecionarAnterior = () => {
  if (!cartoesFormatados.value.length) {
    return;
  }

  indiceCartao.value =
    indiceCartao.value === 0
      ? cartoesFormatados.value.length - 1
      : indiceCartao.value - 1;

  selecionarCartaoAtual();
};

const selecionarProximo = () => {
  if (!cartoesFormatados.value.length) {
    return;
  }

  indiceCartao.value =
    indiceCartao.value ===
    cartoesFormatados.value.length - 1
      ? 0
      : indiceCartao.value + 1;

  selecionarCartaoAtual();
};

const selecionarPorIndice = index => {
  indiceCartao.value = index;
  selecionarCartaoAtual();
};

const validar = () => {
  if (
    !mostrarNovoCartao.value &&
    cartaoSelecionado.value
  ) {
    emit("update:modelValue", {
      ...cartaoSelecionado.value,
      parcelas:
        String(parcelasSelecionadas.value),
      valorParcela:
        valorParcelaAtual.value,
      juros: jurosAtual.value,
      totalComJuros:
        totalComJurosAtual.value
    });

    emit("validado", true);

    return true;
  }

  tentouValidar.value = true;

  const valido = cartaoValido.value;

  emit("validado", valido);

  if (valido) {
    emit("update:modelValue", {
      ...dados.value,
      novo: true,
      salvo: false,
      bandeira: bandeira.value,
      parcelas:
        String(parcelasSelecionadas.value),
      valorParcela:
        valorParcelaAtual.value,
      juros: jurosAtual.value,
      totalComJuros:
        totalComJurosAtual.value
    });
  }

  return valido;
};

const limparValidacao = () => {
  tentouValidar.value = false;
};

onMounted(() => {
  carregarCartoes();

  if (props.modelValue?.id) {
    cartaoSelecionado.value =
      props.modelValue;

    mostrarNovoCartao.value = false;

    parcelasSelecionadas.value =
      String(
        props.modelValue.parcelas || "1"
      );

    const index =
      cartoesFormatados.value.findIndex(
        cartao =>
          cartao.id ===
          props.modelValue.id
      );

    if (index >= 0) {
      indiceCartao.value = index;
    }

    sincronizarParcelas();

    return;
  }

  if (cartoesFormatados.value.length) {
    const principalIndex =
      cartoesFormatados.value.findIndex(
        cartao => cartao.principal
      );

    indiceCartao.value =
      principalIndex >= 0
        ? principalIndex
        : 0;

    selecionarCartaoAtual();
  } else {
    mostrarNovoCartao.value = true;
    sincronizarParcelas();
  }
});

defineExpose({
  validar,
  cartaoValido,
  limparValidacao
});
</script>
<template>
  <section class="pagamento-cartao">

    <div class="cabecalho-cartao">
      <div>
        <span class="eyebrow">
          PAGAMENTO
        </span>

        <h2>
          Cartão
        </h2>

        <p>
          Escolha um cartão salvo ou cadastre um novo.
        </p>
      </div>

      <div class="icone-pagamento">
        <i class="fa-solid fa-credit-card"></i>
      </div>
    </div>

    <div
      v-if="cartoesFormatados.length && !mostrarNovoCartao"
      class="cartoes-salvos"
    >

      <div class="cartoes-titulo">
        <div>
          <span>SEUS CARTÕES</span>

          <strong>
            {{ cartoesFormatados.length }}
            {{
              cartoesFormatados.length === 1
                ? "cartão salvo"
                : "cartões salvos"
            }}
          </strong>
        </div>

        <button
          type="button"
          class="btn-novo-cartao"
          @click="novoCartao"
        >
          <i class="fa-solid fa-plus"></i>
          Novo cartão
        </button>
      </div>

      <div class="cartoes-carousel">

        <button
          v-if="cartoesFormatados.length > 1"
          type="button"
          class="seta-carousel esquerda"
          aria-label="Cartão anterior"
          @click="selecionarAnterior"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div class="carousel-window">

          <div
            class="cartao-salvo"
            :class="{
              selecionado:
                cartaoSelecionado?.id ===
                cartaoAtual?.id
            }"
            @click="selecionarCartaoAtual"
          >

            <div class="cartao-reflexo"></div>

            <div class="cartao-topo">
              <span>
                PADARIA MARTINS
              </span>

              <strong>
                {{ bandeiraCartao(cartaoAtual) }}
              </strong>
            </div>

            <div class="chip-cartao">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="numero-salvo">
              •••• •••• •••• {{ cartaoAtual?.final }}
            </div>

            <div class="cartao-bottom">

              <div>
                <small>TITULAR</small>

                <strong>
                  {{ cartaoAtual?.titular }}
                </strong>
              </div>

              <div>
                <small>VALIDADE</small>

                <strong>
                  {{ cartaoAtual?.validade || "--/--" }}
                </strong>
              </div>

            </div>

            <div
              v-if="cartaoAtual?.principal"
              class="badge-principal"
            >
              <i class="fa-solid fa-star"></i>
              Principal
            </div>

            <div
              v-if="
                cartaoSelecionado?.id ===
                cartaoAtual?.id
              "
              class="badge-selecionado"
            >
              <i class="fa-solid fa-check"></i>
            </div>

          </div>

        </div>

        <button
          v-if="cartoesFormatados.length > 1"
          type="button"
          class="seta-carousel direita"
          aria-label="Próximo cartão"
          @click="selecionarProximo"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>

      </div>

      <div
        v-if="cartoesFormatados.length > 1"
        class="indicadores"
      >
        <button
          v-for="(cartao, index) in cartoesFormatados"
          :key="cartao.id"
          type="button"
          :class="{
            ativo: indiceCartao === index
          }"
          :aria-label="`Selecionar cartão ${index + 1}`"
          @click="selecionarPorIndice(index)"
        ></button>
      </div>

      <div class="cartao-selecionado-info">
        <i class="fa-solid fa-circle-check"></i>

        <span>
          {{
            cartaoSelecionado?.id ===
            cartaoAtual?.id
              ? "Cartão selecionado para este pagamento."
              : "Toque no cartão para selecioná-lo."
          }}
        </span>
      </div>

    </div>

    <div
      v-if="mostrarNovoCartao"
      class="novo-cartao-area"
    >

      <div class="novo-cartao-topo">

        <div>
          <span>NOVO CARTÃO</span>
          <strong>Cadastrar cartão</strong>
        </div>

        <button
          v-if="cartoesFormatados.length"
          type="button"
          @click="
            mostrarNovoCartao = false;
            selecionarCartaoAtual();
          "
        >
          <i class="fa-solid fa-arrow-left"></i>
          Cartões salvos
        </button>

      </div>

      <div class="cartao-visual">

        <div class="cartao-brilho"></div>

        <div class="cartao-visual-topo">
          <span>
            PADARIA MARTINS
          </span>

          <strong>
            {{ bandeira }}
          </strong>
        </div>

        <div class="chip">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="numero-visual">
          {{
            numeroExibicao ||
            "•••• •••• •••• ••••"
          }}
        </div>

        <div class="cartao-visual-bottom">

          <div>
            <small>TITULAR</small>

            <strong>
              {{ nomeCartao }}
            </strong>
          </div>

          <div>
            <small>VALIDADE</small>

            <strong>
              {{ validadeCartao }}
            </strong>
          </div>

        </div>

      </div>

      <div class="formulario-cartao">

        <div class="campo campo-numero">

          <label for="numero-cartao">
            Número do cartão
          </label>

          <div class="input-com-icone">

            <i class="fa-regular fa-credit-card"></i>

            <input
              id="numero-cartao"
              type="text"
              inputmode="numeric"
              autocomplete="cc-number"
              placeholder="0000 0000 0000 0000"
              :value="numeroFormatado"
              maxlength="19"
              @input="formatarNumero"
              @focus="limparValidacao"
            />

            <button
              type="button"
              class="botao-olho"
              @click="
                mostrarNumero =
                  !mostrarNumero
              "
            >
              <i
                :class="
                  mostrarNumero
                    ? 'fa-solid fa-eye-slash'
                    : 'fa-solid fa-eye'
                "
              ></i>
            </button>

          </div>

          <small
            v-if="erroNumero"
            class="erro"
          >
            {{ erroNumero }}
          </small>

        </div>

        <div class="campo">

          <label for="nome-cartao">
            Nome do titular
          </label>

          <div class="input-com-icone">

            <i class="fa-regular fa-user"></i>

            <input
              id="nome-cartao"
              type="text"
              autocomplete="cc-name"
              placeholder="Nome como está no cartão"
              :value="dados.nome"
              maxlength="60"
              @input="formatarNome"
              @focus="limparValidacao"
            />

          </div>

          <small
            v-if="erroNome"
            class="erro"
          >
            {{ erroNome }}
          </small>

        </div>

        <div class="campos-duplos">

          <div class="campo">

            <label for="validade-cartao">
              Validade
            </label>

            <div class="input-com-icone">

              <i class="fa-regular fa-calendar"></i>

              <input
                id="validade-cartao"
                type="text"
                inputmode="numeric"
                autocomplete="cc-exp"
                placeholder="MM/AA"
                :value="dados.validade"
                maxlength="5"
                @input="formatarValidade"
                @focus="limparValidacao"
              />

            </div>

            <small
              v-if="erroValidade"
              class="erro"
            >
              {{ erroValidade }}
            </small>

          </div>

          <div class="campo">

            <label for="cvv-cartao">
              CVV
            </label>

            <div class="input-com-icone">

              <i class="fa-solid fa-lock"></i>

              <input
                id="cvv-cartao"
                :type="
                  mostrarCvv
                    ? 'text'
                    : 'password'
                "
                inputmode="numeric"
                autocomplete="cc-csc"
                placeholder="123"
                maxlength="4"
                :value="dados.cvv"
                @input="formatarCvv"
                @focus="limparValidacao"
              />

              <button
                type="button"
                class="botao-olho"
                @click="
                  mostrarCvv =
                    !mostrarCvv
                "
              >
                <i
                  :class="
                    mostrarCvv
                      ? 'fa-solid fa-eye-slash'
                      : 'fa-solid fa-eye'
                  "
                ></i>
              </button>

            </div>

            <small
              v-if="erroCvv"
              class="erro"
            >
              {{ erroCvv }}
            </small>

          </div>

        </div>

      </div>

    </div>

    <div
      v-if="
        cartaoSelecionado ||
        (mostrarNovoCartao && cartaoValido)
      "
      class="campo campo-parcelas"
    >

      <label for="parcelas-cartao">
        Forma de pagamento
      </label>

      <div class="input-com-icone">

        <i class="fa-solid fa-list-ol"></i>

        <select
          id="parcelas-cartao"
          v-model="parcelasSelecionadas"
        >
          <option
            v-for="parcela in opcoesParcelas"
            :key="parcela.valor"
            :value="parcela.valor"
          >
            {{ parcela.texto }}
          </option>
        </select>

      </div>

      <div
        v-if="parcelaAtual"
        class="resumo-parcelamento"
      >

        <div class="resumo-parcelamento-linha">

          <span>
            Valor por mês
          </span>

          <strong>
            {{ formatarMoeda(valorParcelaAtual) }}
          </strong>

        </div>

        <div class="resumo-parcelamento-linha">

          <span>
            Juros
          </span>

          <strong
            :class="{
              'sem-juros':
                jurosAtual === 0
            }"
          >
            {{
              jurosAtual === 0
                ? "Sem juros"
                : formatarMoeda(jurosAtual)
            }}
          </strong>

        </div>

        <div
          class="resumo-parcelamento-linha total"
        >

          <span>
            Total a pagar
          </span>

          <strong>
            {{ formatarMoeda(totalComJurosAtual) }}
          </strong>

        </div>

      </div>

      <small class="regra-parcelamento">

        <template v-if="valorNumerico < 100">
          Compras abaixo de R$ 100 podem ser pagas somente em 1x.
        </template>

        <template v-else-if="valorNumerico < 150">
          Compras de R$ 100 até R$ 149,99 podem ser pagas em até 2x sem juros.
        </template>

        <template v-else-if="valorNumerico <= 150">
          Compras de R$ 150 podem ser pagas em até 3x sem juros.
        </template>

        <template v-else>
          Até 3x sem juros. De 4x a 10x com juros de 2% ao mês.
        </template>

      </small>

    </div>

    <div
      v-if="cartaoValido"
      class="cartao-validado"
    >

      <i class="fa-solid fa-circle-check"></i>

      <span>
        Dados do cartão preenchidos corretamente.
      </span>

    </div>

  </section>
</template>

<style scoped>
.pagamento-cartao {
  width: 100%;
  margin-top: 20px;
}

.cabecalho-cartao {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.eyebrow {
  color: #a48452;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.cabecalho-cartao h2 {
  margin: 5px 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
}

.cabecalho-cartao p {
  margin: 0;
  color: #968475;
  font-size: 0.68rem;
  line-height: 1.5;
}

.icone-pagamento {
  display: grid;
  flex-shrink: 0;
  width: 43px;
  height: 43px;
  place-items: center;
  border-radius: 14px;
  background: #f1e8da;
  color: #8d6b42;
}

.cartoes-titulo,
.novo-cartao-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 14px;
}

.cartoes-titulo > div,
.novo-cartao-topo > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cartoes-titulo span,
.novo-cartao-topo span {
  color: #a48452;
  font-size: 0.48rem;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.cartoes-titulo strong,
.novo-cartao-topo strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 0.95rem;
  font-weight: 400;
}

.btn-novo-cartao,
.novo-cartao-topo button {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid #e1d5c6;
  border-radius: 10px;
  background: #fffaf4;
  color: #795c3d;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.56rem;
  font-weight: 800;
  transition: 0.2s ease;
}

.btn-novo-cartao:hover,
.novo-cartao-topo button:hover {
  border-color: #b89764;
  background: #f7eee2;
  transform: translateY(-1px);
}

.cartoes-carousel {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 38px 20px;
  box-sizing: border-box;
}

.carousel-window {
  width: 100%;
  padding: 10px 8px 24px;
  box-sizing: border-box;
}

.cartao-salvo {
  position: relative;
  width: 100%;
  max-width: 520px;
  min-height: 220px;
  margin: 0 auto;
  padding: 23px;
  overflow: hidden;
  border: 1px solid rgba(225, 201, 143, 0.18);
  border-radius: 23px;
  background:
    linear-gradient(
      135deg,
      #654132 0%,
      #4c2f24 48%,
      #302019 100%
    );
  color: white;
  cursor: pointer;
  box-sizing: border-box;
  transform: translateY(-2px) rotate(-0.35deg);
  box-shadow:
    0 22px 35px rgba(65, 39, 25, 0.2),
    0 8px 12px rgba(65, 39, 25, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.cartao-salvo:hover {
  transform: translateY(-7px) rotate(0deg);
  box-shadow:
    0 28px 45px rgba(65, 39, 25, 0.25),
    0 10px 16px rgba(65, 39, 25, 0.1);
}

.cartao-salvo.selecionado {
  border-color: rgba(225, 201, 143, 0.65);
  box-shadow:
    0 28px 48px rgba(65, 39, 25, 0.28),
    0 0 0 3px rgba(184, 151, 100, 0.12);
}

.cartao-reflexo {
  position: absolute;
  top: -110px;
  right: -80px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: rgba(225, 201, 143, 0.12);
  pointer-events: none;
}

.cartao-topo,
.cartao-visual-topo {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.cartao-topo span,
.cartao-visual-topo span {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.cartao-topo strong,
.cartao-visual-topo strong {
  color: #e8d4a7;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.chip-cartao,
.chip {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  width: 43px;
  height: 31px;
  margin-top: 25px;
  overflow: hidden;
  border-radius: 7px;
  background: #d8bb83;
}

.chip-cartao span,
.chip span {
  width: 50%;
  height: 50%;
  border: 1px solid rgba(86, 59, 31, 0.25);
  box-sizing: border-box;
}

.numero-salvo,
.numero-visual {
  position: relative;
  z-index: 1;
  margin-top: 19px;
  color: #fffaf1;
  font-size: clamp(1rem, 3.5vw, 1.28rem);
  font-weight: 600;
  letter-spacing: 0.12em;
  word-spacing: 4px;
  white-space: nowrap;
}

.cartao-bottom,
.cartao-visual-bottom {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-top: 20px;
}

.cartao-bottom > div:first-child,
.cartao-visual-bottom > div:first-child {
  min-width: 0;
  flex: 1;
}

.cartao-bottom small,
.cartao-visual-bottom small {
  display: block;
  margin-bottom: 4px;
  color: rgba(255, 250, 241, 0.55);
  font-size: 0.43rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.cartao-bottom strong,
.cartao-visual-bottom strong {
  display: block;
  overflow: hidden;
  color: #fffaf1;
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-principal {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid rgba(225, 201, 143, 0.28);
  border-radius: 8px;
  background: rgba(30, 19, 14, 0.42);
  color: #e1c98f;
  font-size: 0.45rem;
  font-weight: 800;
  backdrop-filter: blur(5px);
}

.badge-selecionado {
  position: absolute;
  right: 15px;
  bottom: 15px;
  z-index: 3;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #e1c98f;
  color: #5e3023;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.badge-selecionado i {
  font-size: 10px;
}

.seta-carousel {
  position: absolute;
  top: 50%;
  z-index: 5;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid #dfd0bd;
  border-radius: 50%;
  background: rgba(255, 253, 249, 0.97);
  color: #6d4f36;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(94, 48, 35, 0.13);
  transform: translateY(-50%);
  transition: 0.25s ease;
}

.seta-carousel:hover {
  background: #5e3023;
  color: #e1c98f;
  transform: translateY(-50%) scale(1.08);
}

.seta-carousel.esquerda {
  left: 0;
}

.seta-carousel.direita {
  right: 0;
}

.seta-carousel i {
  font-size: 9px;
}

.indicadores {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: -3px;
}

.indicadores button {
  width: 6px;
  height: 6px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #d8cec2;
  cursor: pointer;
  transition: 0.2s ease;
}

.indicadores button.ativo {
  width: 18px;
  border-radius: 8px;
  background: #b89764;
}

.cartao-selecionado-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 13px;
  color: #718264;
  font-size: 0.58rem;
}

.cartao-selecionado-info i {
  font-size: 10px;
}

.novo-cartao-area {
  margin-top: 5px;
}

.cartao-visual {
  position: relative;
  width: 100%;
  max-width: 520px;
  min-height: 220px;
  margin: 0 auto 24px;
  padding: 23px;
  overflow: hidden;
  border: 1px solid rgba(225, 201, 143, 0.18);
  border-radius: 23px;
  background:
    linear-gradient(
      135deg,
      #654132 0%,
      #4d3025 48%,
      #302019 100%
    );
  color: #fff;
  box-sizing: border-box;
  transform: translateY(-2px) rotate(-0.35deg);
  box-shadow:
    0 22px 35px rgba(65, 39, 25, 0.2),
    0 8px 12px rgba(65, 39, 25, 0.08);
}

.cartao-brilho {
  position: absolute;
  width: 240px;
  height: 240px;
  top: -125px;
  right: -85px;
  border-radius: 50%;
  background: rgba(225, 201, 143, 0.12);
}

.formulario-cartao {
  display: grid;
  gap: 15px;
}

.campo {
  min-width: 0;
}

.campo label {
  display: block;
  margin-bottom: 7px;
  color: #604532;
  font-size: 0.66rem;
  font-weight: 800;
}

.input-com-icone {
  display: flex;
  align-items: center;
  min-height: 45px;
  border: 1px solid #ddcfbd;
  border-radius: 13px;
  background: #fffdf9;
  transition: 0.2s ease;
}

.input-com-icone:focus-within {
  border-color: #b89764;
  box-shadow:
    0 0 0 3px rgba(184, 151, 100, 0.09);
}

.input-com-icone > i {
  flex-shrink: 0;
  width: 42px;
  color: #ad9575;
  text-align: center;
  font-size: 0.78rem;
}

.input-com-icone input,
.input-com-icone select {
  min-width: 0;
  flex: 1;
  height: 43px;
  padding: 0 8px 0 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #50382a;
  font-family: inherit;
  font-size: 0.74rem;
}

.input-com-icone input::placeholder {
  color: #b9a998;
}

.input-com-icone select {
  cursor: pointer;
}

.botao-olho {
  display: grid;
  flex-shrink: 0;
  width: 40px;
  height: 43px;
  place-items: center;
  border: 0;
  background: transparent;
  color: #a28b72;
  cursor: pointer;
}

.botao-olho:hover {
  color: #65482f;
}

.campos-duplos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.campo-parcelas {
  margin-top: 18px;
}

.resumo-parcelamento {
  display: grid;
  gap: 8px;
  margin-top: 10px;
  padding: 12px 13px;
  border: 1px solid #e4d8c8;
  border-radius: 13px;
  background: #fbf7f1;
}

.resumo-parcelamento-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #8c7968;
  font-size: 0.61rem;
}

.resumo-parcelamento-linha strong {
  color: #5e3023;
  font-size: 0.68rem;
  font-weight: 800;
}

.resumo-parcelamento-linha strong.sem-juros {
  color: #58724d;
}

.resumo-parcelamento-linha.total {
  padding-top: 8px;
  border-top: 1px solid #e5dacb;
}

.resumo-parcelamento-linha.total span {
  color: #604532;
  font-weight: 700;
}

.resumo-parcelamento-linha.total strong {
  color: #5e3023;
  font-size: 0.78rem;
}

.regra-parcelamento {
  display: block;
  margin-top: 6px;
  color: #9b8877;
  font-size: 0.56rem;
  line-height: 1.45;
}

.erro {
  display: block;
  margin-top: 5px;
  color: #a34e42;
  font-size: 0.6rem;
  line-height: 1.35;
}

.cartao-validado {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding: 11px 13px;
  border: 1px solid rgba(91, 125, 78, 0.18);
  border-radius: 13px;
  background: #f1f5ed;
  color: #58724d;
  font-size: 0.65rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .pagamento-cartao {
    margin-top: 16px;
  }

  .cabecalho-cartao {
    margin-bottom: 17px;
  }

  .cabecalho-cartao h2 {
    font-size: 1.35rem;
  }

  .cartoes-carousel {
    padding-left: 30px;
    padding-right: 30px;
    padding-bottom: 17px;
  }

  .carousel-window {
    padding-left: 5px;
    padding-right: 5px;
  }

  .cartao-salvo,
  .cartao-visual {
    min-height: 200px;
    padding: 19px;
    border-radius: 20px;
  }

  .chip-cartao,
  .chip {
    width: 39px;
    height: 28px;
    margin-top: 21px;
  }

  .numero-salvo,
  .numero-visual {
    margin-top: 16px;
    font-size: 0.9rem;
    letter-spacing: 0.09em;
  }

  .cartao-bottom,
  .cartao-visual-bottom {
    margin-top: 16px;
  }

  .cartao-bottom strong,
  .cartao-visual-bottom strong {
    font-size: 0.56rem;
  }

  .seta-carousel {
    width: 30px;
    height: 30px;
  }

  .seta-carousel.esquerda {
    left: -1px;
  }

  .seta-carousel.direita {
    right: -1px;
  }

  .campos-duplos {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .cartoes-titulo,
  .novo-cartao-topo {
    align-items: flex-start;
  }

  .btn-novo-cartao {
    flex-shrink: 0;
  }

  .resumo-parcelamento {
    padding: 11px 12px;
  }
}

@media (max-width: 380px) {
  .cartoes-carousel {
    padding-left: 25px;
    padding-right: 25px;
  }

  .cartao-salvo,
  .cartao-visual {
    min-height: 188px;
    padding: 17px;
  }

  .cartao-topo span,
  .cartao-visual-topo span {
    font-size: 0.53rem;
  }

  .cartao-topo strong,
  .cartao-visual-topo strong {
    font-size: 0.58rem;
  }

  .chip-cartao,
  .chip {
    width: 36px;
    height: 26px;
    margin-top: 17px;
  }

  .numero-salvo,
  .numero-visual {
    margin-top: 13px;
    font-size: 0.74rem;
  }

  .cartao-bottom,
  .cartao-visual-bottom {
    margin-top: 12px;
  }

  .badge-principal {
    top: 11px;
    left: 11px;
    padding: 4px 6px;
  }
}
</style>

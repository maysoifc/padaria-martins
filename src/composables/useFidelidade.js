
import { computed, ref } from "vue";

// =========================================================
// CONFIGURAÇÕES
// =========================================================

const TOTAL_SELOS = 10;
const VALOR_MINIMO = 20;

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const selos = ref(0);
const cupons = ref([]);

const carregando = ref(false);
const erro = ref(null);

const premios = [
  {
    id: 1,
    tipo: "produto",
    icone: "fa-solid fa-cake-candles",
    titulo: "Torta grátis",
    descricao: "Ganhe uma torta grátis.",
  },
  {
    id: 2,
    tipo: "desconto",
    icone: "fa-solid fa-tag",
    titulo: "R$ 10 de desconto",
    descricao: "Ganhe R$ 10 de desconto em sua próxima compra.",
  },
  {
    id: 3,
    tipo: "desconto",
    icone: "fa-solid fa-tags",
    titulo: "R$ 25 de desconto",
    descricao: "Ganhe R$ 25 de desconto em sua próxima compra.",
  },
  {
    id: 4,
    tipo: "desconto",
    icone: "fa-solid fa-gift",
    titulo: "R$ 50 de desconto",
    descricao: "Ganhe R$ 50 de desconto em sua próxima compra.",
  },
  {
    id: 5,
    tipo: "produto",
    icone: "fa-solid fa-bread-slice",
    titulo: "Pão grátis",
    descricao: "Ganhe um pão grátis.",
  },
  {
    id: 6,
    tipo: "produto",
    icone: "fa-solid fa-mug-hot",
    titulo: "Café grátis",
    descricao: "Ganhe um café grátis.",
  },
  {
    id: 7,
    tipo: "produto",
    icone: "fa-solid fa-cookie-bite",
    titulo: "Doce grátis",
    descricao: "Ganhe um doce grátis.",
  },
];

// =========================================================
// AUTENTICAÇÃO
// =========================================================

const obterToken = () => {
  return localStorage.getItem("token");
};

const obterHeaders = () => {
  const token = obterToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
};

// =========================================================
// REQUISIÇÕES
// =========================================================

const requisicao = async (endpoint, options = {}) => {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...obterHeaders(),
      ...options.headers,
    },
  });

  let dados = {};

  try {
    dados = await resposta.json();
  } catch {
    dados = {};
  }

  if (!resposta.ok) {
    if (resposta.status === 401) {
      throw new Error(
        "Sua sessão expirou. Entre novamente na sua conta."
      );
    }

    const mensagem =
      dados.erro ||
      dados.detail ||
      dados.mensagem ||
      "Não foi possível realizar a operação.";

    throw new Error(mensagem);
  }

  return dados;
};

// =========================================================
// NORMALIZAÇÃO DE CUPONS
// =========================================================

const normalizarCupom = (cupom) => {
  if (!cupom) return null;

  const status = String(
    cupom.status || "disponivel"
  ).toLowerCase();

  const criadoEm =
    cupom.criadoEm ||
    cupom.criado_em ||
    null;

  const utilizadoEm =
    cupom.utilizadoEm ||
    cupom.utilizado_em ||
    null;

  const utilizado =
    status === "utilizado" ||
    status === "usado" ||
    Boolean(utilizadoEm);

  return {
    ...cupom,

    id: cupom.id,

    codigo: String(cupom.codigo || "")
      .trim()
      .toUpperCase(),

    status: utilizado ? "utilizado" : status,

    criadoEm,
    utilizadoEm,

    pedidoId:
      cupom.pedidoId ??
      cupom.compra_id ??
      cupom.compra ??
      null,

    resgatado: utilizado,
  };
};

// =========================================================
// STATUS DOS CUPONS
// =========================================================

const cupomFoiUtilizado = (cupom) => {
  if (!cupom) return false;

  return (
    cupom.status === "utilizado" ||
    cupom.status === "usado" ||
    Boolean(cupom.utilizadoEm) ||
    Boolean(cupom.utilizado_em)
  );
};

const buscarCupom = (codigo) => {
  const codigoNormalizado = String(codigo || "")
    .trim()
    .toUpperCase();

  return (
    cupons.value.find(
      (cupom) => cupom.codigo === codigoNormalizado
    ) || null
  );
};

// =========================================================
// SINCRONIZAR CARTEIRA COM O DJANGO
// =========================================================

let requisicaoAtual = null;

const recarregar = async () => {
  const token = obterToken();

  if (!token) {
    selos.value = 0;
    cupons.value = [];

    erro.value =
      "Faça login para consultar sua carteira.";

    return false;
  }

  // Evita várias requisições simultâneas.
  if (requisicaoAtual) {
    return requisicaoAtual;
  }

  carregando.value = true;
  erro.value = null;

  requisicaoAtual = (async () => {
    try {
      const [dadosCarteira, dadosCupons] =
        await Promise.all([
          requisicao("/fidelidade/carteira/"),
          requisicao("/fidelidade/cupons/"),
        ]);

      // CARTEIRA

      const carteira =
        dadosCarteira.carteira ||
        dadosCarteira;

      const valorSelos = Number(
        carteira.selos ?? 0
      );

      selos.value = Number.isFinite(valorSelos)
        ? Math.min(
            Math.max(valorSelos, 0),
            TOTAL_SELOS
          )
        : 0;

      // CUPONS

      let listaCupons = [];

      if (Array.isArray(dadosCupons)) {
        listaCupons = dadosCupons;
      } else if (Array.isArray(dadosCupons.cupons)) {
        listaCupons = dadosCupons.cupons;
      } else {
        const disponiveis = Array.isArray(
          dadosCupons.disponiveis
        )
          ? dadosCupons.disponiveis
          : [];

        const utilizados = Array.isArray(
          dadosCupons.utilizados
        )
          ? dadosCupons.utilizados
          : [];

        listaCupons = [
          ...disponiveis,
          ...utilizados,
        ];
      }

      cupons.value = listaCupons
        .map(normalizarCupom)
        .filter(Boolean);

      return true;
    } catch (e) {
      erro.value =
        e.message || "Erro ao carregar a carteira.";

      console.error(
        "Erro ao sincronizar fidelidade:",
        e
      );

      return false;
    } finally {
      carregando.value = false;
      requisicaoAtual = null;
    }
  })();

  return requisicaoAtual;
};

// =========================================================
// CRIAÇÃO DE CUPOM
// =========================================================

// Os cupons são gerados exclusivamente pelo Django.

const criarCupom = async () => {
  await recarregar();

  return null;
};

// =========================================================
// ADICIONAR SELO
// =========================================================

// O Django credita o selo após a confirmação do pagamento.
// Esta função apenas sincroniza a carteira.

const adicionarSelo = async (valorCompra) => {
  const valor = Number(valorCompra);

  if (
    !Number.isFinite(valor) ||
    valor < VALOR_MINIMO
  ) {
    return {
      ganhouSelo: false,
      completouCartao: false,
      cupom: null,
      mensagem: `Compra mínima de R$ ${VALOR_MINIMO.toFixed(2)}.`,
    };
  }

  const sincronizado = await recarregar();

  return {
    ganhouSelo: false,
    completouCartao: cartaoCompleto.value,
    cupom: null,
    mensagem: sincronizado
      ? "A carteira foi atualizada. O selo é creditado pelo servidor após a confirmação do pagamento."
      : "Não foi possível atualizar a carteira.",
  };
};

// =========================================================
// VALIDAR CUPOM NO SERVIDOR
// =========================================================

// A validação não consome o cupom.

const validarCupom = async (codigo) => {
  const codigoNormalizado = String(codigo || "")
    .trim()
    .toUpperCase();

  if (!codigoNormalizado) {
    return {
      valido: false,
      mensagem: "Informe um código de cupom.",
      cupom: null,
    };
  }

  try {
    const dados = await requisicao(
      `/fidelidade/cupons/${encodeURIComponent(
        codigoNormalizado
      )}/utilizar/`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );

    return {
      valido: Boolean(dados.valido),
      mensagem:
        dados.mensagem || "Cupom validado.",
      cupom: normalizarCupom(dados.cupom),
    };
  } catch (e) {
    return {
      valido: false,
      mensagem:
        e.message || "Não foi possível validar o cupom.",
      cupom: buscarCupom(codigoNormalizado),
    };
  }
};

// =========================================================
// CONFIRMAR UTILIZAÇÃO
// =========================================================

const confirmarUsoCupom = async (
  codigo,
  pedidoId = null
) => {
  const sincronizado = await recarregar();

  if (!sincronizado) {
    return false;
  }

  const cupom = buscarCupom(codigo);

  if (!cupom) {
    return false;
  }

  if (
    pedidoId !== null &&
    cupom.pedidoId !== null &&
    String(cupom.pedidoId) !== String(pedidoId)
  ) {
    return false;
  }

  return cupomFoiUtilizado(cupom);
};

const marcarCupomComoResgatado = async (codigo) => {
  return confirmarUsoCupom(codigo);
};

// =========================================================
// ZERAR SELOS
// =========================================================

// O frontend não zera os selos manualmente.

const zerarSelos = async () => {
  const sincronizado = await recarregar();

  if (!sincronizado) {
    return false;
  }

  return selos.value === 0;
};

// =========================================================
// INDICADORES
// =========================================================

const progresso = computed(() => {
  return Math.min(
    (selos.value / TOTAL_SELOS) * 100,
    100
  );
});

const faltam = computed(() => {
  return Math.max(
    TOTAL_SELOS - selos.value,
    0
  );
});

const cartaoCompleto = computed(() => {
  return selos.value >= TOTAL_SELOS;
});

const cuponsDisponiveis = computed(() => {
  return cupons.value.filter(
    (cupom) => !cupomFoiUtilizado(cupom)
  );
});

const cuponsUtilizados = computed(() => {
  return cupons.value.filter(
    (cupom) => cupomFoiUtilizado(cupom)
  );
});

// =========================================================
// COMPOSABLE
// =========================================================

export function useFidelidade() {
  // A sincronização é compartilhada entre os componentes.
  // Se já existir uma requisição em andamento, ela será reutilizada.
  if (obterToken()) {
    recarregar();
  }

  return {
    selos,
    cupons,
    premios,

    carregando,
    erro,

    TOTAL_SELOS,
    VALOR_MINIMO,

    progresso,
    faltam,
    cartaoCompleto,

    cuponsDisponiveis,
    cuponsUtilizados,

    adicionarSelo,
    criarCupom,
    buscarCupom,
    validarCupom,

    confirmarUsoCupom,
    marcarCupomComoResgatado,

    zerarSelos,
    recarregar,

    cupomFoiUtilizado,
  };
}

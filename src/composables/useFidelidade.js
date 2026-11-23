import { computed, ref } from "vue";

const TOTAL_SELOS = 10;
const VALOR_MINIMO = 20;

const CHAVE_SELOS = "selosCarteira";
const CHAVE_CUPONS = "cuponsCarteira";

const lerSelos = () => {
  return Number(localStorage.getItem(CHAVE_SELOS) || 0);
};

const lerCupons = () => {
  try {
    const dados = localStorage.getItem(CHAVE_CUPONS);

    if (!dados) return [];

    const parsed = JSON.parse(dados);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const selos = ref(lerSelos());
const cupons = ref(lerCupons());

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

// ========================================
// PERSISTÊNCIA
// ========================================

const salvarSelos = () => {
  localStorage.setItem(CHAVE_SELOS, String(selos.value));
};

const salvarCupons = () => {
  localStorage.setItem(
    CHAVE_CUPONS,
    JSON.stringify(cupons.value)
  );
};

const recarregar = () => {
  selos.value = lerSelos();
  cupons.value = lerCupons();
};

// ========================================
// CÓDIGO DO CUPOM
// ========================================

const gerarCodigo = () => {
  return `FID-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
};

// ========================================
// VERIFICAR STATUS DO CUPOM
// Compatibilidade com cupons antigos
// ========================================

const cupomFoiUtilizado = (cupom) => {
  return (
    cupom.status === "utilizado" ||
    cupom.resgatado === true
  );
};

const buscarCupom = (codigo) => {
  return cupons.value.find(
    (cupom) => cupom.codigo === codigo
  );
};

// ========================================
// GERAR PRÊMIO ALEATÓRIO
// ========================================

const criarCupom = () => {
  const cupomExistente = cupons.value.find(
    (cupom) =>
      cupom.tipoSelo === "cartao-10-selos" &&
      !cupomFoiUtilizado(cupom)
  );

  // Não gera outro cupom se já existe
  // um prêmio disponível.
  if (cupomExistente) {
    return cupomExistente;
  }

  const premio =
    premios[Math.floor(Math.random() * premios.length)];

  const novoCupom = {
    id: Date.now(),
    codigo: gerarCodigo(),

    tipoSelo: "cartao-10-selos",

    titulo: premio.titulo,
    descricao: premio.descricao,
    tipo: premio.tipo,
    icone: premio.icone,

    status: "disponivel",
    resgatado: false,

    criadoEm: new Date().toISOString(),
    utilizadoEm: null,
    pedidoId: null,
  };

  cupons.value.push(novoCupom);

  salvarCupons();

  return novoCupom;
};

// ========================================
// ADICIONAR SELO
// ========================================

const adicionarSelo = (valorCompra) => {
  const valor = Number(valorCompra);

  if (
    !Number.isFinite(valor) ||
    valor < VALOR_MINIMO
  ) {
    return {
      ganhouSelo: false,
      completouCartao: false,
      cupom: null,
    };
  }

  // Não permite acumular selos além de 10
  // enquanto o prêmio anterior estiver disponível.
  if (selos.value >= TOTAL_SELOS) {
    return {
      ganhouSelo: false,
      completouCartao: true,
      cupom: cupons.value.find(
        (cupom) =>
          cupom.tipoSelo === "cartao-10-selos" &&
          !cupomFoiUtilizado(cupom)
      ) || null,
    };
  }

  selos.value += 1;

  salvarSelos();

  let cupom = null;
  let completouCartao = false;

  if (selos.value === TOTAL_SELOS) {
    completouCartao = true;
    cupom = criarCupom();
  }

  return {
    ganhouSelo: true,
    completouCartao,
    cupom,
  };
};

// ========================================
// VALIDAR CUPOM
// Não consome o cupom.
// Pode ser chamado ao selecionar
// ou aplicar o cupom no checkout.
// ========================================

const validarCupom = (codigo) => {
  if (!codigo) {
    return {
      valido: false,
      mensagem: "Informe um código de cupom.",
      cupom: null,
    };
  }

  const cupom = buscarCupom(codigo);

  if (!cupom) {
    return {
      valido: false,
      mensagem: "Cupom não encontrado.",
      cupom: null,
    };
  }

  if (cupomFoiUtilizado(cupom)) {
    return {
      valido: false,
      mensagem: "Este cupom já foi utilizado.",
      cupom,
    };
  }

  return {
    valido: true,
    mensagem: "Cupom disponível para utilização.",
    cupom,
  };
};

// ========================================
// CONFIRMAR UTILIZAÇÃO
//
// IMPORTANTE:
// Chamar SOMENTE depois da confirmação
// efetiva do pagamento.
// Nunca chamar ao selecionar o cupom.
// ========================================

const confirmarUsoCupom = (codigo, pedidoId = null) => {
  const resultado = validarCupom(codigo);

  if (!resultado.valido) {
    return false;
  }

  const cupom = resultado.cupom;

  cupom.status = "utilizado";
  cupom.resgatado = true;
  cupom.utilizadoEm = new Date().toISOString();
  cupom.pedidoId = pedidoId;

  // O cartão de selos só é reiniciado
  // depois que o prêmio for efetivamente utilizado.
  if (cupom.tipoSelo === "cartao-10-selos") {
    selos.value = 0;
    salvarSelos();
  }

  salvarCupons();

  return true;
};

// Compatibilidade com chamadas antigas.
// Também deve ser chamado somente após
// a confirmação do pagamento.
const marcarCupomComoResgatado = (codigo) => {
  return confirmarUsoCupom(codigo);
};

// ========================================
// ZERAR SELOS MANUALMENTE
// ========================================

const zerarSelos = () => {
  selos.value = 0;
  salvarSelos();
};

// ========================================
// INDICADORES
// ========================================

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

// ========================================
// COMPOSABLE
// ========================================

export function useFidelidade() {
  return {
    selos,
    cupons,
    premios,

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

    salvarSelos,
    salvarCupons,
  };
}

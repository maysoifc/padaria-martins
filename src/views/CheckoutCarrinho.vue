
<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  onBeforeUnmount
} from 'vue';

import { useRouter } from 'vue-router';
import { useCartStore } from '@/composables/useCart';
import { useFidelidade } from '@/composables/useFidelidade';
import PagamentoCartao from '@/components/PagamentoCartao.vue';

const router = useRouter();
const { removerItens } = useCartStore();

const { validarCupom, recarregar } = useFidelidade();

/* =========================================
   API
========================================= */

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

const obterToken = () => localStorage.getItem('token');

const obterIdProduto = (item) => (
  item.idProduto ??
  item.produto?.idProduto ??
  item.produto?.id ??
  item.produto_id ??
  item.id
);

/* =========================================
   ESTADOS PRINCIPAIS
========================================= */

const CHAVE_PIX = 'pixPendente';
const TEMPO_PIX = 3 * 60 * 60 * 1000;

const itensCompra = ref([]);
const etapaAtual = ref(1);
const erro = ref('');

const cartaoSelecionado = ref(null);

const statusFinalizacao = ref('ocioso');
const mensagemCupom = ref('');
const tipoMensagemCupom = ref('');

const codigoCupom = ref('');
const cupomAplicado = ref(null);

const pixCodigoCopiaCola = ref('');
const pixExpiraEm = ref(null);
const tempoRestantePix = ref('03:00:00');
const mensagemPix = ref('');

const pedidoConcluido = ref(false);
const compraRegistrada = ref(null);

let timerFinalizacao = null;
let timerPix = null;

const form = ref({
  nome: '',
  telefone: '',
  formaPagamento: 'pix'
});

/* =========================================
   ETAPAS
========================================= */

const etapas = {
  1: 'Seu pedido',
  2: 'Seus dados',
  3: 'Pagamento',
  4: 'Finalizar'
};

const etapaNome = computed(() => etapas[etapaAtual.value] || '');

const progressoPercent = computed(() => {
  return (etapaAtual.value / 4) * 100;
});

/* =========================================
   VALORES DO PEDIDO
========================================= */

const quantidadeTotal = computed(() => {
  return itensCompra.value.reduce((total, item) => {
    return total + Number(item.quantidade || 1);
  }, 0);
});

const subtotal = computed(() => {
  return itensCompra.value.reduce((total, item) => {
    return total +
      Number(item.preco || 0) *
      Number(item.quantidade || 1);
  }, 0);
});

/* =========================================
   CUPONS DE DESCONTO
========================================= */

const valorDescontoCupom = computed(() => {
  const cupom = cupomAplicado.value;

  if (!cupom || cupom.tipo !== 'desconto') {
    return 0;
  }

  const texto = `${cupom.titulo || ''} ${cupom.descricao || ''}`;

  const percentual = texto.match(/(\d+(?:[.,]\d+)?)\s*%/);

  if (percentual) {
    const porcentagem = Number(
      percentual[1].replace(',', '.')
    );

    if (Number.isFinite(porcentagem) && porcentagem > 0) {
      return Math.min(
        subtotal.value,
        subtotal.value * (porcentagem / 100)
      );
    }
  }

  const valorFixo = texto.match(
    /R\$\s*(\d+(?:[.,]\d{1,2})?)/
  );

  if (valorFixo) {
    const valor = Number(
      valorFixo[1].replace(',', '.')
    );

    if (Number.isFinite(valor) && valor > 0) {
      return Math.min(subtotal.value, valor);
    }
  }

  return 0;
});

const subtotalComDesconto = computed(() => {
  return Math.max(
    0,
    subtotal.value - valorDescontoCupom.value
  );
});

const aplicarCupom = async () => {
  mensagemCupom.value = '';
  tipoMensagemCupom.value = '';

  const codigo = codigoCupom.value.trim();

  if (!codigo) {
    mensagemCupom.value = 'Informe o código do cupom.';
    tipoMensagemCupom.value = 'erro';
    return;
  }

  if (cupomAplicado.value) {
    mensagemCupom.value =
      'Remova o cupom atual antes de aplicar outro.';
    tipoMensagemCupom.value = 'erro';
    return;
  }

  try {
    const resultado = await validarCupom(codigo);

    if (!resultado?.valido || !resultado.cupom) {
      mensagemCupom.value =
        resultado?.mensagem ||
        'Não foi possível validar esse cupom.';

      tipoMensagemCupom.value = 'erro';
      return;
    }

    if (resultado.cupom.tipo !== 'desconto') {
      mensagemCupom.value =
        'Este cupom é válido para resgate de produto e não pode ser usado como desconto nesta compra.';

      tipoMensagemCupom.value = 'erro';
      return;
    }

    cupomAplicado.value = resultado.cupom;

    if (valorDescontoCupom.value <= 0) {
      cupomAplicado.value = null;

      mensagemCupom.value =
        'Não foi possível identificar o valor deste desconto. Confira a descrição do cupom.';

      tipoMensagemCupom.value = 'erro';
      return;
    }

    codigoCupom.value = resultado.cupom.codigo;

    mensagemCupom.value = 'Cupom aplicado com sucesso!';
    tipoMensagemCupom.value = 'sucesso';

  } catch (e) {
    console.error('Erro ao validar cupom:', e);

    mensagemCupom.value =
      e.message || 'Não foi possível validar o cupom.';

    tipoMensagemCupom.value = 'erro';
  }
};

const removerCupom = () => {
  cupomAplicado.value = null;
  codigoCupom.value = '';
  mensagemCupom.value = 'Cupom removido.';
  tipoMensagemCupom.value = 'sucesso';
};

const limparMensagemCupom = () => {
  mensagemCupom.value = '';
  tipoMensagemCupom.value = '';
};

/* =========================================
   CARTÃO E PARCELAMENTO
========================================= */

const parcelasCartao = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return 1;
  }

  const cartao = cartaoSelecionado.value;

  const parcelas = Number(
    cartao?.parcelas ??
    cartao?.parcelamento ??
    cartao?.numeroParcelas ??
    1
  );

  return Number.isFinite(parcelas) && parcelas > 0
    ? parcelas
    : 1;
});

const jurosCartao = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return 0;
  }

  const juros = Number(
    cartaoSelecionado.value?.juros || 0
  );

  return Number.isFinite(juros) && juros > 0
    ? juros
    : 0;
});

const totalComJuros = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return subtotalComDesconto.value;
  }

  return subtotalComDesconto.value + jurosCartao.value;
});

const valorParcela = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return subtotalComDesconto.value;
  }

  return totalComJuros.value / parcelasCartao.value;
});

const textoParcelas = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return '';
  }

  return `${parcelasCartao.value}x de R$ ${formatarPreco(valorParcela.value)}`;
});

const cartaoResumo = computed(() => {
  if (
    form.value.formaPagamento !== 'cartao' ||
    !cartaoSelecionado.value
  ) {
    return null;
  }

  return {
    bandeira: cartaoSelecionado.value.bandeira || 'Cartão',
    final: cartaoSelecionado.value.final || '0000',
    titular: cartaoSelecionado.value.titular || '',
    parcelas: parcelasCartao.value,
    valorParcela: valorParcela.value,
    juros: jurosCartao.value,
    totalComJuros: totalComJuros.value
  };
});

/* =========================================
   PAGAMENTO FORMATADO
========================================= */

const pagamentoFormatado = computed(() => {
  if (form.value.formaPagamento === 'pix') {
    return 'PIX';
  }

  if (form.value.formaPagamento === 'cartao') {
    if (cartaoSelecionado.value?.final) {
      const bandeira = cartaoSelecionado.value.bandeira
        ? `${cartaoSelecionado.value.bandeira} `
        : '';

      return `${bandeira}•••• ${cartaoSelecionado.value.final}`;
    }

    return 'Cartão';
  }

  return 'Não informado';
});

/* =========================================
   CARREGAMENTO DE DADOS
========================================= */

const carregarItensCompra = () => {
  try {
    const dados = localStorage.getItem('itensCheckout');

    if (!dados) {
      itensCompra.value = [];
      return;
    }

    const itens = JSON.parse(dados);

    itensCompra.value = Array.isArray(itens)
      ? itens
      : [];

  } catch {
    itensCompra.value = [];
  }
};

const carregarDadosCliente = () => {
  try {
    const dados = localStorage.getItem('dadosCliente');

    if (!dados) return;

    const cliente = JSON.parse(dados);

    if (cliente?.nome) {
      form.value.nome = cliente.nome;
    }

    if (cliente?.telefone) {
      form.value.telefone = cliente.telefone;
    }

  } catch {
    return;
  }
};

const carregarCartaoPrincipal = () => {
  try {
    const dados = localStorage.getItem('cartoesPagamento');

    if (!dados) {
      cartaoSelecionado.value = null;
      return;
    }

    const cartoes = JSON.parse(dados);

    if (!Array.isArray(cartoes) || !cartoes.length) {
      cartaoSelecionado.value = null;
      return;
    }

    const principal = cartoes.find(
      cartao => cartao.principal === true
    );

    cartaoSelecionado.value = principal || null;

  } catch {
    cartaoSelecionado.value = null;
  }
};

const salvarDadosCliente = () => {
  localStorage.setItem(
    'dadosCliente',
    JSON.stringify({
      nome: form.value.nome.trim(),
      telefone: form.value.telefone
    })
  );
};

/* =========================================
   UTILITÁRIOS
========================================= */

const getImageUrl = (nomeImagem) => {
  if (!nomeImagem) return '';

  try {
    return new URL(
      `../assets/img/${nomeImagem}`,
      import.meta.url
    ).href;
  } catch {
    return '';
  }
};

const formatarPreco = (valor) => {
  return Number(valor || 0)
    .toFixed(2)
    .replace('.', ',');
};

const quantidadeItem = (item) => {
  return Number(item.quantidade || 1);
};

const subtotalItem = (item) => {
  return (
    Number(item.preco || 0) *
    Number(item.quantidade || 1)
  );
};

const formatarTelefone = (event) => {
  const valor = event.target.value
    .replace(/\D/g, '')
    .slice(0, 11);

  form.value.telefone = valor;
  salvarDadosCliente();
};

const limparErro = () => {
  erro.value = '';
};

/* =========================================
   VALIDAÇÃO DAS ETAPAS
========================================= */

const validarEtapa = () => {
  limparErro();

  if (etapaAtual.value === 1) {
    if (!itensCompra.value.length) {
      erro.value =
        'Não há produtos selecionados para continuar.';
      return false;
    }
  }

  if (etapaAtual.value === 2) {
    if (!form.value.nome.trim()) {
      erro.value = 'Informe seu nome para continuar.';
      return false;
    }

    if (
      !form.value.telefone ||
      form.value.telefone.length < 10
    ) {
      erro.value =
        'Informe um telefone válido para continuar.';
      return false;
    }

    salvarDadosCliente();
  }

  if (etapaAtual.value === 3) {
    if (!form.value.formaPagamento) {
      erro.value = 'Selecione uma forma de pagamento.';
      return false;
    }

    if (
      form.value.formaPagamento === 'cartao' &&
      !cartaoSelecionado.value
    ) {
      erro.value =
        'Selecione um cartão salvo ou cadastre um novo cartão.';
      return false;
    }
  }

  return true;
};

const proximaEtapa = () => {
  if (!validarEtapa()) return;

  if (etapaAtual.value < 4) {
    etapaAtual.value++;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

const etapaAnterior = () => {
  limparErro();

  if (etapaAtual.value > 1) {
    etapaAtual.value--;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

const voltarCarrinho = () => {
  router.push({ name: 'carrinho' });
};

/* =========================================
   REGISTRAR COMPRA NO DJANGO
========================================= */

const registrarCompraNoServidor = async () => {
  const token = obterToken();

  if (!token) {
    throw new Error(
      'Sua sessão expirou. Entre novamente na sua conta.'
    );
  }

  const itens = itensCompra.value.map(item => {
    const idProduto = Number(obterIdProduto(item));
    const quantidade = Number(item.quantidade || 1);

    if (
      !Number.isInteger(idProduto) ||
      idProduto <= 0 ||
      !Number.isInteger(quantidade) ||
      quantidade < 1
    ) {
      throw new Error(
        'Um dos produtos do carrinho possui informações inválidas.'
      );
    }

    return {
      idProduto,
      quantidade
    };
  });

  if (!itens.length) {
    throw new Error('Seu carrinho está vazio.');
  }

  const resposta = await fetch(`${API_URL}/compras/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nome: form.value.nome.trim(),
      telefone: form.value.telefone,
      formaPagamento: form.value.formaPagamento,
      itens
    })
  });

  let dados = {};

  try {
    dados = await resposta.json();
  } catch {
    dados = {};
  }

  if (!resposta.ok) {
    const mensagem =
      dados.detail ||
      dados.erro ||
      dados.mensagem ||
      Object.values(dados).flat().join(' ') ||
      'Não foi possível registrar sua compra.';

    throw new Error(mensagem);
  }

  if (!dados.idCompra) {
    throw new Error(
      'O servidor não retornou o identificador da compra.'
    );
  }

  return dados;
};

/* =========================================
   HISTÓRICO LOCAL
========================================= */

const salvarCompraNoHistorico = (idCompra, compraServidor = {}) => {
  let historico = [];

  try {
    const salvo = localStorage.getItem('historicoCompras');

    if (salvo) {
      const dados = JSON.parse(salvo);

      if (Array.isArray(dados)) {
        historico = dados;
      }
    }
  } catch {
    historico = [];
  }

  const pedidoId = idCompra;

  const pedidoExistente = historico.find(
    pedido => String(pedido.idPedido) === String(pedidoId)
  );

  if (pedidoExistente) {
    return pedidoId;
  }

  const pedido = {
    idPedido: pedidoId,
    idCompra: pedidoId,
    dataCompra: compraServidor.criado_em ||
      compraServidor.dataCompra ||
      new Date().toISOString(),

    cliente: {
      nome: form.value.nome.trim(),
      telefone: form.value.telefone
    },

    formaPagamento: form.value.formaPagamento,
    pagamentoFormatado: pagamentoFormatado.value,

    cartao:
      form.value.formaPagamento === 'cartao'
        ? {
            id: cartaoSelecionado.value?.id || null,
            bandeira: cartaoSelecionado.value?.bandeira || '',
            final: cartaoSelecionado.value?.final || '',
            parcelas: parcelasCartao.value,
            valorParcela: valorParcela.value,
            juros: jurosCartao.value,
            totalComJuros: totalComJuros.value
          }
        : null,

    cupom: cupomAplicado.value
      ? {
          codigo: cupomAplicado.value.codigo,
          titulo: cupomAplicado.value.titulo,
          desconto: valorDescontoCupom.value
        }
      : null,

    subtotal: subtotal.value,
    desconto: valorDescontoCupom.value,
    total: subtotalComDesconto.value,

    totalComJuros:
      form.value.formaPagamento === 'cartao'
        ? totalComJuros.value
        : subtotalComDesconto.value,

    quantidadeTotal: quantidadeTotal.value,

    status: compraServidor.status || 'pendente',
    pagamentoConfirmado: false,

    itens: itensCompra.value.map(item => ({
      ...item,
      idProduto: Number(obterIdProduto(item)),
      quantidade: Number(item.quantidade || 1),
      preco: Number(item.preco || 0),
      avaliado: false,
      nota: null,
      comentario: ''
    }))
  };

  historico.unshift(pedido);

  localStorage.setItem(
    'historicoCompras',
    JSON.stringify(historico)
  );

  return pedidoId;
};

/* =========================================
   LIMPEZA DO PIX
========================================= */

const limparTimerPix = () => {
  if (timerPix) {
    clearInterval(timerPix);
    timerPix = null;
  }
};

const limparPixPendente = () => {
  limparTimerPix();

  localStorage.removeItem(CHAVE_PIX);

  pixCodigoCopiaCola.value = '';
  pixExpiraEm.value = null;
  tempoRestantePix.value = '03:00:00';
};

const atualizarTempoPix = () => {
  if (!pixExpiraEm.value) return;

  const restante = Math.max(
    0,
    pixExpiraEm.value - Date.now()
  );

  if (restante <= 0) {
    limparTimerPix();
    localStorage.removeItem(CHAVE_PIX);

    statusFinalizacao.value = 'pix-expirado';
    mensagemPix.value =
      'O prazo desta demonstração PIX terminou.';

    return;
  }

  const horas = Math.floor(restante / 3600000);
  const minutos = Math.floor((restante % 3600000) / 60000);
  const segundos = Math.floor((restante % 60000) / 1000);

  tempoRestantePix.value = [
    String(horas).padStart(2, '0'),
    String(minutos).padStart(2, '0'),
    String(segundos).padStart(2, '0')
  ].join(':');
};

const iniciarTimerPix = () => {
  limparTimerPix();
  atualizarTempoPix();

  timerPix = setInterval(() => {
    atualizarTempoPix();
  }, 1000);
};

/* =========================================
   GERAR DEMONSTRAÇÃO PIX
========================================= */

const gerarPixDemonstracao = () => {
  const pedidoId = gerarIdPedido();

  pixCodigoCopiaCola.value =
    `DEMONSTRACAO-PIX-NAO-VALIDO-PARA-PAGAMENTO-PADARIA-MARTINS-${pedidoId}`;

  pixExpiraEm.value = Date.now() + TEMPO_PIX;

  const dadosPix = {
    codigo: pixCodigoCopiaCola.value,
    expiraEm: pixExpiraEm.value,
    itens: itensCompra.value,
    cliente: form.value,
    cupom: cupomAplicado.value
      ? {
          codigo: cupomAplicado.value.codigo,
          titulo: cupomAplicado.value.titulo
        }
      : null,
    criadoEm: Date.now()
  };

  localStorage.setItem(
    CHAVE_PIX,
    JSON.stringify(dadosPix)
  );

  statusFinalizacao.value = 'pix';
  mensagemPix.value = '';

  iniciarTimerPix();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const copiarCodigoPix = async () => {
  if (!pixCodigoCopiaCola.value) return;

  try {
    await navigator.clipboard.writeText(
      pixCodigoCopiaCola.value
    );

    mensagemPix.value = 'Código de demonstração copiado.';

  } catch {
    mensagemPix.value =
      'Não foi possível copiar automaticamente. Selecione e copie o código.';
  }
};

const cancelarPix = () => {
  limparPixPendente();

  mensagemPix.value = '';
  statusFinalizacao.value = 'ocioso';
  etapaAtual.value = 3;
};

/* =========================================
   CONCLUIR PEDIDO
========================================= */

const concluirPedido = async () => {
  if (pedidoConcluido.value) return;

  try {
    limparErro();
    salvarDadosCliente();

    /*
      Se a compra já foi registrada no servidor,
      não envia outra requisição e evita duplicidade.
    */
    if (!compraRegistrada.value) {
      const compra = await registrarCompraNoServidor();

      compraRegistrada.value = compra;
    }

    const compra = compraRegistrada.value;

    /*
      Marca como concluído logo após o retorno
      bem-sucedido do Django.
    */
    pedidoConcluido.value = true;

    try {
      salvarCompraNoHistorico(
        compra.idCompra,
        compra
      );
    } catch (erroHistorico) {
      console.error(
        'Não foi possível salvar o histórico local:',
        erroHistorico
      );
    }

    const idsComprados = itensCompra.value.map(item =>
      Number(obterIdProduto(item))
    );

    try {
      removerItens(idsComprados);
    } catch (erroCarrinho) {
      console.error(
        'Não foi possível atualizar o carrinho:',
        erroCarrinho
      );
    }

    localStorage.removeItem('itensCheckout');
    localStorage.removeItem('itensSelecionados');

    limparPixPendente();

    statusFinalizacao.value = 'sucesso';

    /*
      A carteira é apenas atualizada.
      O selo é creditado pelo Django quando
      o pagamento for realmente confirmado.
    */
    try {
      await recarregar();
    } catch (erroFidelidade) {
      console.error(
        'Não foi possível atualizar a carteira:',
        erroFidelidade
      );
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  } catch (e) {
    console.error('Erro ao registrar compra:', e);

    erro.value =
      e.message ||
      'Não foi possível registrar seu pedido. Tente novamente.';

    statusFinalizacao.value = 'ocioso';
    etapaAtual.value = 4;
  }
};

const confirmarPagamentoPix = () => {
  if (statusFinalizacao.value !== 'pix') return;

  limparTimerPix();

  // Confirmação apenas demonstrativa.
  statusFinalizacao.value = 'processando';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  timerFinalizacao = setTimeout(async () => {
    await concluirPedido();
  }, 1200);
};

const finalizarCompra = () => {
  limparErro();

  if (statusFinalizacao.value !== 'ocioso') return;

  if (!form.value.nome.trim()) {
    erro.value = 'Informe seu nome para continuar.';
    etapaAtual.value = 2;
    return;
  }

  if (
    !form.value.telefone ||
    form.value.telefone.length < 10
  ) {
    erro.value = 'Informe um telefone válido para continuar.';
    etapaAtual.value = 2;
    return;
  }

  if (!form.value.formaPagamento) {
    erro.value = 'Selecione uma forma de pagamento.';
    etapaAtual.value = 3;
    return;
  }

  if (
    form.value.formaPagamento === 'cartao' &&
    !cartaoSelecionado.value
  ) {
    erro.value =
      'Selecione um cartão salvo ou cadastre um novo cartão.';
    etapaAtual.value = 3;
    return;
  }

  if (!itensCompra.value.length) {
    erro.value =
      'Não há produtos selecionados para finalizar.';
    etapaAtual.value = 1;
    return;
  }

  salvarDadosCliente();

  if (form.value.formaPagamento === 'pix') {
    gerarPixDemonstracao();
    return;
  }

  statusFinalizacao.value = 'processando';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  timerFinalizacao = setTimeout(async () => {
    await concluirPedido();
  }, 2200);
};

/* =========================================
   RESTAURAR PIX
========================================= */

const restaurarPixPendente = async () => {
  try {
    const salvo = localStorage.getItem(CHAVE_PIX);

    if (!salvo) return;

    const dados = JSON.parse(salvo);

    if (
      !dados?.codigo ||
      !dados?.expiraEm ||
      !Array.isArray(dados.itens)
    ) {
      localStorage.removeItem(CHAVE_PIX);
      return;
    }

    if (dados.expiraEm <= Date.now()) {
      localStorage.removeItem(CHAVE_PIX);

      statusFinalizacao.value = 'pix-expirado';
      mensagemPix.value =
        'O prazo desta demonstração PIX terminou.';

      return;
    }

    pixCodigoCopiaCola.value = dados.codigo;
    pixExpiraEm.value = dados.expiraEm;

    if (dados.itens.length) {
      itensCompra.value = dados.itens;

      localStorage.setItem(
        'itensCheckout',
        JSON.stringify(dados.itens)
      );
    }

    if (dados.cliente) {
      form.value.nome = dados.cliente.nome || '';
      form.value.telefone = dados.cliente.telefone || '';
      form.value.formaPagamento = 'pix';
    }

    if (dados.cupom?.codigo) {
      try {
        const resultado = await validarCupom(
          dados.cupom.codigo
        );

        if (resultado?.valido && resultado.cupom) {
          cupomAplicado.value = resultado.cupom;
          codigoCupom.value = resultado.cupom.codigo;
        }
      } catch (erroCupom) {
        console.error(
          'Não foi possível restaurar o cupom:',
          erroCupom
        );
      }
    }

    etapaAtual.value = 4;
    statusFinalizacao.value = 'pix';

    iniciarTimerPix();

  } catch (e) {
    console.error('Erro ao restaurar PIX:', e);
    localStorage.removeItem(CHAVE_PIX);
  }
};

/* =========================================
   NAVEGAÇÃO
========================================= */

const gerarIdPedido = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

const voltarInicio = () => {
  router.push({ name: 'home' });
};

/* =========================================
   OBSERVADORES
========================================= */

watch(
  () => form.value.formaPagamento,
  (novoPagamento) => {
    if (novoPagamento === 'cartao') {
      carregarCartaoPrincipal();
    } else {
      cartaoSelecionado.value = null;
    }

    limparErro();
  }
);

watch(subtotal, (novoSubtotal) => {
  if (
    cupomAplicado.value &&
    valorDescontoCupom.value > novoSubtotal
  ) {
    removerCupom();
  }
});

/* =========================================
   CICLO DE VIDA
========================================= */

onMounted(async () => {
  carregarItensCompra();
  carregarDadosCliente();

  await restaurarPixPendente();
});

onBeforeUnmount(() => {
  if (timerFinalizacao) {
    clearTimeout(timerFinalizacao);
    timerFinalizacao = null;
  }

  limparTimerPix();
});
</script>

<template>
  <div class="checkout-page">
    <div class="decor decor-one"></div>
    <div class="decor decor-two"></div>

    <!-- PROCESSANDO PEDIDO -->
    <div
      v-if="statusFinalizacao === 'processando'"
      class="finalizacao-page"
    >
      <div class="finalizacao-card processando-card">
        <div class="processando-icon">
          <div class="spinner"></div>
        </div>

        <span class="finalizacao-label">PAGAMENTO</span>

        <h1>Processando seu pedido</h1>

        <p>
          Estamos preparando tudo para finalizar sua compra.
        </p>

        <div class="processando-detalhes">
          <div>
            <span>Total</span>
            <strong>
              R$ {{ formatarPreco(
                form.formaPagamento === 'cartao'
                  ? totalComJuros
                  : subtotalComDesconto
              ) }}
            </strong>
          </div>

          <div>
            <span>Pagamento</span>
            <strong>{{ pagamentoFormatado }}</strong>
          </div>

          <div v-if="form.formaPagamento === 'cartao'">
            <span>Parcelamento</span>
            <strong>{{ textoParcelas }}</strong>
          </div>

          <div v-if="form.formaPagamento === 'cartao'">
            <span>Juros</span>
            <strong>
              {{
                jurosCartao > 0
                  ? `R$ ${formatarPreco(jurosCartao)}`
                  : 'Sem juros'
              }}
            </strong>
          </div>
        </div>

        <div class="processando-barra">
          <div></div>
        </div>

        <small>Aguarde só um momento...</small>
      </div>
    </div>

    <!-- PIX -->
    <div
      v-else-if="statusFinalizacao === 'pix'"
      class="finalizacao-page"
    >
      <div class="finalizacao-card pix-card">
        <div class="pix-topo">
          <div class="pix-icon-grande">
            <i class="fa-brands fa-pix"></i>
          </div>

          <span class="finalizacao-label">
            PAGAMENTO POR PIX
          </span>

          <h1>Seu PIX está pronto!</h1>

          <p>
            Confira o valor do pedido e utilize o código abaixo
            na sua instituição financeira.
          </p>
        </div>

        <div class="pix-valor">
          <span>VALOR DO PEDIDO</span>
          <strong>
            R$ {{ formatarPreco(subtotalComDesconto) }}
          </strong>
        </div>

        <div class="pix-tempo">
          <div class="pix-tempo-icon">
            <i class="fa-regular fa-clock"></i>
          </div>

          <div>
            <span>Tempo restante da demonstração</span>
            <strong>{{ tempoRestantePix }}</strong>
          </div>
        </div>

        <div class="pix-codigo-area">
          <div class="pix-codigo-heading">
            <strong>Código PIX Copia e Cola</strong>
            <span>DEMONSTRAÇÃO</span>
          </div>

          <textarea
            :value="pixCodigoCopiaCola"
            readonly
            rows="4"
            aria-label="Código PIX de demonstração"
          ></textarea>

          <button
            type="button"
            class="btn-copiar-pix"
            @click="copiarCodigoPix"
          >
            <i class="fa-regular fa-copy"></i>
            Copiar código
          </button>
        </div>

        <div class="pix-aviso">
          <i class="fa-solid fa-circle-info"></i>

          <p>
            Este código é apenas ilustrativo e não realiza
            uma transferência financeira real. A confirmação
            abaixo serve somente para testar o fluxo do checkout.
          </p>
        </div>

        <p
          v-if="mensagemPix"
          class="pix-mensagem"
        >
          {{ mensagemPix }}
        </p>

        <button
          type="button"
          class="btn-confirmar-pix"
          @click="confirmarPagamentoPix"
        >
          <i class="fa-solid fa-check"></i>
          Confirmar pagamento de demonstração
        </button>

        <button
          type="button"
          class="btn-cancelar-pix"
          @click="cancelarPix"
        >
          Cancelar e voltar ao pagamento
        </button>
      </div>
    </div>

    <!-- PIX EXPIRADO -->
    <div
      v-else-if="statusFinalizacao === 'pix-expirado'"
      class="finalizacao-page"
    >
      <div class="finalizacao-card pix-expirado-card">
        <div class="pix-expirado-icon">
          <i class="fa-regular fa-clock"></i>
        </div>

        <span class="finalizacao-label">
          PRAZO ENCERRADO
        </span>

        <h1>O PIX expirou</h1>

        <p>
          O tempo disponível para esta demonstração terminou.
          Você pode retornar ao pagamento e gerar uma nova tentativa.
        </p>

        <button
          type="button"
          class="btn-finalizacao"
          @click="statusFinalizacao = 'ocioso'; etapaAtual = 3"
        >
          <span>Voltar ao pagamento</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- PEDIDO FINALIZADO -->
    <div
      v-else-if="statusFinalizacao === 'sucesso'"
      class="finalizacao-page"
    >
      <div class="finalizacao-card sucesso-card">
        <div class="sucesso-icon">
          <i class="fa-solid fa-check"></i>
        </div>

        <span class="finalizacao-label">
          PEDIDO REGISTRADO
        </span>

        <h1>Pedido registrado com sucesso!</h1>

        <p>
          Seu pedido foi registrado e está aguardando a
          confirmação do pagamento. Assim que tudo estiver
          confirmado, a equipe poderá iniciar a preparação.
        </p>

        <div class="sucesso-resumo">
          <div class="sucesso-resumo-item">
            <span>PEDIDO</span>
            <strong>
              {{ quantidadeTotal }}
              {{ quantidadeTotal === 1 ? 'item' : 'itens' }}
            </strong>
          </div>

          <div class="sucesso-resumo-item">
            <span>PAGAMENTO</span>
            <strong>{{ pagamentoFormatado }}</strong>
          </div>

          <div
            v-if="cupomAplicado"
            class="sucesso-resumo-item"
          >
            <span>DESCONTO</span>
            <strong>
              R$ {{ formatarPreco(valorDescontoCupom) }}
            </strong>
          </div>

          <div
            v-if="form.formaPagamento === 'cartao'"
            class="sucesso-resumo-item"
          >
            <span>PARCELAMENTO</span>
            <strong>{{ textoParcelas }}</strong>
          </div>

          <div class="sucesso-resumo-item total">
            <span>TOTAL</span>
            <strong>
              R$ {{ formatarPreco(
                form.formaPagamento === 'cartao'
                  ? totalComJuros
                  : subtotalComDesconto
              ) }}
            </strong>
          </div>
        </div>

        <div class="sucesso-mensagem">
          <i class="fa-solid fa-heart"></i>
          <span>
            Obrigado por escolher a Padaria Martins!
          </span>
        </div>

        <button
          type="button"
          class="btn-finalizacao"
          @click="voltarInicio"
        >
          <span>Voltar para o início</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- CHECKOUT NORMAL -->
    <template v-else>
      <header class="checkout-header">
        <button
          type="button"
          class="btn-voltar"
          aria-label="Voltar para o carrinho"
          @click="voltarCarrinho"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>

        <div class="header-brand">
          <span class="brand-overline">
            <i class="fa-solid fa-sparkles"></i>
            SEU PEDIDO
          </span>

          <h1>Finalizar compra</h1>

          <p>
            Só mais alguns passos para deixar tudo pronto.
          </p>
        </div>

        <div class="seguro-badge">
          <i class="fa-solid fa-lock"></i>
          <span>Seguro</span>
        </div>
      </header>

      <main class="checkout-container">

        <!-- PROGRESSO -->
        <section class="progresso-card">
          <div class="progresso-heading">
            <div>
              <span>PROGRESSO DO PEDIDO</span>
              <strong>{{ etapaNome }}</strong>
            </div>

            <div class="etapa-numero">
              <b>{{ String(etapaAtual).padStart(2, '0') }}</b>
              <small>/ 04</small>
            </div>
          </div>

          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${progressoPercent}%` }"
            ></div>
          </div>

          <div class="passos">
            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 1 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-bag-shopping"></i>
              </div>
              <span>Pedido</span>
            </div>

            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 2 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-user"></i>
              </div>
              <span>Dados</span>
            </div>

            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 3 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-credit-card"></i>
              </div>
              <span>Pagamento</span>
            </div>

            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 4 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-check"></i>
              </div>
              <span>Finalizar</span>
            </div>
          </div>
        </section>

        <!-- ERRO -->
        <div
          v-if="erro"
          class="mensagem-erro"
        >
          <div class="erro-icon">
            <i class="fa-solid fa-circle-exclamation"></i>
          </div>

          <div class="erro-texto">
            <strong>Ops!</strong>
            <span>{{ erro }}</span>
          </div>

          <button
            type="button"
            aria-label="Fechar mensagem"
            @click="limparErro"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- ETAPA 1: PEDIDO -->
        <section
          v-if="etapaAtual === 1"
          class="checkout-card animate-fade"
        >
          <div class="section-heading">
            <div class="section-icon">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>

            <div>
              <span>ETAPA 01</span>
              <h2>Seu pedido</h2>
            </div>
          </div>

          <div class="heading-description">
            <p>
              Tudo que você escolheu, reunido em um só lugar.
            </p>

            <span class="item-counter">
              {{ quantidadeTotal }}
              {{ quantidadeTotal === 1 ? 'item' : 'itens' }}
            </span>
          </div>

          <div class="produtos-lista">
            <article
              v-for="item in itensCompra"
              :key="item.idProduto"
              class="produto-checkout"
            >
              <div class="produto-imagem">
                <img
                  v-if="getImageUrl(item.imagem)"
                  :src="getImageUrl(item.imagem)"
                  :alt="item.nome"
                />

                <div
                  v-else
                  class="imagem-placeholder"
                >
                  <i class="fa-solid fa-cookie-bite"></i>
                </div>
              </div>

              <div class="produto-info">
                <span>PRODUTO</span>
                <h3>{{ item.nome }}</h3>

                <p>
                  {{ quantidadeItem(item) }}
                  × R$ {{ formatarPreco(item.preco) }}
                </p>
              </div>

              <strong class="produto-total">
                R$ {{ formatarPreco(subtotalItem(item)) }}
              </strong>
            </article>
          </div>

          <!-- CUPOM -->
          <div class="cupom-checkout">
            <div class="cupom-titulo">
              <div class="cupom-icone">
                <i class="fa-solid fa-ticket"></i>
              </div>

              <div>
                <strong>Tem um cupom de desconto?</strong>
                <span>
                  Aproveite suas recompensas da carteira.
                </span>
              </div>
            </div>

            <div
              v-if="!cupomAplicado"
              class="cupom-form"
            >
              <input
                v-model="codigoCupom"
                type="text"
                placeholder="Digite seu código"
                autocomplete="off"
                @input="limparMensagemCupom"
                @keyup.enter="aplicarCupom"
              />

              <button
                type="button"
                @click="aplicarCupom"
              >
                Aplicar
              </button>
            </div>

            <div
              v-else
              class="cupom-aplicado"
            >
              <div>
                <i class="fa-solid fa-circle-check"></i>

                <div>
                  <strong>{{ cupomAplicado.codigo }}</strong>
                  <span>
                    {{ cupomAplicado.titulo }}
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Remover cupom"
                @click="removerCupom"
              >
                <i class="fa-solid fa-trash"></i>
                Remover
              </button>
            </div>

            <p
              v-if="mensagemCupom"
              class="cupom-mensagem"
              :class="tipoMensagemCupom"
            >
              <i
                :class="tipoMensagemCupom === 'sucesso'
                  ? 'fa-solid fa-circle-check'
                  : 'fa-solid fa-circle-exclamation'"
              ></i>

              {{ mensagemCupom }}
            </p>
          </div>

          <!-- TOTAL -->
          <div class="total-card">
            <div>
              <span>RESUMO DO PEDIDO</span>
              <strong>
                {{ quantidadeTotal }}
                {{ quantidadeTotal === 1 ? 'item' : 'itens' }}
              </strong>
            </div>

            <div class="total-valor">
              <small>Subtotal</small>
              <strong>
                R$ {{ formatarPreco(subtotal) }}
              </strong>

              <small
                v-if="valorDescontoCupom > 0"
                class="desconto-label"
              >
                Desconto do cupom
              </small>

              <strong
                v-if="valorDescontoCupom > 0"
                class="desconto-valor"
              >
                − R$ {{ formatarPreco(valorDescontoCupom) }}
              </strong>

              <small>Total</small>
              <strong>
                R$ {{ formatarPreco(subtotalComDesconto) }}
              </strong>
            </div>
          </div>

          <div class="acoes">
            <button
              type="button"
              class="btn-principal"
              @click="proximaEtapa"
            >
              <span>Continuar</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>

        <!-- ETAPA 2: DADOS -->
        <section
          v-if="etapaAtual === 2"
          class="checkout-card animate-fade"
        >
          <div class="section-heading">
            <div class="section-icon">
              <i class="fa-solid fa-user"></i>
            </div>

            <div>
              <span>ETAPA 02</span>
              <h2>Seus dados</h2>
            </div>
          </div>

          <p class="section-description">
            Precisamos dessas informações para identificar seu pedido.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label for="nome">Nome completo</label>

              <div class="input-box">
                <i class="fa-solid fa-user"></i>

                <input
                  id="nome"
                  v-model="form.nome"
                  type="text"
                  placeholder="Como podemos chamar você?"
                  autocomplete="name"
                  @input="limparErro"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="telefone">Telefone</label>

              <div class="input-box">
                <i class="fa-solid fa-phone"></i>

                <input
                  id="telefone"
                  type="tel"
                  :value="form.telefone"
                  placeholder="DDD + número"
                  maxlength="11"
                  autocomplete="tel"
                  @input="formatarTelefone"
                  @focus="limparErro"
                />
              </div>

              <small>
                <i class="fa-solid fa-circle-info"></i>
                Exemplo: 48999999999
              </small>
            </div>
          </div>

          <div class="dados-nota">
            <div class="nota-icon">
              <i class="fa-solid fa-heart"></i>
            </div>

            <p>
              Essas informações serão usadas apenas para identificar
              e organizar seu pedido.
            </p>
          </div>

          <div class="acoes dois">
            <button
              type="button"
              class="btn-secundario"
              @click="etapaAnterior"
            >
              <i class="fa-solid fa-arrow-left"></i>
              <span>Voltar</span>
            </button>

            <button
              type="button"
              class="btn-principal"
              @click="proximaEtapa"
            >
              <span>Continuar</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>

        <!-- ETAPA 3: PAGAMENTO -->
        <section
          v-if="etapaAtual === 3"
          class="checkout-card pagamento-card animate-fade"
        >
          <div class="section-heading">
            <div class="section-icon">
              <i class="fa-solid fa-credit-card"></i>
            </div>

            <div>
              <span>ETAPA 03</span>
              <h2>Pagamento</h2>
            </div>
          </div>

          <p class="section-description">
            Escolha a forma de pagamento que prefere utilizar.
          </p>

          <div class="pagamentos">
            <label
              class="pagamento"
              :class="{
                selecionado: form.formaPagamento === 'pix'
              }"
            >
              <input
                v-model="form.formaPagamento"
                type="radio"
                value="pix"
                @change="limparErro"
              />

              <div class="pagamento-icon pix">
                <i class="fa-brands fa-pix"></i>
              </div>

              <div class="pagamento-texto">
                <strong>PIX</strong>
                <span>Pagamento instantâneo</span>
              </div>

              <div class="check">
                <i
                  v-if="form.formaPagamento === 'pix'"
                  class="fa-solid fa-check"
                ></i>
              </div>
            </label>

            <label
              class="pagamento"
              :class="{
                selecionado: form.formaPagamento === 'cartao'
              }"
            >
              <input
                v-model="form.formaPagamento"
                type="radio"
                value="cartao"
                @change="limparErro"
              />

              <div class="pagamento-icon cartao">
                <i class="fa-solid fa-credit-card"></i>
              </div>

              <div class="pagamento-texto">
                <strong>Cartão</strong>
                <span>
                  Use um cartão salvo ou adicione um novo
                </span>
              </div>

              <div class="check">
                <i
                  v-if="form.formaPagamento === 'cartao'"
                  class="fa-solid fa-check"
                ></i>
              </div>
            </label>
          </div>

          <!-- CARTÃO -->
          <div
            v-if="form.formaPagamento === 'cartao'"
            class="area-cartao"
          >
            <div class="cartao-topo">
              <div>
                <span class="cartao-label">
                  CARTÃO PARA O PAGAMENTO
                </span>

                <strong>Seus cartões salvos</strong>
              </div>

              <div class="cartao-seguranca">
                <i class="fa-solid fa-lock"></i>
                Seguro
              </div>
            </div>

            <PagamentoCartao
              v-model="cartaoSelecionado"
              :valor="subtotalComDesconto"
            />
          </div>

          <div class="seguranca">
            <div class="seguranca-icon">
              <i class="fa-solid fa-shield-halved"></i>
            </div>

            <div>
              <strong>Pagamento seguro</strong>
              <span>
                Apenas informações necessárias do cartão são utilizadas.
              </span>
            </div>
          </div>

          <div class="mini-total">
            <div>
              <span>Total do pedido</span>

              <small v-if="valorDescontoCupom > 0">
                Cupom aplicado:
                − R$ {{ formatarPreco(valorDescontoCupom) }}
              </small>
            </div>

            <strong>
              R$ {{ formatarPreco(
                form.formaPagamento === 'cartao'
                  ? totalComJuros
                  : subtotalComDesconto
              ) }}
            </strong>
          </div>

          <div class="acoes dois">
            <button
              type="button"
              class="btn-secundario"
              @click="etapaAnterior"
            >
              <i class="fa-solid fa-arrow-left"></i>
              <span>Voltar</span>
            </button>

            <button
              type="button"
              class="btn-principal"
              @click="proximaEtapa"
            >
              <span>Ver resumo</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>

        <!-- ETAPA 4: CONFIRMAÇÃO -->
        <section
          v-if="etapaAtual === 4"
          class="checkout-card confirmacao-card animate-fade"
        >
          <div class="confirmacao-topo">
            <div class="check-grande">
              <i class="fa-solid fa-check"></i>
            </div>

            <span>ETAPA 04</span>

            <h2>Quase tudo pronto!</h2>

            <p>
              Confira os detalhes antes de confirmar seu pedido.
            </p>
          </div>

          <div class="recibo">
            <div class="recibo-header">
              <div>
                <span>RESUMO DO PEDIDO</span>
                <strong>Seu pedido</strong>
              </div>

              <i class="fa-solid fa-receipt"></i>
            </div>

            <div class="linha-detalhe"></div>

            <div class="cliente-resumo">
              <div class="cliente-item">
                <span>CLIENTE</span>
                <strong>{{ form.nome }}</strong>
              </div>

              <div class="cliente-item">
                <span>TELEFONE</span>
                <strong>{{ form.telefone }}</strong>
              </div>

              <div class="cliente-item">
                <span>PAGAMENTO</span>
                <strong>{{ pagamentoFormatado }}</strong>
              </div>
            </div>

            <!-- CARTÃO ESCOLHIDO -->
            <div
              v-if="form.formaPagamento === 'cartao' && cartaoResumo"
              class="cartao-resumo"
            >
              <div class="cartao-resumo-header">
                <div class="cartao-mini-icon">
                  <i class="fa-solid fa-credit-card"></i>
                </div>

                <div>
                  <span>CARTÃO ESCOLHIDO</span>

                  <strong>
                    {{ cartaoResumo.bandeira }}
                    •••• {{ cartaoResumo.final }}
                  </strong>
                </div>
              </div>

              <div class="cartao-resumo-info">
                <div>
                  <span>TITULAR</span>
                  <strong>
                    {{ cartaoResumo.titular || 'Cartão cadastrado' }}
                  </strong>
                </div>

                <div>
                  <span>PARCELAMENTO</span>
                  <strong>{{ cartaoResumo.parcelas }}x</strong>
                </div>

                <div>
                  <span>VALOR POR MÊS</span>
                  <strong>
                    R$ {{ formatarPreco(cartaoResumo.valorParcela) }}
                  </strong>
                </div>

                <div>
                  <span>JUROS</span>

                  <strong
                    :class="{
                      'sem-juros': cartaoResumo.juros === 0
                    }"
                  >
                    {{
                      cartaoResumo.juros > 0
                        ? `R$ ${formatarPreco(cartaoResumo.juros)}`
                        : 'Sem juros'
                    }}
                  </strong>
                </div>

                <div>
                  <span>TOTAL COM JUROS</span>
                  <strong>
                    R$ {{ formatarPreco(cartaoResumo.totalComJuros) }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="linha-detalhe"></div>

            <!-- PRODUTOS -->
            <div class="resumo-produtos">
              <div
                v-for="item in itensCompra"
                :key="item.idProduto"
                class="resumo-produto"
              >
                <div>
                  <span>{{ quantidadeItem(item) }}×</span>
                  <strong>{{ item.nome }}</strong>
                </div>

                <b>
                  R$ {{ formatarPreco(subtotalItem(item)) }}
                </b>
              </div>
            </div>

            <div class="linha-detalhe"></div>

            <!-- CUPOM NO RECIBO -->
            <div
              v-if="cupomAplicado"
              class="recibo-cupom"
            >
              <div>
                <i class="fa-solid fa-ticket"></i>

                <div>
                  <span>CUPOM APLICADO</span>
                  <strong>{{ cupomAplicado.codigo }}</strong>
                </div>
              </div>

              <strong>
                − R$ {{ formatarPreco(valorDescontoCupom) }}
              </strong>
            </div>

            <div class="retirada">
              <div class="retirada-icon">
                <i class="fa-solid fa-store"></i>
              </div>

              <div>
                <span>FORMA DE ENTREGA</span>
                <strong>Retirada na loja</strong>
                <small>
                  Seu pedido estará disponível para retirada.
                </small>
              </div>
            </div>

            <!-- TOTAL -->
            <div class="total-recibo">
              <div>
                <span>TOTAL</span>

                <small>
                  {{ quantidadeTotal }}
                  {{ quantidadeTotal === 1 ? 'item' : 'itens' }}
                </small>
              </div>

              <strong>
                R$ {{ formatarPreco(
                  form.formaPagamento === 'cartao'
                    ? totalComJuros
                    : subtotalComDesconto
                ) }}
              </strong>
            </div>
          </div>

          <div class="acoes dois">
            <button
              type="button"
              class="btn-secundario"
              @click="etapaAnterior"
            >
              <i class="fa-solid fa-arrow-left"></i>
              <span>Voltar</span>
            </button>

            <button
              type="button"
              class="btn-confirmar"
              @click="finalizarCompra"
            >
              <span>
                {{ form.formaPagamento === 'pix'
                  ? 'Gerar PIX'
                  : 'Confirmar pedido' }}
              </span>

              <i
                :class="form.formaPagamento === 'pix'
                  ? 'fa-brands fa-pix'
                  : 'fa-solid fa-check'"
              ></i>
            </button>
          </div>
        </section>

        <div class="checkout-footer">
          <i class="fa-solid fa-heart"></i>
          Feito com carinho para você
        </div>
      </main>
    </template>
  </div>
</template>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Imprima&display=swap");


/* =========================================
   CUPOM DE DESCONTO
========================================= */

.cupom-checkout {
  margin-top: 17px;
  padding: 16px;
  border: 1px solid #eadfce;
  border-radius: 19px;
  background: linear-gradient(135deg, #fffdfa, #faf5ed);
}

.cupom-titulo {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 13px;
}

.cupom-icone {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #f0e5d4;
  color: #a7834e;
  font-size: 16px;
}

.cupom-titulo > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cupom-titulo strong {
  color: #5e3023;
  font-size: .72rem;
}

.cupom-titulo span {
  color: #a09287;
  font-size: .57rem;
}

.cupom-form {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.cupom-form input {
  min-width: 0;
  flex: 1;
  height: 43px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #e4d8c9;
  border-radius: 12px;
  outline: none;
  background: white;
  color: #5e3023;
  font-family: inherit;
  font-size: .68rem;
  text-transform: uppercase;
  transition: .2s ease;
}

.cupom-form input::placeholder {
  color: #b6aaa0;
  text-transform: none;
}

.cupom-form input:focus {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184,151,100,.1);
}

.cupom-form button {
  min-width: 85px;
  padding: 0 13px;
  border: none;
  border-radius: 12px;
  background: #5e3023;
  color: white;
  cursor: pointer;
  font-family: inherit;
  font-size: .62rem;
  font-weight: 800;
  transition: .2s ease;
}

.cupom-form button:hover {
  background: #754333;
  transform: translateY(-1px);
}

.cupom-aplicado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border: 1px solid #d9e7d6;
  border-radius: 13px;
  background: #f4f8f1;
}

.cupom-aplicado > div {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.cupom-aplicado > div > i {
  color: #64845b;
  font-size: 17px;
  flex-shrink: 0;
}

.cupom-aplicado > div > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cupom-aplicado strong {
  color: #526c49;
  font-size: .68rem;
}

.cupom-aplicado span {
  overflow: hidden;
  color: #899b7e;
  font-size: .54rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cupom-aplicado button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 9px;
  border: 1px solid #e8d2ce;
  border-radius: 9px;
  background: white;
  color: #a45c52;
  cursor: pointer;
  font-family: inherit;
  font-size: .53rem;
  font-weight: 800;
  flex-shrink: 0;
}

.cupom-aplicado button:hover {
  background: #fff3f1;
}

.cupom-mensagem {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 10px 0 0;
  font-size: .57rem;
  line-height: 1.5;
}

.cupom-mensagem.sucesso {
  color: #628258;
}

.cupom-mensagem.erro {
  color: #ad5b50;
}

.cupom-mensagem i {
  margin-top: 2px;
  flex-shrink: 0;
}

.desconto-label {
  margin-top: 7px;
  color: #71916a !important;
}

.total-valor strong.desconto-valor {
  color: #b5d1a9;
  font-size: .83rem;
}

/* =========================================
   TOTAL COM DESCONTO
========================================= */

.total-valor {
  min-width: 100px;
}

.total-valor small {
  text-align: right;
}

.mini-total > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mini-total small {
  color: #71916a;
  font-size: .52rem;
}

/* =========================================
   CUPOM NO RECIBO
========================================= */

.recibo-cupom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 12px 17px;
  padding: 11px;
  border: 1px solid #dce8d6;
  border-radius: 13px;
  background: #f4f8f1;
}

.recibo-cupom > div {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.recibo-cupom > div > i {
  color: #718d64;
  font-size: 16px;
}

.recibo-cupom > div > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.recibo-cupom span {
  color: #8b9b80;
  font-size: .42rem;
  font-weight: 900;
  letter-spacing: .8px;
}

.recibo-cupom strong {
  color: #5c7852;
  font-size: .65rem;
}

.recibo-cupom > strong {
  white-space: nowrap;
}

/* =========================================
   TELA PIX
========================================= */

.pix-card {
  max-width: 490px;
}

.pix-topo {
  text-align: center;
}

.pix-icon-grande {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 23px;
  background: #eaf5ed;
  color: #399568;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 10px 25px rgba(57,149,104,.1);
}

.pix-valor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-top: 23px;
  padding: 18px;
  border-radius: 18px;
  background: #5e3023;
}

.pix-valor span {
  color: rgba(255,255,255,.55);
  font-size: .49rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.pix-valor strong {
  color: #e1c98f;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.9rem;
  font-weight: 400;
}

.pix-tempo {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 15px;
  padding: 13px;
  border: 1px solid #eee3d5;
  border-radius: 15px;
  background: #fcfaf7;
  text-align: left;
}

.pix-tempo-icon {
  width: 37px;
  height: 37px;
  border-radius: 12px;
  background: #f3e9d9;
  color: #a7834e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pix-tempo > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pix-tempo span {
  color: #998b80;
  font-size: .55rem;
}

.pix-tempo strong {
  color: #5e3023;
  font-size: .88rem;
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
}

.pix-codigo-area {
  margin-top: 17px;
  padding: 14px;
  border: 1px solid #e9dfd3;
  border-radius: 17px;
  background: #fcfaf7;
  text-align: left;
}

.pix-codigo-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.pix-codigo-heading strong {
  color: #5e3023;
  font-size: .65rem;
}

.pix-codigo-heading span {
  padding: 5px 7px;
  border-radius: 7px;
  background: #f4e9d7;
  color: #987849;
  font-size: .42rem;
  font-weight: 900;
  letter-spacing: .6px;
}

.pix-codigo-area textarea {
  width: 100%;
  min-height: 85px;
  box-sizing: border-box;
  padding: 11px;
  border: 1px dashed #d8c7ad;
  border-radius: 11px;
  outline: none;
  resize: none;
  background: white;
  color: #82756b;
  font-family: monospace;
  font-size: .61rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.btn-copiar-pix {
  width: 100%;
  min-height: 43px;
  margin-top: 9px;
  border: 1px solid #d8c7ad;
  border-radius: 11px;
  background: #f6efe5;
  color: #765c39;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: .65rem;
  font-weight: 900;
  transition: .2s ease;
}

.btn-copiar-pix:hover {
  background: #eee1ce;
}

.pix-aviso {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #eadfc9;
  border-radius: 13px;
  background: #fffaf0;
  text-align: left;
}

.pix-aviso > i {
  margin-top: 2px;
  color: #a7834e;
  flex-shrink: 0;
}

.pix-aviso p {
  margin: 0;
  color: #927d60;
  font-size: .55rem;
  line-height: 1.55;
}

.pix-mensagem {
  margin: 12px 0 0;
  color: #628258;
  font-size: .6rem;
  line-height: 1.5;
}

.btn-confirmar-pix {
  width: 100%;
  min-height: 49px;
  margin-top: 18px;
  padding: 10px;
  border: none;
  border-radius: 14px;
  background: #5e3023;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: .65rem;
  font-weight: 900;
  transition: .25s ease;
}

.btn-confirmar-pix:hover {
  background: #754333;
  transform: translateY(-2px);
  box-shadow: 0 9px 20px rgba(94,48,35,.13);
}

.btn-confirmar-pix i {
  color: #e1c98f;
}

.btn-cancelar-pix {
  margin-top: 13px;
  padding: 9px;
  border: none;
  background: transparent;
  color: #a08f83;
  cursor: pointer;
  font-family: inherit;
  font-size: .59rem;
  font-weight: 700;
  transition: .2s ease;
}

.btn-cancelar-pix:hover {
  color: #5e3023;
}

/* =========================================
   PIX EXPIRADO
========================================= */

.pix-expirado-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 23px;
  background: #f8eee6;
  color: #b17a55;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

/* =========================================
   RESPONSIVIDADE
========================================= */

@media (max-width: 600px) {
  .cupom-checkout {
    padding: 13px;
    border-radius: 16px;
  }

  .cupom-form {
    gap: 6px;
  }

  .cupom-form input {
    height: 42px;
    font-size: .63rem;
  }

  .cupom-form button {
    min-width: 76px;
    padding: 0 9px;
    font-size: .57rem;
  }

  .cupom-aplicado {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .cupom-aplicado button {
    margin-left: auto;
  }

  .recibo-cupom {
    margin-right: 12px;
    margin-left: 12px;
  }

  .pix-card {
    padding: 25px 17px;
  }

  .pix-valor strong {
    font-size: 1.7rem;
  }

  .pix-codigo-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .pix-aviso p {
    font-size: .53rem;
  }

  .btn-confirmar-pix {
    font-size: .59rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .processando-barra div {
    animation: none;
  }

  .finalizacao-card,
  .animate-fade {
    animation: none;
  }
}

.checkout-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding-bottom: 50px;
  background:
    radial-gradient(circle at 8% 12%, rgba(184,151,100,.1), transparent 20%),
    radial-gradient(circle at 92% 75%, rgba(94,48,35,.06), transparent 22%),
    linear-gradient(180deg,#fcfaf7 0%,#f7f0e8 100%);
  color: #5e3023;
  font-family: "DM Sans", Arial, sans-serif;
}

.decor {
  position: absolute;
  pointer-events: none;
  border: 1px solid rgba(184,151,100,.16);
  border-radius: 50%;
}

.decor-one {
  width: 260px;
  height: 260px;
  top: 90px;
  left: -170px;
}

.decor-two {
  width: 210px;
  height: 210px;
  right: -140px;
  bottom: 120px;
}

.checkout-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 185px;
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 70px;
  box-sizing: border-box;
}

.header-brand {
  text-align: center;
}

.brand-overline {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #b89764;
  font-size: .57rem;
  font-weight: 900;
  letter-spacing: 2.2px;
}

.header-brand h1 {
  margin: 9px 0 7px;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2.2rem,7vw,3rem);
  font-weight: 400;
  line-height: 1;
}

.header-brand p {
  margin: 0;
  color: #97867b;
  font-size: .7rem;
}

.btn-voltar,
.seguro-badge {
  position: absolute;
  top: 30px;
}

.btn-voltar {
  left: 22px;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(94,48,35,.1);
  border-radius: 15px;
  background: rgba(255,255,255,.9);
  color: #5e3023;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(94,48,35,.06);
  transition: .25s ease;
}

.btn-voltar:hover {
  background: #5e3023;
  color: white;
  transform: translateX(-2px);
}

.seguro-badge {
  right: 22px;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 13px;
  border-radius: 15px;
  background: #5e3023;
  color: #e1c98f;
  box-shadow: 0 8px 25px rgba(94,48,35,.12);
  font-size: .58rem;
  font-weight: 800;
}

.checkout-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 730px;
  margin: 0 auto;
  padding: 0 18px;
  box-sizing: border-box;
}

.progresso-card {
  margin-bottom: 15px;
  padding: 19px 21px 17px;
  border: 1px solid rgba(94,48,35,.06);
  border-radius: 24px;
  background: rgba(255,255,255,.94);
  box-shadow: 0 12px 38px rgba(94,48,35,.065);
}

.progresso-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.progresso-heading > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progresso-heading span {
  color: #b89764;
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.progresso-heading strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1rem;
  font-weight: 400;
}

.etapa-numero {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.etapa-numero b {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.3rem;
}

.etapa-numero small {
  color: #b4a79d;
  font-size: .58rem;
}

.progress-track {
  position: relative;
  height: 4px;
  margin: 0 8px 15px;
  overflow: hidden;
  border-radius: 10px;
  background: #eee6dc;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#5e3023,#b89764);
  transition: width .4s ease;
}

.passos {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.passo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.passo-icon {
  width: 29px;
  height: 29px;
  border: 1px solid #e1d8cf;
  border-radius: 50%;
  background: #fff;
  color: #aaa099;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  transition: .3s ease;
}

.passo span {
  color: #a99d94;
  font-size: .48rem;
  font-weight: 800;
}

.passo.ativo .passo-icon {
  border-color: #5e3023;
  background: #5e3023;
  color: #e1c98f;
  box-shadow: 0 4px 12px rgba(94,48,35,.15);
}

.passo.ativo span {
  color: #5e3023;
}

.mensagem-erro {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 11px 13px;
  border: 1px solid #ebcbc5;
  border-radius: 17px;
  background: #fff7f5;
}

.erro-icon {
  width: 31px;
  height: 31px;
  border-radius: 10px;
  background: #f7dfda;
  color: #a04f47;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.erro-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.mensagem-erro strong {
  color: #8f463f;
  font-size: .62rem;
}

.mensagem-erro span {
  color: #a16d66;
  font-size: .61rem;
}

.mensagem-erro button {
  border: none;
  background: transparent;
  color: #b48a83;
  cursor: pointer;
}

.checkout-card {
  padding: 25px;
  border: 1px solid rgba(94,48,35,.06);
  border-radius: 28px;
  background: rgba(255,255,255,.97);
  box-shadow: 0 18px 50px rgba(94,48,35,.07);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 13px;
}

.section-icon {
  width: 46px;
  height: 46px;
  border-radius: 15px;
  background: #f5ecdf;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-heading span {
  display: block;
  margin-bottom: 3px;
  color: #b89764;
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.section-heading h2 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.55rem;
  font-weight: 400;
}

.section-description {
  margin: 13px 0 22px;
  color: #948379;
  font-size: .7rem;
  line-height: 1.6;
}

.heading-description {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 13px 0 20px;
}

.heading-description p {
  margin: 0;
  color: #948379;
  font-size: .7rem;
}

.item-counter {
  padding: 6px 9px;
  border-radius: 9px;
  background: #f6efe6;
  color: #8f7047;
  font-size: .52rem;
  font-weight: 900;
  white-space: nowrap;
}

.produtos-lista {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.produto-checkout {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #eee6dc;
  border-radius: 18px;
  background: #fcfaf7;
  transition: .25s ease;
}

.produto-checkout:hover {
  border-color: #d9c6a7;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(94,48,35,.05);
}

.produto-imagem {
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 15px;
  background: #eee1cf;
  flex-shrink: 0;
}

.produto-imagem img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.imagem-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b89764;
  font-size: 18px;
}

.produto-info {
  min-width: 0;
  flex: 1;
}

.produto-info > span {
  display: block;
  margin-bottom: 3px;
  color: #b89764;
  font-size: .44rem;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.produto-info h3 {
  margin: 0 0 4px;
  overflow: hidden;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: .98rem;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.produto-info p {
  margin: 0;
  color: #96877d;
  font-size: .62rem;
}

.produto-total {
  color: #5e3023;
  font-size: .78rem;
  white-space: nowrap;
}

.total-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 15px;
  padding: 17px;
  border-radius: 20px;
  background: #5e3023;
  box-shadow: 0 10px 25px rgba(94,48,35,.12);
}

.total-card > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total-card span {
  color: rgba(255,255,255,.52);
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.total-card strong {
  color: white;
  font-size: .73rem;
}

.total-valor {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.total-valor small {
  color: rgba(255,255,255,.52);
  font-size: .52rem;
}

.total-valor strong {
  color: #e1c98f;
  font-size: 1.35rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  color: #5e3023;
  font-size: .67rem;
  font-weight: 800;
}

.input-box {
  position: relative;
}

.input-box > i {
  position: absolute;
  top: 50%;
  left: 14px;
  color: #b89764;
  font-size: 11px;
  transform: translateY(-50%);
}

.input-box input {
  width: 100%;
  height: 51px;
  box-sizing: border-box;
  padding: 0 14px 0 39px;
  border: 1px solid #e3dad0;
  border-radius: 15px;
  outline: none;
  background: #fcfaf7;
  color: #5e3023;
  font-family: inherit;
  font-size: .78rem;
  transition: .2s ease;
}

.input-box input::placeholder {
  color: #b4aaa2;
}

.input-box input:focus {
  border-color: #b89764;
  background: white;
  box-shadow: 0 0 0 4px rgba(184,151,100,.09);
}

.form-group small {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  color: #a3978f;
  font-size: .53rem;
}

.form-group small i {
  color: #b89764;
}

.dados-nota {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 15px;
  background: #f9f5ef;
}

.nota-icon {
  width: 31px;
  height: 31px;
  border-radius: 10px;
  background: #f0e4d3;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
}

.dados-nota p {
  margin: 0;
  color: #988980;
  font-size: .58rem;
  line-height: 1.5;
}

.pagamento-card {
  overflow: visible;
}

.pagamentos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pagamento {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border: 1px solid #e2d9ce;
  border-radius: 18px;
  background: white;
  cursor: pointer;
  transition: .25s ease;
}

.pagamento:hover {
  transform: translateY(-1px);
  border-color: #cdb78f;
}

.pagamento.selecionado {
  border-color: #b89764;
  background: #fdfaf5;
  box-shadow: 0 8px 22px rgba(184,151,100,.1);
}

.pagamento input {
  display: none;
}

.pagamento-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
}

.pagamento-icon.pix {
  background: #edf6ef;
  color: #438d5c;
}

.pagamento-icon.cartao {
  background: #f4ecdf;
  color: #8d7040;
}

.pagamento-texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pagamento-texto strong {
  color: #5e3023;
  font-size: .76rem;
}

.pagamento-texto span {
  color: #9c8e84;
  font-size: .58rem;
}

.check {
  width: 20px;
  height: 20px;
  margin-left: auto;
  border: 1.5px solid #d6ccc1;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pagamento.selecionado .check {
  border-color: #5e3023;
  background: #5e3023;
}

.check i {
  font-size: 8px;
}

.area-cartao {
  margin-top: 18px;
  padding: 18px 14px 14px;
  border: 1px solid #eadfd2;
  border-radius: 22px;
  background:
    linear-gradient(180deg,#fffdfa 0%,#faf5ee 100%);
  box-shadow:
    0 15px 35px rgba(94,48,35,.055),
    inset 0 1px 0 rgba(255,255,255,.9);
}

.cartao-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 4px 8px;
}

.cartao-topo > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cartao-label {
  color: #b89764;
  font-size: .46rem;
  font-weight: 900;
  letter-spacing: 1.4px;
}

.cartao-topo strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: .98rem;
  font-weight: 400;
}

.cartao-seguranca {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 10px;
  background: #f0e8dd;
  color: #806744;
  font-size: .48rem;
  font-weight: 800;
}

.cartao-seguranca i {
  font-size: 8px;
}

.area-cartao :deep(.cartoes-pagamento),
.area-cartao :deep(.pagamento-cartao),
.area-cartao :deep(.cartao-wrapper) {
  margin-top: 0;
}

.seguranca {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 13px;
  border-radius: 15px;
  background: #f8f4ee;
}

.seguranca-icon {
  width: 33px;
  height: 33px;
  border-radius: 10px;
  background: #efe5d7;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.seguranca div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.seguranca strong {
  color: #6d5b4f;
  font-size: .62rem;
}

.seguranca span {
  color: #a1958c;
  font-size: .54rem;
}

.mini-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 11px;
  padding: 13px 15px;
  border: 1px solid #eee5da;
  border-radius: 14px;
  background: #fcfaf7;
}

.mini-total span {
  color: #8d7d72;
  font-size: .61rem;
}

.mini-total strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 400;
}

.confirmacao-card {
  padding-top: 28px;
}

.confirmacao-topo {
  text-align: center;
}

.check-grande {
  width: 58px;
  height: 58px;
  margin: 0 auto 11px;
  border-radius: 19px;
  background: #5e3023;
  color: #e1c98f;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(94,48,35,.14);
  font-size: 20px;
}

.confirmacao-topo > span {
  color: #b89764;
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.confirmacao-topo h2 {
  margin: 6px 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.65rem;
  font-weight: 400;
}

.confirmacao-topo p {
  margin: 0 0 22px;
  color: #95867c;
  font-size: .66rem;
}

.recibo {
  overflow: hidden;
  border: 1px solid #e9e0d6;
  border-radius: 20px;
  background: #fcfaf7;
}

.recibo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px;
}

.recibo-header div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recibo-header span {
  color: #b89764;
  font-size: .46rem;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.recibo-header strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1rem;
  font-weight: 400;
}

.recibo-header > i {
  color: #c0a878;
}

.linha-detalhe {
  height: 1px;
  margin: 0 17px;
  background: #e9e0d6;
}

.cliente-resumo {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 12px;
  padding: 15px 17px;
}

.cliente-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cliente-item span {
  color: #aa9d94;
  font-size: .45rem;
  font-weight: 800;
  letter-spacing: .8px;
}

.cliente-item strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .62rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cartao-resumo {
  margin: 0 17px 15px;
  padding: 14px;
  border: 1px solid #e4d7c6;
  border-radius: 16px;
  background: linear-gradient(135deg,#f7efe3,#fffaf4);
}

.cartao-resumo-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cartao-mini-icon {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  background: #5e3023;
  color: #e1c98f;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cartao-resumo-header > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cartao-resumo-header span {
  color: #b89764;
  font-size: .43rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.cartao-resumo-header strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cartao-resumo-info {
  display: grid;
  grid-template-columns: 1.2fr .7fr 1fr;
  gap: 10px;
  margin-top: 13px;
  padding-top: 12px;
  border-top: 1px solid rgba(94,48,35,.08);
}

.cartao-resumo-info > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cartao-resumo-info span {
  color: #aa9d94;
  font-size: .4rem;
  font-weight: 800;
  letter-spacing: .7px;
}

.cartao-resumo-info strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .57rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cartao-resumo-info strong.sem-juros {
  color: #58724d;
}

.resumo-produtos {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 15px 17px;
}

.resumo-produto {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  color: #77675d;
  font-size: .63rem;
}

.resumo-produto > div {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.resumo-produto > div span {
  color: #b89764;
  font-weight: 900;
}

.resumo-produto > div strong {
  overflow: hidden;
  color: #77675d;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resumo-produto b {
  color: #5e3023;
  white-space: nowrap;
}

.retirada {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 14px 17px;
  padding: 12px;
  border-radius: 14px;
  background: #f6efe5;
}

.retirada-icon {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  background: #eadcc9;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.retirada div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.retirada span {
  color: #b89764;
  font-size: .43rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.retirada strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: .86rem;
  font-weight: 400;
}

.retirada small {
  color: #988a80;
  font-size: .51rem;
}

.total-recibo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 17px;
  background: #5e3023;
}

.total-recibo div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-recibo span {
  color: white;
  font-size: .62rem;
  font-weight: 900;
}

.total-recibo small {
  color: rgba(255,255,255,.48);
  font-size: .5rem;
}

.total-recibo > strong {
  color: #e1c98f;
  font-size: 1.3rem;
}

.acoes {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.acoes.dois {
  justify-content: space-between;
  gap: 10px;
}

.btn-principal,
.btn-secundario,
.btn-confirmar {
  min-height: 48px;
  padding: 0 19px;
  border: none;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  cursor: pointer;
  font-family: inherit;
  font-size: .69rem;
  font-weight: 900;
  transition: .25s ease;
}

.btn-principal {
  min-width: 138px;
  background: #5e3023;
  color: white;
}

.btn-principal i {
  color: #e1c98f;
}

.btn-principal:hover {
  background: #754333;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(94,48,35,.15);
}

.btn-secundario {
  background: #f2ede7;
  color: #6d5c51;
}

.btn-secundario:hover {
  background: #e8dfd5;
}

.btn-confirmar {
  min-width: 165px;
  background: #b89764;
  color: white;
}

.btn-confirmar:hover {
  background: #9f814f;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(159,129,79,.18);
}

.checkout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 25px;
  color: #aa9d94;
  font-size: .52rem;
  letter-spacing: .4px;
}

.checkout-footer i {
  color: #b89764;
  font-size: 8px;
}

.animate-fade {
  animation: fadeIn .35s ease;
}

.finalizacao-page {
  position: relative;
  z-index: 5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 18px;
  box-sizing: border-box;
}

.finalizacao-card {
  width: 100%;
  max-width: 510px;
  padding: 42px 35px;
  border: 1px solid rgba(94,48,35,.07);
  border-radius: 32px;
  background: rgba(255,255,255,.97);
  text-align: center;
  box-shadow: 0 25px 70px rgba(94,48,35,.11);
  animation: finalizacaoEntrada .5s ease;
}

.finalizacao-label {
  display: block;
  margin-top: 16px;
  color: #b89764;
  font-size: .52rem;
  font-weight: 900;
  letter-spacing: 2px;
}

.finalizacao-card h1 {
  margin: 9px 0 10px;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2rem,6vw,2.6rem);
  font-weight: 400;
  line-height: 1.08;
}

.finalizacao-card > p {
  max-width: 390px;
  margin: 0 auto;
  color: #95867c;
  font-size: .7rem;
  line-height: 1.65;
}

.processando-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 24px;
  background: #f4eadc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #dfcfb6;
  border-top-color: #5e3023;
  border-radius: 50%;
  animation: girar .8s linear infinite;
}

.processando-detalhes {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 10px;
  margin-top: 25px;
}

.processando-detalhes > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  border-radius: 15px;
  background: #faf6f0;
}

.processando-detalhes span {
  color: #a3968c;
  font-size: .43rem;
  font-weight: 900;
  letter-spacing: .9px;
}

.processando-detalhes strong {
  color: #5e3023;
  font-size: .65rem;
}

.processando-barra {
  height: 4px;
  margin-top: 22px;
  overflow: hidden;
  border-radius: 20px;
  background: #eee5da;
}

.processando-barra div {
  width: 45%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#5e3023,#b89764);
  animation: carregar 2.1s ease forwards;
}

.processando-card small {
  display: block;
  margin-top: 13px;
  color: #aaa099;
  font-size: .53rem;
}

.sucesso-icon {
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 25px;
  background: #5e3023;
  color: #e1c98f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 14px 32px rgba(94,48,35,.17);
  animation: sucessoPop .6s ease;
}

.sucesso-resumo {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 9px;
  margin-top: 25px;
  text-align: left;
}

.sucesso-resumo-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 15px;
  background: #faf6f0;
}

.sucesso-resumo-item span {
  color: #a3968c;
  font-size: .42rem;
  font-weight: 900;
  letter-spacing: .9px;
}

.sucesso-resumo-item strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .64rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sucesso-resumo-item.total {
  grid-column: 1 / -1;
  background: #5e3023;
}

.sucesso-resumo-item.total span {
  color: rgba(255,255,255,.55);
}

.sucesso-resumo-item.total strong {
  color: #e1c98f;
  font-size: 1.1rem;
}

.sucesso-mensagem {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 18px 0;
  padding: 12px;
  border-radius: 14px;
  background: #f8f2e9;
  color: #8f7960;
  font-size: .58rem;
}

.sucesso-mensagem i {
  color: #b89764;
}

.btn-finalizacao {
  width: 100%;
  min-height: 50px;
  padding: 0 20px;
  border: none;
  border-radius: 15px;
  background: #5e3023;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-family: inherit;
  font-size: .69rem;
  font-weight: 900;
  transition: .25s ease;
}

.btn-finalizacao i {
  color: #e1c98f;
}

.btn-finalizacao:hover {
  background: #754333;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(94,48,35,.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

@keyframes carregar {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

@keyframes finalizacaoEntrada {
  from {
    opacity: 0;
    transform: translateY(18px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes sucessoPop {
  0% {
    opacity: 0;
    transform: scale(.65);
  }

  70% {
    transform: scale(1.08);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width:600px) {
  .checkout-page {
    padding-bottom: 35px;
  }

  .checkout-header {
    min-height: 155px;
    padding: 25px 58px;
  }

  .btn-voltar,
  .seguro-badge {
    top: 20px;
  }

  .btn-voltar {
    left: 16px;
    width: 40px;
    height: 40px;
  }

  .seguro-badge {
    right: 16px;
    height: 40px;
    padding: 0 10px;
  }

  .header-brand h1 {
    font-size: 2rem;
  }

  .header-brand p {
    font-size: .62rem;
  }

  .checkout-container {
    padding: 0 12px;
  }

  .progresso-card {
    padding: 17px 15px 15px;
    border-radius: 20px;
  }

  .checkout-card {
    padding: 18px;
    border-radius: 23px;
  }

  .section-heading {
    gap: 10px;
  }

  .section-icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
  }

  .section-heading h2 {
    font-size: 1.35rem;
  }

  .heading-description {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 16px;
  }

  .produto-checkout {
    gap: 9px;
    padding: 8px;
  }

  .produto-imagem {
    width: 55px;
    height: 55px;
    border-radius: 13px;
  }

  .produto-info h3 {
    font-size: .88rem;
  }

  .produto-info p {
    font-size: .57rem;
  }

  .produto-total {
    font-size: .68rem;
  }

  .total-card {
    padding: 14px;
  }

  .total-valor strong {
    font-size: 1.15rem;
  }

  .area-cartao {
    margin-top: 15px;
    padding: 15px 9px 11px;
    border-radius: 19px;
  }

  .cartao-topo {
    align-items: flex-start;
    margin-bottom: 7px;
  }

  .cartao-seguranca {
    padding: 5px 7px;
    font-size: .43rem;
  }

  .cliente-resumo {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .cartao-resumo-info {
    grid-template-columns: 1fr 1fr;
  }

  .cartao-resumo-info > div:last-child {
    grid-column: 1 / -1;
  }

  .acoes.dois {
    flex-direction: column-reverse;
  }

  .acoes.dois button {
    width: 100%;
  }

  .btn-principal,
  .btn-secundario,
  .btn-confirmar {
    width: 100%;
  }

  .resumo-produto {
    font-size: .58rem;
  }

  .retirada {
    align-items: flex-start;
  }

  .finalizacao-page {
    padding: 20px 12px;
  }

  .finalizacao-card {
    padding: 32px 20px;
    border-radius: 26px;
  }

  .finalizacao-card h1 {
    font-size: 2rem;
  }

  .processando-detalhes {
    grid-template-columns: 1fr;
  }

  .sucesso-resumo {
    grid-template-columns: 1fr;
  }

  .sucesso-resumo-item.total {
    grid-column: auto;
  }
}

@media (min-width:601px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

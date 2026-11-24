<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(
  /\/+$/,
  "",
);

const adminUsername = ref(localStorage.getItem("adminUsername") || "Administrador");

const carregando = ref(true);
const erro = ref("");
const ultimaAtualizacao = ref(null);

const resumo = ref({
  produtos: 0,
  categorias: 0,
  encomendas: 0,
  compras: 0,
  usuarios: 0,
  cupons: null,
  pendentes: 0,
  encomendas_pendentes: 0,
  pagamentos_confirmados: 0,
  concluidas: 0,
  ticket_medio: 0,
});

const grafico = ref([]);
const ultimasEncomendas = ref([]);
const produtosMaisVendidos = ref([]);
const alertas = ref([]);

let intervaloAtualizacao = null;

const tokenAdmin = () => localStorage.getItem("adminToken");

const headersAdmin = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${tokenAdmin()}`,
});

const primeiroNome = computed(() => {
  return adminUsername.value.trim().split(/\s+/)[0] || "Administrador";
});

const dataAtual = computed(() => {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
});

const maiorValorGrafico = computed(() => {
  return Math.max(1, ...grafico.value.map((item) => Number(item.encomendas || 0)));
});

const pontosGrafico = computed(() => {
  const largura = 600;
  const altura = 210;
  const margemX = 28;
  const margemY = 20;
  const areaAltura = altura - margemY * 2;
  const areaLargura = largura - margemX * 2;

  if (!grafico.value.length) return "";

  return grafico.value
    .map((item, index) => {
      const x =
        margemX +
        (grafico.value.length === 1
          ? areaLargura / 2
          : (index * areaLargura) / (grafico.value.length - 1));

      const y =
        altura - margemY - (Number(item.encomendas || 0) / maiorValorGrafico.value) * areaAltura;

      return `${x},${y}`;
    })
    .join(" ");
});

const areaGrafico = computed(() => {
  if (!pontosGrafico.value) return "";

  const pontos = pontosGrafico.value.split(" ");
  const primeiro = pontos[0].split(",");
  const ultimo = pontos[pontos.length - 1].split(",");

  return `${primeiro[0]},190 ${pontosGrafico.value} ${ultimo[0]},190`;
});

const totalEncomendasGrafico = computed(() => {
  return grafico.value.reduce((total, item) => total + Number(item.encomendas || 0), 0);
});

const faturamentoGrafico = computed(() => {
  return grafico.value.reduce((total, item) => total + Number(item.faturamento || 0), 0);
});

const maiorVendaProduto = computed(() => {
  return Math.max(1, ...produtosMaisVendidos.value.map((item) => Number(item.quantidade || 0)));
});

const indicadores = computed(() => [
  {
    id: "produtos",
    titulo: "Produtos",
    descricao: "Itens cadastrados no catálogo",
    valor: resumo.value.produtos,
    icone: "fa-bread-slice",
    cor: "terracota",
    rota: "/admin/produtos",
  },
  {
    id: "encomendas",
    titulo: "Encomendas",
    descricao: "Total de pedidos registrados",
    valor: resumo.value.encomendas,
    icone: "fa-receipt",
    cor: "dourado",
    rota: "/admin/encomendas",
  },
  {
    id: "compras",
    titulo: "Compras",
    descricao: "Total de pedidos feitos pelo carrinho",
    valor: resumo.value.compras,
    icone: "fa-bag-shopping",
    cor: "terracota",
    rota: "/admin/compras",
  },
  {
    id: "usuarios",
    titulo: "Usuários",
    descricao: "Contas cadastradas",
    valor: resumo.value.usuarios,
    icone: "fa-users",
    cor: "oliva",
    rota: "/admin/usuarios",
  },
  {
    id: "cupons",
    titulo: "Cupons de fidelidade",
    descricao:
      resumo.value.cupons === null
        ? "Aguardando integração com a API"
        : "Cupons registrados no sistema",
    valor: resumo.value.cupons,
    icone: "fa-ticket",
    cor: "dourado",
    rota: null,
  },
  {
    id: "pendentes",
    titulo: "Aguardando pagamento",
    descricao: "Compras sem pagamento confirmado",
    valor: resumo.value.pendentes,
    icone: "fa-clock",
    cor: "terracota",
    rota: "/admin/compras",
  },
  {
    id: "confirmados",
    titulo: "Pagamentos confirmados",
    descricao: "Compras com pagamento verificado",
    valor: resumo.value.pagamentos_confirmados,
    icone: "fa-circle-check",
    cor: "oliva",
    rota: "/admin/compras",
  },
  {
    id: "encomendas_pendentes",
    titulo: "Encomendas pendentes",
    descricao: "Pedidos aguardando atendimento",
    valor: resumo.value.encomendas_pendentes,
    icone: "fa-hourglass-half",
    cor: "terracota",
    rota: "/admin/encomendas",
  },
  {
    id: "concluidas",
    titulo: "Encomendas concluídas",
    descricao: "Pedidos finalizados ou entregues",
    valor: resumo.value.concluidas,
    icone: "fa-check-double",
    cor: "oliva",
    rota: "/admin/encomendas",
  },
]);

const formatarMoeda = (valor) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatarData = (data) => {
  if (!data) return "—";

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dataConvertida);
};

const formatarQuantidade = (valor) => {
  if (valor === null || valor === undefined) return "—";
  return Number(valor || 0).toLocaleString("pt-BR");
};

const navegar = (rota) => {
  if (rota) router.push(rota);
};

const normalizarTexto = (valor) => {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
};

const obterStatusCompra = (compra) => {
  return compra?.status ?? compra?.status_encomenda ?? compra?.situacao ?? compra?.estado ?? "";
};

const normalizarStatusEncomenda = (compra) => {
  const status = normalizarTexto(obterStatusCompra(compra));

  const equivalencias = {
    aguardando: "pendente",
    recebido: "pendente",
    em_aberto: "pendente",
    em_preparacao: "preparando",
    em_preparo: "preparando",
    preparando: "preparando",
    pronto_para_retirada: "pronto",
    concluido: "finalizado",
    concluida: "finalizado",
    entregue: "finalizado",
    finalizada: "finalizado",
    finalizado: "finalizado",
    cancelada: "cancelado",
  };

  return equivalencias[status] || status;
};

const normalizarStatusVisual = (status) => {
  const valor = normalizarTexto(status);

  if (valor.includes("conclu") || valor.includes("finaliz") || valor.includes("entreg")) {
    return "concluida";
  }

  if (valor.includes("cancel")) {
    return "cancelada";
  }

  if (valor.includes("pend") || valor.includes("aguard") || valor.includes("prepar")) {
    return "pendente";
  }

  return "andamento";
};

const normalizarLista = (dados) => {
  if (Array.isArray(dados)) return dados;

  if (Array.isArray(dados?.results)) return dados.results;
  if (Array.isArray(dados?.compras)) return dados.compras;
  if (Array.isArray(dados?.encomendas)) return dados.encomendas;
  if (Array.isArray(dados?.pedidos)) return dados.pedidos;
  if (Array.isArray(dados?.data)) return dados.data;
  if (Array.isArray(dados?.data?.results)) return dados.data.results;

  return [];
};

/*
 * Normaliza os produtos que chegam da API.
 * O ranking é ordenado pela quantidade real informada pelo backend.
 */
const normalizarProdutosMaisVendidos = (lista) => {
  if (!Array.isArray(lista)) return [];

  return lista
    .map((produto) => ({
      ...produto,
      id: produto.id ?? produto.produto_id ?? produto.id_produto,
      nome:
        produto.nome ?? produto.produto_nome ?? produto.titulo ?? produto.nome_produto ?? "Produto",
      quantidade: Number(
        produto.quantidade ??
          produto.total_vendido ??
          produto.quantidade_vendida ??
          produto.vendas ??
          produto.total ??
          0,
      ),
    }))
    .filter((produto) => Number.isFinite(produto.quantidade) && produto.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);
};

const carregarResumoCompras = async () => {
  const resposta = await fetch(`${API_URL}/compras/admin/`, {
    method: "GET",
    headers: headersAdmin(),
  });

  const dados = await resposta.json().catch(() => []);

  if (resposta.status === 401 || resposta.status === 403) {
    throw new Error("SESSAO_EXPIRADA");
  }

  if (!resposta.ok) {
    throw new Error(
      dados.detail || dados.erro || "Não foi possível carregar os dados das compras.",
    );
  }

  const compras = normalizarLista(dados).filter((compra) => compra && typeof compra === "object");

  const statusNormalizados = compras.map((compra) => ({
    compra,
    status: normalizarStatusEncomenda(compra),
  }));

  resumo.value.compras = compras.length;

  resumo.value.pendentes = compras.filter((compra) => {
    return !Boolean(compra.pagamento_confirmado);
  }).length;

  resumo.value.pagamentos_confirmados = compras.filter((compra) => {
    return Boolean(compra.pagamento_confirmado);
  }).length;

  resumo.value.encomendas_pendentes = statusNormalizados.filter((item) => {
    return item.status === "pendente";
  }).length;

  resumo.value.concluidas = statusNormalizados.filter((item) => {
    return item.status === "finalizado";
  }).length;
};

const carregarDashboard = async () => {
  carregando.value = true;
  erro.value = "";

  try {
    const token = tokenAdmin();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const resposta = await fetch(`${API_URL}/admin/dashboard/`, {
      method: "GET",
      headers: headersAdmin(),
    });

    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error("SESSAO_EXPIRADA");
    }

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os dados do dashboard.");
    }

    const dados = await resposta.json();

    resumo.value = {
      ...resumo.value,
      ...(dados.resumo || {}),
    };

    await carregarResumoCompras();

    grafico.value = Array.isArray(dados.grafico) ? dados.grafico : [];

    ultimasEncomendas.value = normalizarLista(dados.ultimas_encomendas).map((compra) => ({
      ...compra,
      id: compra.id ?? compra.idCompra ?? compra.id_compra,
      cliente: compra.cliente ?? compra.nome_cliente ?? compra.nome ?? "Cliente",
      data: compra.data ?? compra.criado_em ?? compra.data_compra ?? compra.created_at,
      pagamento:
        compra.pagamento ?? compra.forma_pagamento ?? compra.formaPagamento ?? "Não informado",
      total: Number(compra.total ?? compra.valor_total ?? compra.total_compra ?? 0),
      status: compra.status ?? compra.status_encomenda ?? compra.situacao ?? "Em andamento",
    }));

    /*
     * Aqui está a correção do ranking:
     * recebe o ranking calculado pelo Django, normaliza,
     * ordena e apresenta somente os cinco mais vendidos.
     */
    produtosMaisVendidos.value = normalizarProdutosMaisVendidos(dados.produtos_mais_vendidos);

    alertas.value = Array.isArray(dados.alertas) ? dados.alertas : [];

    resumo.value.cupons =
      dados.resumo?.cupons !== undefined && dados.resumo?.cupons !== null
        ? Number(dados.resumo.cupons)
        : null;

    ultimaAtualizacao.value = new Date();
  } catch (error) {
    if (error.message === "SESSAO_EXPIRADA") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefresh");
      localStorage.removeItem("adminUsername");

      router.replace("/admin/login");
      return;
    }

    erro.value = error.message || "Erro ao conectar com o servidor.";
  } finally {
    carregando.value = false;
  }
};

const iniciarAtualizacaoAutomatica = () => {
  intervaloAtualizacao = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      carregarDashboard();
    }
  }, 60000);
};

onMounted(() => {
  carregarDashboard();
  iniciarAtualizacaoAutomatica();
});

onUnmounted(() => {
  if (intervaloAtualizacao) {
    window.clearInterval(intervaloAtualizacao);
  }
});
</script>

<template>
  <main class="dashboard">
    <section class="hero-admin">
      <div class="hero-textura"></div>
      <div class="hero-circulo hero-circulo-1"></div>
      <div class="hero-circulo hero-circulo-2"></div>

      <div class="hero-conteudo">
        <div class="hero-esquerda">
          <div class="status-admin">
            <span class="status-ponto"></span>
            PAINEL ADMINISTRATIVO
          </div>

          <p class="saudacao">Bem-vindo, {{ primeiroNome }}.</p>

          <h1>
            A tradição de hoje,
            <em>o sucesso de amanhã.</em>
          </h1>

          <p class="hero-descricao">
            Sua padaria, sua história, sua gestão. Tudo começa com cuidado em cada detalhe.
          </p>

          <div class="hero-data">
            <i class="fa-regular fa-calendar"></i>
            {{ dataAtual }}
          </div>

          <button type="button" class="hero-botao" @click="navegar('/admin/produtos')">
            Gerenciar cardápio
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div class="hero-direita" aria-hidden="true">
          <div class="selo-circular selo-externo"></div>
          <div class="selo-circular selo-meio"></div>
          <div class="selo-circular selo-interno"></div>

          <div class="simbolo-padaria">
            <i class="fa-solid fa-bread-slice"></i>
          </div>

          <span class="estrela estrela-1">✦</span>
          <span class="estrela estrela-2">✧</span>

          <div class="etiqueta-artesanal">
            <span class="etiqueta-icone">
              <i class="fa-solid fa-heart"></i>
            </span>
            <span>
              <strong>Padaria Martins</strong>
              <small>Feito com carinho</small>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="secao-visao">
      <div class="secao-cabecalho">
        <div>
          <span class="eyebrow">VISÃO GERAL</span>
          <h2>Seu negócio em um só lugar.</h2>
          <p>Indicadores atualizados diretamente do banco de dados.</p>
        </div>

        <button
          type="button"
          class="btn-atualizar"
          :disabled="carregando"
          @click="carregarDashboard"
        >
          <i class="fa-solid fa-rotate" :class="{ girando: carregando }"></i>
          Atualizar
        </button>
      </div>

      <div v-if="erro" class="erro-dashboard">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ erro }}</span>

        <button type="button" @click="carregarDashboard">Tentar novamente</button>
      </div>

      <div class="metricas">
        <button
          v-for="item in indicadores"
          :key="item.id"
          type="button"
          class="metrica"
          :class="`metrica-${item.cor}`"
          @click="navegar(item.rota)"
        >
          <div class="metrica-topo">
            <span class="metrica-icone">
              <i :class="`fa-solid ${item.icone}`"></i>
            </span>
            <span class="metrica-detalhe">INDICADOR</span>
          </div>

          <div class="metrica-conteudo">
            <span v-if="carregando" class="valor-carregando"></span>

            <strong v-else>
              {{
                item.valor === null || item.valor === undefined
                  ? "—"
                  : formatarQuantidade(item.valor)
              }}
            </strong>

            <h3>{{ item.titulo }}</h3>
            <p>{{ item.descricao }}</p>
          </div>

          <div class="metrica-rodape">
            <span>
              {{ item.rota ? "Acessar área" : "Indicador informativo" }}
            </span>
            <i
              :class="
                item.rota ? 'fa-solid fa-arrow-up-right-from-square' : 'fa-solid fa-chart-line'
              "
            ></i>
          </div>
        </button>
      </div>
    </section>

    <section class="painel-grafico">
      <div class="grafico-cabecalho">
        <div>
          <span class="eyebrow">DESEMPENHO</span>
          <h2>Movimento de encomendas</h2>
          <p>Quantidade de compras registradas nos últimos meses.</p>
        </div>

        <span class="grafico-legenda">
          <i></i>
          Encomendas
        </span>
      </div>

      <div v-if="carregando" class="grafico-carregando">
        <i class="fa-solid fa-chart-line"></i>
        Carregando dados do gráfico...
      </div>

      <div v-else-if="!grafico.length" class="grafico-vazio">
        <i class="fa-solid fa-chart-column"></i>
        <strong>Sem dados para exibir</strong>
        <span> Assim que houver registros, o gráfico aparecerá aqui. </span>
      </div>

      <div v-else class="grafico-area">
        <svg
          class="grafico-svg"
          viewBox="0 0 600 210"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de encomendas"
        >
          <line
            v-for="linha in [20, 62, 104, 146, 190]"
            :key="linha"
            x1="28"
            :y1="linha"
            x2="572"
            :y2="linha"
            class="linha-grade"
          />

          <polygon :points="areaGrafico" class="grafico-preenchimento" />

          <polyline :points="pontosGrafico" class="grafico-linha" />

          <circle
            v-for="(ponto, index) in pontosGrafico.split(' ')"
            :key="index"
            :cx="Number(ponto.split(',')[0])"
            :cy="Number(ponto.split(',')[1])"
            r="5"
            class="grafico-ponto"
          />
        </svg>

        <div
          class="grafico-meses"
          :style="{
            gridTemplateColumns: `repeat(${grafico.length}, minmax(0, 1fr))`,
          }"
        >
          <span v-for="(item, index) in grafico" :key="index">
            {{ item.mes }}
          </span>
        </div>

        <div class="grafico-resumo">
          <div>
            <span>Total no período</span>
            <strong>
              {{ formatarQuantidade(totalEncomendasGrafico) }}
              encomendas
            </strong>
          </div>

          <div>
            <span>Faturamento no período</span>
            <strong>{{ formatarMoeda(faturamentoGrafico) }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="painel-produtos">
      <div class="secao-bloco-cabecalho">
        <div>
          <span class="eyebrow">DESTAQUES DO CATÁLOGO</span>
          <h2>Produtos mais vendidos</h2>
          <p>Os produtos com maior quantidade de vendas.</p>
        </div>

        <button type="button" class="link-encomendas" @click="navegar('/admin/produtos')">
          Ver catálogo
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div v-if="carregando" class="estado-lista">Carregando produtos...</div>

      <div v-else-if="!produtosMaisVendidos.length" class="estado-lista">
        <i class="fa-solid fa-basket-shopping"></i>
        <strong>Nenhum produto em destaque.</strong>
        <span>Os produtos mais vendidos aparecerão aqui.</span>
      </div>

      <div v-else class="ranking-produtos">
        <div
          v-for="(produto, index) in produtosMaisVendidos"
          :key="produto.id || produto.nome || index"
          class="ranking-item"
        >
          <span class="ranking-posicao">
            {{ String(index + 1).padStart(2, "0") }}
          </span>

          <div class="ranking-info">
            <div class="ranking-titulo">
              <strong>{{ produto.nome || "Produto" }}</strong>
              <span> {{ formatarQuantidade(produto.quantidade) }} vendidos </span>
            </div>

            <div class="ranking-barra">
              <span
                :style="{
                  width: `${Math.min(
                    100,
                    (Number(produto.quantidade || 0) / maiorVendaProduto) * 100,
                  )}%`,
                }"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="painel-alertas">
      <div class="secao-bloco-cabecalho">
        <div>
          <span class="eyebrow">ATENÇÃO</span>
          <h2>Avisos administrativos</h2>
          <p>Pontos que podem precisar da sua atenção.</p>
        </div>

        <span class="alertas-contagem"> {{ alertas.length }} avisos </span>
      </div>

      <div v-if="carregando" class="estado-lista">Verificando avisos...</div>

      <div v-else-if="!alertas.length" class="alerta-vazio">
        <span class="alerta-vazio-icone">
          <i class="fa-solid fa-check"></i>
        </span>
        <div>
          <strong>Tudo em ordem!</strong>
          <span>Não há avisos administrativos no momento.</span>
        </div>
      </div>

      <div v-else class="lista-alertas">
        <div
          v-for="(alerta, index) in alertas"
          :key="alerta.id || index"
          class="alerta-item"
          :class="`alerta-${alerta.tipo || 'info'}`"
        >
          <span class="alerta-icone">
            <i :class="alerta.icone ? `fa-solid ${alerta.icone}` : 'fa-solid fa-circle-info'"></i>
          </span>

          <div>
            <strong>{{ alerta.titulo || "Aviso" }}</strong>
            <p>{{ alerta.mensagem || "" }}</p>
          </div>

          <button v-if="alerta.rota" type="button" @click="navegar(alerta.rota)">
            Ver
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>

    <section class="ultimas-section">
      <div class="ultimas-cabecalho">
        <div>
          <span class="eyebrow">ACOMPANHAMENTO</span>
          <h2>Últimas encomendas</h2>
          <p>Os pedidos mais recentes registrados.</p>
        </div>

        <button type="button" class="link-encomendas" @click="navegar('/admin/encomendas')">
          Ver todas
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div v-if="carregando" class="estado-lista">Carregando encomendas...</div>

      <div v-else-if="!ultimasEncomendas.length" class="estado-lista">
        <i class="fa-regular fa-clipboard"></i>
        <strong>Nenhuma encomenda registrada ainda.</strong>
        <span> Quando uma encomenda for realizada, ela aparecerá aqui. </span>
      </div>

      <div v-else class="tabela-encomendas">
        <div v-for="compra in ultimasEncomendas" :key="compra.id" class="encomenda-linha">
          <div class="encomenda-icone">
            <i class="fa-solid fa-receipt"></i>
          </div>

          <div class="encomenda-cliente">
            <strong>{{ compra.cliente || "Cliente" }}</strong>
            <small> Pedido #{{ compra.id }} · {{ formatarData(compra.data) }} </small>
          </div>

          <span class="status-encomenda" :class="`status-${normalizarStatusVisual(compra.status)}`">
            {{ compra.status || "Em andamento" }}
          </span>

          <div class="encomenda-pagamento">
            {{ compra.pagamento || "Não informado" }}
          </div>

          <strong class="encomenda-total">
            {{ formatarMoeda(compra.total) }}
          </strong>
        </div>
      </div>
    </section>

    <footer class="dashboard-footer">
      <span></span>

      <div>
        <i class="fa-solid fa-heart"></i>
        PADARIA MARTINS
      </div>

      <span></span>

      <small v-if="ultimaAtualizacao">
        Atualizado às
        {{
          ultimaAtualizacao.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </small>
    </footer>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap");

* {
  box-sizing: border-box;
}

.dashboard {
  --cafe: #5e3023;
  --cafe-escuro: #38251c;
  --dourado: #b89764;
  --dourado-claro: #e1c98f;
  --texto: #493327;
  --suave: #978677;
  --borda: #eee4d8;

  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding-bottom: 25px;
  color: var(--texto);
  font-family: "DM Sans", sans-serif;
}

/* HERO */

.hero-admin {
  position: relative;
  isolation: isolate;
  min-height: 340px;
  padding: 30px 34px 0;
  overflow: hidden;
  border-radius: 26px;
  background:
    radial-gradient(circle at 82% 35%, rgba(205, 177, 126, 0.18), transparent 27%),
    linear-gradient(118deg, #38251c, #543426 57%, #70482f);
  color: #fffaf3;
  box-shadow: 0 22px 55px rgba(65, 39, 25, 0.12);
}

.hero-textura {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image: radial-gradient(rgba(255, 245, 225, 0.5) 0.7px, transparent 0.7px);
  background-size: 15px 15px;
  opacity: 0.1;
}

.hero-circulo {
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(230, 204, 159, 0.11);
  border-radius: 50%;
}

.hero-circulo-1 {
  width: 420px;
  height: 420px;
  top: -210px;
  right: 3%;
}

.hero-circulo-2 {
  width: 320px;
  height: 320px;
  top: -160px;
  right: 7%;
}

.hero-conteudo {
  display: flex;
  min-height: 305px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-esquerda {
  position: relative;
  z-index: 2;
  max-width: 690px;
  padding-bottom: 25px;
}

.status-admin {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 12px;
  border: 1px solid rgba(231, 211, 177, 0.2);
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.055);
  color: #e4c998;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.status-ponto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d7c08e;
}

.saudacao {
  margin: 22px 0 10px;
  color: #ddc7a8;
  font-size: 0.86rem;
}

.hero-esquerda h1 {
  margin: 0;
  color: #fffaf3;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  font-weight: 500;
  line-height: 1.12;
}

.hero-esquerda h1 em {
  display: block;
  color: #dfc28d;
  font-weight: 500;
}

.hero-descricao {
  max-width: 480px;
  margin: 16px 0 12px;
  color: rgba(255, 250, 243, 0.7);
  font-size: 0.84rem;
  line-height: 1.75;
}

.hero-data {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 19px;
  color: #dfc9aa;
  font-size: 0.7rem;
  text-transform: capitalize;
}

.hero-botao {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  gap: 18px;
  padding: 0 19px;
  border: 0;
  border-radius: 13px;
  background: #e1c98f;
  color: #442c1e;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
}

.hero-botao:hover {
  transform: translateY(-3px);
  background: #f0d6a5;
}

.hero-direita {
  position: relative;
  display: flex;
  width: 280px;
  min-width: 230px;
  height: 250px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.selo-circular {
  position: absolute;
  border: 1px solid rgba(225, 201, 143, 0.18);
  border-radius: 50%;
}

.selo-externo {
  width: 245px;
  height: 245px;
}

.selo-meio {
  width: 205px;
  height: 205px;
  border-style: dashed;
}

.selo-interno {
  width: 165px;
  height: 165px;
  border: 8px solid rgba(225, 201, 143, 0.15);
  background: linear-gradient(145deg, #d4aa70, #986943);
  box-shadow: 0 20px 40px rgba(25, 14, 8, 0.18);
}

.simbolo-padaria {
  position: relative;
  z-index: 2;
  display: grid;
  width: 118px;
  height: 118px;
  place-items: center;
  color: #fff2d9;
  font-size: 3.1rem;
}

.estrela {
  position: absolute;
  color: #e1c98f;
}

.estrela-1 {
  top: 26px;
  left: 17px;
}

.estrela-2 {
  right: 14px;
  bottom: 51px;
  font-size: 1.5rem;
}

.etiqueta-artesanal {
  position: absolute;
  right: -5px;
  bottom: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border-radius: 15px;
  background: rgba(45, 28, 19, 0.85);
}

.etiqueta-icone {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 10px;
  background: rgba(225, 201, 143, 0.16);
  color: #e1c98f;
}

.etiqueta-artesanal > span:last-child {
  display: grid;
  gap: 4px;
}

.etiqueta-artesanal strong {
  font-size: 0.66rem;
}

.etiqueta-artesanal small {
  color: rgba(255, 250, 243, 0.6);
  font-size: 0.58rem;
}

/* CABEÇALHOS */

.secao-visao {
  margin-top: 40px;
}

.secao-cabecalho,
.grafico-cabecalho,
.ultimas-cabecalho,
.secao-bloco-cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 19px;
}

.eyebrow {
  display: block;
  color: #b89764;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.secao-cabecalho h2,
.grafico-cabecalho h2,
.ultimas-cabecalho h2,
.secao-bloco-cabecalho h2 {
  margin: 8px 0 7px;
  color: #503427;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(1.55rem, 2.6vw, 2.1rem);
  font-weight: 500;
}

.secao-cabecalho p,
.grafico-cabecalho p,
.ultimas-cabecalho p,
.secao-bloco-cabecalho p {
  margin: 0;
  color: #988777;
  font-size: 0.8rem;
}

.btn-atualizar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border: 1px solid #eadfce;
  border-radius: 12px;
  background: #fff;
  color: #805e3e;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-atualizar:hover {
  border-color: var(--dourado);
  background: #fcf8f1;
}

.btn-atualizar:disabled {
  opacity: 0.6;
  cursor: wait;
}

.girando {
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

/* ERRO */

.erro-dashboard {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 13px 15px;
  border: 1px solid #e8c7bd;
  border-radius: 13px;
  background: #fff5f1;
  color: #944a3c;
  font-size: 0.75rem;
}

.erro-dashboard button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #743629;
  font-weight: 800;
  cursor: pointer;
}

/* INDICADORES */

.metricas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metrica {
  display: flex;
  min-width: 0;
  min-height: 190px;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #eee4d8;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  color: var(--texto);
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(65, 43, 28, 0.035);
  transition: 0.25s ease;
}

.metrica:hover {
  transform: translateY(-4px);
  border-color: #ddc9ad;
  box-shadow: 0 16px 35px rgba(65, 43, 28, 0.08);
}

.metrica-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metrica-icone {
  display: grid;
  width: 45px;
  height: 45px;
  place-items: center;
  border-radius: 14px;
  font-size: 1rem;
}

.metrica-terracota .metrica-icone {
  background: #f3e5dc;
  color: #8b4c38;
}

.metrica-dourado .metrica-icone {
  background: #f5ecda;
  color: #a9824e;
}

.metrica-oliva .metrica-icone {
  background: #eaf0e5;
  color: #6d805f;
}

.metrica-detalhe {
  color: #c1ad94;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.metrica-conteudo {
  flex: 1;
  padding: 15px 0;
}

.metrica-conteudo > strong {
  display: block;
  overflow-wrap: anywhere;
  color: #53392a;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 2rem;
}

.metrica-conteudo h3 {
  margin: 5px 0;
  color: #53392a;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.15rem;
}

.metrica-conteudo p {
  margin: 0;
  color: #998979;
  font-size: 0.68rem;
}

.valor-carregando {
  display: block;
  width: 75px;
  height: 31px;
  border-radius: 8px;
  background: #f0e9df;
  animation: pulsar 1s ease infinite alternate;
}

@keyframes pulsar {
  to {
    opacity: 0.45;
  }
}

.metrica-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f1e9df;
  color: #9d8261;
  font-size: 0.64rem;
  font-weight: 700;
}

/* PAINÉIS */

.painel-grafico,
.painel-produtos,
.painel-alertas,
.ultimas-section {
  margin-top: 25px;
  padding: 25px;
  border: 1px solid #eee4d8;
  border-radius: 23px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 10px 32px rgba(65, 43, 28, 0.035);
}

/* GRÁFICO */

.grafico-cabecalho {
  align-items: center;
}

.grafico-cabecalho h2,
.ultimas-cabecalho h2,
.secao-bloco-cabecalho h2 {
  font-size: 1.6rem;
}

.grafico-legenda {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8d7965;
  font-size: 0.68rem;
}

.grafico-legenda i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #a8794c;
}

.grafico-area {
  padding-top: 14px;
}

.grafico-svg {
  display: block;
  width: 100%;
  height: 220px;
  overflow: visible;
}

.linha-grade {
  stroke: #eee7de;
  stroke-width: 1;
  stroke-dasharray: 4 6;
}

.grafico-preenchimento {
  fill: rgba(184, 151, 100, 0.15);
}

.grafico-linha {
  fill: none;
  stroke: #a8794c;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.grafico-ponto {
  fill: #fff;
  stroke: #a8794c;
  stroke-width: 3;
}

.grafico-meses {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  color: #9a8877;
  text-align: center;
  font-size: 0.65rem;
}

.grafico-resumo {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 22px;
  padding-top: 17px;
  border-top: 1px solid #f0e8de;
}

.grafico-resumo div {
  display: grid;
  gap: 5px;
}

.grafico-resumo span {
  color: #a18f7d;
  font-size: 0.63rem;
}

.grafico-resumo strong {
  color: #5e3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.15rem;
}

.grafico-vazio,
.grafico-carregando,
.estado-lista {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 9px;
  color: #9a8877;
  text-align: center;
  font-size: 0.78rem;
}

.grafico-vazio > i,
.grafico-carregando > i,
.estado-lista > i {
  color: #c2a477;
  font-size: 1.5rem;
}

.grafico-vazio strong,
.estado-lista strong {
  color: #634735;
}

/* PRODUTOS MAIS VENDIDOS */

.ranking-produtos {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 5px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ranking-posicao {
  display: grid;
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 11px;
  background: #f5ecdf;
  color: #987348;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 0.9rem;
}

.ranking-info {
  min-width: 0;
  flex: 1;
}

.ranking-titulo {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.ranking-titulo strong {
  overflow: hidden;
  color: #5e4231;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-titulo span {
  flex-shrink: 0;
  color: #a18f7d;
  font-size: 0.66rem;
}

.ranking-barra {
  height: 7px;
  overflow: hidden;
  border-radius: 30px;
  background: #f1eae1;
}

.ranking-barra span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #b89764, #d7bd8b);
  transition: width 0.4s ease;
}

/* ALERTAS */

.alertas-contagem {
  padding: 7px 11px;
  border-radius: 30px;
  background: #f5ecdf;
  color: #987348;
  font-size: 0.65rem;
  font-weight: 800;
}

.alerta-vazio {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
  border: 1px solid #e4ebdf;
  border-radius: 14px;
  background: #f8fbf5;
}

.alerta-vazio-icone {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #e8f0e2;
  color: #6d805f;
}

.alerta-vazio div {
  display: grid;
  gap: 5px;
}

.alerta-vazio strong {
  color: #526548;
  font-size: 0.76rem;
}

.alerta-vazio div span {
  color: #8d9b83;
  font-size: 0.68rem;
}

.lista-alertas {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alerta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border: 1px solid #eee4d8;
  border-radius: 13px;
  background: #fffdf9;
}

.alerta-icone {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 11px;
  background: #f5ecdf;
  color: #a9824e;
}

.alerta-item > div {
  min-width: 0;
  flex: 1;
}

.alerta-item strong {
  color: #624735;
  font-size: 0.74rem;
}

.alerta-item p {
  margin: 4px 0 0;
  color: #9a8877;
  font-size: 0.67rem;
}

.alerta-item button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: #987348;
  font-size: 0.67rem;
  font-weight: 800;
  cursor: pointer;
}

.alerta-aviso .alerta-icone {
  background: #fff1d8;
  color: #a87935;
}

.alerta-erro .alerta-icone {
  background: #f9e6e1;
  color: #a34d3d;
}

.alerta-sucesso .alerta-icone {
  background: #e8f0e2;
  color: #6d805f;
}

/* ENCOMENDAS */

.ultimas-section {
  margin-top: 25px;
}

.ultimas-cabecalho {
  align-items: center;
}

.link-encomendas {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #8a6746;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.link-encomendas:hover {
  color: #5e3023;
}

.tabela-encomendas {
  display: flex;
  flex-direction: column;
}

.encomenda-linha {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 0;
  border-top: 1px solid #f0e8de;
}

.encomenda-icone {
  display: grid;
  width: 41px;
  height: 41px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #f6eee2;
  color: #a9824e;
}

.encomenda-cliente {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 5px;
}

.encomenda-cliente strong {
  overflow: hidden;
  color: #53392a;
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encomenda-cliente small {
  color: #9d8c7b;
  font-size: 0.62rem;
}

.encomenda-pagamento {
  color: #9a8877;
  font-size: 0.65rem;
  text-transform: capitalize;
}

.encomenda-total {
  color: #5e3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 0.95rem;
  white-space: nowrap;
}

.status-encomenda {
  padding: 6px 9px;
  border-radius: 30px;
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-pendente {
  background: #fff1d8;
  color: #98703b;
}

.status-concluida {
  background: #e8f0e2;
  color: #637b55;
}

.status-cancelada {
  background: #f9e6e1;
  color: #a34d3d;
}

.status-andamento {
  background: #eeeaf4;
  color: #79658f;
}

/* RODAPÉ */

.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 27px 0 5px;
  color: #b09c86;
}

.dashboard-footer > span {
  width: 45px;
  height: 1px;
  background: #e7dbcc;
}

.dashboard-footer div {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.53rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.dashboard-footer i {
  color: #b89764;
}

.dashboard-footer small {
  color: #ad9a85;
  font-size: 0.58rem;
}

/* ACESSIBILIDADE */

.dashboard button:focus-visible {
  outline: 3px solid rgba(184, 151, 100, 0.65);
  outline-offset: 3px;
}

/* TABLET */

@media (max-width: 1000px) {
  .metricas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-direita {
    transform: scale(0.85);
    margin-right: -20px;
  }
}

/* MOBILE */

@media (max-width: 760px) {
  .hero-admin {
    min-height: auto;
    padding: 23px 20px 10px;
    border-radius: 21px;
  }

  .hero-conteudo {
    min-height: 0;
  }

  .hero-esquerda {
    padding-bottom: 18px;
  }

  .hero-direita {
    display: none;
  }

  .hero-esquerda h1 {
    font-size: clamp(1.9rem, 6vw, 2.6rem);
  }

  .metricas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 11px;
  }

  .metrica {
    min-height: 175px;
    padding: 15px;
  }

  .metrica-conteudo > strong {
    font-size: 1.6rem;
  }

  .painel-grafico,
  .painel-produtos,
  .painel-alertas,
  .ultimas-section {
    padding: 19px 15px;
  }
}

@media (max-width: 480px) {
  .hero-admin {
    padding: 20px 16px 8px;
  }

  .hero-esquerda h1 {
    font-size: 2rem;
  }

  .hero-descricao {
    font-size: 0.74rem;
  }

  .hero-botao {
    width: 100%;
    justify-content: space-between;
  }

  .secao-cabecalho,
  .grafico-cabecalho,
  .ultimas-cabecalho,
  .secao-bloco-cabecalho {
    align-items: flex-start;
  }

  .secao-cabecalho h2,
  .grafico-cabecalho h2,
  .ultimas-cabecalho h2,
  .secao-bloco-cabecalho h2 {
    font-size: 1.4rem;
  }

  .btn-atualizar {
    padding: 9px;
    font-size: 0;
  }

  .btn-atualizar i {
    font-size: 0.8rem;
  }

  .metricas {
    grid-template-columns: 1fr;
  }

  .metrica {
    min-height: 155px;
  }

  .grafico-svg {
    height: 170px;
  }

  .grafico-meses {
    font-size: 0.56rem;
  }

  .grafico-resumo {
    gap: 18px;
  }

  .ranking-titulo {
    align-items: flex-start;
  }

  .ranking-titulo span {
    font-size: 0.59rem;
  }

  .encomenda-linha {
    flex-wrap: wrap;
    gap: 9px;
  }

  .encomenda-cliente {
    flex-basis: calc(100% - 55px);
  }

  .status-encomenda {
    margin-left: 50px;
  }

  .encomenda-pagamento {
    display: none;
  }

  .encomenda-total {
    margin-left: auto;
    font-size: 0.82rem;
  }

  .alerta-item {
    align-items: flex-start;
  }

  .alerta-item button {
    align-self: center;
  }

  .dashboard-footer {
    flex-wrap: wrap;
  }

  .dashboard-footer > span {
    width: 25px;
  }

  .dashboard-footer small {
    flex-basis: 100%;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard *,
  .dashboard *::before,
  .dashboard *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}

.metricas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1000px) {
  .metricas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .metricas {
    grid-template-columns: 1fr;
  }
}
</style>

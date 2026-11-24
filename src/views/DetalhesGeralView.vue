
<script setup>
import {
  computed,
  onMounted,
  onBeforeUnmount,
  ref
} from 'vue';

import { useRoute, useRouter } from 'vue-router';
import '@/assets/css/detalhesView.css';
import { useFidelidade } from '@/composables/useFidelidade';

const route = useRoute();
const router = useRouter();

const {
  cupons,
  cuponsDisponiveis,
  cuponsUtilizados,
  carregando,
  erro,
  recarregar
} = useFidelidade();

const copiadoCodigo = ref('');
let temporizadorCopia = null;

const configuracoes = {
  pedidos: {
    titulo: 'Meus Pedidos',
    subtitulo: 'Tudo o que você já viveu com a gente.',
    abas: [
      {
        id: 'favoritos',
        nome: 'Favoritos',
        descricao: 'Seus queridinhos',
        icone: 'fa-heart'
      },
      {
        id: 'avaliados',
        nome: 'Avaliados',
        descricao: 'Suas avaliações',
        icone: 'fa-star'
      },
      {
        id: 'preparados',
        nome: 'Preparados',
        descricao: 'Pedidos realizados',
        icone: 'fa-utensils'
      }
    ]
  },

  carteira: {
    titulo: 'Minha Carteira',
    subtitulo: 'Vantagens especiais para você.',
    abas: [
      {
        id: 'cupons',
        nome: 'Cupons',
        descricao: 'Descontos disponíveis',
        icone: 'fa-ticket'
      },
      {
        id: 'selos',
        nome: 'Selos',
        descricao: 'Sua coleção',
        icone: 'fa-certificate'
      },
      {
        id: 'cartoes',
        nome: 'Cartões',
        descricao: 'Formas de pagamento',
        icone: 'fa-credit-card'
      }
    ]
  }
};

// =====================================================
// NAVEGAÇÃO
// =====================================================

const grupo = computed(() =>
  configuracoes[route.params.grupo]
    ? route.params.grupo
    : 'pedidos'
);

const dadosAtuais = computed(() =>
  configuracoes[grupo.value]
);

const tipoAtual = computed(() => {
  const tipo = route.params.tipo;

  return dadosAtuais.value.abas.some(
    aba => aba.id === tipo
  )
    ? tipo
    : dadosAtuais.value.abas[0].id;
});

const abaAtual = computed(() =>
  dadosAtuais.value.abas.find(
    aba => aba.id === tipoAtual.value
  )
);

const ehCupons = computed(() =>
  grupo.value === 'carteira' &&
  tipoAtual.value === 'cupons'
);

// =====================================================
// CUPONS
// =====================================================

const quantidadeCupons = computed(() =>
  cupons.value.length
);

const quantidadeDisponiveis = computed(() =>
  cuponsDisponiveis.value.length
);

const quantidadeUtilizados = computed(() =>
  cuponsUtilizados.value.length
);

async function carregarCupons() {
  if (!ehCupons.value) return;

  await recarregar();
}

function atualizarCupons() {
  carregarCupons();
}

// =====================================================
// DATAS
// =====================================================

function formatarData(data) {
  if (!data) return '';

  const valor = String(data);

  // Evita problemas de fuso horário em datas sem horário.
  const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (iso) {
    return `${iso[3]}/${iso[2]}/${iso[1]}`;
  }

  const dataObj = new Date(data);

  return Number.isNaN(dataObj.getTime())
    ? ''
    : dataObj.toLocaleDateString('pt-BR');
}

// =====================================================
// COPIAR CUPOM
// =====================================================

async function copiarCodigo(codigo) {
  if (!codigo) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(codigo);
    } else {
      const campo = document.createElement('textarea');

      campo.value = codigo;
      campo.style.position = 'fixed';
      campo.style.opacity = '0';

      document.body.appendChild(campo);
      campo.select();

      const copiou = document.execCommand('copy');

      document.body.removeChild(campo);

      if (!copiou) {
        throw new Error('Não foi possível copiar o código.');
      }
    }

    copiadoCodigo.value = codigo;

    if (temporizadorCopia) {
      clearTimeout(temporizadorCopia);
    }

    temporizadorCopia = setTimeout(() => {
      copiadoCodigo.value = '';
      temporizadorCopia = null;
    }, 2000);

  } catch (erroCopia) {
    console.error('Erro ao copiar cupom:', erroCopia);

    alert(
      'Não foi possível copiar o código. Tente novamente.'
    );
  }
}

// =====================================================
// NAVEGAÇÃO ENTRE ABAS
// =====================================================

function mudarAba(id) {
  if (grupo.value === 'carteira' && id === 'selos') {
    router.push('/carteira/selos');
    return;
  }

  router.push(`/detalhes/${grupo.value}/${id}`);
}

function voltar() {
  router.push('/perfil');
}

// =====================================================
// CICLO DE VIDA
// =====================================================

onMounted(() => {
  carregarCupons();

  window.addEventListener('focus', atualizarCupons);
  window.addEventListener('storage', atualizarCupons);
  window.addEventListener('cupons-atualizados', atualizarCupons);
});

onBeforeUnmount(() => {
  window.removeEventListener('focus', atualizarCupons);
  window.removeEventListener('storage', atualizarCupons);
  window.removeEventListener('cupons-atualizados', atualizarCupons);

  if (temporizadorCopia) {
    clearTimeout(temporizadorCopia);
  }
});
</script>

<template>
  <main class="detalhes-page">
    <div class="detalhes-container">

      <!-- CABEÇALHO -->
      <header class="page-header">
        <button
          class="btn-voltar"
          type="button"
          @click="voltar"
        >
          <i class="fa-solid fa-arrow-left"></i>
          Meu perfil
        </button>

        <span class="eyebrow">
          {{ grupo === 'carteira' ? 'MINHA CARTEIRA' : 'MINHA CONTA' }}
        </span>

        <h1>{{ dadosAtuais.titulo }}</h1>
        <p>{{ dadosAtuais.subtitulo }}</p>
      </header>

      <!-- CATEGORIAS -->
      <section class="categorias-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">EXPLORE</span>
            <h2>Escolha uma categoria</h2>
          </div>

          <span class="contador">
            {{ dadosAtuais.abas.length }} opções
          </span>
        </div>

        <nav
          class="abas-container"
          aria-label="Categorias"
        >
          <button
            v-for="aba in dadosAtuais.abas"
            :key="aba.id"
            type="button"
            class="aba"
            :class="{ ativa: tipoAtual === aba.id }"
            :aria-current="tipoAtual === aba.id ? 'page' : undefined"
            @click="mudarAba(aba.id)"
          >
            <span class="aba-icone">
              <i :class="`fa-solid ${aba.icone}`"></i>
            </span>

            <span class="aba-texto">
              <strong>{{ aba.nome }}</strong>
              <small>{{ aba.descricao }}</small>
            </span>

            <i class="fa-solid fa-arrow-right aba-seta"></i>
          </button>
        </nav>
      </section>

      <!-- CONTEÚDO PRINCIPAL -->
      <section class="conteudo-card">

        <header class="conteudo-topo">
          <div class="conteudo-identidade">
            <span class="icone-conteudo">
              <i :class="`fa-solid ${abaAtual.icone}`"></i>
            </span>

            <div>
              <span class="eyebrow">SEÇÃO ATUAL</span>
              <h2>{{ abaAtual.nome }}</h2>
            </div>
          </div>

          <span v-if="ehCupons" class="status-pill">
            {{ quantidadeCupons }}
            {{ quantidadeCupons === 1 ? 'cupom' : 'cupons' }}
          </span>

          <span v-else class="status-pill">
            Em breve
          </span>
        </header>

        <!-- ÁREA DE CUPONS -->
        <div v-if="ehCupons" class="cupons-content">

          <!-- CARREGANDO -->
          <div
            v-if="carregando && !quantidadeCupons"
            class="estado-vazio"
          >
            <span class="vazio-icone">
              <i class="fa-solid fa-spinner fa-spin"></i>
            </span>

            <h3>Carregando sua carteira...</h3>

            <p>
              Estamos buscando suas recompensas.
            </p>
          </div>

          <!-- ERRO -->
          <div
            v-else-if="erro && !quantidadeCupons"
            class="estado-vazio"
          >
            <span class="vazio-icone">
              <i class="fa-solid fa-circle-exclamation"></i>
            </span>

            <h3>Não foi possível carregar seus cupons.</h3>

            <p>{{ erro }}</p>

            <button
              type="button"
              class="btn-principal"
              @click="carregarCupons"
            >
              Tentar novamente
              <i class="fa-solid fa-rotate"></i>
            </button>
          </div>

          <template v-else-if="quantidadeCupons">

            <!-- CUPONS DISPONÍVEIS -->
            <section
              v-if="quantidadeDisponiveis"
              class="grupo-cupons"
            >
              <div class="cupons-intro">
                <span class="intro-icone">
                  <i class="fa-solid fa-gift"></i>
                </span>

                <div>
                  <span class="eyebrow">SUAS RECOMPENSAS</span>
                  <h3>Prêmios disponíveis</h3>
                  <p>
                    Confira as recompensas que você desbloqueou.
                  </p>
                </div>
              </div>

              <div class="cupons-lista">
                <article
                  v-for="cupom in cuponsDisponiveis"
                  :key="cupom.id || cupom.codigo"
                  class="cupom-card"
                >
                  <div class="cupom-topo">
                    <span class="cupom-icone">
                      <i :class="cupom.icone || 'fa-solid fa-ticket'"></i>
                    </span>

                    <span class="cupom-status status-disponivel">
                      DISPONÍVEL
                    </span>
                  </div>

                  <span class="eyebrow">
                    RECOMPENSA DOS SELOS
                  </span>

                  <h3>
                    {{ cupom.titulo || 'Recompensa especial' }}
                  </h3>

                  <p>
                    {{ cupom.descricao || 'Uma recompensa para você.' }}
                  </p>

                  <div class="cupom-codigo">
                    <div class="cupom-codigo-info">
                      <small>CÓDIGO DO CUPOM</small>

                      <strong>
                        {{ cupom.codigo || 'Sem código' }}
                      </strong>
                    </div>

                    <button
                      type="button"
                      class="btn-copiar"
                      :disabled="!cupom.codigo"
                      @click="copiarCodigo(cupom.codigo)"
                    >
                      <i
                        :class="
                          copiadoCodigo === cupom.codigo
                            ? 'fa-solid fa-check'
                            : 'fa-regular fa-copy'
                        "
                      ></i>

                      {{
                        copiadoCodigo === cupom.codigo
                          ? 'Copiado!'
                          : 'Copiar código'
                      }}
                    </button>
                  </div>

                  <p
                    v-if="cupom.criadoEm"
                    class="cupom-data"
                  >
                    <i class="fa-regular fa-calendar"></i>
                    Recebido em {{ formatarData(cupom.criadoEm) }}
                  </p>
                </article>
              </div>
            </section>

            <!-- CUPONS UTILIZADOS -->
            <section
              v-if="quantidadeUtilizados"
              class="grupo-cupons grupo-utilizados"
            >
              <div class="cupons-intro">
                <span class="intro-icone">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                </span>

                <div>
                  <span class="eyebrow">SEU HISTÓRICO</span>
                  <h3>Cupons utilizados</h3>
                  <p>
                    Veja as recompensas que você já aproveitou.
                  </p>
                </div>
              </div>

              <div class="cupons-lista">
                <article
                  v-for="cupom in cuponsUtilizados"
                  :key="cupom.id || cupom.codigo"
                  class="cupom-card cupom-utilizado"
                >
                  <div class="cupom-topo">
                    <span class="cupom-icone">
                      <i :class="cupom.icone || 'fa-solid fa-ticket'"></i>
                    </span>

                    <span class="cupom-status status-utilizado">
                      JÁ UTILIZADO
                    </span>
                  </div>

                  <span class="eyebrow">
                    RECOMPENSA DOS SELOS
                  </span>

                  <h3>
                    {{ cupom.titulo || 'Recompensa especial' }}
                  </h3>

                  <p>
                    {{ cupom.descricao || 'Uma recompensa que você aproveitou.' }}
                  </p>

                  <div class="cupom-codigo">
                    <div class="cupom-codigo-info">
                      <small>CÓDIGO DO CUPOM</small>

                      <strong>
                        {{ cupom.codigo || 'Sem código' }}
                      </strong>
                    </div>

                    <button
                      type="button"
                      class="btn-copiar"
                      :disabled="!cupom.codigo"
                      @click="copiarCodigo(cupom.codigo)"
                    >
                      <i
                        :class="
                          copiadoCodigo === cupom.codigo
                            ? 'fa-solid fa-check'
                            : 'fa-regular fa-copy'
                        "
                      ></i>

                      {{
                        copiadoCodigo === cupom.codigo
                          ? 'Copiado!'
                          : 'Copiar código'
                      }}
                    </button>
                  </div>

                  <p
                    v-if="cupom.utilizadoEm"
                    class="cupom-data"
                  >
                    <i class="fa-regular fa-calendar-check"></i>
                    Utilizado em
                    {{ formatarData(cupom.utilizadoEm) }}
                  </p>
                </article>
              </div>
            </section>

          </template>

          <!-- NENHUM CUPOM -->
          <div
            v-else-if="!carregando && !erro"
            class="estado-vazio"
          >
            <span class="vazio-icone">
              <i class="fa-solid fa-ticket"></i>
            </span>

            <span class="eyebrow">SEUS CUPONS</span>

            <h3>Ainda não há recompensas.</h3>

            <p>
              Complete sua cartela com 10 selos para desbloquear
              uma recompensa especial.
            </p>

            <button
              type="button"
              class="btn-principal"
              @click="router.push('/carteira/selos')"
            >
              Ver meus selos
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

        </div>

        <!-- OUTRAS CATEGORIAS -->
        <div v-else class="estado-vazio">
          <span class="vazio-icone">
            <i :class="`fa-solid ${abaAtual.icone}`"></i>
          </span>

          <span class="eyebrow">
            {{ abaAtual.nome.toUpperCase() }}
          </span>

          <h3>Estamos preparando algo especial.</h3>

          <p>
            Esta área ainda está sendo preparada.
            Em breve você poderá acompanhar tudo por aqui.
          </p>

          <button
            type="button"
            class="btn-principal"
            @click="voltar"
          >
            Voltar ao meu perfil
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </section>

      <!-- RODAPÉ -->
      <footer class="page-footer">
        <span></span>
        <i class="fa-solid fa-heart"></i>
        Feito com carinho
        <span></span>
      </footer>

    </div>
  </main>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import '@/assets/css/DetalhesView.css';

const route = useRoute();
const router = useRouter();

const cupons = ref([]);

const configuracoes = {
  pedidos: {
    titulo: 'Meus Pedidos',
    subtitulo: 'Tudo o que você já viveu com a gente.',
    abas: [
      { id: 'favoritos', nome: 'Favoritos', descricao: 'Seus queridinhos', icone: 'fa-heart' },
      { id: 'avaliados', nome: 'Avaliados', descricao: 'Suas avaliações', icone: 'fa-star' },
      { id: 'preparados', nome: 'Preparados', descricao: 'Pedidos realizados', icone: 'fa-utensils' }
    ]
  },
  carteira: {
    titulo: 'Minha Carteira',
    subtitulo: 'Vantagens especiais para você.',
    abas: [
      { id: 'cupons', nome: 'Cupons', descricao: 'Descontos disponíveis', icone: 'fa-ticket' },
      { id: 'selos', nome: 'Selos', descricao: 'Sua coleção', icone: 'fa-certificate' },
      { id: 'cartoes', nome: 'Cartões', descricao: 'Formas de pagamento', icone: 'fa-credit-card' }
    ]
  }
};

const grupo = computed(() =>
  configuracoes[route.params.grupo] ? route.params.grupo : 'pedidos'
);

const dadosAtuais = computed(() => configuracoes[grupo.value]);

const tipoAtual = computed(() => {
  const tipo = route.params.tipo;
  return dadosAtuais.value.abas.some(aba => aba.id === tipo)
    ? tipo
    : dadosAtuais.value.abas[0].id;
});

const abaAtual = computed(() =>
  dadosAtuais.value.abas.find(aba => aba.id === tipoAtual.value)
);

const ehCupons = computed(() =>
  grupo.value === 'carteira' && tipoAtual.value === 'cupons'
);

function carregarCupons() {
  try {
    const dados = JSON.parse(localStorage.getItem('cuponsCarteira') || '[]');
    cupons.value = Array.isArray(dados) ? dados : [];
  } catch {
    cupons.value = [];
  }
}

function formatarData(data) {
  if (!data) return '';

  const valor = String(data);
  const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;

  const dataObj = new Date(data);

  return Number.isNaN(dataObj.getTime())
    ? ''
    : dataObj.toLocaleDateString('pt-BR');
}

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

onMounted(carregarCupons);
</script>

<template>
  <main class="detalhes-page">
    <div class="detalhes-container">
      <header class="page-header">
        <button class="btn-voltar" type="button" @click="voltar">
          <i class="fa-solid fa-arrow-left"></i>
          Meu perfil
        </button>

        <span class="eyebrow">
          {{ grupo === 'carteira' ? 'MINHA CARTEIRA' : 'MINHA CONTA' }}
        </span>

        <h1>{{ dadosAtuais.titulo }}</h1>
        <p>{{ dadosAtuais.subtitulo }}</p>
      </header>

      <section class="categorias-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">EXPLORE</span>
            <h2>Escolha uma categoria</h2>
          </div>
          <span class="contador">{{ dadosAtuais.abas.length }} opções</span>
        </div>

        <nav class="abas-container" aria-label="Categorias">
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
            {{ cupons.length }}
            {{ cupons.length === 1 ? 'cupom' : 'cupons' }}
          </span>

          <span v-else class="status-pill">Em breve</span>
        </header>

        <div v-if="ehCupons" class="cupons-content">
          <template v-if="cupons.length">
            <div class="cupons-intro">
              <span class="intro-icone">
                <i class="fa-solid fa-gift"></i>
              </span>
              <div>
                <span class="eyebrow">SUAS RECOMPENSAS</span>
                <h3>Prêmios disponíveis</h3>
                <p>Confira as recompensas que você desbloqueou.</p>
              </div>
            </div>

            <div class="cupons-lista">
              <article
                v-for="(cupom, index) in cupons"
                :key="cupom.codigo || index"
                class="cupom-card"
              >
                <div class="cupom-topo">
                  <span class="cupom-icone">
                    <i :class="cupom.icone || 'fa-solid fa-ticket'"></i>
                  </span>
                  <span class="cupom-status">DISPONÍVEL</span>
                </div>

                <span class="eyebrow">RECOMPENSA DOS SELOS</span>
                <h3>{{ cupom.titulo || 'Recompensa especial' }}</h3>
                <p>{{ cupom.descricao || 'Uma recompensa para você.' }}</p>

                <div class="cupom-codigo">
                  <div>
                    <small>CÓDIGO DO CUPOM</small>
                    <strong>{{ cupom.codigo || 'Sem código' }}</strong>
                  </div>
                  <i class="fa-solid fa-ticket"></i>
                </div>

                <p v-if="cupom.data" class="cupom-data">
                  <i class="fa-regular fa-calendar"></i>
                  Recebido em {{ formatarData(cupom.data) }}
                </p>
              </article>
            </div>
          </template>

          <div v-else class="estado-vazio">
            <span class="vazio-icone">
              <i class="fa-solid fa-ticket"></i>
            </span>
            <span class="eyebrow">SEUS CUPONS</span>
            <h3>Ainda não há recompensas.</h3>
            <p>
              Complete sua cartela com 10 selos para desbloquear
              uma recompensa especial.
            </p>
            <button type="button" class="btn-principal" @click="router.push('/carteira/selos')">
              Ver meus selos
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <div v-else class="estado-vazio">
          <span class="vazio-icone">
            <i :class="`fa-solid ${abaAtual.icone}`"></i>
          </span>
          <span class="eyebrow">{{ abaAtual.nome.toUpperCase() }}</span>
          <h3>Estamos preparando algo especial.</h3>
          <p>
            Esta área ainda está sendo preparada.
            Em breve você poderá acompanhar tudo por aqui.
          </p>
          <button type="button" class="btn-principal" @click="voltar">
            Voltar ao meu perfil
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </section>

      <footer class="page-footer">
        <span></span>
        <i class="fa-solid fa-heart"></i>
        Feito com carinho
        <span></span>
      </footer>
    </div>
  </main>
</template>

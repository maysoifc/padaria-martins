<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const tipoAtual = computed(() => route.params.tipo);
const voltarParaPerfil = () => {
  router.push('/perfil');
};
const abas = [
  { id: 'favoritos', nome: 'Favoritos', icone: 'fa-heart' },
  { id: 'avaliados', nome: 'Avaliados', icone: 'fa-star' },
  { id: 'preparados', nome: 'Preparados', icone: 'fa-utensils' }
];

const mudarAba = (id) => router.push(`/pedidos/${id}`);
</script>

<template>
  <div class="pedidos-view">
    <button @click="voltarParaPerfil" class="btn-voltar">← Voltar</button>
    <h1>Meus Pedidos</h1>

    <div class="abas-container">
      <div
        v-for="aba in abas"
        :key="aba.id"
        class="aba"
        :class="{ 'ativa': tipoAtual === aba.id }"
        @click="mudarAba(aba.id)"
      >
        {{ aba.nome }}
      </div>
    </div>

    <div class="conteudo-lista">
      <div class="placeholder-vazio">
        <i class="fas" :class="abas.find(a => a.id === tipoAtual)?.icone"></i>
        <p> <strong>{{ tipoAtual.toUpperCase() }}</strong></p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.pedidos-view {
  padding: 2rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fcfaf7;
}

.btn-voltar {
  background: rgba(0, 0, 0, 0.03);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: 0.2s;
}

.btn-voltar:hover { background: rgba(0, 0, 0, 0.08); }

h1 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #1a1a1a;
  text-align: center;
}

.abas-container {
  display: flex;
  justify-content: space-around;
  background: white;
  padding: 0.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
}

.aba {
  padding: 12px 20px;
  cursor: pointer;
  color: #a0a0a0;
  font-weight: 700;
  font-size: 0.9rem;
  transition: 0.3s;
  border-radius: 15px;
}

.aba.ativa {
  color: #bba270;
  background: #fdfbf7;
  border-bottom: 2px solid #bba270;
}
.conteudo-lista {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  text-align: center;
}

.placeholder-vazio {
  color: #888;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.placeholder-vazio i {
  font-size: 3rem;
  color: #eaddc5;
}
</style>


<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import "@/assets/css/MeusSelos.css";

const router = useRouter();
const totalSelos = 10;
const selos = ref(0);

const progresso = computed(() => (selos.value / totalSelos) * 100);
const faltam = computed(() => totalSelos - selos.value);
const premioLiberado = computed(() => selos.value >= totalSelos);

onMounted(() => {
  const valor = Number(localStorage.getItem("selosCarteira") ?? 0);
  selos.value = Number.isFinite(valor)
    ? Math.min(Math.max(valor, 0), totalSelos)
    : 0;
});

function verCupons() {
  if (premioLiberado.value) {
    selos.value = 0;
    localStorage.setItem("selosCarteira", "0");
  }

  router.push("/detalhes/carteira/cupons");
}
</script>

<template>
  <main class="meus-selos">
    <div class="selos-container">
      <button class="selos-voltar" type="button" @click="router.push('/perfil')">
        <i class="fa-solid fa-arrow-left"></i>
        Minha carteira
      </button>

      <header class="selos-cabecalho">
        <span class="selos-etiqueta">PROGRAMA DE FIDELIDADE</span>
        <h1>Meus Selos</h1>
        <p>
          A cada compra de R$ 20,00 ou mais, ganhe 1 selo.
          Complete os 10 selos para desbloquear uma recompensa!
        </p>
      </header>

      <section class="selos-cartao">
        <div class="selos-cartao-topo">
          <div>
            <span class="selos-etiqueta">SUA COLEÇÃO</span>
            <h2>Cartão de fidelidade</h2>
          </div>

          <div class="selos-contador">
            <strong>{{ selos }}</strong>
            <span>/ {{ totalSelos }}</span>
          </div>
        </div>

        <div class="selos-progresso">
          <div class="selos-progresso-info">
            <span>Seu progresso</span>
            <strong>{{ Math.round(progresso) }}%</strong>
          </div>
          <div
            class="selos-barra"
            role="progressbar"
            :aria-valuenow="selos"
            :aria-valuemin="0"
            :aria-valuemax="totalSelos"
            aria-label="Progresso do cartão de fidelidade"
          >
            <div :style="{ width: `${progresso}%` }"></div>
          </div>
        </div>

        <div class="selos-grade">
          <div
            v-for="numero in totalSelos"
            :key="numero"
            class="selos-item"
            :class="{
              'esta-preenchido': numero <= selos,
              'e-premio': numero === totalSelos
            }"
          >
            <div class="selos-circulo">
              <i
                v-if="numero <= selos"
                class="fa-solid fa-check"
              ></i>
              <i
                v-else-if="numero === totalSelos"
                class="fa-solid fa-gift"
              ></i>
              <span v-else>{{ numero }}</span>
            </div>
            <small>{{ numero === totalSelos ? "Prêmio" : `Selo ${numero}` }}</small>
          </div>
        </div>

        <div v-if="premioLiberado" class="selos-mensagem selos-premio">
          <i class="fa-solid fa-gift"></i>
          <div>
            <strong>Parabéns! Seu prêmio foi desbloqueado.</strong>
            <p>Acesse seus cupons para conferir a recompensa.</p>
          </div>
          <button type="button" @click="verCupons">
            Ver cupons <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div v-else class="selos-mensagem">
          <i class="fa-solid fa-bread-slice"></i>
          <div>
            <strong>
              {{ faltam === 1 ? "Falta apenas 1 selo!" : `Faltam ${faltam} selos` }}
            </strong>
            <p>Faça mais compras de R$ 20,00 ou mais para completar seu cartão.</p>
          </div>
        </div>
      </section>

      <section class="selos-como-funciona">
        <h2>Como funciona?</h2>

        <div class="selos-passos">
          <article>
            <i class="fa-solid fa-bag-shopping"></i>
            <h3>Faça uma compra</h3>
            <p>Compre R$ 20,00 ou mais.</p>
          </article>

          <article>
            <i class="fa-solid fa-certificate"></i>
            <h3>Ganhe um selo</h3>
            <p>Receba 1 selo por compra válida.</p>
          </article>

          <article>
            <i class="fa-solid fa-gift"></i>
            <h3>Resgate seu prêmio</h3>
            <p>Complete 10 selos e confira seus cupons.</p>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

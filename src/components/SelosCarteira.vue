<script setup>
import {
  computed,
  onMounted,
  onBeforeUnmount
} from "vue";

import { useRouter } from "vue-router";
import { useFidelidade } from "@/composables/useFidelidade";

import "@/assets/css/meusSelos.css";

const router = useRouter();

// =========================================================
// FIDELIDADE
// =========================================================

const {
  selos,
  TOTAL_SELOS,
  progresso,
  faltam,
  cartaoCompleto,
  carregando,
  erro,
  recarregar
} = useFidelidade();

const totalSelos = TOTAL_SELOS;

// =========================================================
// INDICADORES
// =========================================================

const premioLiberado = computed(() => {
  return cartaoCompleto.value;
});

// =========================================================
// ATUALIZAR CARTEIRA
// =========================================================

async function atualizarSelos() {
  await recarregar();
}

// =========================================================
// NAVEGAÇÃO
// =========================================================

function verCupons() {
  // Abrir os cupons não consome o prêmio
  // e não modifica a quantidade de selos.

  router.push("/detalhes/carteira/cupons");
}

function voltarPerfil() {
  router.push("/perfil");
}

// =========================================================
// EVENTOS
// =========================================================

onMounted(() => {
  atualizarSelos();

  // Atualiza ao retornar para a página.
  window.addEventListener(
    "focus",
    atualizarSelos
  );

  // Atualiza quando outra aba modifica os dados.
  window.addEventListener(
    "storage",
    atualizarSelos
  );

  // Atualiza quando a aplicação emitir esse evento.
  window.addEventListener(
    "selos-atualizados",
    atualizarSelos
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "focus",
    atualizarSelos
  );

  window.removeEventListener(
    "storage",
    atualizarSelos
  );

  window.removeEventListener(
    "selos-atualizados",
    atualizarSelos
  );
});
</script>

<template>
  <main class="meus-selos">
    <div class="selos-container">

      <!-- VOLTAR -->
      <button
        class="selos-voltar"
        type="button"
        @click="voltarPerfil"
      >
        <i class="fa-solid fa-arrow-left"></i>
        Minha carteira
      </button>

      <!-- CABEÇALHO -->
      <header class="selos-cabecalho">
        <span class="selos-etiqueta">
          PROGRAMA DE FIDELIDADE
        </span>

        <h1>Meus Selos</h1>

        <p>
          A cada compra de R$ 20,00 ou mais, ganhe 1 selo.
          Complete os 10 selos para desbloquear uma recompensa!
        </p>
      </header>

      <!-- CARREGAMENTO -->
      <div
        v-if="carregando && selos === 0"
        class="selos-mensagem"
        role="status"
      >
        <i class="fa-solid fa-spinner fa-spin"></i>

        <div>
          <strong>Carregando sua carteira...</strong>

          <p>
            Estamos buscando seus selos e recompensas.
          </p>
        </div>
      </div>

      <!-- ERRO -->
      <div
        v-if="erro"
        class="selos-mensagem"
        role="alert"
      >
        <i class="fa-solid fa-circle-exclamation"></i>

        <div>
          <strong>Não foi possível carregar sua carteira.</strong>

          <p>{{ erro }}</p>

          <button
            type="button"
            @click="atualizarSelos"
            :disabled="carregando"
          >
            <i
              class="fa-solid"
              :class="carregando ? 'fa-spinner fa-spin' : 'fa-rotate'"
            ></i>

            Tentar novamente
          </button>
        </div>
      </div>

      <!-- CARTÃO DE FIDELIDADE -->
      <section
        v-if="!erro || selos > 0"
        class="selos-cartao"
      >

        <!-- TOPO -->
        <div class="selos-cartao-topo">
          <div>
            <span class="selos-etiqueta">
              SUA COLEÇÃO
            </span>

            <h2>Cartão de fidelidade</h2>
          </div>

          <div class="selos-contador">
            <strong>{{ selos }}</strong>
            <span>/ {{ totalSelos }}</span>
          </div>
        </div>

        <!-- PROGRESSO -->
        <div class="selos-progresso">
          <div class="selos-progresso-info">
            <span>Seu progresso</span>

            <strong>
              {{ Math.round(progresso) }}%
            </strong>
          </div>

          <div
            class="selos-barra"
            role="progressbar"
            :aria-valuenow="selos"
            :aria-valuemin="0"
            :aria-valuemax="totalSelos"
            aria-label="Progresso do cartão de fidelidade"
          >
            <div
              :style="{
                width: `${progresso}%`
              }"
            ></div>
          </div>
        </div>

        <!-- GRADE DE SELOS -->
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

              <span v-else>
                {{ numero }}
              </span>

            </div>

            <small>
              {{
                numero === totalSelos
                  ? "Prêmio"
                  : `Selo ${numero}`
              }}
            </small>
          </div>
        </div>

        <!-- PRÊMIO LIBERADO -->
        <div
          v-if="premioLiberado"
          class="selos-mensagem selos-premio"
        >
          <i class="fa-solid fa-gift"></i>

          <div>
            <strong>
              Parabéns! Seu prêmio foi desbloqueado.
            </strong>

            <p>
              Acesse seus cupons para conferir sua recompensa.
            </p>
          </div>

          <button
            type="button"
            @click="verCupons"
          >
            Ver cupons

            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <!-- PROGRESSO -->
        <div
          v-else
          class="selos-mensagem"
        >
          <i class="fa-solid fa-bread-slice"></i>

          <div>
            <strong>
              {{
                faltam === 1
                  ? "Falta apenas 1 selo!"
                  : `Faltam ${faltam} selos`
              }}
            </strong>

            <p>
              Faça mais compras de R$ 20,00 ou mais
              para completar seu cartão.
            </p>
          </div>
        </div>

      </section>

      <!-- COMO FUNCIONA -->
      <section class="selos-como-funciona">
        <h2>Como funciona?</h2>

        <div class="selos-passos">

          <article>
            <i class="fa-solid fa-bag-shopping"></i>

            <h3>Faça uma compra</h3>

            <p>
              Compre R$ 20,00 ou mais.
            </p>
          </article>

          <article>
            <i class="fa-solid fa-certificate"></i>

            <h3>Ganhe um selo</h3>

            <p>
              Receba 1 selo por compra válida,
              após a confirmação do pagamento.
            </p>
          </article>

          <article>
            <i class="fa-solid fa-gift"></i>

            <h3>Resgate seu prêmio</h3>

            <p>
              Complete 10 selos e confira seus cupons.
            </p>
          </article>

        </div>
      </section>

    </div>
  </main>
</template>

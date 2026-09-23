<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const totalSelos = 10;
const selos = ref(0);

const carregarSelos = () => {
  const salvo = localStorage.getItem("selosCarteira");

  if (salvo !== null) {
    const valor = Number(salvo);

    if (!Number.isNaN(valor)) {
      selos.value = Math.min(
        Math.max(valor, 0),
        totalSelos
      );
    }
  }
};

const verCupons = () => {
  if (selos.value >= totalSelos) {
    selos.value = 0;

    localStorage.setItem(
      "selosCarteira",
      "0"
    );
  }

  router.push("/detalhes/carteira/cupons");
};

const progresso = computed(() => {
  return (selos.value / totalSelos) * 100;
});

const faltam = computed(() => {
  return Math.max(
    totalSelos - selos.value,
    0
  );
});

const premioLiberado = computed(() => {
  return selos.value >= totalSelos;
});

const voltar = () => {
  router.push("/perfil");
};

onMounted(() => {
  carregarSelos();
});
</script>

<template>
  <main class="carteira-selos">

    <div class="decoracao decoracao-1"></div>
    <div class="decoracao decoracao-2"></div>

    <div class="container">

      <button
        type="button"
        class="voltar"
        @click="voltar"
      >
        <span class="icone-voltar">
          <i class="fa-solid fa-arrow-left"></i>
        </span>

        <span>Minha carteira</span>
      </button>

      <header class="cabecalho">

        <span class="eyebrow">
          PROGRAMA DE FIDELIDADE
        </span>

        <div class="titulo-linha">

          <div>
            <h1>
              Meus Selos
            </h1>

            <p>
              Junte 10 selos em compras de R$ 20,00
              ou mais e desbloqueie uma recompensa especial.
            </p>
          </div>

          <div class="icone-titulo">
            <i class="fa-solid fa-certificate"></i>
          </div>

        </div>

      </header>

      <section class="regra-compra">

        <div class="regra-icone">
          <i class="fa-solid fa-circle-info"></i>
        </div>

        <div>
          <strong>
            Regra dos selos
          </strong>

          <p>
            A cada compra de <b>R$ 20,00 ou mais</b>,
            você ganha 1 selo.
          </p>
        </div>

      </section>

      <section class="cartao-selos">

        <div class="cartao-topo">

          <div>

            <span class="cartao-label">
              SUA COLEÇÃO
            </span>

            <h2>
              Cartão de fidelidade
            </h2>

          </div>

          <div class="contador">

            <strong>
              {{ selos }}
            </strong>

            <span>
              / {{ totalSelos }}
            </span>

          </div>

        </div>

        <div class="progresso-area">

          <div class="progresso-info">

            <span>
              Progresso
            </span>

            <strong>
              {{ Math.round(progresso) }}%
            </strong>

          </div>

          <div class="barra">

            <div
              class="barra-preenchida"
              :style="{ width: `${progresso}%` }"
            ></div>

          </div>

        </div>

        <div class="selos-grid">

          <div
            v-for="numero in totalSelos"
            :key="numero"
            class="selo"
            :class="{
              preenchido: numero <= selos,
              ultimo: numero === totalSelos
            }"
          >

            <div class="selo-circulo">

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

        <div
          v-if="premioLiberado"
          class="premio-liberado"
        >

          <div class="premio-icone">
            <i class="fa-solid fa-gift"></i>
          </div>

          <div class="premio-texto">

            <span>
              RECOMPENSA DESBLOQUEADA
            </span>

            <strong>
              Você completou seu cartão!
            </strong>

            <p>
              Seu prêmio está disponível na área de Cupons.
              Ao acessar os cupons, um novo cartão será iniciado.
            </p>

          </div>

          <button
            type="button"
            class="btn-cupons"
            @click="verCupons"
          >
            Ver cupons

            <i class="fa-solid fa-arrow-right"></i>
          </button>

        </div>

        <div
          v-else
          class="mensagem-progresso"
        >

          <div class="mensagem-icone">
            <i class="fa-solid fa-bread-slice"></i>
          </div>

          <div>

            <strong>
              {{
                faltam === 1
                  ? "Falta apenas 1 selo!"
                  : `Faltam ${faltam} selos`
              }}
            </strong>

            <p>
              Cada compra de R$ 20,00 ou mais adiciona
              um novo selo.
            </p>

          </div>

        </div>

      </section>

      <section class="como-funciona">

        <div class="secao-titulo">

          <span>
            COMO FUNCIONA
          </span>

          <h2>
            Simples assim
          </h2>

        </div>

        <div class="passos">

          <article class="passo">

            <span class="passo-numero">
              01
            </span>

            <div class="passo-icone">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>

            <h3>
              Faça uma compra
            </h3>

            <p>
              Faça uma compra de R$ 20,00 ou mais
              na Padaria Martins.
            </p>

          </article>

          <article class="passo">

            <span class="passo-numero">
              02
            </span>

            <div class="passo-icone">
              <i class="fa-solid fa-certificate"></i>
            </div>

            <h3>
              Ganhe um selo
            </h3>

            <p>
              Cada compra válida adiciona um novo
              selo à sua coleção.
            </p>

          </article>

          <article class="passo">

            <span class="passo-numero">
              03
            </span>

            <div class="passo-icone">
              <i class="fa-solid fa-gift"></i>
            </div>

            <h3>
              Receba sua recompensa
            </h3>

            <p>
              Complete os 10 selos, veja seu cupom
              e comece uma nova coleção.
            </p>

          </article>

        </div>

      </section>

      <footer class="rodape">

        <span></span>

        <div>
          <i class="fa-solid fa-heart"></i>
          Feito com carinho
        </div>

        <span></span>

      </footer>

    </div>

  </main>
</template>

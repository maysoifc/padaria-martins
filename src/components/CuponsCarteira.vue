
<script setup>
import {
  computed,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  ref
} from "vue";

import "@/assets/css/cuponsCarteira.css";
import { useFidelidade } from "@/composables/useFidelidade";

const {
  cuponsDisponiveis,
  cuponsUtilizados,
  carregando,
  erro,
  recarregar
} = useFidelidade();

const codigoCopiado = ref("");
const mensagem = ref("");
let temporizadorMensagem = null;

const quantidadeDisponiveis = computed(
  () => cuponsDisponiveis.value.length
);

const quantidadeUtilizados = computed(
  () => cuponsUtilizados.value.length
);

async function atualizarCupons() {
  await recarregar();
}

onMounted(() => {
  atualizarCupons();

  window.addEventListener("focus", atualizarCupons);
  window.addEventListener("storage", atualizarCupons);
  window.addEventListener("cupons-atualizados", atualizarCupons);
});

onBeforeUnmount(() => {
  window.removeEventListener("focus", atualizarCupons);
  window.removeEventListener("storage", atualizarCupons);
  window.removeEventListener("cupons-atualizados", atualizarCupons);

  if (temporizadorMensagem) {
    clearTimeout(temporizadorMensagem);
  }
});

async function copiarCodigo(codigo) {
  if (!codigo) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(codigo);
    } else {
      const campo = document.createElement("textarea");

      campo.value = codigo;
      campo.style.position = "fixed";
      campo.style.opacity = "0";

      document.body.appendChild(campo);
      campo.select();

      const sucesso = document.execCommand("copy");

      document.body.removeChild(campo);

      if (!sucesso) {
        throw new Error("Falha ao copiar");
      }
    }

    codigoCopiado.value = codigo;
    mensagem.value = "Código copiado com sucesso!";
  } catch {
    codigoCopiado.value = "";
    mensagem.value =
      "Não foi possível copiar. Selecione o código manualmente.";
  }

  if (temporizadorMensagem) {
    clearTimeout(temporizadorMensagem);
  }

  temporizadorMensagem = setTimeout(() => {
    codigoCopiado.value = "";
    mensagem.value = "";
    temporizadorMensagem = null;
  }, 2500);
}

function formatarData(data) {
  if (!data) return "";

  const dataValida = new Date(data);

  if (Number.isNaN(dataValida.getTime())) return "";

  return dataValida.toLocaleDateString("pt-BR");
}
</script>

<template>
  <main class="cupons-container">

    <!-- CABEÇALHO -->
    <header class="carteira-cabecalho">
      <span class="vazio-label">PROGRAMA DE FIDELIDADE</span>

      <h1>Minha carteira</h1>

      <p>
        Confira suas recompensas e acompanhe os cupons
        que você já utilizou.
      </p>
    </header>

    <!-- CARREGAMENTO -->
    <div v-if="carregando && !cuponsDisponiveis.length && !cuponsUtilizados.length"
      class="cupons-vazio">
      <div class="vazio-icone">
        <i class="fa-solid fa-spinner fa-spin"></i>
      </div>

      <h3>Carregando sua carteira...</h3>

      <p>Estamos buscando suas recompensas.</p>
    </div>

    <!-- ERRO -->
    <div v-else-if="erro && !cuponsDisponiveis.length && !cuponsUtilizados.length"
      class="cupons-vazio">
      <div class="vazio-icone">
        <i class="fa-solid fa-circle-exclamation"></i>
      </div>

      <h3>Não foi possível carregar os cupons</h3>

      <p>{{ erro }}</p>

      <button
        type="button"
        class="btn-copiar"
        @click="atualizarCupons"
      >
        <i class="fa-solid fa-rotate"></i>
        Tentar novamente
      </button>
    </div>

    <template v-else>

      <!-- DISPONÍVEIS -->
      <section class="secao-cupons">
        <div class="lista-topo">
          <div>
            <span>SUAS RECOMPENSAS</span>
            <h3>Cupons disponíveis</h3>
          </div>

          <div class="contador-cupons">
            {{ quantidadeDisponiveis }}
          </div>
        </div>

        <div
          v-if="cuponsDisponiveis.length"
          class="lista-cupons"
        >
          <article
            v-for="cupom in cuponsDisponiveis"
            :key="cupom.id || cupom.codigo"
            class="cupom"
          >
            <div class="cupom-icone">
              <i :class="cupom.icone || 'fa-solid fa-gift'"></i>
            </div>

            <div class="cupom-conteudo">
              <span class="cupom-label status-disponivel">
                <i class="fa-solid fa-circle-check"></i>
                DISPONÍVEL
              </span>

              <h4>{{ cupom.titulo || "Recompensa especial" }}</h4>

              <p>
                {{ cupom.descricao || "Uma recompensa especial da Padaria Martins." }}
              </p>

              <div class="cupom-codigo">
                <span>CÓDIGO DO CUPOM</span>
                <strong>{{ cupom.codigo }}</strong>
              </div>

              <button
                type="button"
                class="btn-copiar"
                @click="copiarCodigo(cupom.codigo)"
              >
                <i
                  :class="
                    codigoCopiado === cupom.codigo
                      ? 'fa-solid fa-check'
                      : 'fa-regular fa-copy'
                  "
                ></i>

                {{
                  codigoCopiado === cupom.codigo
                    ? "Copiado!"
                    : "Copiar código"
                }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="cupons-vazio">
          <div class="vazio-icone">
            <i class="fa-solid fa-ticket"></i>
          </div>

          <h3>Nenhum prêmio disponível</h3>

          <p>
            Complete seu cartão de selos para receber
            novas recompensas.
          </p>
        </div>
      </section>

      <!-- UTILIZADOS -->
      <section class="secao-cupons secao-historico">
        <div class="lista-topo">
          <div>
            <span>SEU HISTÓRICO</span>
            <h3>Cupons utilizados</h3>
          </div>

          <div class="contador-cupons contador-utilizados">
            {{ quantidadeUtilizados }}
          </div>
        </div>

        <div
          v-if="cuponsUtilizados.length"
          class="lista-cupons"
        >
          <article
            v-for="cupom in cuponsUtilizados"
            :key="cupom.id || cupom.codigo"
            class="cupom cupom-ja-utilizado"
          >
            <div class="cupom-icone">
              <i :class="cupom.icone || 'fa-solid fa-gift'"></i>
            </div>

            <div class="cupom-conteudo">
              <span class="cupom-label status-utilizado">
                <i class="fa-solid fa-circle-check"></i>
                JÁ UTILIZADO
              </span>

              <h4>{{ cupom.titulo || "Recompensa especial" }}</h4>

              <p>
                {{ cupom.descricao || "Recompensa da Padaria Martins." }}
              </p>

              <div class="cupom-codigo">
                <span>CÓDIGO DO CUPOM</span>
                <strong>{{ cupom.codigo }}</strong>
              </div>

              <div
                v-if="cupom.utilizadoEm"
                class="cupom-data"
              >
                <i class="fa-regular fa-calendar-check"></i>
                Utilizado em {{ formatarData(cupom.utilizadoEm) }}
              </div>

              <button
                type="button"
                class="btn-copiar"
                @click="copiarCodigo(cupom.codigo)"
              >
                <i
                  :class="
                    codigoCopiado === cupom.codigo
                      ? 'fa-solid fa-check'
                      : 'fa-regular fa-copy'
                  "
                ></i>

                {{
                  codigoCopiado === cupom.codigo
                    ? "Copiado!"
                    : "Copiar código"
                }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="cupons-vazio">
          <div class="vazio-icone">
            <i class="fa-regular fa-clock"></i>
          </div>

          <h3>Nenhum cupom utilizado</h3>

          <p>
            Os cupons utilizados aparecerão aqui
            depois da confirmação do pagamento.
          </p>
        </div>
      </section>

    </template>

    <!-- FEEDBACK -->
    <div
      v-if="mensagem"
      class="mensagem-copiado"
      role="status"
      aria-live="polite"
    >
      <i
        :class="
          codigoCopiado
            ? 'fa-solid fa-circle-check'
            : 'fa-solid fa-circle-info'
        "
      ></i>

      {{ mensagem }}
    </div>

  </main>
</template>

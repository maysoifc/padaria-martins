
<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFidelidade } from "@/composables/useFidelidade";

const router = useRouter();

const {
  cuponsDisponiveis,
  cuponsUtilizados,
  carregando,
  erro,
  recarregar,
} = useFidelidade();

const totalCupons = computed(
  () =>
    cuponsDisponiveis.value.length +
    cuponsUtilizados.value.length
);

const formatarData = (valor) => {
  if (!valor) return "Não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return data.toLocaleDateString("pt-BR");
};

const obterValidade = (cupom) => {
  const validade =
    cupom?.validade ??
    cupom?.data_validade ??
    cupom?.validade_em ??
    cupom?.validadeAte ??
    cupom?.validade_ate ??
    cupom?.expires_at ??
    cupom?.expira_em ??
    cupom?.data_expiracao ??
    cupom?.dataExpiracao ??
    cupom?.valid_until ??
    cupom?.expiracao;

  return formatarData(validade);
};

const obterTitulo = (cupom) => {
  return (
    cupom?.titulo ||
    cupom?.nome ||
    cupom?.nome_premio ||
    cupom?.premio?.nome ||
    "Prêmio gratuito"
  );
};

const obterDescricao = (cupom) => {
  return (
    cupom?.descricao ||
    cupom?.detalhes ||
    cupom?.premio?.descricao ||
    "Um presente especial da Padaria Martins para você!"
  );
};

const obterCodigo = (cupom) => {
  return cupom?.codigo || "Código não informado";
};

const obterDataUtilizacao = (cupom) => {
  return (
    cupom?.utilizadoEm ||
    cupom?.utilizado_em ||
    cupom?.data_utilizacao ||
    cupom?.dataUtilizacao ||
    null
  );
};

const copiarCodigo = async (codigo) => {
  if (!codigo || codigo === "Código não informado") return;

  try {
    await navigator.clipboard.writeText(String(codigo));
    window.alert("Código do cupom copiado!");
  } catch {
    window.alert(`Código do cupom: ${codigo}`);
  }
};

const voltar = () => {
  router.push("/perfil");
};

onMounted(() => {
  recarregar();
});
</script>

<template>
  <div class="cupons-gratis-page">
    <header class="cupons-header">
      <button
        type="button"
        class="cupons-voltar"
        aria-label="Voltar ao perfil"
        @click="voltar"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="cupons-header-texto">
        <span>PROGRAMA DE FIDELIDADE</span>
        <h1>Cupons <em>Grátis</em></h1>
        <p>Seus presentes por fazer parte da nossa história.</p>
      </div>

      <div class="cupons-header-icone">
        <i class="fa-solid fa-gift"></i>
      </div>
    </header>

    <main class="cupons-conteudo">
      <section class="cupons-introducao">
        <div class="introducao-icone">
          <i class="fa-solid fa-award"></i>
        </div>

        <div>
          <span>SEU ESFORÇO VIROU RECOMPENSA</span>
          <h2>Você merece esse carinho!</h2>
          <p>
            Ao completar sua cartela de selos, você conquista
            recompensas especiais para aproveitar na Padaria Martins.
          </p>
        </div>
      </section>

      <section class="cupons-resumo">
        <div class="resumo-icone">
          <i class="fa-solid fa-ticket"></i>
        </div>

        <div class="resumo-texto">
          <span>SEUS CUPONS CONQUISTADOS</span>
          <strong>{{ totalCupons }}</strong>
          <small>Prêmios registrados na sua carteira</small>
        </div>

        <button
          type="button"
          class="atualizar-cupons"
          aria-label="Atualizar cupons"
          :disabled="carregando"
          @click="recarregar"
        >
          <i
            class="fa-solid fa-rotate"
            :class="{ 'fa-spin': carregando }"
          ></i>
        </button>
      </section>

      <div
        v-if="carregando && !totalCupons"
        class="cupons-carregando"
      >
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Buscando seus presentes...</span>
      </div>

      <section v-else-if="erro" class="cupons-erro">
        <i class="fa-solid fa-circle-exclamation"></i>

        <h3>Não foi possível carregar seus cupons</h3>

        <p>{{ erro }}</p>

        <button type="button" @click="recarregar">
          Tentar novamente
        </button>
      </section>

      <template v-else>
        <!-- CUPONS DISPONÍVEIS -->
        <section class="cupons-grupo">
          <div class="grupo-cabecalho">
            <div>
              <span class="grupo-legenda">SEUS PRESENTES</span>
              <h2>
                <i class="fa-solid fa-gift"></i>
                Disponíveis
              </h2>
            </div>

            <span class="grupo-contador">
              {{ cuponsDisponiveis.length }}
            </span>
          </div>

          <div
            v-if="cuponsDisponiveis.length"
            class="cupons-lista"
          >
            <article
              v-for="(cupom, indice) in cuponsDisponiveis"
              :key="cupom.id || cupom.codigo || indice"
              class="cupom-card"
            >
              <div class="cupom-faixa">
                <span>PADARIA MARTINS</span>
                <i class="fa-solid fa-wheat-awn"></i>
              </div>

              <div class="cupom-card-conteudo">
                <div class="cupom-topo">
                  <span class="cupom-status disponivel">
                    <i class="fa-solid fa-circle-check"></i>
                    Disponível
                  </span>

                  <i class="fa-solid fa-gift cupom-icone"></i>
                </div>

                <h3>{{ obterTitulo(cupom) }}</h3>

                <p class="cupom-descricao">
                  {{ obterDescricao(cupom) }}
                </p>

                <div class="cupom-codigo-area">
                  <div>
                    <span>CÓDIGO DO SEU PRÊMIO</span>
                    <strong>{{ obterCodigo(cupom) }}</strong>
                  </div>

                  <button
                    v-if="cupom.codigo"
                    type="button"
                    aria-label="Copiar código do cupom"
                    @click="copiarCodigo(cupom.codigo)"
                  >
                    <i class="fa-regular fa-copy"></i>
                  </button>
                </div>

                <div class="cupom-informacoes">
                  <div>
                    <i class="fa-regular fa-calendar"></i>
                    <span>
                      Validade:
                      <strong>{{ obterValidade(cupom) }}</strong>
                    </span>
                  </div>

                  <div
                    v-if="cupom.criadoEm || cupom.criado_em"
                  >
                    <i class="fa-regular fa-clock"></i>
                    <span>
                      Conquistado em:
                      <strong>
                        {{ formatarData(cupom.criadoEm || cupom.criado_em) }}
                      </strong>
                    </span>
                  </div>
                </div>

                <div class="cupom-retirada">
                  <i class="fa-solid fa-store"></i>

                  <div>
                    <strong>Retire na loja!</strong>
                    <span>
                      Apresente este código no atendimento da
                      Padaria Martins para retirar seu prêmio.
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="cupons-vazio">
            <div class="vazio-icone">
              <i class="fa-solid fa-gift"></i>
            </div>

            <h3>Nenhum prêmio disponível por enquanto</h3>

            <p>
              Continue juntando selos na sua cartela.
              Ao completar os 10 selos, seus prêmios aparecerão aqui!
            </p>

            <button
              type="button"
              @click="router.push('/detalhes/carteira/selos')"
            >
              <i class="fa-solid fa-certificate"></i>
              Ver meus selos
            </button>
          </div>
        </section>

        <!-- CUPONS UTILIZADOS -->
        <section class="cupons-grupo grupo-utilizados">
          <div class="grupo-cabecalho">
            <div>
              <span class="grupo-legenda">SEUS PRÊMIOS ANTERIORES</span>
              <h2>
                <i class="fa-solid fa-check-double"></i>
                Já utilizados
              </h2>
            </div>

            <span class="grupo-contador utilizados">
              {{ cuponsUtilizados.length }}
            </span>
          </div>

          <div
            v-if="cuponsUtilizados.length"
            class="cupons-lista"
          >
            <article
              v-for="(cupom, indice) in cuponsUtilizados"
              :key="cupom.id || cupom.codigo || indice"
              class="cupom-card cupom-utilizado"
            >
              <div class="cupom-faixa">
                <span>PADARIA MARTINS</span>
                <i class="fa-solid fa-wheat-awn"></i>
              </div>

              <div class="cupom-card-conteudo">
                <div class="cupom-topo">
                  <span class="cupom-status utilizado">
                    <i class="fa-solid fa-check"></i>
                    Utilizado
                  </span>

                  <i class="fa-solid fa-gift cupom-icone"></i>
                </div>

                <h3>{{ obterTitulo(cupom) }}</h3>

                <p class="cupom-descricao">
                  {{ obterDescricao(cupom) }}
                </p>

                <div class="cupom-codigo-area">
                  <div>
                    <span>CÓDIGO DO PRÊMIO</span>
                    <strong>{{ obterCodigo(cupom) }}</strong>
                  </div>
                </div>

                <div class="cupom-informacoes">
                  <div>
                    <i class="fa-regular fa-calendar-check"></i>
                    <span>
                      Utilizado em:
                      <strong>
                        {{ formatarData(obterDataUtilizacao(cupom)) }}
                      </strong>
                    </span>
                  </div>
                </div>

                <div class="cupom-retirada retirada-concluida">
                  <i class="fa-solid fa-circle-check"></i>

                  <div>
                    <strong>Prêmio resgatado</strong>
                    <span>
                      Este cupom já foi utilizado e não está mais
                      disponível para uma nova retirada.
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="utilizados-vazio">
            <i class="fa-regular fa-folder-open"></i>
            <span>Você ainda não utilizou nenhum cupom.</span>
          </div>
        </section>
      </template>

      <footer class="cupons-rodape">
        <i class="fa-solid fa-heart"></i>
        <span>Feito com carinho para você.</span>
        <small>PADARIA MARTINS</small>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.cupons-gratis-page {
  min-height: 100vh;
  background: #fbf8f3;
  color: #5e3023;
  padding-bottom: 40px;
}

.cupons-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 35px max(5%, calc((100% - 1050px) / 2));
  background: linear-gradient(125deg, #5e3023, #754b35);
  color: #fff8ed;
  overflow: hidden;
}

.cupons-voltar {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 13px;
  color: #fff8ed;
  background: rgba(255,255,255,.08);
  cursor: pointer;
}

.cupons-header-texto {
  flex: 1;
}

.cupons-header-texto > span,
.introducao-icone + div > span {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #e1c98f;
}

.cupons-header h1 {
  margin: 7px 0;
  font-family: Georgia, serif;
  font-size: clamp(27px, 5vw, 39px);
  font-weight: 500;
}

.cupons-header h1 em {
  color: #e1c98f;
}

.cupons-header p {
  margin: 0;
  color: #f3e4d2;
  font-size: 13px;
}

.cupons-header-icone {
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(225,201,143,.15);
  color: #e1c98f;
  font-size: 36px;
}

.cupons-conteudo {
  width: min(100% - 36px, 950px);
  margin: 28px auto;
}

.cupons-introducao {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 23px;
  background: #fff;
  border: 1px solid #ead9c5;
  border-radius: 20px;
  margin-bottom: 20px;
}

.introducao-icone {
  width: 58px;
  height: 58px;
  min-width: 58px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: #f7eee2;
  color: #a47b49;
  font-size: 25px;
}

.cupons-introducao h2 {
  margin: 5px 0;
  font-family: Georgia, serif;
  font-size: 21px;
}

.cupons-introducao p {
  margin: 0;
  color: #907968;
  font-size: 13px;
  line-height: 1.6;
}

.cupons-resumo {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 18px;
  background: #f7eee2;
  border: 1px solid #e9d8c1;
  margin-bottom: 34px;
}

.resumo-icone {
  width: 51px;
  height: 51px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: #5e3023;
  color: #e1c98f;
  font-size: 22px;
}

.resumo-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.resumo-texto span {
  font-size: 10px;
  letter-spacing: 1.3px;
  font-weight: 800;
  color: #8c6748;
}

.resumo-texto strong {
  font-size: 27px;
}

.resumo-texto small {
  color: #987e68;
  font-size: 11px;
}

.atualizar-cupons {
  width: 40px;
  height: 40px;
  border: 1px solid #dfc9aa;
  border-radius: 12px;
  color: #5e3023;
  background: #fffaf4;
  cursor: pointer;
}

.atualizar-cupons:disabled {
  opacity: .6;
}

.cupons-grupo {
  margin-bottom: 36px;
}

.grupo-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 17px;
}

.grupo-legenda {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.7px;
  color: #ad906e;
}

.grupo-cabecalho h2 {
  margin: 5px 0 0;
  font-family: Georgia, serif;
  font-size: 23px;
}

.grupo-cabecalho h2 i {
  color: #b89764;
  font-size: 17px;
  margin-right: 5px;
}

.grupo-contador {
  min-width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  padding: 0 9px;
  border-radius: 12px;
  background: #e1c98f;
  color: #5e3023;
  font-weight: 800;
}

.grupo-contador.utilizados {
  background: #e8e6df;
  color: #777064;
}

.cupons-lista {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px;
}

.cupom-card {
  overflow: hidden;
  border: 1px solid #e8d6c1;
  border-radius: 19px;
  background: #fff;
  box-shadow: 0 7px 20px rgba(94,48,35,.045);
}

.cupom-faixa {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 17px;
  background: #5e3023;
  color: #e1c98f;
}

.cupom-faixa span {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
}

.cupom-faixa i {
  font-size: 16px;
}

.cupom-card-conteudo {
  padding: 17px;
}

.cupom-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cupom-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
}

.cupom-status.disponivel {
  background: #edf4e9;
  color: #58764a;
}

.cupom-status.utilizado {
  background: #efeee9;
  color: #777064;
}

.cupom-icone {
  color: #b89764;
  font-size: 22px;
}

.cupom-card h3 {
  margin: 13px 0 6px;
  font-family: Georgia, serif;
  font-size: 21px;
}

.cupom-descricao {
  min-height: 38px;
  margin: 0 0 16px;
  color: #8d7868;
  font-size: 12px;
  line-height: 1.55;
}

.cupom-codigo-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border: 1px dashed #c8a978;
  border-radius: 12px;
  background: #fcf8f0;
}

.cupom-codigo-area div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.cupom-codigo-area span {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #a58a6b;
}

.cupom-codigo-area strong {
  overflow-wrap: anywhere;
  font-size: 16px;
  letter-spacing: 1px;
  color: #5e3023;
}

.cupom-codigo-area button {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 0;
  border-radius: 10px;
  background: #e1c98f;
  color: #5e3023;
  cursor: pointer;
}

.cupom-informacoes {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px 0;
}

.cupom-informacoes > div {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #927d69;
  font-size: 11px;
}

.cupom-informacoes i {
  color: #b89764;
}

.cupom-informacoes strong {
  color: #5e3023;
}

.cupom-retirada {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px;
  border-radius: 12px;
  background: #f7eee2;
  color: #8c6748;
}

.cupom-retirada > i {
  margin-top: 2px;
  font-size: 17px;
  color: #a47b49;
}

.cupom-retirada div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cupom-retirada strong {
  font-size: 12px;
  color: #5e3023;
}

.cupom-retirada span {
  font-size: 10px;
  line-height: 1.5;
}

.retirada-concluida {
  background: #f0f0e9;
}

.retirada-concluida > i {
  color: #758267;
}

.cupom-utilizado {
  opacity: .82;
}

.cupom-utilizado .cupom-faixa {
  background: #777064;
}

.cupons-vazio {
  padding: 32px 20px;
  text-align: center;
  border: 1px dashed #dfcbb1;
  border-radius: 18px;
  background: #fffdf9;
}

.vazio-icone {
  width: 55px;
  height: 55px;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: #f7eee2;
  color: #b89764;
  font-size: 23px;
}

.cupons-vazio h3 {
  margin: 0 0 7px;
  font-family: Georgia, serif;
  font-size: 19px;
}

.cupons-vazio p {
  max-width: 420px;
  margin: 0 auto 17px;
  color: #927d69;
  font-size: 12px;
  line-height: 1.6;
}

.cupons-vazio button,
.cupons-erro button {
  padding: 11px 17px;
  border: 0;
  border-radius: 10px;
  background: #5e3023;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.utilizados-vazio {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 19px;
  border: 1px solid #e9dfd2;
  border-radius: 14px;
  color: #927d69;
  background: #fff;
  font-size: 12px;
}

.utilizados-vazio i {
  font-size: 20px;
  color: #b89764;
}

.cupons-carregando,
.cupons-erro {
  padding: 35px 20px;
  text-align: center;
  color: #8c6748;
}

.cupons-carregando i {
  display: block;
  margin-bottom: 12px;
  font-size: 25px;
}

.cupons-erro {
  border: 1px solid #e8d6c1;
  border-radius: 16px;
  background: #fff;
}

.cupons-erro > i {
  font-size: 27px;
  color: #a47b49;
}

.cupons-erro h3 {
  margin-bottom: 7px;
}

.cupons-erro p {
  font-size: 12px;
}

.cupons-rodape {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 25px 0 10px;
  color: #a58a6b;
}

.cupons-rodape i {
  color: #b89764;
}

.cupons-rodape span {
  font-family: Georgia, serif;
  font-size: 14px;
}

.cupons-rodape small {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
}

@media (max-width: 650px) {
  .cupons-header {
    padding: 25px 18px;
    gap: 12px;
  }

  .cupons-header-icone {
    width: 53px;
    height: 53px;
    font-size: 24px;
  }

  .cupons-header p {
    max-width: 230px;
    line-height: 1.5;
  }

  .cupons-conteudo {
    width: calc(100% - 26px);
    margin-top: 18px;
  }

  .cupons-introducao {
    padding: 16px;
    gap: 12px;
  }

  .introducao-icone {
    width: 45px;
    height: 45px;
    min-width: 45px;
    font-size: 20px;
  }

  .cupons-introducao h2 {
    font-size: 18px;
  }

  .cupons-introducao p {
    font-size: 11px;
  }

  .cupons-resumo {
    padding: 15px;
  }

  .cupons-lista {
    grid-template-columns: 1fr;
  }

  .cupom-card-conteudo {
    padding: 16px;
  }
}

@media (max-width: 360px) {
  .cupons-header-icone {
    display: none;
  }

  .grupo-cabecalho h2 {
    font-size: 20px;
  }
}
</style>

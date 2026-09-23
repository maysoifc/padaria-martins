<script setup>
import { ref, onMounted } from "vue";

const cupons = ref([]);

const carregarCupons = () => {
  const salvo = localStorage.getItem("cuponsCarteira");

  if (!salvo) {
    cupons.value = [];
    return;
  }

  try {
    const dados = JSON.parse(salvo);

    cupons.value = Array.isArray(dados)
      ? dados
      : [];
  } catch {
    cupons.value = [];
  }
};

const removerCupom = (id) => {
  cupons.value = cupons.value.filter(
    cupom => cupom.id !== id
  );

  localStorage.setItem(
    "cuponsCarteira",
    JSON.stringify(cupons.value)
  );
};

onMounted(() => {
  carregarCupons();
});
</script>

<template>
  <div class="cupons-container">

    <div
      v-if="cupons.length === 0"
      class="cupons-vazio"
    >
      <div class="vazio-icone">
        <i class="fa-solid fa-ticket"></i>
      </div>

      <span class="vazio-label">
        SEUS CUPONS
      </span>

      <h3>
        Nenhum prêmio disponível
      </h3>

      <p>
        Complete seu cartão de selos para receber
        prêmios especiais aqui.
      </p>
    </div>

    <div
      v-else
      class="lista-cupons"
    >
      <div class="lista-topo">
        <div>
          <span>
            SEUS PRÊMIOS
          </span>

          <h3>
            Cupons disponíveis
          </h3>
        </div>

        <div class="contador-cupons">
          {{ cupons.length }}
        </div>
      </div>

      <article
        v-for="cupom in cupons"
        :key="cupom.id"
        class="cupom"
      >
        <div class="cupom-icone">
          <i
            :class="
              cupom.icone ||
              'fa-solid fa-gift'
            "
          ></i>
        </div>

        <div class="cupom-conteudo">
          <span class="cupom-label">
            PRÊMIO
          </span>

          <h4>
            {{ cupom.titulo }}
          </h4>

          <p>
            {{ cupom.descricao }}
          </p>

          <div class="cupom-codigo">
            <span>
              CÓDIGO
            </span>

            <strong>
              {{ cupom.codigo }}
            </strong>
          </div>
        </div>

        <button
          type="button"
          class="btn-usar"
          @click="removerCupom(cupom.id)"
        >
          <span>
            Usar
          </span>

          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </article>
    </div>

  </div>
</template>

<style scoped>
.cupons-container {
  width: 100%;
}

.cupons-vazio {
  min-height: 360px;
  padding: 45px 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.vazio-icone {
  width: 82px;
  height: 82px;
  margin-bottom: 20px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(164, 132, 82, 0.18);
  border-radius: 50%;
  background: #fbf7f0;
  color: #b29362;
  font-size: 1.7rem;
  box-shadow:
    0 15px 30px
    rgba(85, 59, 37, 0.07);
}

.vazio-label,
.lista-topo > div > span {
  color: #a48452;
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.cupons-vazio h3,
.lista-topo h3 {
  margin: 8px 0 10px;
  color: #432f22;
  font-family: "Playfair Display", serif;
  font-size: 1.55rem;
  font-weight: 600;
}

.cupons-vazio p {
  max-width: 360px;
  margin: 0;
  color: #958374;
  font-size: 0.82rem;
  line-height: 1.65;
}

.lista-cupons {
  padding: 24px;
}

.lista-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.lista-topo h3 {
  margin-bottom: 0;
  font-size: 1.35rem;
}

.contador-cupons {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f4eee5;
  color: #765636;
  font-size: 0.78rem;
  font-weight: 800;
}

.lista-cupons {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lista-cupons .lista-topo {
  width: 100%;
}

.cupom {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px;
  overflow: hidden;
  border: 1px solid #eadfd2;
  border-radius: 20px;
  background: #fffdf9;
  box-shadow:
    0 8px 25px
    rgba(65, 45, 29, 0.05);
  transition: 0.25s ease;
}

.cupom:hover {
  transform: translateY(-2px);
  border-color: rgba(164, 132, 82, 0.25);
  box-shadow:
    0 12px 30px
    rgba(65, 45, 29, 0.08);
}

.cupom::after {
  content: "";
  position: absolute;
  width: 90px;
  height: 90px;
  right: -45px;
  bottom: -45px;
  border-radius: 50%;
  background: rgba(184, 151, 100, 0.08);
  pointer-events: none;
}

.cupom-icone {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: #f4eee5;
  color: #a38454;
  font-size: 1rem;
}

.cupom-conteudo {
  min-width: 0;
  flex: 1;
}

.cupom-label {
  display: block;
  margin-bottom: 3px;
  color: #b89764;
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.cupom-conteudo h4 {
  margin: 0 0 3px;
  color: #4a3527;
  font-family: "Playfair Display", serif;
  font-size: 1.05rem;
  font-weight: 600;
}

.cupom-conteudo p {
  margin: 0;
  color: #958374;
  font-size: 0.66rem;
  line-height: 1.4;
}

.cupom-codigo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 9px;
  padding: 5px 8px;
  border-radius: 7px;
  background: #f8f3ea;
}

.cupom-codigo span {
  color: #aa947a;
  font-size: 0.46rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.cupom-codigo strong {
  color: #6f5136;
  font-size: 0.56rem;
  letter-spacing: 0.04em;
}

.btn-usar {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 10px 13px;
  border: 0;
  border-radius: 11px;
  background: #4b3527;
  color: #fffaf3;
  font-family: "DM Sans", sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-usar:hover {
  background: #39281e;
  transform: translateX(2px);
}

.btn-usar i {
  font-size: 0.55rem;
}

@media (max-width: 600px) {
  .lista-cupons {
    padding: 20px;
  }

  .cupom {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .cupom-conteudo {
    flex: 1;
  }

  .btn-usar {
    width: 100%;
    justify-content: center;
    margin-top: 3px;
  }
}

@media (max-width: 390px) {
  .lista-cupons {
    padding: 17px;
  }

  .cupons-vazio {
    min-height: 330px;
    padding: 35px 20px;
  }

  .cupons-vazio h3 {
    font-size: 1.35rem;
  }

  .lista-topo h3 {
    font-size: 1.2rem;
  }

  .cupom {
    padding: 14px;
    gap: 11px;
  }

  .cupom-icone {
    width: 42px;
    height: 42px;
    border-radius: 13px;
  }

  .cupom-conteudo h4 {
    font-size: 0.95rem;
  }
}
</style>

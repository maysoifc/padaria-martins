<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/composables/useCart';

const router = useRouter();

const {
  itensCarrinho,
  removerItem,
  carregarCarrinho
} = useCartStore();

const itensSelecionados = ref([]);

onMounted(() => {
  carregarCarrinho();

  const salvos = localStorage.getItem('itensSelecionados');

  if (salvos) {
    try {
      const idsSalvos = JSON.parse(salvos);

      itensSelecionados.value = idsSalvos.filter(id =>
        itensCarrinho.value.some(item => item.idProduto === id)
      );
    } catch {
      itensSelecionados.value = [];
    }
  }
});

const salvarSelecaoStorage = () => {
  localStorage.setItem(
    'itensSelecionados',
    JSON.stringify(itensSelecionados.value)
  );
};

const quantidadeSelecionada = computed(() => {
  return itensSelecionados.value.length;
});

const todosSelecionados = computed(() => {
  return (
    itensCarrinho.value.length > 0 &&
    itensSelecionados.value.length === itensCarrinho.value.length
  );
});

const marcarTodos = computed({
  get: () => todosSelecionados.value,
  set: (marcar) => {
    itensSelecionados.value = marcar
      ? itensCarrinho.value.map(item => item.idProduto)
      : [];

    salvarSelecaoStorage();
  }
});

const estaSelecionado = (idProduto) => {
  return itensSelecionados.value.includes(idProduto);
};

const alternarSelecao = (idProduto) => {
  const index = itensSelecionados.value.indexOf(idProduto);

  if (index > -1) {
    itensSelecionados.value.splice(index, 1);
  } else {
    itensSelecionados.value.push(idProduto);
  }

  salvarSelecaoStorage();
};

const getImageUrl = (nomeImagem) => {
  try {
    return new URL(
      `../assets/img/${nomeImagem}`,
      import.meta.url
    ).href;
  } catch {
    return '';
  }
};

const formatarPreco = (valor) => {
  return Number(valor || 0)
    .toFixed(2)
    .replace('.', ',');
};

const subtotalItem = (item) => {
  return Number(item.preco || 0) * Number(item.quantidade || 1);
};

const diminuirQuantidade = (item) => {
  if (item.quantidade > 1) {
    item.quantidade--;
    salvarSelecaoStorage();
    return;
  }

  removerItem(item.idProduto);

  itensSelecionados.value = itensSelecionados.value.filter(
    id => id !== item.idProduto
  );

  salvarSelecaoStorage();
};

const aumentarQuantidade = (item) => {
  item.quantidade++;
};

const valorTotal = computed(() => {
  return itensCarrinho.value.reduce((total, item) => {
    if (!estaSelecionado(item.idProduto)) {
      return total;
    }

    return total + subtotalItem(item);
  }, 0);
});

const quantidadeTotalProdutos = computed(() => {
  return itensCarrinho.value.reduce((total, item) => {
    if (!estaSelecionado(item.idProduto)) {
      return total;
    }

    return total + Number(item.quantidade || 1);
  }, 0);
});

const irParaFinalizacao = () => {
  if (itensSelecionados.value.length === 0) {
    alert('Selecione pelo menos um produto para continuar.');
    return;
  }

  const compraFinal = itensCarrinho.value.filter(item =>
    itensSelecionados.value.includes(item.idProduto)
  );

  localStorage.setItem(
    'itensCheckout',
    JSON.stringify(compraFinal)
  );

  router.push({
    name: 'CheckoutCarrinho'
  });
};

const voltar = () => {
  router.push({
    name: 'home'
  });
};
</script>

<template>
  <div class="carrinho-page">

    <header class="carrinho-header">

      <button
        type="button"
        class="btn-voltar"
        @click="voltar"
        aria-label="Voltar para a home"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="titulo-area">

        <span class="titulo-label">
          SEU PEDIDO
        </span>

        <h1>Meu carrinho</h1>

        <p v-if="itensCarrinho.length > 0">
          {{ itensCarrinho.length }}
          {{ itensCarrinho.length === 1 ? 'produto' : 'produtos' }}
          no seu carrinho
        </p>

      </div>

      <div class="icone-sacola">

        <i class="fa-solid fa-bag-shopping"></i>

        <span v-if="itensCarrinho.length">
          {{ itensCarrinho.length }}
        </span>

      </div>

    </header>

    <main class="carrinho-container">

      <section
        v-if="itensCarrinho.length === 0"
        class="carrinho-vazio"
      >

        <div class="vazio-ilustracao">

          <div class="vazio-circulo">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>

          <span class="detalhe detalhe-1"></span>
          <span class="detalhe detalhe-2"></span>
          <span class="detalhe detalhe-3"></span>

        </div>

        <span class="vazio-label">
          SEU CARRINHO ESTÁ ESPERANDO
        </span>

        <h2>
          Que tal escolher<br />
          algo delicioso?
        </h2>

        <p>
          Explore nosso cardápio e encontre aquele sabor
          perfeito para o seu momento.
        </p>

        <button
          type="button"
          class="btn-ver-produtos"
          @click="router.push('/menu')"
        >
          <span>Explorar cardápio</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>

      </section>

      <template v-else>

        <div class="selecao-topo">

          <label class="selecao-todos">

            <span
              class="checkbox-custom"
              :class="{ ativo: todosSelecionados }"
            >

              <i
                v-if="todosSelecionados"
                class="fa-solid fa-check"
              ></i>

              <input
                type="checkbox"
                v-model="marcarTodos"
              />

            </span>

            <span>
              {{
                todosSelecionados
                  ? 'Todos selecionados'
                  : 'Selecionar todos'
              }}
            </span>

          </label>

          <span class="quantidade-selecionada">

            {{ quantidadeSelecionada }}

            selecionado{{ quantidadeSelecionada === 1 ? '' : 's' }}

          </span>

        </div>

        <section class="lista-cards">

          <article
            v-for="item in itensCarrinho"
            :key="item.idProduto"
            class="item-card"
            :class="{
              selecionado: estaSelecionado(item.idProduto)
            }"
          >

            <button
              type="button"
              class="area-selecao"
              @click="alternarSelecao(item.idProduto)"
              :aria-label="`Selecionar ${item.nome}`"
            >

              <span
                class="checkbox-produto"
                :class="{
                  ativo: estaSelecionado(item.idProduto)
                }"
              >

                <i
                  v-if="estaSelecionado(item.idProduto)"
                  class="fa-solid fa-check"
                ></i>

              </span>

            </button>

            <div class="imagem-produto">

              <img
                :src="getImageUrl(item.imagem)"
                :alt="item.nome"
              />

            </div>

            <div class="produto-info">

              <span class="produto-tag">
                PRODUTO
              </span>

              <h2>
                {{ item.nome }}
              </h2>

              <p class="preco-unitario">
                R$ {{ formatarPreco(item.preco) }}
                <span>cada</span>
              </p>

              <div class="produto-bottom">

                <div class="controle-quantidade">

                  <button
                    type="button"
                    class="btn-controle"
                    :class="{
                      remover: item.quantidade === 1
                    }"
                    @click.stop="diminuirQuantidade(item)"
                    :aria-label="
                      item.quantidade === 1
                        ? 'Remover produto'
                        : 'Diminuir quantidade'
                    "
                  >

                    <i
                      v-if="item.quantidade === 1"
                      class="fa-solid fa-trash-can"
                    ></i>

                    <span v-else>
                      −
                    </span>

                  </button>

                  <span class="numero-quantidade">
                    {{ item.quantidade }}
                  </span>

                  <button
                    type="button"
                    class="btn-controle"
                    @click.stop="aumentarQuantidade(item)"
                    aria-label="Aumentar quantidade"
                  >
                    <span>+</span>
                  </button>

                </div>

                <strong class="subtotal-item">
                  R$ {{ formatarPreco(subtotalItem(item)) }}
                </strong>

              </div>

            </div>

          </article>

        </section>

      </template>

    </main>

    <aside
      v-if="itensCarrinho.length > 0"
      class="resumo-carrinho"
    >

      <div class="resumo-conteudo">

        <div class="resumo-info">

          <div class="resumo-linha pequena">

            <span>
              {{ quantidadeTotalProdutos }}
              {{ quantidadeTotalProdutos === 1 ? 'item' : 'itens' }}
            </span>

            <span>
              {{ quantidadeSelecionada }}
              selecionado{{ quantidadeSelecionada === 1 ? '' : 's' }}
            </span>

          </div>

          <div class="resumo-total">

            <span>Total</span>

            <strong>
              R$ {{ formatarPreco(valorTotal) }}
            </strong>

          </div>

        </div>

        <button
          type="button"
          class="btn-finalizar"
          :disabled="quantidadeSelecionada === 0"
          @click="irParaFinalizacao"
        >

          <span>Continuar</span>

          <i class="fa-solid fa-arrow-right"></i>

        </button>

      </div>

    </aside>

  </div>
</template>

<style scoped>
.carrinho-page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 10% 5%,
      rgba(184, 162, 112, 0.12),
      transparent 25%
    ),
    linear-gradient(
      180deg,
      #fbf8f3 0%,
      #f7f1e8 100%
    );
  color: #5e3023;
  padding-bottom: 170px;
}

.carrinho-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 750px;
  min-height: 155px;
  margin: 0 auto;
  padding: 25px 25px 20px;
  box-sizing: border-box;
}

.btn-voltar {
  position: absolute;
  left: 22px;
  top: 28px;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(94, 48, 35, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  color: #5e3023;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 6px 20px rgba(94, 48, 35, 0.06);
  transition: 0.25s ease;
  z-index: 2;
}

.btn-voltar:hover {
  background: #5e3023;
  color: white;
  transform: translateX(-2px);
}

.titulo-area {
  text-align: center;
}

.titulo-label {
  display: block;
  margin-bottom: 7px;
  color: #b89764;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 2px;
}

.titulo-area h1 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2rem, 8vw, 2.7rem);
  line-height: 1;
  font-weight: 800;
}

.titulo-area p {
  margin: 10px 0 0;
  color: #8c7b70;
  font-size: 0.72rem;
}

.icone-sacola {
  position: absolute;
  right: 22px;
  top: 28px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #5e3023;
  color: #e1c98f;
  font-size: 16px;
  box-shadow: 0 8px 20px rgba(94, 48, 35, 0.16);
}

.icone-sacola span {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  box-sizing: border-box;
  border: 2px solid #fbf8f3;
  border-radius: 50px;
  background: #b89764;
  color: white;
  font-size: 0.55rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carrinho-container {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  padding: 0 18px;
  box-sizing: border-box;
}

.selecao-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 0 3px;
}

.selecao-todos {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #6a594f;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
}

.checkbox-custom {
  position: relative;
  width: 21px;
  height: 21px;
  border: 1.5px solid #d6c8b8;
  border-radius: 7px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
}

.checkbox-custom.ativo {
  background: #5e3023;
  border-color: #5e3023;
  color: #e1c98f;
}

.checkbox-custom i {
  font-size: 10px;
}

.checkbox-custom input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

.quantidade-selecionada {
  color: #a39284;
  font-size: 0.68rem;
  font-weight: 700;
}

.lista-cards {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.item-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 126px;
  padding: 12px;
  border: 1px solid rgba(94, 48, 35, 0.06);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 8px 30px rgba(94, 48, 35, 0.055),
    0 1px 3px rgba(94, 48, 35, 0.03);
  box-sizing: border-box;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.item-card.selecionado {
  border-color: rgba(184, 151, 100, 0.45);
  box-shadow:
    0 10px 32px rgba(94, 48, 35, 0.08),
    0 0 0 1px rgba(184, 151, 100, 0.08);
}

.area-selecao {
  width: 25px;
  height: 100%;
  min-height: 95px;
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-produto {
  width: 21px;
  height: 21px;
  border: 1.5px solid #d8cabb;
  border-radius: 7px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
}

.checkbox-produto.ativo {
  background: #5e3023;
  border-color: #5e3023;
  color: #e1c98f;
  transform: scale(1.05);
}

.checkbox-produto i {
  font-size: 10px;
}

.imagem-produto {
  width: 92px;
  height: 92px;
  overflow: hidden;
  border-radius: 17px;
  background: #f3eadf;
  flex-shrink: 0;
}

.imagem-produto img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.item-card:hover .imagem-produto img {
  transform: scale(1.06);
}

.produto-info {
  min-width: 0;
  flex: 1;
  padding: 2px 2px 2px 0;
}

.produto-tag {
  display: block;
  margin-bottom: 4px;
  color: #b89764;
  font-size: 0.48rem;
  font-weight: 900;
  letter-spacing: 1.4px;
}

.produto-info h2 {
  margin: 0 0 5px;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preco-unitario {
  margin: 0;
  color: #89786d;
  font-size: 0.67rem;
  font-weight: 600;
}

.preco-unitario span {
  color: #b1a198;
  font-size: 0.6rem;
}

.produto-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 11px;
}

.controle-quantidade {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid #eee5db;
  border-radius: 50px;
  background: #f9f5ef;
}

.btn-controle {
  width: 27px;
  height: 27px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: white;
  color: #5e3023;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 7px rgba(94, 48, 35, 0.05);
  transition: 0.2s ease;
}

.btn-controle:hover {
  background: #5e3023;
  color: #e1c98f;
  transform: scale(1.05);
}

.btn-controle.remover {
  color: #a6534b;
  background: #fff5f3;
}

.btn-controle.remover:hover {
  background: #a6534b;
  color: white;
}

.numero-quantidade {
  min-width: 21px;
  text-align: center;
  color: #5e3023;
  font-size: 0.75rem;
  font-weight: 900;
}

.subtotal-item {
  color: #5e3023;
  font-size: 0.83rem;
  white-space: nowrap;
}

.carrinho-vazio {
  position: relative;
  overflow: hidden;
  padding: 48px 24px;
  border: 1px solid rgba(94, 48, 35, 0.06);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  box-shadow: 0 15px 45px rgba(94, 48, 35, 0.07);
}

.vazio-ilustracao {
  position: relative;
  width: 145px;
  height: 145px;
  margin: 0 auto 25px;
}

.vazio-circulo {
  position: absolute;
  inset: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      #5e3023,
      #774636
    );
  color: #e1c98f;
  font-size: 40px;
  box-shadow: 0 15px 30px rgba(94, 48, 35, 0.18);
}

.detalhe {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: #b89764;
}

.detalhe-1 {
  width: 9px;
  height: 9px;
  top: 4px;
  right: 23px;
}

.detalhe-2 {
  width: 6px;
  height: 6px;
  bottom: 16px;
  left: 8px;
}

.detalhe-3 {
  width: 13px;
  height: 13px;
  right: 4px;
  bottom: 35px;
  opacity: 0.5;
}

.vazio-label {
  color: #b89764;
  font-size: 0.57rem;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.carrinho-vazio h2 {
  margin: 10px 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.8rem;
  line-height: 1.08;
}

.carrinho-vazio p {
  max-width: 360px;
  margin: 0 auto 25px;
  color: #89786d;
  font-size: 0.78rem;
  line-height: 1.6;
}

.btn-ver-produtos {
  min-height: 47px;
  padding: 0 20px;
  border: none;
  border-radius: 14px;
  background: #5e3023;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 9px 22px rgba(94, 48, 35, 0.17);
  transition: 0.25s ease;
}

.btn-ver-produtos i {
  color: #e1c98f;
}

.btn-ver-produtos:hover {
  transform: translateY(-2px);
  box-shadow: 0 13px 27px rgba(94, 48, 35, 0.23);
}

.resumo-carrinho {
  position: fixed;
  z-index: 900;
  left: 50%;
  bottom: 0;
  width: min(750px, 100%);
  transform: translateX(-50%);
  padding: 10px 15px calc(10px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: rgba(251, 248, 243, 0.88);
  border-top: 1px solid rgba(94, 48, 35, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.resumo-conteudo {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 11px 12px 11px 16px;
  border-radius: 20px;
  background: #5e3023;
  box-shadow: 0 -5px 25px rgba(94, 48, 35, 0.14);
}

.resumo-info {
  min-width: 0;
  flex: 1;
}

.resumo-linha.pequena {
  display: flex;
  gap: 7px;
  margin-bottom: 3px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.56rem;
  font-weight: 700;
}

.resumo-linha.pequena span + span::before {
  content: "•";
  margin-right: 7px;
  color: #b89764;
}

.resumo-total {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.resumo-total span {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.7rem;
  font-weight: 600;
}

.resumo-total strong {
  color: #e1c98f;
  font-size: 1.25rem;
  line-height: 1;
  font-weight: 900;
}

.btn-finalizar {
  min-width: 125px;
  min-height: 47px;
  padding: 0 15px;
  border: none;
  border-radius: 14px;
  background: #e1c98f;
  color: #5e3023;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: 0.7rem;
  font-weight: 900;
  cursor: pointer;
  transition: 0.25s ease;
}

.btn-finalizar:hover:not(:disabled) {
  background: white;
  transform: translateY(-2px);
}

.btn-finalizar:disabled {
  background: #806354;
  color: rgba(255, 255, 255, 0.45);
  cursor: not-allowed;
  box-shadow: none;
}

.btn-finalizar i {
  font-size: 10px;
}

@media (max-width: 480px) {
  .carrinho-header {
    min-height: 140px;
    padding-top: 25px;
  }

  .btn-voltar,
  .icone-sacola {
    top: 22px;
  }

  .btn-voltar {
    left: 16px;
  }

  .icone-sacola {
    right: 16px;
  }

  .titulo-area h1 {
    font-size: 2rem;
  }

  .item-card {
    gap: 9px;
    padding: 10px;
    min-height: 118px;
    border-radius: 19px;
  }

  .area-selecao {
    width: 21px;
    min-height: 92px;
  }

  .imagem-produto {
    width: 78px;
    height: 78px;
    border-radius: 15px;
  }

  .produto-info h2 {
    font-size: 0.95rem;
  }

  .produto-bottom {
    margin-top: 8px;
  }

  .btn-controle {
    width: 25px;
    height: 25px;
  }

  .subtotal-item {
    font-size: 0.76rem;
  }

  .resumo-conteudo {
    gap: 8px;
    padding-left: 13px;
  }

  .btn-finalizar {
    min-width: 112px;
    padding: 0 12px;
  }

  .resumo-total strong {
    font-size: 1.12rem;
  }
}

@media (max-width: 350px) {
  .carrinho-container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .item-card {
    gap: 6px;
  }

  .imagem-produto {
    width: 67px;
    height: 67px;
  }

  .produto-info h2 {
    font-size: 0.86rem;
  }

  .produto-tag {
    font-size: 0.43rem;
  }

  .preco-unitario {
    font-size: 0.6rem;
  }

  .subtotal-item {
    font-size: 0.68rem;
  }

  .btn-finalizar {
    min-width: 100px;
    font-size: 0.64rem;
  }
}
</style>

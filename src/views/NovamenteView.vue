<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ComprarNovamente from "@/components/ComprarNovamente.vue";

const router = useRouter();

const pedidos = ref([]);
const carregando = ref(true);

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const obterImagem = (produto) => {
  if (!produto) {
    return null;
  }

  const possibilidades = [
    produto.imagem,
    produto.foto,
    produto.image,
    produto.imagem_url,
    produto.foto_url,
    produto.image_url,
    produto.url_imagem,
    produto.url,
    produto.secure_url
  ];

  for (const imagem of possibilidades) {
    if (!imagem) {
      continue;
    }

    if (typeof imagem === "object") {
      const urlObjeto =
        imagem.secure_url ||
        imagem.url ||
        imagem.imagem ||
        imagem.foto;

      if (urlObjeto) {
        return normalizarUrl(urlObjeto);
      }

      continue;
    }

    if (typeof imagem === "string" && imagem.trim()) {
      return normalizarUrl(imagem);
    }
  }

  return null;
};

const normalizarUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  const valor = url.trim();

  if (!valor) {
    return null;
  }

  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://") ||
    valor.startsWith("data:") ||
    valor.startsWith("blob:")
  ) {
    return valor;
  }

  if (valor.startsWith("//")) {
    return `https:${valor}`;
  }

  if (valor.startsWith("/")) {
    const backend =
      API_BASE
        .replace("/api", "")
        .replace(/\/$/, "");

    return `${backend}${valor}`;
  }

  return valor;
};

const carregarPedidos = () => {
  carregando.value = true;

  try {
    const salvo = localStorage.getItem("historicoCompras");

    if (!salvo) {
      pedidos.value = [];
      return;
    }

    const dados = JSON.parse(salvo);

    pedidos.value = Array.isArray(dados)
      ? dados
      : [];
  } catch (error) {
    console.error(
      "Erro ao carregar histórico:",
      error
    );

    pedidos.value = [];
  } finally {
    carregando.value = false;
  }
};

const produtosComprados = computed(() => {
  const produtos = [];

  pedidos.value.forEach((pedido) => {
    if (!Array.isArray(pedido.itens)) {
      return;
    }

    pedido.itens.forEach((item) => {
      produtos.push({
        ...item,
        pedidoId: pedido.idPedido,
        dataCompra: pedido.dataCompra
      });
    });
  });

  return produtos;
});

const produtosUnicos = computed(() => {
  const mapa = new Map();

  produtosComprados.value.forEach((produto) => {
    const id =
      produto.idProduto ??
      produto.id ??
      produto.nome;

    if (!id) {
      return;
    }

    if (!mapa.has(String(id))) {
      mapa.set(String(id), {
        ...produto,
        imagemExibida: obterImagem(produto)
      });
    }
  });

  return Array.from(mapa.values());
});

const esconderImagem = (produto, evento) => {
  const imagemAtual = evento.target;

  if (!imagemAtual) {
    return;
  }

  const fontes = [
    produto.imagem,
    produto.foto,
    produto.image,
    produto.imagem_url,
    produto.foto_url,
    produto.image_url,
    produto.url_imagem,
    produto.url,
    produto.secure_url
  ]
    .filter(Boolean)
    .map((imagem) => {
      if (typeof imagem === "object") {
        return (
          imagem.secure_url ||
          imagem.url ||
          imagem.imagem ||
          imagem.foto
        );
      }

      return imagem;
    })
    .filter(
      (imagem) =>
        typeof imagem === "string" &&
        imagem.trim()
    )
    .map((imagem) => normalizarUrl(imagem))
    .filter(Boolean);

  const atual = imagemAtual.src;

  const indiceAtual = fontes.findIndex(
    (fonte) => fonte === atual
  );

  const proximaFonte =
    indiceAtual >= 0
      ? fontes[indiceAtual + 1]
      : null;

  if (proximaFonte && proximaFonte !== atual) {
    imagemAtual.src = proximaFonte;
    return;
  }

  imagemAtual.style.display = "none";

  const container = imagemAtual.parentElement;

  if (container) {
    container.classList.add("sem-imagem");

    if (!container.querySelector(".imagem-padrao")) {
      const placeholder =
        document.createElement("div");

      placeholder.className = "imagem-padrao";

      placeholder.innerHTML =
        '<i class="fa-solid fa-bread-slice"></i>';

      container.appendChild(placeholder);
    }
  }
};

const formatarPreco = (valor) => {
  return Number(valor || 0)
    .toFixed(2)
    .replace(".", ",");
};

const voltar = () => {
  router.back();
};

const irParaMenu = () => {
  router.push("/menu");
};

onMounted(() => {
  carregarPedidos();
});
</script>

<template>
  <div class="novamente-view">

    <header class="novamente-header">

      <button
        type="button"
        class="botao-voltar"
        aria-label="Voltar"
        @click="voltar"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="header-titulo">

        <span>
          Seus favoritos de sempre
        </span>

        <h1>
          Comprar novamente
        </h1>

      </div>

    </header>

    <main class="novamente-conteudo">

      <section class="introducao">

        <div class="introducao-icone">
          <i class="fa-solid fa-rotate"></i>
        </div>

        <div>

          <h2>
            Seus pedidos de sempre
          </h2>

          <p>
            Encontre aqui produtos que você já comprou
            e peça novamente com facilidade.
          </p>

        </div>

      </section>

      <div
        v-if="carregando"
        class="estado-carregando"
      >

        <i
          class="fa-solid fa-spinner fa-spin"
        ></i>

        <span>
          Carregando seus produtos...
        </span>

      </div>

      <section
        v-else-if="produtosUnicos.length"
        class="produtos-lista"
      >

        <article
          v-for="produto in produtosUnicos"
          :key="
            produto.idProduto ??
            produto.id ??
            produto.nome
          "
          class="produto-card"
        >

          <div class="produto-imagem">

            <img
              v-if="produto.imagemExibida"
              :src="produto.imagemExibida"
              :alt="produto.nome"
              loading="lazy"
              @error="
                esconderImagem(
                  produto,
                  $event
                )
              "
            />

            <div
              v-else
              class="imagem-padrao"
            >
              <i
                class="fa-solid fa-bread-slice"
              ></i>
            </div>

          </div>

          <div class="produto-info">

            <h3>
              {{ produto.nome }}
            </h3>

            <span class="produto-preco">
              R$
              {{ formatarPreco(produto.preco) }}
            </span>

            <ComprarNovamente
              :produto="produto"
            />

          </div>

        </article>

      </section>

      <section
        v-else
        class="estado-vazio"
      >

        <div class="vazio-icone">
          <i
            class="fa-solid fa-bag-shopping"
          ></i>
        </div>

        <h2>
          Nenhuma compra ainda
        </h2>

        <p>
          Quando você fizer uma compra, os produtos
          aparecerão aqui para comprar novamente.
        </p>

        <button
          type="button"
          class="botao-menu"
          @click="irParaMenu"
        >

          <i
            class="fa-solid fa-utensils"
          ></i>

          Ver cardápio

        </button>

      </section>

    </main>

  </div>
</template>

<style scoped>
.novamente-view {
  min-height: 100vh;
  padding-bottom: 35px;

  background:
    radial-gradient(
      circle at 5% 10%,
      rgba(184, 151, 100, 0.08),
      transparent 25%
    ),
    linear-gradient(
      180deg,
      #fbf8f3 0%,
      #f7eee2 100%
    );

  color: #5e3023;
  font-family: "Imprima", sans-serif;
}

.novamente-header {
  position: relative;

  display: flex;
  align-items: center;

  gap: 14px;

  padding: 20px 18px;

  background: #fffdf9;

  border-bottom: 1px solid #eee2d4;
}

.botao-voltar {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 13px;

  background: #f5eadc;
  color: #5e3023;

  font-size: 15px;

  cursor: pointer;

  transition: 0.2s ease;
}

.botao-voltar:hover {
  background: #ead9c3;
}

.botao-voltar:active {
  transform: scale(0.95);
}

.header-titulo {
  min-width: 0;
}

.header-titulo span {
  display: block;

  margin-bottom: 3px;

  color: #a08e7d;

  font-size: 0.68rem;
}

.header-titulo h1 {
  margin: 0;

  color: #5e3023;

  font-size: 1.35rem;
  font-weight: 400;
}

.novamente-conteudo {
  width: 100%;
  max-width: 700px;

  margin: 0 auto;

  padding: 20px 16px 40px;

  box-sizing: border-box;
}

.introducao {
  display: flex;
  align-items: center;

  gap: 13px;

  margin-bottom: 22px;
  padding: 16px;

  border: 1px solid #eadbc9;
  border-radius: 18px;

  background: #fffdf9;

  box-shadow:
    0 5px 18px rgba(94, 48, 35, 0.04);
}

.introducao-icone {
  width: 45px;
  height: 45px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: #f5eadc;
  color: #8d6844;

  font-size: 16px;
}

.introducao h2 {
  margin: 0 0 4px;

  color: #5e3023;

  font-size: 0.98rem;
  font-weight: 400;
}

.introducao p {
  margin: 0;

  color: #9b8875;

  font-size: 0.72rem;
  line-height: 1.45;
}

.produtos-lista {
  display: flex;
  flex-direction: column;

  gap: 14px;
}

.produto-card {
  display: flex;
  align-items: center;

  gap: 14px;

  padding: 13px;

  border: 1px solid #eadbc9;
  border-radius: 20px;

  background: #fffdf9;

  box-shadow:
    0 5px 18px rgba(94, 48, 35, 0.05);

  box-sizing: border-box;
}

.produto-imagem {
  position: relative;

  width: 88px;
  height: 88px;

  flex-shrink: 0;

  overflow: hidden;

  border-radius: 16px;

  background: #f5eadc;

  display: flex;
  align-items: center;
  justify-content: center;
}

.produto-imagem img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
}

.produto-imagem.sem-imagem {
  display: flex;
  align-items: center;
  justify-content: center;
}

.imagem-padrao {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #f5eadc;

  color: #b89764;

  font-size: 23px;
}

.produto-info {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  gap: 7px;
}

.produto-info h3 {
  width: 100%;

  margin: 0;

  overflow: hidden;

  color: #5e3023;

  font-size: 0.98rem;
  font-weight: 400;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.produto-preco {
  color: #8d6844;

  font-size: 0.78rem;
  font-weight: 600;
}

.produto-info :deep(.comprar-novamente) {
  width: 100%;
  min-width: 0;
}

.estado-carregando {
  min-height: 220px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 10px;

  color: #9b8875;

  font-size: 0.82rem;
}

.estado-carregando i {
  color: #b89764;

  font-size: 20px;
}

.estado-vazio {
  padding: 42px 22px;

  text-align: center;

  border: 1px solid #eadbc9;
  border-radius: 22px;

  background: #fffdf9;
}

.vazio-icone {
  width: 64px;
  height: 64px;

  margin: 0 auto 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 20px;

  background: #f5eadc;
  color: #b89764;

  font-size: 24px;
}

.estado-vazio h2 {
  margin: 0 0 8px;

  color: #5e3023;

  font-size: 1.05rem;
  font-weight: 400;
}

.estado-vazio p {
  max-width: 310px;

  margin: 0 auto 22px;

  color: #9b8875;

  font-size: 0.76rem;
  line-height: 1.5;
}

.botao-menu {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  min-height: 45px;

  padding: 0 20px;

  border: none;
  border-radius: 14px;

  background: #5e3023;
  color: #fffdf9;

  font-family: "Imprima", sans-serif;

  font-size: 0.82rem;

  cursor: pointer;
}

.botao-menu i {
  color: #e1c98f;
}

@media (max-width: 430px) {
  .novamente-header {
    padding: 17px 15px;
  }

  .novamente-conteudo {
    padding: 17px 13px 30px;
  }

  .introducao {
    padding: 14px;
  }

  .introducao p {
    font-size: 0.68rem;
  }

  .produto-card {
    align-items: flex-start;

    gap: 11px;

    padding: 11px;
  }

  .produto-imagem {
    width: 76px;
    height: 76px;
  }

  .produto-info h3 {
    font-size: 0.9rem;
  }

  .produto-preco {
    font-size: 0.74rem;
  }
}

@media (max-width: 350px) {
  .produto-card {
    flex-direction: column;
  }

  .produto-imagem {
    width: 100%;
    height: 130px;
  }

  .produto-info {
    width: 100%;
  }
}
</style>

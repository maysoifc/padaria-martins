
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ComprarNovamente from "@/components/ComprarNovamente.vue";

const router = useRouter();

const pedidos = ref([]);
const carregando = ref(true);
const tentativasImagem = ref({});

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

const imagensLocais = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

// Normaliza imagens locais, relativas e externas.
const normalizarUrl = (imagem) => {
  if (!imagem) return null;

  let valor = imagem;

  // Algumas APIs retornam a imagem como objeto.
  if (typeof valor === "object" && valor !== null) {
    valor =
      valor.secure_url ||
      valor.url ||
      valor.imagem ||
      valor.foto ||
      valor.image ||
      valor.path ||
      "";
  }

  if (typeof valor !== "string") return null;

  valor = valor.trim();

  if (
    !valor ||
    valor === "null" ||
    valor === "undefined"
  ) {
    return null;
  }

  // Procura primeiro pelo nome entre as imagens locais.
  const nomeArquivo = valor.split("/").pop()?.split("?")[0];

  const caminhoLocal = Object.keys(imagensLocais).find(
    (arquivo) =>
      arquivo.split("/").pop()?.toLowerCase() ===
      nomeArquivo?.toLowerCase()
  );

  if (caminhoLocal) {
    return imagensLocais[caminhoLocal];
  }

  // URL externa ou endereço completo.
  if (/^https?:\/\//i.test(valor)) {
    try {
      const url = new URL(valor);

      // Corrige endereços antigos de desenvolvimento.
      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1"
      ) {
        return `${API_ORIGIN}${url.pathname}${url.search}${url.hash}`;
      }

      return valor;
    } catch {
      return null;
    }
  }

  // URL iniciada com //.
  if (valor.startsWith("//")) {
    return `https:${valor}`;
  }

  // Caminho absoluto da mídia.
  if (valor.startsWith("/")) {
    return `${API_ORIGIN}${valor}`;
  }

  // Caminho relativo da mídia.
  return `${API_ORIGIN}/${valor.replace(/^\/+/, "")}`;
};

// Obtém todas as possibilidades de imagem do produto.
const obterFontesImagem = (produto) => {
  if (!produto) return [];

  const campos = [
    produto.imagem_url,
    produto.foto_url,
    produto.image_url,
    produto.url_imagem,
    produto.imagem,
    produto.foto,
    produto.image,
    produto.foto_produto,
    produto.url,
    produto.secure_url,
  ];

  const urls = campos
    .map(normalizarUrl)
    .filter(Boolean);

  return [...new Set(urls)];
};

const carregarPedidos = () => {
  carregando.value = true;

  try {
    const salvo = localStorage.getItem("historicoCompras");
    const dados = salvo ? JSON.parse(salvo) : [];

    pedidos.value = Array.isArray(dados) ? dados : [];
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    pedidos.value = [];
  } finally {
    carregando.value = false;
  }
};

// Organiza os produtos sem duplicar os que já foram comprados.
const produtosUnicos = computed(() => {
  const mapa = new Map();

  for (const pedido of pedidos.value) {
    if (!Array.isArray(pedido.itens)) continue;

    for (const item of pedido.itens) {
      const id = item.idProduto ?? item.id ?? item.nome;

      if (id == null || String(id).trim() === "") continue;

      const chave = String(id);

      if (mapa.has(chave)) continue;

      const fontesImagem = obterFontesImagem(item);

      mapa.set(chave, {
        ...item,
        idProduto: item.idProduto ?? item.id,
        fontesImagem,
      });
    }
  }

  return [...mapa.values()];
});

// Retorna a imagem atual de cada produto.
const obterImagemAtual = (produto) => {
  const chave = String(
    produto.idProduto ?? produto.id ?? produto.nome
  );

  const indice = tentativasImagem.value[chave] || 0;

  return produto.fontesImagem?.[indice] || null;
};

// Se uma imagem falhar, tenta a próxima fonte.
const esconderImagem = (produto) => {
  const chave = String(
    produto.idProduto ?? produto.id ?? produto.nome
  );

  const indiceAtual = tentativasImagem.value[chave] || 0;

  tentativasImagem.value = {
    ...tentativasImagem.value,
    [chave]: indiceAtual + 1,
  };
};

const formatarPreco = (valor) => {
  const numero = Number(valor);

  return (Number.isFinite(numero) ? numero : 0).toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};

const voltar = () => {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push("/perfil");
  }
};

const irParaMenu = () => {
  router.push("/menu");
};

onMounted(carregarPedidos);
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
        <span>Seus favoritos de sempre</span>
        <h1>Comprar novamente</h1>
      </div>
    </header>

    <main class="novamente-conteudo">
      <section class="introducao">
        <div class="introducao-icone">
          <i class="fa-solid fa-rotate"></i>
        </div>

        <div>
          <h2>Seus pedidos de sempre</h2>
          <p>
            Encontre aqui produtos que você já comprou
            e peça novamente com facilidade.
          </p>
        </div>
      </section>

      <div
        v-if="carregando"
        class="estado-carregando"
        role="status"
      >
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Carregando seus produtos...</span>
      </div>

      <section
        v-else-if="produtosUnicos.length"
        class="produtos-lista"
        aria-label="Produtos comprados anteriormente"
      >
        <article
          v-for="produto in produtosUnicos"
          :key="produto.idProduto ?? produto.id ?? produto.nome"
          class="produto-card"
        >
          <div
            class="produto-imagem"
            :class="{ 'sem-imagem': !obterImagemAtual(produto) }"
          >
            <img
              v-if="obterImagemAtual(produto)"
              :src="obterImagemAtual(produto)"
              :alt="produto.nome || 'Produto da Padaria Martins'"
              loading="lazy"
              @error="esconderImagem(produto)"
            />

            <div v-else class="imagem-padrao">
              <div class="imagem-padrao-detalhe">
                <i class="fa-solid fa-wheat-awn"></i>
              </div>

              <i class="fa-solid fa-bread-slice"></i>

              <span>PADARIA</span>
              <small>MARTINS</small>
            </div>
          </div>

          <div class="produto-info">
            <h3>{{ produto.nome || "Produto" }}</h3>

            <span class="produto-preco">
              R$ {{ formatarPreco(produto.preco) }}
            </span>

            <ComprarNovamente :produto="produto" />
          </div>
        </article>
      </section>

      <section v-else class="estado-vazio">
        <div class="vazio-icone">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>

        <h2>Nenhuma compra ainda</h2>

        <p>
          Quando você fizer uma compra, os produtos aparecerão
          aqui para comprar novamente.
        </p>

        <button
          type="button"
          class="botao-menu"
          @click="irParaMenu"
        >
          <i class="fa-solid fa-utensils"></i>
          Ver cardápio
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped src="@/assets/css/comprarNovamenteView.css"></style>

<style scoped>
.produto-imagem {
  overflow: hidden;
  position: relative;
  background: #f5eadb;
}

.produto-imagem img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.produto-imagem.sem-imagem {
  background: #f5eadb;
}

.imagem-padrao {
  width: 100%;
  height: 100%;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #f7eee2, #e8d3b5);
  color: #5e3023;
}

.imagem-padrao > i {
  font-size: 35px;
  color: #8c5b32;
  margin-bottom: 7px;
}

.imagem-padrao span {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
}

.imagem-padrao small {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #a47b49;
}

.imagem-padrao-detalhe {
  position: absolute;
  top: -9px;
  right: -5px;
  font-size: 38px;
  color: #b89764;
  opacity: 0.3;
  transform: rotate(25deg);
}
</style>

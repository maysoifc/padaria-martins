<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ComprarNovamente from "@/components/ComprarNovamente.vue";

const router = useRouter();

const pedidos = ref([]);
const carregando = ref(true);

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const normalizarUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return null;

  const valor = url.trim();

  if (/^(https?:\/\/|data:|blob:)/i.test(valor)) {
    return valor;
  }

  if (valor.startsWith("//")) {
    return `https:${valor}`;
  }

  if (valor.startsWith("/")) {
    const backend = API_BASE.replace(/\/api\/?$/, "");
    return `${backend}${valor}`;
  }

  return valor;
};

const obterFontesImagem = (produto) => {
  if (!produto) return [];

  const campos = [
    produto.imagem,
    produto.foto,
    produto.image,
    produto.imagem_url,
    produto.foto_url,
    produto.image_url,
    produto.url_imagem,
    produto.url,
    produto.secure_url,
  ];

  const urls = campos
    .map((imagem) => {
      if (typeof imagem === "object" && imagem !== null) {
        return (
          imagem.secure_url ||
          imagem.url ||
          imagem.imagem ||
          imagem.foto
        );
      }

      return imagem;
    })
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
        imagemExibida: fontesImagem[0] || null,
        fontesImagem,
        indiceImagem: 0,
      });
    }
  }

  return [...mapa.values()];
});

const esconderImagem = (produto) => {
  const proximoIndice = produto.indiceImagem + 1;

  produto.indiceImagem = proximoIndice;
  produto.imagemExibida =
    produto.fontesImagem[proximoIndice] || null;
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
            :class="{ 'sem-imagem': !produto.imagemExibida }"
          >
            <img
              v-if="produto.imagemExibida"
              :src="produto.imagemExibida"
              :alt="produto.nome || 'Produto da padaria'"
              loading="lazy"
              @error="esconderImagem(produto)"
            />

            <div v-else class="imagem-padrao">
              <i class="fa-solid fa-bread-slice"></i>
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

<style scoped src="@/assets/css/ComprarNovamenteView.css"></style>

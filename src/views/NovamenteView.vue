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

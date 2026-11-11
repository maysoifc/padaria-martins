<script setup>
import { computed, onMounted, ref } from "vue";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const imagensLocais = import.meta.glob("../../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default"
});

const produtos = ref([]);
const categorias = ref([]);

const busca = ref("");
const categoriaSelecionada = ref("todas");

const modalAberto = ref(false);
const modoEdicao = ref(false);
const produtoEditando = ref(null);

const carregando = ref(false);
const salvando = ref(false);
const erro = ref("");
const mensagem = ref("");
const confirmacaoExclusao = ref(null);

const formulario = ref({
  nome: "",
  preco: "",
  imagem: "",
  ingredientes_base: "",
  ingredientes_creme: "",
  favorito: false,
  categorias: []
});

const token = () => localStorage.getItem("adminToken");

const formatarPreco = (valor) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

const getImageUrl = (imagem) => {
  if (!imagem || typeof imagem !== "string") return "";

  const caminho = imagem.trim();

  if (!caminho) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(caminho)) {
    return caminho;
  }

  const nomeArquivo = caminho.split("/").pop()?.split("?")[0];

  if (!nomeArquivo) return "";

  const imagemLocal = Object.entries(imagensLocais).find(([arquivo]) => {
    return arquivo.endsWith(`/${nomeArquivo}`);
  });

  if (imagemLocal) return imagemLocal[1];

  if (caminho.startsWith("/")) {
    return `${API_ORIGIN}${caminho}`;
  }

  if (caminho.startsWith("media/")) {
    return `${API_ORIGIN}/${caminho}`;
  }

  if (caminho.includes("/")) {
    return `${API_ORIGIN}/${caminho.replace(/^\/+/, "")}`;
  }

  return `${API_ORIGIN}/media/${encodeURIComponent(nomeArquivo)}`;
};

const imagemComErro = (event) => {
  event.target.style.display = "none";
  event.target.parentElement?.classList.add("sem-imagem");
};

const normalizarLista = (dados) => {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.results)) return dados.results;
  if (Array.isArray(dados?.data)) return dados.data;
  return [];
};

const requisicao = async (caminho, opcoes = {}) => {
  const cabecalhos = {
    ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    ...opcoes.headers
  };

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: cabecalhos
  });

  if (resposta.status === 204) return null;

  const tipo = resposta.headers.get("content-type") || "";

  const dados = tipo.includes("application/json")
    ? await resposta.json()
    : await resposta.text();

  if (!resposta.ok) {
    const detalhe =
      typeof dados === "object" && dados !== null
        ? Object.entries(dados)
            .map(([campo, valor]) => {
              const texto = Array.isArray(valor)
                ? valor.join(", ")
                : typeof valor === "string"
                  ? valor
                  : JSON.stringify(valor);

              return `${campo}: ${texto}`;
            })
            .join(" | ")
        : String(dados || "Não foi possível concluir a operação.");

    throw new Error(detalhe);
  }

  return dados;
};

const categoriasDisponiveis = computed(() => {
  const mapa = new Map();

  categorias.value.forEach((categoria) => {
    const id = categoria.idCategoria ?? categoria.id;

    if (id != null) {
      mapa.set(String(id), categoria);
    }
  });

  produtos.value.forEach((produto) => {
    if (!Array.isArray(produto.categorias)) return;

    produto.categorias.forEach((categoria) => {
      if (typeof categoria === "object" && categoria !== null) {
        const id = categoria.idCategoria ?? categoria.id;

        if (id != null) {
          mapa.set(String(id), categoria);
        }
      }
    });
  });

  return [...mapa.values()];
});

const produtosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");

  return produtos.value.filter((produto) => {
    const nome = String(produto.nome || "").toLocaleLowerCase("pt-BR");

    const correspondeBusca = nome.includes(termo);

    const listaCategorias = Array.isArray(produto.categorias)
      ? produto.categorias
      : [];

    const correspondeCategoria =
      categoriaSelecionada.value === "todas" ||
      listaCategorias.some((categoria) => {
        const id =
          typeof categoria === "object" && categoria !== null
            ? categoria.idCategoria ?? categoria.id
            : categoria;

        return String(id) === String(categoriaSelecionada.value);
      });

    return correspondeBusca && correspondeCategoria;
  });
});

const totalProdutos = computed(() => produtos.value.length);

const totalFavoritos = computed(() => {
  return produtos.value.filter((produto) => produto.favorito).length;
});

const nomeCategoria = (categoria) => {
  if (typeof categoria === "object" && categoria !== null) {
    return categoria.nome_categoria || categoria.nome || "Categoria";
  }

  const encontrada = categoriasDisponiveis.value.find((item) => {
    return String(item.idCategoria ?? item.id) === String(categoria);
  });

  return encontrada?.nome_categoria || encontrada?.nome || "Categoria";
};

const idCategoria = (categoria) => {
  return String(categoria.idCategoria ?? categoria.id);
};

const carregarProdutos = async () => {
  carregando.value = true;
  erro.value = "";

  try {
    const dados = await requisicao("/produtos/");
    produtos.value = normalizarLista(dados);
  } catch (e) {
    erro.value = e.message || "Não foi possível carregar os produtos.";
  } finally {
    carregando.value = false;
  }
};

const carregarCategorias = async () => {
  try {
    const dados = await requisicao("/categorias/");
    categorias.value = normalizarLista(dados);
  } catch {
    categorias.value = [];
  }
};

const limparFormulario = () => {
  formulario.value = {
    nome: "",
    preco: "",
    imagem: "",
    ingredientes_base: "",
    ingredientes_creme: "",
    favorito: false,
    categorias: []
  };
};

const abrirCadastro = () => {
  limparFormulario();

  modoEdicao.value = false;
  produtoEditando.value = null;
  erro.value = "";
  modalAberto.value = true;
};

const abrirEdicao = (produto) => {
  modoEdicao.value = true;
  produtoEditando.value = produto;
  erro.value = "";

  formulario.value = {
    nome: produto.nome || "",
    preco: String(produto.preco ?? "").replace(".", ","),
    imagem: produto.imagem || "",
    ingredientes_base: produto.ingredientes_base || "",
    ingredientes_creme: produto.ingredientes_creme || "",
    favorito: Boolean(produto.favorito),
    categorias: Array.isArray(produto.categorias)
      ? produto.categorias.map((categoria) => {
          const id =
            typeof categoria === "object" && categoria !== null
              ? categoria.idCategoria ?? categoria.id
              : categoria;

          return String(id);
        })
      : []
  };

  modalAberto.value = true;
};

const fecharModal = () => {
  if (salvando.value) return;

  modalAberto.value = false;
  erro.value = "";
};

const alternarCategoria = (id) => {
  const identificador = String(id);
  const selecionadas = formulario.value.categorias;

  if (selecionadas.includes(identificador)) {
    formulario.value.categorias = selecionadas.filter(
      (item) => item !== identificador
    );
  } else {
    formulario.value.categorias = [...selecionadas, identificador];
  }
};

const salvarProduto = async () => {
  erro.value = "";
  mensagem.value = "";

  const nome = formulario.value.nome.trim();

  const precoTexto = String(formulario.value.preco)
    .trim()
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const preco = Number(precoTexto);

  if (!nome) {
    erro.value = "Informe o nome do produto.";
    return;
  }

  if (
    formulario.value.preco === "" ||
    !Number.isFinite(preco) ||
    preco < 0
  ) {
    erro.value = "Informe um preço válido.";
    return;
  }

  const dadosProduto = {
    nome,
    preco: preco.toFixed(2),
    imagem: formulario.value.imagem.trim() || null,
    ingredientes_base: formulario.value.ingredientes_base.trim(),
    ingredientes_creme: formulario.value.ingredientes_creme.trim(),
    favorito: formulario.value.favorito,
    categorias: formulario.value.categorias.map(Number)
  };

  salvando.value = true;

  try {
    if (modoEdicao.value && produtoEditando.value) {
      await requisicao(`/produtos/${produtoEditando.value.idProduto}/`, {
        method: "PATCH",
        body: JSON.stringify(dadosProduto)
      });

      mensagem.value = "Produto atualizado com sucesso.";
    } else {
      await requisicao("/produtos/", {
        method: "POST",
        body: JSON.stringify(dadosProduto)
      });

      mensagem.value = "Produto cadastrado com sucesso.";
    }

    modalAberto.value = false;
    await carregarProdutos();
  } catch (e) {
    erro.value = e.message || "Não foi possível salvar o produto.";
  } finally {
    salvando.value = false;
  }
};

const excluirProduto = async () => {
  if (!confirmacaoExclusao.value) return;

  erro.value = "";

  const id = confirmacaoExclusao.value.idProduto;

  try {
    await requisicao(`/produtos/${id}/`, {
      method: "DELETE"
    });

    produtos.value = produtos.value.filter(
      (produto) => produto.idProduto !== id
    );

    mensagem.value = "Produto excluído com sucesso.";
  } catch (e) {
    erro.value = e.message || "Não foi possível excluir o produto.";
  } finally {
    confirmacaoExclusao.value = null;
  }
};

const alternarFavorito = async (produto) => {
  erro.value = "";

  try {
    await requisicao(`/produtos/${produto.idProduto}/favorito/`, {
      method: "PATCH",
      body: JSON.stringify({
        favorito: !produto.favorito
      })
    });

    produto.favorito = !produto.favorito;

    mensagem.value = produto.favorito
      ? "Produto adicionado aos favoritos."
      : "Produto removido dos favoritos.";
  } catch (e) {
    erro.value = e.message || "Não foi possível alterar o favorito.";
  }
};

onMounted(() => {
  carregarProdutos();
  carregarCategorias();
});
</script>

<template>
  <div class="produtos-admin">

    <header class="pagina-cabecalho">
      <div class="titulo-bloco">
        <div class="caminho">
          <span>Administração</span>
          <i class="fa-solid fa-chevron-right"></i>
          <strong>Produtos</strong>
        </div>

        <span class="eyebrow">CATÁLOGO DA PADARIA</span>
        <h1>Produtos<span>.</span></h1>
        <p>Cuide de cada detalhe do cardápio da Padaria Martins.</p>
      </div>

      <button
        type="button"
        class="botao-principal"
        @click="abrirCadastro"
      >
        <i class="fa-solid fa-plus"></i>
        Novo produto
      </button>
    </header>

    <section class="resumo-produtos">
      <article class="resumo-card">
        <div class="resumo-icone icone-marrom">
          <i class="fa-solid fa-bread-slice"></i>
        </div>
        <div class="resumo-texto">
          <span>Produtos cadastrados</span>
          <strong>{{ totalProdutos }}</strong>
          <small>Itens no catálogo</small>
        </div>
        <span class="resumo-detalhe">01</span>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone icone-dourado">
          <i class="fa-solid fa-heart"></i>
        </div>
        <div class="resumo-texto">
          <span>Favoritos</span>
          <strong>{{ totalFavoritos }}</strong>
          <small>Produtos em destaque</small>
        </div>
        <span class="resumo-detalhe">02</span>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone icone-verde">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <div class="resumo-texto">
          <span>Categorias</span>
          <strong>{{ categoriasDisponiveis.length }}</strong>
          <small>Tipos de produtos</small>
        </div>
        <span class="resumo-detalhe">03</span>
      </article>
    </section>

    <section class="catalogo-card">
      <div class="catalogo-cabecalho">
        <div>
          <span class="eyebrow">SEU CARDÁPIO</span>
          <h2>Todos os produtos</h2>
          <p>Pesquise, organize e atualize seus itens.</p>
        </div>

        <span class="contador-produtos">
          {{ produtosFiltrados.length }}
          {{ produtosFiltrados.length === 1 ? "produto" : "produtos" }}
        </span>
      </div>

      <div class="filtros">
        <label class="campo-busca">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="busca"
            type="search"
            placeholder="Buscar produto pelo nome..."
          />

          <button
            v-if="busca"
            type="button"
            aria-label="Limpar busca"
            @click="busca = ''"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </label>

        <label class="campo-categoria">
          <i class="fa-solid fa-sliders"></i>

          <select v-model="categoriaSelecionada">
            <option value="todas">Todas as categorias</option>

            <option
              v-for="categoria in categoriasDisponiveis"
              :key="idCategoria(categoria)"
              :value="idCategoria(categoria)"
            >
              {{ categoria.nome_categoria || categoria.nome }}
            </option>
          </select>

          <i class="fa-solid fa-chevron-down seta-select"></i>
        </label>
      </div>

      <div
        v-if="mensagem"
        class="alerta alerta-sucesso"
        role="status"
      >
        <i class="fa-solid fa-circle-check"></i>
        {{ mensagem }}
        <button
          type="button"
          aria-label="Fechar mensagem"
          @click="mensagem = ''"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div
        v-if="erro && !modalAberto"
        class="alerta alerta-erro"
        role="alert"
      >
        <i class="fa-solid fa-circle-exclamation"></i>
        {{ erro }}
        <button
          type="button"
          aria-label="Fechar mensagem"
          @click="erro = ''"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div v-if="carregando" class="estado-vazio">
        <i class="fa-solid fa-spinner girando"></i>
        <h3>Carregando produtos...</h3>
        <p>Estamos organizando o catálogo da padaria.</p>
      </div>

      <div
        v-else-if="produtosFiltrados.length"
        class="produtos-grid"
      >
        <article
          v-for="(produto, index) in produtosFiltrados"
          :key="produto.idProduto"
          class="produto-card"
        >
          <div class="produto-imagem">
            <img
              v-if="getImageUrl(produto.imagem)"
              :src="getImageUrl(produto.imagem)"
              :alt="produto.nome"
              loading="lazy"
              @error="imagemComErro"
            />

            <div class="marca-imagem">
              <i class="fa-solid fa-bread-slice"></i>
              <span>Padaria Martins</span>
            </div>

            <span class="produto-numero">
              Nº {{ String(index + 1).padStart(2, "0") }}
            </span>

            <button
              type="button"
              class="botao-favorito"
              :class="{ favorito: produto.favorito }"
              :aria-label="
                produto.favorito
                  ? 'Remover dos favoritos'
                  : 'Adicionar aos favoritos'
              "
              @click="alternarFavorito(produto)"
            >
              <i
                :class="
                  produto.favorito
                    ? 'fa-solid fa-heart'
                    : 'fa-regular fa-heart'
                "
              ></i>
            </button>
          </div>

          <div class="produto-conteudo">
            <div class="categorias-produto">
              <span
                v-for="(categoria, posicao) in produto.categorias || []"
                :key="posicao"
              >
                {{ nomeCategoria(categoria) }}
              </span>

              <span v-if="!produto.categorias?.length">
                Sem categoria
              </span>
            </div>

            <h3>{{ produto.nome }}</h3>
            <p class="produto-descricao">
              Produto do catálogo da padaria.
            </p>

            <div class="produto-preco">
              <span>Preço de venda</span>
              <strong>{{ formatarPreco(produto.preco) }}</strong>
            </div>

            <div class="produto-acoes">
              <button
                type="button"
                class="botao-editar"
                @click="abrirEdicao(produto)"
              >
                <i class="fa-solid fa-pen"></i>
                Editar
              </button>

              <button
                type="button"
                class="botao-excluir"
                :aria-label="`Excluir ${produto.nome}`"
                title="Excluir produto"
                @click="confirmacaoExclusao = produto"
              >
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-else-if="!carregando" class="estado-vazio">
        <div class="estado-icone">
          <i class="fa-solid fa-bread-slice"></i>
        </div>

        <h3>
          {{
            busca || categoriaSelecionada !== "todas"
              ? "Nenhum produto encontrado"
              : "Seu catálogo está vazio"
          }}
        </h3>

        <p>
          {{
            busca || categoriaSelecionada !== "todas"
              ? "Tente alterar a busca ou escolher outra categoria."
              : "Cadastre seu primeiro produto para começar."
          }}
        </p>

        <button
          v-if="!busca && categoriaSelecionada === 'todas'"
          type="button"
          class="botao-principal"
          @click="abrirCadastro"
        >
          <i class="fa-solid fa-plus"></i>
          Novo produto
        </button>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modalAberto"
          class="modal-overlay"
          @click.self="fecharModal"
        >
          <section
            class="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
          >
            <header class="modal-cabecalho">
              <div class="modal-titulo-icone">
                <i class="fa-solid fa-bread-slice"></i>
              </div>

              <div class="modal-titulo-texto">
                <span class="eyebrow">
                  {{ modoEdicao ? "ATUALIZAÇÃO DO CATÁLOGO" : "NOVO CADASTRO" }}
                </span>

                <h2 id="modal-titulo">
                  {{ modoEdicao ? "Editar produto" : "Novo produto" }}
                </h2>

                <p>
                  {{
                    modoEdicao
                      ? "Atualize as informações deste produto."
                      : "Adicione um novo sabor ao catálogo da padaria."
                  }}
                </p>
              </div>

              <button
                type="button"
                class="modal-fechar"
                aria-label="Fechar formulário"
                :disabled="salvando"
                @click="fecharModal"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </header>

            <form
              class="formulario-produto"
              @submit.prevent="salvarProduto"
            >
              <div class="formulario-scroll">
                <section class="form-secao">
                  <div class="form-secao-titulo">
                    <span>01</span>
                    <div>
                      <h3>Informações principais</h3>
                      <p>Identificação e preço do produto.</p>
                    </div>
                  </div>

                  <div class="campos-grid">
                    <div class="campo-formulario campo-largo">
                      <label for="nomeProduto">
                        Nome do produto <span>*</span>
                      </label>

                      <input
                        id="nomeProduto"
                        v-model="formulario.nome"
                        type="text"
                        placeholder="Ex.: Bolo de cenoura"
                        maxlength="200"
                        required
                      />
                    </div>

                    <div class="campo-formulario">
                      <label for="precoProduto">
                        Preço de venda <span>*</span>
                      </label>

                      <div class="campo-preco">
                        <span>R$</span>
                        <input
                          id="precoProduto"
                          v-model="formulario.preco"
                          type="text"
                          inputmode="decimal"
                          placeholder="0,00"
                          required
                        />
                      </div>
                    </div>

                    <div class="campo-formulario">
                      <label class="label-favorito" for="favoritoProduto">
                        Produto favorito
                      </label>

                      <label class="favorito-controle">
                        <input
                          id="favoritoProduto"
                          v-model="formulario.favorito"
                          type="checkbox"
                        />

                        <span class="favorito-switch"></span>

                        <span>
                          <strong>
                            {{ formulario.favorito ? "Favorito" : "Normal" }}
                          </strong>
                          <small>Destacar no catálogo</small>
                        </span>
                      </label>
                    </div>
                  </div>
                </section>

                <section class="form-secao">
                  <div class="form-secao-titulo">
                    <span>02</span>
                    <div>
                      <h3>Imagem do produto</h3>
                      <p>Adicione uma imagem para apresentar seu produto.</p>
                    </div>
                  </div>

                  <div class="imagem-editor">
                    <div class="imagem-preview">
                      <img
                        v-if="getImageUrl(formulario.imagem)"
                        :src="getImageUrl(formulario.imagem)"
                        alt="Prévia do produto"
                        @error="imagemComErro"
                      />

                      <div class="imagem-preview-vazia">
                        <i class="fa-solid fa-image"></i>
                        <span>Prévia do produto</span>
                      </div>
                    </div>

                    <div class="imagem-editor-campos">
                      <label for="imagemProduto">
                        Caminho ou URL da imagem
                      </label>

                      <input
                        id="imagemProduto"
                        v-model="formulario.imagem"
                        type="text"
                        placeholder="Ex.: bolo-cenoura.jpg"
                      />

                      <small>
                        Informe o nome do arquivo em assets/img, o caminho
                        de mídia do Django ou uma URL completa.
                      </small>

                      <button
                        v-if="formulario.imagem"
                        type="button"
                        class="limpar-imagem"
                        @click="formulario.imagem = ''"
                      >
                        <i class="fa-solid fa-trash-can"></i>
                        Remover imagem
                      </button>
                    </div>
                  </div>
                </section>

                <section class="form-secao">
                  <div class="form-secao-titulo">
                    <span>03</span>
                    <div>
                      <h3>Categorias</h3>
                      <p>Selecione uma ou mais categorias para o produto.</p>
                    </div>
                  </div>

                  <div
                    v-if="categoriasDisponiveis.length"
                    class="categorias-opcoes"
                  >
                    <label
                      v-for="categoria in categoriasDisponiveis"
                      :key="idCategoria(categoria)"
                      class="categoria-opcao"
                      :class="{
                        selecionada: formulario.categorias.includes(
                          idCategoria(categoria)
                        )
                      }"
                    >
                      <input
                        type="checkbox"
                        :checked="
                          formulario.categorias.includes(idCategoria(categoria))
                        "
                        @change="alternarCategoria(idCategoria(categoria))"
                      />

                      <span class="categoria-check">
                        <i class="fa-solid fa-check"></i>
                      </span>

                      <span class="categoria-nome">
                        {{ categoria.nome_categoria || categoria.nome }}
                      </span>
                    </label>
                  </div>

                  <div v-else class="categorias-vazias">
                    <i class="fa-solid fa-circle-info"></i>
                    Nenhuma categoria foi encontrada na API.
                  </div>

                  <small class="ajuda-categorias">
                    {{ formulario.categorias.length }}
                    {{ formulario.categorias.length === 1 ? "categoria selecionada" : "categorias selecionadas" }}
                  </small>
                </section>

                <section class="form-secao">
                  <div class="form-secao-titulo">
                    <span>04</span>
                    <div>
                      <h3>Ingredientes</h3>
                      <p>Informações adicionais sobre a composição.</p>
                    </div>
                  </div>

                  <div class="campos-grid">
                    <div class="campo-formulario">
                      <label for="ingredientesBase">
                        Ingredientes da base
                      </label>

                      <textarea
                        id="ingredientesBase"
                        v-model="formulario.ingredientes_base"
                        rows="3"
                        placeholder="Informe os ingredientes da base..."
                      ></textarea>
                    </div>

                    <div class="campo-formulario">
                      <label for="ingredientesCreme">
                        Ingredientes do creme
                      </label>

                      <textarea
                        id="ingredientesCreme"
                        v-model="formulario.ingredientes_creme"
                        rows="3"
                        placeholder="Informe os ingredientes do creme..."
                      ></textarea>
                    </div>
                  </div>
                </section>

                <div
                  v-if="erro"
                  class="alerta alerta-erro"
                  role="alert"
                >
                  <i class="fa-solid fa-circle-exclamation"></i>
                  {{ erro }}
                </div>
              </div>

              <footer class="modal-rodape">
                <span class="campos-obrigatorios">
                  <span>*</span> Campos obrigatórios
                </span>

                <div class="modal-acoes">
                  <button
                    type="button"
                    class="botao-cancelar"
                    :disabled="salvando"
                    @click="fecharModal"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    class="botao-salvar"
                    :disabled="salvando"
                  >
                    <i
                      v-if="salvando"
                      class="fa-solid fa-spinner girando"
                    ></i>

                    <i
                      v-else
                      class="fa-solid fa-check"
                    ></i>

                    {{ salvando ? "Salvando..." : "Salvar produto" }}
                  </button>
                </div>
              </footer>
            </form>
          </section>
        </div>
      </Transition>

      <Transition name="modal">
        <div
          v-if="confirmacaoExclusao"
          class="modal-overlay"
          @click.self="confirmacaoExclusao = null"
        >
          <section class="confirmacao-card">
            <div class="confirmacao-icone">
              <i class="fa-solid fa-trash-can"></i>
            </div>

            <span class="eyebrow">CONFIRMAÇÃO</span>
            <h2>Excluir produto?</h2>

            <p>
              Tem certeza de que deseja excluir
              <strong>{{ confirmacaoExclusao.nome }}</strong>?
              Esta ação não poderá ser desfeita.
            </p>

            <div class="modal-acoes">
              <button
                type="button"
                class="botao-cancelar"
                @click="confirmacaoExclusao = null"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="botao-excluir-confirmar"
                @click="excluirProduto"
              >
                <i class="fa-solid fa-trash-can"></i>
                Excluir
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap");

* {
  box-sizing: border-box;
}

.produtos-admin {
  width: 100%;
  max-width: 1450px;
  margin: 0 auto;
  padding-bottom: 35px;
  color: #493326;
  font-family: "DM Sans", sans-serif;
  animation: entrada 0.4s ease both;
}

@keyframes entrada {
  from {
    opacity: 0;
    transform: translateY(9px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagina-cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 27px;
}

.titulo-bloco {
  min-width: 0;
}

.caminho {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 23px;
  color: #a18d78;
  font-size: 0.72rem;
}

.caminho i {
  color: #c6ad8b;
  font-size: 0.58rem;
}

.caminho strong {
  color: #76543b;
}

.eyebrow {
  display: block;
  color: #b18c56;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.titulo-bloco h1 {
  margin: 8px 0;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(2.3rem, 5vw, 3.6rem);
  font-weight: 600;
  line-height: 1;
}

.titulo-bloco h1 span {
  color: #b89764;
}

.titulo-bloco p {
  margin: 0;
  color: #927f6d;
  font-size: 0.86rem;
}

.botao-principal {
  display: inline-flex;
  min-height: 47px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 19px;
  border: 0;
  border-radius: 13px;
  background: #5e3023;
  color: #fffaf3;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 9px 22px rgba(94, 48, 35, 0.14);
  transition: 0.22s ease;
}

.botao-principal:hover {
  transform: translateY(-2px);
  background: #48251b;
}

.resumo-produtos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 25px;
}

.resumo-card {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 13px;
  overflow: hidden;
  padding: 18px;
  border: 1px solid #eee1d2;
  border-radius: 19px;
  background: #fffdf9;
  box-shadow: 0 8px 25px rgba(73, 48, 29, 0.04);
  transition: 0.2s ease;
}

.resumo-card:hover {
  transform: translateY(-2px);
}

.resumo-icone {
  display: grid;
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 15px;
}

.icone-marrom {
  background: #f2e5d8;
  color: #815039;
}

.icone-dourado {
  background: #f7efdf;
  color: #b18c56;
}

.icone-verde {
  background: #edf1e8;
  color: #728466;
}

.resumo-texto {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.resumo-texto span {
  color: #927f6d;
  font-size: 0.68rem;
}

.resumo-texto strong {
  color: #4c3325;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.55rem;
}

.resumo-texto small {
  color: #aa9886;
  font-size: 0.62rem;
}

.resumo-detalhe {
  position: absolute;
  right: 12px;
  bottom: 9px;
  color: rgba(184, 151, 100, 0.2);
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.4rem;
}

.catalogo-card {
  overflow: hidden;
  border: 1px solid #eee1d2;
  border-radius: 25px;
  background: #fffdfb;
  box-shadow: 0 15px 40px rgba(73, 48, 29, 0.045);
}

.catalogo-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 25px 26px 20px;
}

.catalogo-cabecalho h2 {
  margin: 7px 0 5px;
  color: #493124;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.65rem;
}

.catalogo-cabecalho p {
  margin: 0;
  color: #978575;
  font-size: 0.77rem;
}

.contador-produtos {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid #eadbc8;
  border-radius: 30px;
  background: #faf4eb;
  color: #977449;
  font-size: 0.7rem;
  font-weight: 800;
}

.filtros {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 245px;
  gap: 12px;
  padding: 0 26px 22px;
}

.campo-busca,
.campo-categoria {
  display: flex;
  min-width: 0;
  height: 46px;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid #e9dfd3;
  border-radius: 12px;
  background: #fff;
  color: #b09a7c;
}

.campo-busca:focus-within,
.campo-categoria:focus-within {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.1);
}

.campo-busca input,
.campo-categoria select {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #624b38;
  font: inherit;
  font-size: 0.76rem;
}

.campo-busca input::placeholder {
  color: #b1a394;
}

.campo-busca button {
  display: grid;
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #f6efe6;
  color: #8b6b4c;
  cursor: pointer;
}

.campo-categoria select {
  appearance: none;
  cursor: pointer;
}

.campo-categoria .seta-select {
  font-size: 0.65rem;
}

.produtos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  padding: 0 26px 26px;
}

.produto-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #eee1d2;
  border-radius: 25px;
  background: #fffdfb;
  box-shadow: 0 13px 30px rgba(73, 48, 29, 0.07);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.produto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 35px rgba(73, 48, 29, 0.1);
}

.produto-imagem {
  position: relative;
  height: 220px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 40%, #fffaf1, transparent 60%),
    #f5ecdf;
}

.produto-imagem img {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.produto-card:hover .produto-imagem img {
  transform: scale(1.045);
}

.marca-imagem {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  color: #c1a47d;
  pointer-events: none;
}

.marca-imagem i {
  font-size: 2.5rem;
}

.marca-imagem span {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1rem;
}

.produto-imagem:not(.sem-imagem) img[src] ~ .marca-imagem {
  display: none;
}

.produto-numero {
  position: absolute;
  z-index: 2;
  top: 14px;
  left: 13px;
  padding: 8px 11px;
  border-radius: 12px;
  background: rgba(255, 253, 249, 0.94);
  color: #98734d;
  font-size: 0.65rem;
  font-weight: 800;
}

.botao-favorito {
  position: absolute;
  z-index: 2;
  top: 13px;
  right: 13px;
  display: grid;
  width: 45px;
  height: 45px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  background: rgba(255, 253, 249, 0.95);
  color: #ad9273;
  font-size: 1.15rem;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(61, 40, 25, 0.08);
  transition: 0.2s ease;
}

.botao-favorito:hover {
  transform: scale(1.06);
}

.botao-favorito.favorito {
  color: #b95748;
  background: #fff4f1;
}

.produto-conteudo {
  display: flex;
  min-height: 315px;
  flex-direction: column;
  padding: 20px;
}

.categorias-produto {
  display: flex;
  min-height: 30px;
  flex-wrap: wrap;
  gap: 6px;
}

.categorias-produto span {
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 10px;
  background: #f5ecdf;
  color: #98734d;
  font-size: 0.62rem;
  font-weight: 800;
}

.produto-conteudo h3 {
  margin: 12px 0 8px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.45rem;
  line-height: 1.2;
}

.produto-descricao {
  min-height: 40px;
  margin: 7px 0 15px;
  color: #998675;
  font-size: 0.77rem;
  line-height: 1.6;
}

.produto-preco {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding: 17px 0;
  border-top: 1px solid #eee4d9;
}

.produto-preco span {
  color: #a18b76;
  font-size: 0.68rem;
}

.produto-preco strong {
  color: #70432e;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.4rem;
  white-space: nowrap;
}

.produto-acoes {
  display: flex;
  align-items: center;
  gap: 10px;
}

.botao-editar,
.botao-excluir {
  display: inline-flex;
  min-height: 47px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid #eadbca;
  border-radius: 13px;
  background: #fff;
  color: #79583d;
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.botao-editar {
  flex: 1;
}

.botao-editar:hover {
  border-color: #c9ab7b;
  background: #faf3e8;
  color: #5e3023;
}

.botao-excluir {
  width: 49px;
  flex-shrink: 0;
  color: #b46b5b;
}

.botao-excluir:hover {
  border-color: #e3bdb4;
  background: #fff3f0;
}

.estado-vazio {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 35px 20px;
  text-align: center;
}

.estado-vazio > i {
  margin-bottom: 15px;
  color: #b89764;
  font-size: 1.5rem;
}

.estado-icone {
  display: grid;
  width: 65px;
  height: 65px;
  margin-bottom: 16px;
  place-items: center;
  border-radius: 21px;
  background: #f5ecdf;
  color: #b89764;
  font-size: 1.4rem;
}

.estado-vazio h3 {
  margin: 0 0 8px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.35rem;
}

.estado-vazio p {
  max-width: 390px;
  margin: 0 0 18px;
  color: #978575;
  font-size: 0.79rem;
  line-height: 1.7;
}

.alerta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 26px 18px;
  padding: 13px 15px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 0.75rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.alerta-sucesso {
  border-color: #d8e6d3;
  background: #f1f7ee;
  color: #627c59;
}

.alerta-erro {
  border-color: #eed2ca;
  background: #fff6f3;
  color: #a74e40;
}

.alerta button {
  display: grid;
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  margin-left: auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

/* Modal */

.modal-overlay {
  position: fixed;
  z-index: 99999;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 24px;
  background: rgba(43, 29, 20, 0.48);
  backdrop-filter: blur(7px);
}

.modal-card {
  display: flex;
  width: min(100%, 760px);
  max-height: min(850px, calc(100dvh - 48px));
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 26px;
  background: #fffdf9;
  box-shadow: 0 28px 90px rgba(37, 24, 16, 0.25);
}

.modal-cabecalho {
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 15px;
  padding: 23px 27px;
  border-bottom: 1px solid #eee4d8;
  background:
    radial-gradient(circle at 90% 0%, rgba(184, 151, 100, 0.12), transparent 35%),
    #fffdf9;
}

.modal-titulo-icone {
  display: grid;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid #eadbc8;
  border-radius: 17px;
  background: #f6eee2;
  color: #946b42;
  font-size: 1.15rem;
}

.modal-titulo-texto {
  min-width: 0;
}

.modal-titulo-texto h2 {
  margin: 4px 0 3px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.7rem;
  font-weight: 600;
}

.modal-titulo-texto p {
  margin: 0;
  color: #998675;
  font-size: 0.73rem;
}

.modal-fechar {
  display: grid;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  margin-left: auto;
  place-items: center;
  border: 1px solid #eadbca;
  border-radius: 13px;
  background: #fff;
  color: #80654c;
  cursor: pointer;
  transition: 0.2s ease;
}

.modal-fechar:hover {
  transform: rotate(90deg);
  background: #f8f0e5;
}

.modal-fechar:disabled {
  opacity: 0.5;
  cursor: wait;
}

.formulario-produto {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.formulario-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 8px 27px 25px;
  overscroll-behavior: contain;
  scrollbar-color: #d5c2a8 #f7f1e8;
  scrollbar-width: thin;
}

.formulario-scroll::-webkit-scrollbar {
  width: 7px;
}

.formulario-scroll::-webkit-scrollbar-track {
  background: #f7f1e8;
  border-radius: 20px;
}

.formulario-scroll::-webkit-scrollbar-thumb {
  background: #d5c2a8;
  border-radius: 20px;
}

.form-secao {
  padding: 21px 0;
  border-bottom: 1px solid #eee5da;
}

.form-secao:last-of-type {
  border-bottom: 0;
}

.form-secao-titulo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 17px;
}

.form-secao-titulo > span {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 11px;
  background: #f5ecdf;
  color: #a47d4c;
  font-size: 0.65rem;
  font-weight: 800;
}

.form-secao-titulo h3 {
  margin: 0 0 3px;
  color: #563b29;
  font-size: 0.9rem;
  font-weight: 800;
}

.form-secao-titulo p {
  margin: 0;
  color: #a18d7b;
  font-size: 0.68rem;
}

.campos-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.campo-largo {
  grid-column: 1 / -1;
}

.campo-formulario {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.campo-formulario > label {
  color: #76583e;
  font-size: 0.73rem;
  font-weight: 800;
}

.campo-formulario > label span {
  color: #b66b58;
}

.campo-formulario input,
.campo-formulario textarea {
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border: 1px solid #e8d9c8;
  border-radius: 12px;
  outline: none;
  background: #fff;
  color: #634630;
  font: inherit;
  font-size: 0.78rem;
  transition: 0.2s ease;
}

.campo-formulario textarea {
  min-height: 90px;
  resize: vertical;
  line-height: 1.55;
}

.campo-formulario input::placeholder,
.campo-formulario textarea::placeholder {
  color: #b5a493;
}

.campo-formulario input:focus,
.campo-formulario textarea:focus {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.1);
}

.campo-preco {
  display: flex;
  min-height: 46px;
  align-items: center;
  border: 1px solid #e8d9c8;
  border-radius: 12px;
  background: #fff;
}

.campo-preco:focus-within {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.1);
}

.campo-preco > span {
  padding-left: 14px;
  color: #98734d;
  font-size: 0.78rem;
  font-weight: 800;
}

.campo-preco input {
  border: 0;
  box-shadow: none !important;
}

.label-favorito {
  display: block;
}

.favorito-controle {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.favorito-controle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.favorito-switch {
  position: relative;
  width: 39px;
  height: 23px;
  flex-shrink: 0;
  border-radius: 30px;
  background: #ded5c9;
  transition: 0.2s ease;
}

.favorito-switch::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #fff;
  content: "";
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  transition: 0.2s ease;
}

.favorito-controle input:checked + .favorito-switch {
  background: #b89764;
}

.favorito-controle input:checked + .favorito-switch::after {
  transform: translateX(16px);
}

.favorito-controle > span:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.favorito-controle strong {
  color: #654a34;
  font-size: 0.72rem;
}

.favorito-controle small {
  color: #a18b76;
  font-size: 0.63rem;
}

.imagem-editor {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 17px;
  align-items: center;
}

.imagem-preview {
  position: relative;
  display: grid;
  height: 125px;
  overflow: hidden;
  place-items: center;
  border: 1px dashed #d9c5a9;
  border-radius: 16px;
  background: #f8f1e7;
}

.imagem-preview img {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagem-preview-vazia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  color: #b59a75;
  font-size: 0.65rem;
}

.imagem-preview-vazia i {
  font-size: 1.7rem;
}

.imagem-preview:has(img[src]) .imagem-preview-vazia {
  display: none;
}

.imagem-editor-campos {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 9px;
}

.imagem-editor-campos label {
  color: #76583e;
  font-size: 0.73rem;
  font-weight: 800;
}

.imagem-editor-campos input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #e8d9c8;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: #634630;
  font: inherit;
  font-size: 0.75rem;
}

.imagem-editor-campos input:focus {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.1);
}

.imagem-editor-campos small {
  color: #a18d7b;
  font-size: 0.64rem;
  line-height: 1.5;
}

.limpar-imagem {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: #ae6c5c;
  font: inherit;
  font-size: 0.67rem;
  font-weight: 700;
  cursor: pointer;
}

.categorias-opcoes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.categoria-opcao {
  display: flex;
  min-width: 0;
  min-height: 47px;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e9dfd3;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: 0.2s ease;
}

.categoria-opcao:hover {
  border-color: #d3bd9b;
  background: #fdfaf5;
}

.categoria-opcao.selecionada {
  border-color: #c5a779;
  background: #f8f1e6;
}

.categoria-opcao input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.categoria-check {
  display: grid;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid #d9cbbb;
  border-radius: 6px;
  background: #fff;
  color: transparent;
  font-size: 0.6rem;
}

.categoria-opcao.selecionada .categoria-check {
  border-color: #a98758;
  background: #a98758;
  color: #fff;
}

.categoria-nome {
  overflow: hidden;
  color: #71563d;
  font-size: 0.72rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.categorias-vazias {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px;
  border: 1px solid #eee1d2;
  border-radius: 12px;
  background: #faf6ef;
  color: #927b60;
  font-size: 0.72rem;
}

.ajuda-categorias {
  display: block;
  margin-top: 10px;
  color: #a18d7b;
  font-size: 0.65rem;
}

.modal-rodape {
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 16px 27px;
  border-top: 1px solid #eee4d8;
  background: #fffdf9;
  box-shadow: 0 -7px 20px rgba(65, 43, 27, 0.035);
}

.campos-obrigatorios {
  color: #a18d7b;
  font-size: 0.65rem;
}

.campos-obrigatorios span {
  color: #b66b58;
  font-weight: 800;
}

.modal-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.botao-cancelar,
.botao-salvar,
.botao-excluir-confirmar {
  display: inline-flex;
  min-height: 43px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 17px;
  border: 1px solid #eadbca;
  border-radius: 11px;
  font-family: inherit;
  font-size: 0.73rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.botao-cancelar {
  background: #fff;
  color: #80654c;
}

.botao-cancelar:hover {
  background: #f8f0e5;
}

.botao-salvar {
  border-color: #5e3023;
  background: #5e3023;
  color: #fff;
  box-shadow: 0 6px 15px rgba(94, 48, 35, 0.13);
}

.botao-salvar:hover {
  background: #48251b;
  transform: translateY(-1px);
}

.botao-salvar:disabled,
.botao-cancelar:disabled {
  opacity: 0.6;
  cursor: wait;
}

.alerta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 0.75rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.alerta-erro {
  margin-top: 15px;
  border-color: #eed2ca;
  background: #fff6f3;
  color: #a74e40;
}

.confirmacao-card {
  width: min(100%, 420px);
  padding: 30px;
  border: 1px solid #eadbca;
  border-radius: 24px;
  background: #fffdf9;
  text-align: center;
  box-shadow: 0 28px 90px rgba(37, 24, 16, 0.25);
}

.confirmacao-icone {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 0 auto 18px;
  place-items: center;
  border-radius: 18px;
  background: #fff0eb;
  color: #b46b5b;
  font-size: 1.3rem;
}

.confirmacao-card h2 {
  margin: 8px 0;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.65rem;
}

.confirmacao-card p {
  margin: 10px 0 22px;
  color: #927f6d;
  font-size: 0.79rem;
  line-height: 1.7;
}

.confirmacao-card p strong {
  color: #634630;
}

.confirmacao-card .modal-acoes {
  justify-content: center;
}

.botao-excluir-confirmar {
  border-color: #b46b5b;
  background: #b46b5b;
  color: #fff;
}

.botao-excluir-confirmar:hover {
  background: #984f42;
}

.girando {
  animation: girar 0.9s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1050px) {
  .produtos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .pagina-cabecalho {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .titulo-bloco h1 {
    font-size: 2.65rem;
  }

  .resumo-produtos {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .catalogo-cabecalho {
    align-items: flex-start;
    flex-direction: column;
    padding: 21px 17px 17px;
    gap: 12px;
  }

  .filtros {
    grid-template-columns: 1fr;
    padding: 0 17px 18px;
  }

  .produtos-grid {
    grid-template-columns: 1fr;
    padding: 0 17px 20px;
    gap: 16px;
  }

  .produto-imagem {
    height: 230px;
  }

  .produto-conteudo {
    min-height: 290px;
  }

  .alerta {
    margin-right: 17px;
    margin-left: 17px;
  }

  .modal-overlay {
    place-items: center;
    padding: 12px;
  }

  .modal-card {
    max-height: calc(100dvh - 24px);
    border-radius: 21px;
  }

  .modal-cabecalho {
    padding: 17px;
  }

  .modal-titulo-icone {
    width: 44px;
    height: 44px;
  }

  .modal-titulo-texto h2 {
    font-size: 1.4rem;
  }

  .formulario-scroll {
    padding: 5px 17px 20px;
  }

  .modal-rodape {
    padding: 13px 17px;
  }
}

@media (max-width: 520px) {
  .campos-grid {
    grid-template-columns: 1fr;
  }

  .campo-largo {
    grid-column: auto;
  }

  .imagem-editor {
    grid-template-columns: 1fr;
  }

  .imagem-preview {
    height: 155px;
  }

  .categorias-opcoes {
    grid-template-columns: 1fr;
  }

  .modal-rodape {
    align-items: stretch;
    flex-direction: column;
    gap: 9px;
  }

  .campos-obrigatorios {
    text-align: center;
  }

  .modal-acoes {
    width: 100%;
  }

  .modal-acoes button {
    flex: 1;
  }
}

@media (max-width: 390px) {
  .titulo-bloco h1 {
    font-size: 2.25rem;
  }

  .produto-imagem {
    height: 195px;
  }

  .produto-conteudo {
    padding: 16px;
  }

  .produto-conteudo h3 {
    font-size: 1.3rem;
  }

  .modal-titulo-icone {
    display: none;
  }

  .modal-titulo-texto h2 {
    font-size: 1.25rem;
  }

  .modal-titulo-texto p {
    font-size: 0.66rem;
  }

  .modal-fechar {
    width: 34px;
    height: 34px;
  }
}
</style>

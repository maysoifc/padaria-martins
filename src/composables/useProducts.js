
import { ref } from "vue";

export function useProducts() {
  const produtos = ref([]);
  const erro = ref(null);
  const carregando = ref(false);

  // =========================================================
  // CONFIGURAÇÃO DA API
  // =========================================================

  const API_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");

  // =========================================================
  // CARREGAR PRODUTOS
  // =========================================================

  const carregarProdutos = async (
    categoria = "",
    busca = ""
  ) => {
    carregando.value = true;
    erro.value = null;

    try {
      const catParam =
        categoria === "Todos os produtos"
          ? ""
          : categoria;

      const params = new URLSearchParams();

      params.append("categoria", catParam);
      params.append("busca", busca);

      const url = `${API_URL}/produtos/?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar produtos. Código: ${response.status}`
        );
      }

      const data = await response.json();

      // Aceita tanto uma lista direta quanto a paginação do DRF.
      const listaProdutos = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];

      // Mantém os dados originais, inclusive avaliação e
      // quantidade_avaliacoes retornados pelo serializer.
      const produtosUnicos = new Map();

      listaProdutos.forEach((item) => {
        if (item?.idProduto !== undefined && item?.idProduto !== null) {
          if (!produtosUnicos.has(item.idProduto)) {
            produtosUnicos.set(item.idProduto, {
              ...item,
              avaliacao: Number(
                String(item.avaliacao ?? 0).replace(",", ".")
              ),
              quantidade_avaliacoes: Number(
                item.quantidade_avaliacoes ?? 0
              ),
            });
          }
        }
      });

      produtos.value = Array.from(produtosUnicos.values());

    } catch (err) {
      erro.value = err.message;
      produtos.value = [];

      console.error("Erro ao carregar produtos:", err);

    } finally {
      carregando.value = false;
    }
  };

  // =========================================================
  // RETORNO
  // =========================================================

  return {
    produtos,
    erro,
    carregando,
    carregarProdutos,
  };
}

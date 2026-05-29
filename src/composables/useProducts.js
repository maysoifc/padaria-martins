import { ref } from 'vue';

export function useProducts() {
  const produtos = ref([]);
  const erro = ref(null);

  // Agora aceita categoria e termo de busca como parâmetros opcionais
  const carregarProdutos = async (categoria = '', busca = '') => {
    try {
      // Ajuste para enviar a categoria vazia caso seja "Todos os produtos"
      const catParam = categoria === 'Todos os produtos' ? '' : categoria;

      // Monta a URL com os dois filtros
      const url = `http://127.0.0.1:8000/api/produtos/?categoria=${encodeURIComponent(catParam)}&busca=${encodeURIComponent(busca)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao conectar com a API');

      const data = await response.json();

      // Remove duplicatas mantendo apenas o primeiro registro encontrado para cada id
      produtos.value = data.filter((item, index, self) =>
        index === self.findIndex((t) => t.idProduto === item.idProduto)
      );

    } catch (err) {
      erro.value = err.message;
      console.error("Erro na conexão:", err);
    }
  };

  return { produtos, erro, carregarProdutos };
}

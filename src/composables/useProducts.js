import {ref } from 'vue';

export function useProducts() {
  const produtos = ref([]);
  const erro = ref(null);

  const carregarProdutos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/produtos');
      if (!response.ok) throw new Error('Erro ao conectar com a API');
      produtos.value = await response.json();
    } catch (err) {
      erro.value = err.message;
      console.error("Erro na conexão:", err);
    }
  };

  return {produtos, erro, carregarProdutos };

}

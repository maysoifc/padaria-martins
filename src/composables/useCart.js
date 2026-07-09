import { ref } from 'vue';

const itensCarrinho = ref(JSON.parse(localStorage.getItem('carrinho')) || []);

export function useCartStore() {
  const salvarStorage = () => {
    localStorage.setItem('carrinho', JSON.stringify(itensCarrinho.value));
  };
  const carregarCarrinho = () => {
    const dadosSalvos = localStorage.getItem('carrinho');
    if (dadosSalvos) {
      itensCarrinho.value = JSON.parse(dadosSalvos);
    }
  };

  const adicionarItem = (produto) => {
    const index = itensCarrinho.value.findIndex(item => item.idProduto === produto.idProduto);

    if (index !== -1) {
      itensCarrinho.value[index].quantidade = (itensCarrinho.value[index].quantidade || 1) + 1;
    } else {
      itensCarrinho.value.push({ ...produto, quantidade: 1 });
    }
    salvarStorage();
  };

  const removerItem = (idProduto) => {
    itensCarrinho.value = itensCarrinho.value.filter(item => item.idProduto !== idProduto);
    salvarStorage();
  };

  const limparCarrinho = () => {
    itensCarrinho.value = [];
    salvarStorage();
  };

  return {
    itensCarrinho,
    adicionarItem,
    removerItem,
    limparCarrinho,
    carregarCarrinho
  };
}

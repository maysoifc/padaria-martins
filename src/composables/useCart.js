import { ref } from 'vue';

const itensCarrinho = ref([]);

export function useCartStore() {
  const salvarStorage = () => {
    localStorage.setItem(
      'carrinho',
      JSON.stringify(itensCarrinho.value)
    );
  };

  const carregarCarrinho = () => {
    try {
      const dadosSalvos = localStorage.getItem('carrinho');

      if (!dadosSalvos) {
        itensCarrinho.value = [];
        return;
      }

      const dados = JSON.parse(dadosSalvos);

      itensCarrinho.value = Array.isArray(dados)
        ? dados
        : [];
    } catch {
      itensCarrinho.value = [];
      localStorage.removeItem('carrinho');
    }
  };

  const adicionarItem = (produto) => {
    const index = itensCarrinho.value.findIndex(
      item => item.idProduto === produto.idProduto
    );

    if (index !== -1) {
      itensCarrinho.value[index].quantidade =
        Number(itensCarrinho.value[index].quantidade || 1) + 1;
    } else {
      itensCarrinho.value.push({
        ...produto,
        quantidade: 1
      });
    }

    salvarStorage();
  };

  const aumentarQuantidade = (idProduto) => {
    const item = itensCarrinho.value.find(
      item => item.idProduto === idProduto
    );

    if (!item) return;

    item.quantidade = Number(item.quantidade || 1) + 1;

    salvarStorage();
  };

  const diminuirQuantidade = (idProduto) => {
    const item = itensCarrinho.value.find(
      item => item.idProduto === idProduto
    );

    if (!item) return;

    const quantidadeAtual = Number(
      item.quantidade || 1
    );

    if (quantidadeAtual <= 1) {
      removerItem(idProduto);
      return;
    }

    item.quantidade = quantidadeAtual - 1;

    salvarStorage();
  };

  const removerItem = (idProduto) => {
    itensCarrinho.value =
      itensCarrinho.value.filter(
        item => item.idProduto !== idProduto
      );

    salvarStorage();
  };

  const removerItens = (idsProdutos) => {
    if (!Array.isArray(idsProdutos)) return;

    itensCarrinho.value =
      itensCarrinho.value.filter(
        item => !idsProdutos.includes(item.idProduto)
      );

    salvarStorage();
  };

  const limparCarrinho = () => {
    itensCarrinho.value = [];

    salvarStorage();
  };

  const quantidadeTotal = () => {
    return itensCarrinho.value.reduce(
      (total, item) =>
        total + Number(item.quantidade || 1),
      0
    );
  };

  const valorTotal = () => {
    return itensCarrinho.value.reduce(
      (total, item) =>
        total +
        Number(item.preco || 0) *
        Number(item.quantidade || 1),
      0
    );
  };

  carregarCarrinho();

  return {
    itensCarrinho,
    adicionarItem,
    aumentarQuantidade,
    diminuirQuantidade,
    removerItem,
    removerItens,
    limparCarrinho,
    carregarCarrinho,
    quantidadeTotal,
    valorTotal
  };
}

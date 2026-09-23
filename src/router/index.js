import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/cadastro",
      name: "cadastro",
      component: () => import("../views/CadastroView.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/home",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },

    {
      path: "/menu",
      name: "menu",
      component: () => import("../views/MenuView.vue"),
    },

    {
      path: "/perfil",
      name: "perfil",
      component: () => import("../views/ProfileView.vue"),
    },

    {
      path: "/carrinho",
      name: "carrinho",
      component: () => import("../views/CarrinhoView.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/checkout-carrinho",
      name: "CheckoutCarrinho",
      component: () => import("@/views/CheckoutCarrinho.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/encomenda",
      name: "encomenda",
      component: () => import("../views/EncomendaView.vue"),
    },

    {
      path: "/encomenda-opcoes",
      name: "encomenda-opcoes",
      component: () => import("../views/EncomendaOpcoesView.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/checkout-encomenda",
      name: "CheckoutEncomenda",
      component: () => import("@/views/CheckoutEncomenda.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/pedidos/:tipo",
      name: "pedidos-detalhes",
      component: () => import("../views/PedidosDetalhesView.vue"),
      props: true,
    },

    {
      path: "/novamente",
      name: "novamente",
      component: () => import("../views/NovamenteView.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/produto/:id",
      name: "produto-detalhes",
      component: () => import("../components/ProdutosDetalhes.vue"),
      props: true,
      meta: { hideNav: true },
    },

    {
      path: "/detalhes/carteira/selos",
      redirect: "/carteira/selos",
    },

    {
      path: "/carteira/selos",
      name: "carteira-selos",
      component: () => import("../views/SelosCarteiraView.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/detalhes/carteira/cartoes",
      redirect: "/carteira/cartoes",
    },

    {
      path: "/carteira/cartoes",
      name: "carteira-cartoes",
      component: () => import("../views/CartoesCarteiraView.vue"),
      meta: { hideNav: true },
    },

    {
      path: "/detalhes/:grupo/:tipo",
      name: "detalhes-geral",
      component: () => import("../views/DetalhesGeralView.vue"),
      props: true,
    },
  ],
});

export default router;

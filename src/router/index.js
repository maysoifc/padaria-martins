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

    // LOGIN ADMINISTRATIVO
    {
      path: "/admin/login",
      name: "AdminLogin",
      component: () => import("../views/admin/AdminLoginView.vue"),
      meta: {
        hideNav: true,
        guestAdmin: true,
      },
    },

    // PAINEL ADMINISTRATIVO
    {
      path: "/admin",
      component: () => import("../components/admin/AdminLayout.vue"),
      meta: {
        hideNav: true,
        requiresAdmin: true,
      },
      children: [
        {
          path: "",
          name: "AdminDashboard",
          component: () =>
            import("../views/admin/AdminDashboardView.vue"),
        },
        {
          path: "produtos",
          name: "AdminProdutos",
          component: () =>
            import("../views/admin/AdminProdutosView.vue"),
        },
        {
          path: "encomendas",
          name: "AdminEncomendas",
          component: () => import("../views/admin/AdminEncomendasView.vue"),
        },
         {
            path: "usuarios",
            name: "AdminUsuarios",
            component: () => import("../views/admin/AdminUsuariosView.vue"),
        },
      ],
    },

    // ROTA NÃO ENCONTRADA
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      redirect: "/",
    },
  ],
});

// PROTEÇÃO DAS ROTAS ADMINISTRATIVAS
router.beforeEach((to) => {
  const adminToken = localStorage.getItem("adminToken");

  const exigeAdmin = to.matched.some(
    (record) => record.meta.requiresAdmin
  );

  const exigeVisitante = to.matched.some(
    (record) => record.meta.guestAdmin
  );

  if (exigeAdmin && !adminToken) {
    return { name: "AdminLogin" };
  }

  if (exigeVisitante && adminToken) {
    return { name: "AdminDashboard" };
  }

  return true;
});

export default router;

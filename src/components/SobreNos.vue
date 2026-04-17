<template>
  <section class="historia-container">
  <h2 class="titulo-historia">Nossa História: Tradição e amor em cada fornada</h2>

  <div class="historia-conteudo">
    <div class="moldura-foto">
    <img src="/img/historia.jpeg" alt="Padaria Martins" class="foto-historia">
    </div>

    <div class="texto-historia">
    <p>
    A Padaria Martins nasceu do sonho de levar o pão artesanal à mesa de cada vizinho.
    Com receitas de gerações, honramos o cuidado no preparo e a escolha dos melhores ingredientes.
    Cada fornada é um compromisso com o seu café da manhã.
    </p>
    </div>
  </div>
  </section>
</template>
<style scoped>
.historia-conteiner {
  padding: 40px 20px;
  background-color: #F5F9;
}

.titulo-historia {
  color: #5E3023;
  font-family: 'Imprima';
  font-size: 2.2rem;
  line-height: 1.2;
  margin-bottom: 20px;
  max-width: 90%;
  margin-left: 30px;
}

.historia-conteudo {
  display: flex;
  align-items: center;
  gap: 20px;
}

.moldura-foto {
  background-color: #F5F0E6;
  border: 4px solid #D9CAB3;
  border-radius: 30px;
  padding: 10px;
  flex-shrink: 0;
  width: 180px;
  margin-left: 20px;
}

.foto-historia {
  width: 100%;
  height: 250px;
  border-radius: 20px;
  filter: grayscale(100%);
  display: block;
}


.texto-historia{
  flex: 1;
}

.texto-historia p{
  color: #5E3023;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  text-align: left;
  border-top: 4px solid #B89764;
  border-bottom: 4px solid #B89764;
  padding: 10px 0;

}
</style>

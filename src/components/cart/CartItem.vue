<template>
  <li class="cart__item product">
    <div class="product__pic">
      <img :src="item.product.image" width="120" height="120" srcset="img/phone-square-3@2x.jpg 2x" alt="Название товара">
    </div>
    <router-link class="product__link" :to="{name: 'products', params: {id: item.product.id}}">
      <h3 class="product__title">{{ item.product.title }}</h3>
    </router-link>
    <span class="product__code">Аритикул: {{ item.product.id }}</span>

    <BaseAddReduceAmount class="product__counter" v-model.number="amount" :amount.sync="amount" />

    <b class="product__price">{{ (item.amount * item.product.price) | numberFormat }} ₽</b>

    <button class="product__del button-del" type="button" aria-label="Удалить товар из корзины" 
            @click.prevent="deleteProduct">
      <svg width="20" height="20" fill="currentColor">
        <use xlink:href="#icon-close"></use>
      </svg>
    </button>
  </li>
</template>

<script>
import BaseAddReduceAmount from '@/components/base/BaseAddReduceAmount.vue';
import numberFormat from '@/helpers/numberFormat';
import { mapActions } from 'vuex';

export default {
  props: ['item'],
  components: { BaseAddReduceAmount },
  filters: { numberFormat },
  computed: {
    amount: {
      get() {
        return this.item.amount;
      },
      set(value) {
        this.$store.dispatch('updateCartProductAmount', { 
          productId: this.item.productId,
          amount: value,
        });
      },
    },
  },
  methods: {
    ...mapActions(['deleteCartProduct']),

    deleteProduct() {
      this.deleteCartProduct(this.item.productId);
    },
  },
};
</script>
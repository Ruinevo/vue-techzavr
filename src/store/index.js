import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import API_BASE_URL from '@/config';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cartProducts: [],
    userAccessKey: null,
    cartProductsData: [],
    orderInfo: [],
  },
  mutations: {
    resetCart(state) {
      state.cartProducts = [];
      state.cartProductsData = [];
    },
    updateOrderInfo(state, orderInfo) {
      state.orderInfo = orderInfo;
    },
    updateCartProductAmount(state, { productId, amount }) {
      const itemIsInCart = state.cartProducts.find((item) => item.productId === productId);

      if (itemIsInCart) {
        itemIsInCart.amount = amount;
      }
    },
    deleteCartProduct(state, productId) {
      state.cartProducts = state.cartProducts.filter((item) => item.productId !== productId);
    },
    updateUserAccessKey(state, accessKey) {
      state.userAccessKey = accessKey;
    },
    updateCartProductsData(state, items) {
      state.cartProductsData = items;
    },
    syncCartProducts(state) {
      /* eslint-disable */
      state.cartProducts = state.cartProductsData.map((item) => {
        return {
          productId: item.product.id,
          amount: item.quantity,
        };
      });
    },
  },
  getters: {
    cartDetailProduct(state) {
      /* eslint-disable */
      return state.cartProducts.map((item) => {
        const product = state.cartProductsData.find(p => p.product.id === item.productId).product;

        return {
          ...item,
          product: {
            ...product,
            image: product.image.file.url,
          }
        };
      });
    },
    cartTotalPrice(state, getters) {
      return getters.cartDetailProduct.reduce((acc, item) => (item.product.price * item.amount) + acc, 0)
    },
    cartTotalAmount(state, getters) {
      return getters.cartDetailProduct.reduce((acc, item) => (item.amount) + acc, 0)
    },
  },
  actions: {
    loadOrderInfo(context, orderId) {
      return axios.get(`${API_BASE_URL}/api/orders/${orderId}`, {
        params: {
          userAccessKey: context.state.userAccessKey
        }
      })
        .then((response) => {
          context.commit('updateOrderInfo', response.data);
        })
    },
    loadCart(context) {
      return axios.get(`${API_BASE_URL}/api/baskets`, {
        params: {
          userAccessKey: context.state.userAccessKey
        }
      })
        .then((response) => {
          if (!context.state.userAccessKey) {
            localStorage.setItem('userAccessKey', response.data.user.accessKey);
            context.commit('updateUserAccessKey', response.data.user.accessKey);
          }
          context.commit('updateCartProductsData', response.data.items);
          context.commit('syncCartProducts');
        })
    },
    addProductToCart(context, { productId, amount }) {
      return axios
        .post(`${API_BASE_URL}/api/baskets/products`, {
          productId: productId,
          quantity: amount,
        }, {
          params: {
            userAccessKey: context.state.userAccessKey,
          }
        })
        .then((response) => {
          context.commit('updateCartProductsData', response.data.items)
          context.commit('syncCartProducts')
        })
    },
    updateCartProductAmount(context, { productId, amount }) {
      context.commit('updateCartProductAmount', { productId, amount });

      if (amount < 1) {
        return;
      }

      return axios
        .put(`${API_BASE_URL}/api/baskets/products`, {
          productId: productId,
          quantity: amount,
        }, {
          params: {
            userAccessKey: context.state.userAccessKey,
          }
        })
        .then((response) => {
          context.commit('updateCartProductsData', response.data.items)
        })
        .catch(() => {
          context.commit('syncCartProducts')
        })
    },
    deleteCartProduct(context, productId) {
      axios.delete(`${API_BASE_URL}/api/baskets/products`, {
        params: {
          userAccessKey: this.state.userAccessKey,
        },
        data: {
          productId,
        },
      })
        .then((response) => {
          context.commit('updateCartProductsData', response.data.items);
          context.commit('syncCartProducts');
        });
    },
  }
});
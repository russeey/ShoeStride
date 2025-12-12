import { ref } from 'vue'

const cart = ref([])

export function useCart() {
  const addCart = (item) => {
    cart.value.push(item)
  }

  const removeFromCart = (item) => {
    cart.value = cart.value.filter(c => c !== item)
  }

  return { cart, addCart, removeFromCart }
}

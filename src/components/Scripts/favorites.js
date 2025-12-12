import { ref } from 'vue'

const favorites = ref([]) // singleton

export function useFavorites() {
  const addFavorite = (item) => {
    if (!favorites.value.includes(item)) favorites.value.push(item)
  }
  const removeFavorite = (item) => {
    favorites.value = favorites.value.filter(f => f !== item)
  }
  return { favorites, addFavorite, removeFavorite }
}

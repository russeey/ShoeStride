// homescript.js
import { signOut } from "firebase/auth"
import { auth } from "@/firebase"
import { ref } from "vue"
import { useRouter } from "vue-router"

export function useLogout() {
  const router = useRouter()
  const showDropdown = ref(false) // reactive state for dropdown

  // Log out user and navigate to login page
  const logout = async () => {
    try {
      await signOut(auth)
      showDropdown.value = false
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  // Toggle dropdown menu
  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  return { logout, showDropdown, toggleDropdown }
}

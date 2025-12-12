// src/router.js
import { createRouter, createWebHistory } from "vue-router";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => import("@/components/login.vue");
const Signup = () => import("@/components/signup.vue");
const Home = () => import("@/components/home.vue");
const Collection = () => import("@/components/collection.vue");
const Event = () => import("@/components/events.vue");
const About = () => import("@/components/about.vue");
const Contact = () => import("@/components/contact.vue");
const Profile = () => import("@/components/profile.vue");
const Cart = () => import("@/components/cart.vue");
const Favorites = () => import("@/components/favorite.vue");
const Admin = () => import("@/components/admin.vue");
const Application = () => import("@/components/application.vue");
const ResetPassword = () => import("@/components/resetPassword.vue");
const ForgetPassword = () => import("@/components/forgetPass.vue"); 
const Order = () => import("@/components/order.vue");
const Payment = () => import("@/components/payment-success.vue");



const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/home", component: Home, meta: { requiresAuth: true } },
  { path: "/collection", component: Collection, meta: { requiresAuth: true } },
  { path: "/events", component: Event, meta: { requiresAuth: true } },
  { path: "/about", component: About, meta: { requiresAuth: true } },
  { path: "/contact", component: Contact, meta: { requiresAuth: true } },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/cart", component: Cart, meta: { requiresAuth: true } },
  { path: "/favorites", component: Favorites, meta: { requiresAuth: true } },
  { path: "/admin", component: Admin, meta: { requiresAuth: true, requiresRole: "admin" } },
  { path: "/application", component: Application, meta: { requiresAuth: true } },
  { path: "/resetPassword", component: ResetPassword },
  { path: "/forgetPass", component: ForgetPassword },
  { path: "/order", component: Order, meta: { requiresAuth: true } },
  { path: "/payment-success", component: Payment},

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// wait for firebase auth initialisation
let isAuthReady = false;
const waitForAuth = () =>
  new Promise((resolve) => {
    if (isAuthReady) {
      resolve(auth.currentUser);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      isAuthReady = true;
      unsub();
      resolve(user);
    });
  });

// global guard
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = await waitForAuth();
    if (!user) {
      next("/login");
      return;
    }

    // if route requires a role (e.g. admin), fetch users/{uid} and check role
    if (to.meta.requiresRole) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;
        if (role === to.meta.requiresRole) {
          next();
        } else {
          // unauthorized -> redirect to home
          next("/home");
        }
      } catch (err) {
        console.error("role check error", err);
        next("/home");
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

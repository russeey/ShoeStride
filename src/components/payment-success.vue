<script setup>
import axios from "axios";
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const router = useRouter();

// Get linkId from URL
const urlParams = new URLSearchParams(window.location.search);
const linkId = urlParams.get("linkId");

const finalizeOrder = async () => {
  if (!linkId) return alert("Missing payment reference!");

  const res = await axios.get(`http://localhost:5000/get-pending-order/${linkId}`);

  if (!res.data.success) return alert("Order not found!");

  const { uid, items } = res.data;

  const user = auth.currentUser;
  if (!user || user.uid !== uid) return alert("User mismatch!");

  const orderRef = collection(db, "orders", user.uid, "items");

  for (const item of items) {
    await addDoc(orderRef, {
      ...item,
      paymentMethod: "GCash",
      timestamp: Date.now(),
    });
  }

  router.push("/order");
};
</script>

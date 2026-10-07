// ========================================
// CuDanDeals.vn – Auth Helper
// ========================================

import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Lấy role của user từ Firestore
async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data().role; // "resident" | "partner" | "admin"
  return null;
}

// Redirect đúng trang sau khi đăng nhập
async function redirectByRole(user) {
  const role = await getUserRole(user.uid);
  if (role === "admin")    window.location.href = "/pages/admin/dashboard.html";
  else if (role === "partner") window.location.href = "/pages/partner/dashboard.html";
  else                     window.location.href = "/pages/resident/explore.html";
}

// Kiểm tra auth trên mọi trang protected
function requireAuth(allowedRoles = []) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/login.html";
      return;
    }
    if (allowedRoles.length > 0) {
      const role = await getUserRole(user.uid);
      if (!allowedRoles.includes(role)) {
        window.location.href = "/login.html";
      }
    }
  });
}

export {
  auth, db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  getUserRole,
  redirectByRole,
  requireAuth
};

// ══════════════════════════════════════════════════════════════════
// firebase.js — ملف إعداد Firebase لـ FitTrack Pro
// ══════════════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

// ── إعدادات مشروعك ────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAwnJkkdu-b12pVeKHDavPMXu_zj7gYEfo",
  authDomain: "fittrack-pro-7a3ea.firebaseapp.com",
  projectId: "fittrack-pro-7a3ea",
  storageBucket: "fittrack-pro-7a3ea.firebasestorage.app",
  messagingSenderId: "438685676307",
  appId: "1:438685676307:web:716768d266090cae4a20e6",
  measurementId: "G-8T38XNJJWV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ══════════════════════════════════════════════════════════════════
// ACTIVATION CODES — أكواد التفعيل
// ══════════════════════════════════════════════════════════════════

// التحقق من كود التفعيل
export async function verifyCode(code) {
  try {
    const ref = doc(db, "codes", code.toUpperCase());
    const snap = await getDoc(ref);
    if (!snap.exists()) return { valid: false, error: "الكود غير صحيح" };
    const data = snap.data();
    if (data.used) return { valid: false, error: "هذا الكود مستخدم مسبقاً" };
    return { valid: true, ...data };
  } catch {
    return { valid: false, error: "خطأ في الاتصال" };
  }
}

// تفعيل الكود (تسجيل الاستخدام)
export async function activateCode(code, userId) {
  try {
    const ref = doc(db, "codes", code.toUpperCase());
    await updateDoc(ref, {
      used: true,
      usedBy: userId,
      usedAt: serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ══════════════════════════════════════════════════════════════════
// USER PROFILE — بيانات المستخدم
// ══════════════════════════════════════════════════════════════════

// حفظ بيانات المستخدم
export async function saveProfile(userId, profile) {
  try {
    await setDoc(doc(db, "users", userId), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// جلب بيانات المستخدم
export async function getProfile(userId) {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════
// FOOD LOG — سجل الأكل اليومي
// ══════════════════════════════════════════════════════════════════

// حفظ سجل اليوم
export async function saveDayLog(userId, date, log) {
  try {
    await setDoc(doc(db, "logs", `${userId}_${date}`), {
      userId,
      date,
      items: log,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// جلب سجل يوم معين
export async function getDayLog(userId, date) {
  try {
    const snap = await getDoc(doc(db, "logs", `${userId}_${date}`));
    return snap.exists() ? snap.data().items : [];
  } catch {
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════
// WEIGHT LOG — سجل الوزن
// ══════════════════════════════════════════════════════════════════

export async function saveWeight(userId, date, weight) {
  try {
    await setDoc(doc(db, "weights", `${userId}_${date}`), {
      userId, date, weight,
      recordedAt: serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getWeightLog(userId) {
  try {
    const q = query(collection(db, "weights"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data()).sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════
// ADMIN — لوحة الإدارة
// ══════════════════════════════════════════════════════════════════

// إضافة كود تفعيل جديد
export async function addActivationCode(code, type = "individual", gymId = "") {
  try {
    await setDoc(doc(db, "codes", code), {
      type, gymId,
      used: false,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// جلب كل الأكواد
export async function getAllCodes() {
  try {
    const snap = await getDocs(collection(db, "codes"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// حذف كود
export async function deleteCode(code) {
  try {
    await deleteDoc(doc(db, "codes", code));
    return { success: true };
  } catch {
    return { success: false };
  }
}

// إضافة جيم
export async function addGym(gymId, gymData) {
  try {
    await setDoc(doc(db, "gyms", gymId), {
      ...gymData,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// جلب كل الجيمات
export async function getAllGyms() {
  try {
    const snap = await getDocs(collection(db, "gyms"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// جلب إحصائيات المستخدمين
export async function getStats() {
  try {
    const [usersSnap, codesSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "codes")),
    ]);
    const codes = codesSnap.docs.map(d => d.data());
    return {
      totalUsers: usersSnap.size,
      activeCodes: codes.filter(c => !c.used).length,
      usedCodes: codes.filter(c => c.used).length,
    };
  } catch {
    return { totalUsers: 0, activeCodes: 0, usedCodes: 0 };
  }
}

import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
// Icons ke liye (lucide-react install hona chahiye)
import { Phone, Lock, LogIn, Loader2 } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (phone.length !== 10) {
      alert("Sahi mobile number dalein");
      return;
    }

    if (password.length < 4) {
      alert("Password dalein");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "parents"),
        where("phone", "==", phone)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("Number register nahi hai");
        setLoading(false);
        return;
      }

      const userData = snap.docs[0].data();

      if (userData.password === password) {
        localStorage.setItem("parentId", snap.docs[0].id);
        window.location.href = "/dashboard";
      } else {
        alert("Password galat hai");
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert("Login me error aaya");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      {/* Background decoration elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-blue-600"></div>
      
      <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-blue-100 w-full max-w-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <LogIn className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-blue-900 tracking-tight">
            Parent Login
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Apne account me login karein</p>
        </div>

        <div className="space-y-4">
          {/* Phone Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              placeholder="Mobile Number"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={loginUser}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Login Account"
            )}
          </button>
        </div>

        <p className="text-center mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
          Sunshine School Management
        </p>
      </div>
    </div>
  );
}
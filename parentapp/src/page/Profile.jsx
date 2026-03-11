import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { 
  User, IdCard, Phone, MapPin, Calendar, LogOut, 
  ChevronLeft, ShieldCheck, Eye, EyeOff 
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Change Password States
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Visibility States
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  useEffect(() => {
    let studentId = location.state?.student?.id;
    if (!studentId) {
      const savedStudentRaw = localStorage.getItem("student");
      if (savedStudentRaw && savedStudentRaw !== "undefined") {
        try { studentId = JSON.parse(savedStudentRaw)?.id; } catch (e) { console.error(e); }
      }
    }

    if (!studentId) { setLoading(false); return; }

    const unsubscribe = onSnapshot(doc(db, "students", studentId), (snap) => {
      if (snap.exists()) setStudentData({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [location.state]);

  const handleLogout = async () => {
    if (window.confirm("Kya aap Logout karna chahte hain?")) {
      try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = "/login";
      } catch (e) { alert("Logout fail hua!"); }
    }
  };

  const handleChangePassword = async () => {
    const parentId = localStorage.getItem("parentId");
    if (!parentId) { alert("Parent not logged in"); return; }
    if (!currentPass || !newPass || !confirmPass) { alert("Sab field bharein"); return; }
    if (newPass !== confirmPass) { alert("New password match nahi kar raha"); return; }

    try {
      const q = query(collection(db, "parents"), where("__name__", "==", parentId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const parentData = snap.docs[0].data();
        if (parentData.password !== currentPass) { alert("Current password galat hai"); return; }
        await updateDoc(doc(db, "parents", parentId), { password: newPass });
        alert("Password successfully change ho gaya!");
        setCurrentPass(""); setNewPass(""); setConfirmPass("");
        setShowPasswordBox(false);
      }
    } catch (error) { alert("Error changing password"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600 bg-slate-50 italic">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full mr-2"><ChevronLeft size={24} className="text-blue-900" /></button>
        <h1 className="text-xl font-black text-blue-900 tracking-tight">My Profile</h1>
      </div>

      <div className="p-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mt-6 mb-10">
          <div className="relative">
            <img src={studentData?.photoURL || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-32 h-32 rounded-[40px] border-4 border-white shadow-xl object-cover" alt="Avatar" />
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-2xl border-4 border-slate-50 shadow-lg"><ShieldCheck size={20} /></div>
          </div>
          <h2 className="text-2xl font-black text-blue-900 mt-4">{studentData?.name}</h2>
          <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase mt-1">Class {studentData?.className}</span>
        </div>

        {/* Info Cards */}
        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 space-y-1">
          <InfoItem icon={<IdCard size={20} />} label="Roll Number" value={studentData?.rollNumber} />
          <InfoItem icon={<Phone size={20} />} label="Phone Number" value={studentData?.phone} />
          <InfoItem icon={<MapPin size={20} />} label="Address" value={studentData?.address} />
          <InfoItem icon={<Calendar size={20} />} label="Session" value={studentData?.session} />
        </div>

        {/* 🔐 Change Password Section */}
        <div className="mt-6">
          <button onClick={() => setShowPasswordBox(!showPasswordBox)} className="w-full bg-blue-50 text-blue-600 py-4 rounded-[24px] font-black border border-blue-100 active:scale-95 transition-all">
            {showPasswordBox ? "Cancel Update" : "Change Password"}
          </button>

          {showPasswordBox && (
            <div className="bg-white p-4 rounded-[28px] shadow-md border border-blue-100 mt-4 space-y-3 animate-in fade-in zoom-in duration-200">
              
              {/* Current Password */}
              <div className="relative">
                <input
                  type={showCurr ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full border border-slate-200 p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowCurr(!showCurr)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showCurr ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full border border-slate-200 p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConf ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full border border-slate-200 p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showConf ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button onClick={handleChangePassword} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200">
                Update Password Now
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full mt-8 bg-red-50 text-red-600 py-5 rounded-[24px] font-black flex items-center justify-center gap-3 active:scale-95 transition-all border border-red-100">
          <LogOut size={20} /> Logout Account
        </button>

        <p className="text-center mt-10 text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">Sunshine App v2.0.1 Web</p>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mr-4">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="font-bold text-slate-800">{value || "Not Set"}</p>
      </div>
    </div>
  );
}
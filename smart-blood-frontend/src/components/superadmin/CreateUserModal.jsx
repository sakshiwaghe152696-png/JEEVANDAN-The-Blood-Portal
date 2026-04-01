import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  createDoctor,
  createBankAdminWithBloodBank,
  updateDoctor,
  updateBankAdmin,
} from "../../services/superAdminApi";

export default function CreateUserModal({
  onClose = () => {},
  onSuccess = () => {},
  mode = "create",        // "create" | "edit"
  initialData = null,     // doctor/admin object
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    role: "DOCTOR",
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "Pune",
    degree: "",
    bankName: "",
    address: "",
    contact: "",
  });

  /* ===============================
     PREFILL FOR EDIT MODE
  =============================== */
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        role: initialData.role || prev.role, // ✅ preserve role — don't let spread override with undefined
        password: "",                         // never prefill password
      }));
    }
  }, [mode, initialData]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ===============================
     SUBMIT HANDLER
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    console.log("initialData:", initialData);

    try {
      /* -------- CREATE -------- */
      if (mode === "create") {
        if (form.role === "DOCTOR") {
          await createDoctor({
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            password: form.password,
            city: form.city,
            degree: form.degree,
          });
        }

        if (form.role === "BANK_ADMIN") {
          await createBankAdminWithBloodBank({
            admin: {
              name: form.name,
              email: form.email,
              phone: form.phone || null,
              password: form.password,
              city: form.city,
            },
            bank: {
              name: form.bankName,
              address: form.address,
              city: form.city,
              contact: form.contact,
            },
          });
        }
      }

      /* -------- EDIT -------- */
      if (mode === "edit") {
        // ✅ Safety check — don't call API if ID is missing
        if (!initialData?.user_id) {
          alert("Error: User ID is missing. Please refresh and try again.");
          return;
        }

        if (form.role === "DOCTOR") {
          await updateDoctor(initialData.user_id, {
            name: form.name,
            email: form.email,
            phone: form.phone,
            city: form.city,
            degree: form.degree,
          });
        }

        if (form.role === "BANK_ADMIN") {
          await updateBankAdmin(initialData.user_id, {
            name: form.name,
            email: form.email,
            phone: form.phone,
            city: form.city,
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={() => !loading && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="
          relative bg-white w-full max-w-xl
          rounded-2xl shadow-2xl
          p-6 md:p-8
          max-h-[85vh] overflow-y-auto
        "
      >
        {/* Close */}
        <button
          onClick={() => !loading && onClose()}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "edit" ? "Edit" : "Create"}{" "}
            {form.role === "DOCTOR" ? "Doctor" : "Blood Bank Admin"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Super Admin controlled access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ROLE (LOCKED IN EDIT MODE) */}
          <select
            disabled={mode === "edit"}
            className="w-full border rounded-xl px-4 py-3 bg-gray-50
              focus:ring-2 focus:ring-red-500 outline-none"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <option value="DOCTOR">Doctor</option>
            <option value="BANK_ADMIN">Blood Bank Admin</option>
          </select>

          {/* USER INFO */}
          <Section title="User Information">
            <Input icon={User} placeholder="Full Name" value={form.name}
              onChange={(v) => handleChange("name", v)} />

            <Input icon={Mail} placeholder="Email Address" value={form.email}
              onChange={(v) => handleChange("email", v)} />

            <Input icon={Phone} placeholder="Phone (optional)" value={form.phone}
              onChange={(v) => handleChange("phone", v)} />

            {/* Password only in CREATE */}
            {mode === "create" && (
              <Input icon={Lock} type="password" placeholder="Password"
                value={form.password}
                onChange={(v) => handleChange("password", v)} />
            )}

            <CitySelect value={form.city}
              onChange={(v) => handleChange("city", v)} />
          </Section>

          {/* DOCTOR */}
          {form.role === "DOCTOR" && (
            <Section title="Doctor Details">
              <Input
                icon={GraduationCap}
                placeholder="Degree (MBBS, MD, etc.)"
                value={form.degree}
                onChange={(v) => handleChange("degree", v)}
              />
            </Section>
          )}

          {/* BANK ADMIN */}
          {form.role === "BANK_ADMIN" && mode === "create" && (
            <Section title="Blood Bank Details">
              <Input
                icon={Building2}
                placeholder="Blood Bank Name"
                value={form.bankName}
                onChange={(v) => handleChange("bankName", v)}
              />

              <textarea
                className="w-full border rounded-xl px-4 py-3 bg-gray-50
                  focus:ring-2 focus:ring-red-500 outline-none resize-none"
                rows={3}
                placeholder="Full Address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />

              <Input
                icon={Phone}
                placeholder="Contact Number"
                value={form.contact}
                onChange={(v) => handleChange("contact", v)}
              />
            </Section>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-lg"
              }`}
          >
            {loading
              ? "Processing..."
              : mode === "edit"
              ? "Update"
              : "Create"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ===============================
   SMALL REUSABLE COMPONENTS
================================ */

function Section({ title, children }) {
  return (
    <div className="space-y-3 pt-4 border-t">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      {children}
    </div>
  );
}

function CitySelect({ value, onChange }) {
  return (
    <select
      className="w-full border rounded-xl px-4 py-3 bg-gray-50
        focus:ring-2 focus:ring-red-500 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option>Pune</option>
      <option>Mumbai</option>
      <option>Baramati</option>
      <option>Satara</option>
      <option>Nashik</option>
    </select>
  );
}

function Input({ icon: Icon, type = "text", placeholder, value, onChange }) {
  return (
    <div className="relative">
      <Icon
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type={type}
        className="w-full border rounded-xl pl-11 pr-4 py-3 bg-gray-50
          focus:ring-2 focus:ring-red-500 outline-none transition"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={placeholder !== "Phone (optional)"}
      />
    </div>
  );
}
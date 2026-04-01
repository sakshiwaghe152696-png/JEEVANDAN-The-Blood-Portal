import { useState } from "react";
import api from "../../services/axios";

export default function CreateUser() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    user_type: "DONOR",
    full_name: "",
    email: "",
    phone: "",
    city: "",
    gender: "",
    date_of_birth: "",
    age: "",
    address: "",
    blood_group: "",
    weight: "",
    last_donation_date: "",

    // medical screening
    has_diabetes: "NO",
    has_bp: "NO",
    heart_disease: "NO",
    hepatitis_history: "NO",
    recent_surgery: "NO",
    taking_medication: "NO"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.full_name || !form.phone || !form.city) {
      return "Full name, phone and city are required";
    }

    if (form.user_type === "DONOR" && !form.blood_group) {
      return "Blood group is required for donors";
    }

    return "";
  };

  const submit = async () => {

    const msg = validate();

    if (msg) {
      setError(msg);
      return;
    }

    try {

      setLoading(true);
      setError("");

      await api.post("/doctor/create-user", form);

      alert("User created successfully");

      setForm({
        user_type: "PATIENT",
        full_name: "",
        email: "",
        phone: "",
        city: "",
        gender: "",
        date_of_birth: "",
        age: "",
        address: "",
        blood_group: "",
        weight: "",
        last_donation_date: "",

        has_diabetes: "NO",
        has_bp: "NO",
        heart_disease: "NO",
        hepatitis_history: "NO",
        recent_surgery: "NO",
        taking_medication: "NO"
      });

    } catch (err) {

      setError(
        err.response?.data?.message || "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="max-w-3xl bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Create Patient / Donor
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {/* USER TYPE */}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          User Type
        </label>

        <select
          name="user_type"
          value={form.user_type}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="PATIENT">Patient</option>
          <option value="DONOR">Donor</option>
        </select>
      </div>


      {/* BASIC INFO */}

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="text-sm font-medium">Full Name *</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phone *</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">City *</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Date of Birth
          </label>

          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Age
          </label>

          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

      </div>


      {/* ADDRESS */}

      <div className="mt-4">

        <label className="text-sm font-medium">
          Address
        </label>

        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />

      </div>


      {/* DONOR MEDICAL INFO */}

      {form.user_type === "DONOR" && (

        <div className="mt-6 border-t pt-4">

          <h3 className="text-lg font-medium mb-3">
            Donor Medical Info
          </h3>

          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="text-sm font-medium">
                Blood Group *
              </label>

              <select
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Weight (kg)
              </label>

              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Last Donation Date
              </label>

              <input
                type="date"
                name="last_donation_date"
                value={form.last_donation_date}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

          </div>


          {/* MEDICAL SCREENING */}

          <div className="mt-6">

            <h3 className="text-lg font-medium mb-3">
              Medical Screening
            </h3>

            <div className="grid grid-cols-3 gap-4">

              <div>
                <label className="text-sm font-medium">
                  Diabetes
                </label>

                <select
                  name="has_diabetes"
                  value={form.has_diabetes}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Blood Pressure
                </label>

                <select
                  name="has_bp"
                  value={form.has_bp}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Heart Disease
                </label>

                <select
                  name="heart_disease"
                  value={form.heart_disease}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Hepatitis History
                </label>

                <select
                  name="hepatitis_history"
                  value={form.hepatitis_history}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Recent Surgery
                </label>

                <select
                  name="recent_surgery"
                  value={form.recent_surgery}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Taking Medication
                </label>

                <select
                  name="taking_medication"
                  value={form.taking_medication}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

            </div>

          </div>

        </div>

      )}


      {/* SUBMIT BUTTON */}

      <div className="mt-6">

        <button
          onClick={submit}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create User"}
        </button>

      </div>

    </div>

  );
}
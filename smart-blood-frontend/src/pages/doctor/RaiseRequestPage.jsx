import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/axios";
import {
  FaUserInjured,
  FaTint,
  FaBox,
  FaPaperPlane,
  FaHospital,
  FaNotesMedical
} from "react-icons/fa";

export default function RequestBloodPage() {

  const { bankId } = useParams();

  const [form, setForm] = useState({
    patient_name: "",
    age: "",
    gender: "",
    blood_group: "",
    units: "",
    urgency: "Routine",
    component: "WHOLE",
    diagnosis: "",
    hospital_name: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/doctor/request-blood/${bankId}`, form);
      alert("Blood request submitted successfully!");

      setForm({
        patient_name: "",
        age: "",
        gender: "",
        blood_group: "",
        units: "",
        urgency: "Routine",
        component: "WHOLE",
        diagnosis: "",
        hospital_name: ""
      });

    } catch (error) {
      console.error(error);
      alert("Failed to submit request");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h2 className="text-2xl font-bold mb-8">
        Raise Blood Request
      </h2>

      <div className="bg-white p-8 rounded-xl shadow-md max-w-xl">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Patient Name */}
          <div className="flex items-center border rounded-lg px-3">
            <FaUserInjured className="mr-2 text-gray-400" />
            <input
              name="patient_name"
              value={form.patient_name}
              onChange={handleChange}
              placeholder="Patient Name"
              className="w-full p-3 outline-none"
              required
            />
          </div>

          {/* Age + Gender */}
          <div className="flex gap-4">
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
              className="w-1/2 p-3 border rounded-lg"
              required
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-1/2 p-3 border rounded-lg"
              required
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* Blood Group */}
          <div className="flex items-center border rounded-lg px-3">
            <FaTint className="text-red-500 mr-2" />
            <select
              name="blood_group"
              value={form.blood_group}
              onChange={handleChange}
              className="w-full p-3"
              required
            >
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>O+</option>
              <option>O-</option>
              <option>AB+</option>
              <option>AB-</option>
            </select>
          </div>

          {/* Units */}
          <div className="flex items-center border rounded-lg px-3">
            <FaBox className="mr-2 text-gray-400" />
            <input
              type="number"
              name="units"
              value={form.units}
              onChange={handleChange}
              className="w-full p-3"
              required
            />
          </div>

          {/* Component */}
          <select
            name="component"
            value={form.component}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="WHOLE">Whole Blood</option>
            <option value="RBC">RBC</option>
            <option value="PLASMA">Plasma</option>
            <option value="PLATELETS">Platelets</option>
          </select>

          {/* Urgency */}
          <select
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option>Routine</option>
            <option>Urgent</option>
            <option>Emergency</option>
          </select>

          {/* Diagnosis */}
          <div className="flex items-center border rounded-lg px-3">
            <FaNotesMedical className="mr-2 text-gray-400" />
            <input
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              placeholder="Diagnosis"
              className="w-full p-3"
            />
          </div>

          {/* Hospital */}
          <div className="flex items-center border rounded-lg px-3">
            <FaHospital className="mr-2 text-gray-400" />
            <input
              name="hospital_name"
              value={form.hospital_name}
              onChange={handleChange}
              placeholder="Hospital Name"
              className="w-full p-3"
            />
          </div>

          <button className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            <FaPaperPlane />
            Submit Request
          </button>

        </form>
      </div>
    </div>
  );
}
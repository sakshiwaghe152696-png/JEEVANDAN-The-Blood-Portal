import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadPhoto,
} from "../../services/doctorApi";
import api from "../../services/axios";
import defaultAvatar from "../../assets/avatar.jpg";

export default function Profile() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const [editProfile, setEditProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    degree: "",
  });

  const [pwd, setPwd] = useState({
    oldPassword: "",
    newPassword: "",
  });

  /* ================= LOAD PROFILE ================= */
  const loadProfile = async () => {
    try {
      const data = await getMyProfile();

      setDoctor(data);

      setForm({
        full_name: data.profile?.full_name || "",
        phone: data.phone || "",
        degree: data.profile?.degree || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD NOTIFICATIONS ================= */
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/doctor/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  useEffect(() => {
    loadProfile();
    fetchNotifications();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!doctor) return <p>Failed to load profile</p>;

  /* ================= ACTIONS ================= */
  const handleProfileUpdate = async () => {
    if (!form.full_name.trim()) {
      alert("Name is required");
      return;
    }

    await updateMyProfile(form);
    setEditProfile(false);
    loadProfile();
  };

  const handlePasswordChange = async () => {
    if (!pwd.oldPassword || !pwd.newPassword) {
      alert("Please fill both fields");
      return;
    }

    await changePassword(pwd);
    alert("Password updated");

    setPwd({ oldPassword: "", newPassword: "" });
    setShowPassword(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Image must be less than 1 MB");
      return;
    }

    await uploadPhoto(file);
    loadProfile();
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">My Profile</h2>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        {/* PHOTO */}
        <div className="flex items-center gap-4">
          <img
            src={doctor.photo || defaultAvatar}
            className="h-20 w-20 rounded-full object-cover border"
          />

          <label className="text-sm text-blue-600 cursor-pointer">
            Change Photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        {/* EDIT MODE */}
        {editProfile ? (
          <>
            <input
              className="input"
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Degree"
              value={form.degree}
              onChange={(e) =>
                setForm({ ...form, degree: e.target.value })
              }
            />

            <div className="flex gap-3">
              <button onClick={handleProfileUpdate} className="btn-primary">
                Save
              </button>
              <button
                onClick={() => setEditProfile(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p><b>Name:</b> {doctor?.profile?.full_name || "Not Provided"}</p>
            <p><b>Email:</b> {doctor.email}</p>
            <p><b>Phone:</b> {doctor.phone || "-"}</p>
            <p><b>Degree:</b> {doctor?.profile?.degree || "-"}</p>
            <p><b>City:</b> {doctor.city}</p>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setEditProfile(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>

              <button
                onClick={() => setShowPassword(!showPassword)}
                className="btn-secondary"
              >
                Change Password
              </button>
            </div>
          </>
        )}

        {/* PASSWORD SECTION */}
        {showPassword && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold">Change Password</h3>

            <input
              type="password"
              className="input"
              placeholder="Old Password"
              value={pwd.oldPassword}
              onChange={(e) =>
                setPwd({ ...pwd, oldPassword: e.target.value })
              }
            />

            <input
              type="password"
              className="input"
              placeholder="New Password"
              value={pwd.newPassword}
              onChange={(e) =>
                setPwd({ ...pwd, newPassword: e.target.value })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={handlePasswordChange}
                className="btn-danger"
              >
                Update Password
              </button>
              <button
                onClick={() => setShowPassword(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔔 NOTIFICATIONS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-3">🔔 Notifications</h3>

        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className="p-3 border rounded-lg bg-gray-50"
              >
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-xs text-gray-600">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
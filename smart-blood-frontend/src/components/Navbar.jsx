import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white shadow">
      <h1 className="text-xl font-bold text-red-600">
        SmartBlood
      </h1>

      <button
        onClick={() => navigate("/login")}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </nav>
  );
}

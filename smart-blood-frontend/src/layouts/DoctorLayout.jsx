import { Outlet } from "react-router-dom";
import DoctorSidebar from "../components/doctor/DoctorSidebar";
import DoctorTopbar from "../components/doctor/DoctorTopbar";

export default function DoctorLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <DoctorTopbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
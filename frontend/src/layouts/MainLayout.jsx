import { NavLink, Outlet, useNavigate } from "react-router";
import { BarChart3, Boxes, LayoutDashboard, LogOut, Menu, UserCircle, Users, Wrench } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/assets", label: "Assets", icon: Boxes },
  { to: "/employees", label: "Employees", icon: Users, staff: true },
  { to: "/maintenance", label: "Maintenance", icon: Wrench, staff: true },
  { to: "/reports", label: "Reports", icon: BarChart3, staff: true },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function MainLayout() {
  const { user, logout, isStaff } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="nav-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen">
        <div className="navbar bg-base-100 shadow lg:hidden">
          <label htmlFor="nav-drawer" className="btn btn-ghost btn-square" aria-label="Open menu">
            <Menu />
          </label>
          <span className="font-bold">IT Asset Manager</span>
        </div>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-20">
        <label htmlFor="nav-drawer" aria-label="Close menu" className="drawer-overlay" />
        <aside className="flex min-h-full w-64 flex-col bg-base-100 p-4">
          <div className="mb-6 px-2 text-xl font-bold text-primary">IT Asset Manager</div>
          <ul className="menu flex-1 gap-1 p-0">
            {NAV.filter((n) => !n.staff || isStaff).map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon size={18} /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="border-t pt-4">
            <div className="px-2 text-sm font-medium">{user?.name}</div>
            <div className="px-2 pb-3 text-xs text-base-content/60">{user?.role}</div>
            <button className="btn btn-outline btn-sm w-full" onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

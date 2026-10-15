const menuItems = [
  { label: "Dashboard", icon: "▦", page: "dashboard" },
  { label: "Assets", icon: "▣", page: "assets" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">IT</span>
        <div>
          <strong>AssetFlow</strong>
          <small>Management System</small>
        </div>
      </div>

      <p className="menu-label">WORKSPACE</p>

      <nav>
    {menuItems.map((item) => (
          <button
            key={item.page}
            className={`menu-item ${
              page === item.page ? "active" : ""
            }`}
            onClick={() => setPage(item.page)}
          >
            <span className="menu-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        Asset Management
      </div>
    </aside>
  );
}
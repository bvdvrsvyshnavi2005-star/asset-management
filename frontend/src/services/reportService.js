import api from "./api";

export const getDashboard = () => api.get("/dashboard").then((r) => r.data);
export const getAuditLog = (params) => api.get("/audit", { params }).then((r) => r.data);

export const downloadAssetsCsv = async () => {
  const res = await api.get("/reports/assets.csv", { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "assets.csv";
  a.click();
  URL.revokeObjectURL(url);
};

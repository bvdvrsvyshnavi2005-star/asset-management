import api from "./api";

export const listMaintenance = (params) => api.get("/maintenance", { params }).then((r) => r.data);
export const createMaintenance = (data) => api.post("/maintenance", data).then((r) => r.data);
export const completeMaintenance = (id, data) => api.put(`/maintenance/${id}/complete`, data).then((r) => r.data);

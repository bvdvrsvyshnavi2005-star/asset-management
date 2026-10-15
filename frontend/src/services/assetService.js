import api from "./api";

export const listAssets = (params) => api.get("/assets", { params }).then((r) => r.data);
export const getAsset = (id) => api.get(`/assets/${id}`).then((r) => r.data);
export const getAssetHistory = (id) => api.get(`/assets/${id}/history`).then((r) => r.data);
export const createAsset = (data) => api.post("/assets", data).then((r) => r.data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data).then((r) => r.data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`).then((r) => r.data);
export const assignAsset = (id, employeeId, note) => api.post(`/assets/${id}/assign`, { employeeId, note }).then((r) => r.data);
export const transferAsset = (id, employeeId, note) => api.post(`/assets/${id}/transfer`, { employeeId, note }).then((r) => r.data);
export const returnAsset = (id, note) => api.post(`/assets/${id}/return`, { note }).then((r) => r.data);

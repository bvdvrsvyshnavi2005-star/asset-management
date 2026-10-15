import api from "./api";

export const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data);
export const me = () => api.get("/auth/me").then((r) => r.data);
export const changePassword = (payload) => api.put("/auth/password", payload).then((r) => r.data);

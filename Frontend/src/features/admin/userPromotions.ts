// src/api/userApi.ts

import api from "@/api/apiService";

export const promoteToSeller = async (userId: number) => {
  return api.post(`/api/users/${userId}/promote_to_seller/`);
};

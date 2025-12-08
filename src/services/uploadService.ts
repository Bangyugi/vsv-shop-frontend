import api from "../api/axios";
import type { ApiResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Ensure the return type matches what we extract (string)
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  // Use ApiResponse<string> to match the backend structure { code, message, data: string }
  const response = await api.post<ApiResponse<string>>(`${BASE_URL}/uploads`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Extract the actual URL string from the 'data' field
  if (response.data && response.data.data) {
    return response.data.data;
  }

  throw new Error("Upload failed: No URL returned from server");
};
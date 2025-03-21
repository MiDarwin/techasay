import { headers } from "next/headers";

const BASE_URL = "http://127.0.1:8000";

export async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  token = null
) {
  const headers = {};

  const accessToken = token || localStorage.getItem("access_token");
  if (accessToken) {
    headers["Authorization"] = `${accessToken}`;
  }

  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: isFormData
      ? headers
      : { ...headers, "Content-Type": "application/json" },
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  // 204 No Content durumunu kontrol et
  if (response.status === 204) {
    return; // Boş döndür
  }

  // Diğer durumlarda JSON'u parse et
  return await response.json();
}
// Kullanıcı CRUD İstekleri

// Kullanıcı oluşturma (kayıt)
export const registerUser = (userData) =>
  apiRequest("/register", "POST", userData);

// Kullanıcı giriş yapma (login)
export const loginUser = (email, password) =>
  apiRequest("/login", "POST", { email, password });

// Mevcut kullanıcı bilgilerini alma
export const getCurrentUser = () => {
  const token = localStorage.getItem("access_token"); // localStorage'dan token al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  return apiRequest("/user/users/me", "GET", null, token); // Token'ı apiRequest'e gönder
};
// Kullanıcı şifresini güncelleme
export const updateUserPassword = (email, oldPassword, newPassword) =>
  apiRequest("/users/update-password", "PUT", {
    email,
    old_password: oldPassword,
    new_password: newPassword,
  });
// Tüm kullanıcıları getirme
export const getAllUsers = async () => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  return apiRequest("/user/users/with-permissions", "GET", null, token); // Tüm kullanıcıları getiren API
};
export const getAllUsersPermissions = async () => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  return apiRequest("/user/permissions", "GET", null, token); // Tüm kullanıcıları getiren API
};
// Kullanıcının yetkilerini getirme
export const getUserPermissions = () => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  return apiRequest("/user/users/with-permissions", "GET", null, token); // Yetki API'sine istek
};
// Şirket CRUD İstekleri
export const createCompany = (companyData) =>
  apiRequest("/companies/", "POST", companyData);

export const getAllCompanies = () => apiRequest("/companies/", "GET");

export const getCompanyById = (_id) => apiRequest(`/companies/${_id}`, "GET");

export const getCompanyByCompanyId = (company_id) =>
  apiRequest(`/companies/by_company_id/${company_id}`, "GET");

export const updateCompany = (company_id, updateData) =>
  apiRequest(`/companies/${company_id}`, "PUT", updateData);

export const deleteCompany = (company_id) =>
  apiRequest(`/companies/${company_id}`, "DELETE");

// Şube CRUD İstekleri
export const createBranch = (companyId, branchData) => 
  apiRequest(`/companies/${companyId}/branches`, "POST", branchData);
export const getAllBranches = async (limit = 50, city = null) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const url = `${BASE_URL}/branches?limit=${limit}${city ? `&city=${city}` : ""}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Token'ı Authorization header'ına ekle
    }
  });

  if (!response.ok) {
    throw new Error("Şubeler alınırken bir hata oluştu.");
  }

  return await response.json();
};

export const getBranchById = (branch_id) =>
  apiRequest(`/branches/${branch_id}`, "GET");

export const getBranchesByCompanyId = async (companyId, city = "",districtFilter ="", search = "") => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const params = new URLSearchParams(); // Query parametrelerini oluşturmak için URLSearchParams kullanılır

  if (city) params.append("city", city); // Eğer city varsa ekle
  if (search) params.append("textinput", search); // Eğer search varsa ekle
  if (districtFilter) params.append("district",districtFilter);

  const response = await fetch(`${BASE_URL}/companies/${companyId}/branches?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Token'ı Authorization header'ına ekle
    }
  });

  if (!response.ok) {
    throw new Error("Şubelere erişim sağlanırken bir hata oluştu.");
  }

  return response.json();
};
export const updateBranch = async (branchId, updateData) => {
  const response = await fetch(`${BASE_URL}/branches/${branchId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Güncelleme işlemi başarısız oldu.");
  }
};

export const deleteBranch = (branchId) => {
  return apiRequest(`/branches/${branchId}`, "DELETE");
};

// ** Envanter CRUD İstekleri **
export const createInventory = (branchId, inventoryData) =>
  apiRequest(`/branches/${branchId}/inventories`, "POST", inventoryData);

export const getInventoryByBranch = (branch_id) =>
  apiRequest(`/branches/${branch_id}/inventory`, "GET");

export const getcombinedinventoryByBranch = (branch_id) =>
  apiRequest(`/branches/${branch_id}/combined-inventory`, "GET");

export const updateInventory = (inventoryId, updateData) =>
  apiRequest(`/inventories/${inventoryId}`, "PUT", updateData);

export const deleteInventory = (inventoryId) =>
  apiRequest(`/inventories/${inventoryId}`, "DELETE");

export const getAllInventory = (companyName = "", branchName = "") => {
  const params = new URLSearchParams();

  if (companyName) params.append("company_name", companyName); // Şirket adı
  if (branchName) params.append("branch_name", branchName); // Şube adı

  return apiRequest(`/inventories?${params.toString()}`, "GET");
};
// ** Alt Şube CRUD İstekleri **
export const createSubBranch = async (branchId, subBranchData) => {
  const response = await fetch(`${BASE_URL}/branches/${branchId}/sub-branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify(subBranchData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Alt şube eklenirken bir hata oluştu.");
  }

  return response.json();
};

export const getSubBranchesByBranchId = async (branchId) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const response = await fetch(`${BASE_URL}/branches/${branchId}/sub-branches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Token'ı Authorization header'ına ekle
    },
  });

  if (!response.ok) {
    throw new Error("Alt şubelere erişim sağlanırken bir hata oluştu.");
  }

  return response.json();
};

// Alt Şube Güncelleme ve Silme İstekleri
export const updateSubBranch = async (subBranchId, updateData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${BASE_URL}/branches/sub-branches/${subBranchId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Alt şube güncellenirken bir hata oluştu.");
  }

  return response.json();
};

export const deleteSubBranch = async (subBranchId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${BASE_URL}/branches/sub-branches/${subBranchId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error("Alt şube silinirken bir hata oluştu.");
  }

  return; // Başarılı ise boş döndür
};
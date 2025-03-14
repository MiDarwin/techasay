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
    headers["Authorization"] = `Bearer ${accessToken}`;
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

export const getAllBranches = (city = "", search = "", company = "") => {
  const params = new URLSearchParams();
  if (city) {
    params.append("city", city);
  }
  if (search) {
    params.append("search", search);
  }
  if (company) {
    params.append("company_id", company); // Şirket ID'sini ekledik
  }
  return apiRequest(`/branches/?${params.toString()}`, "GET");
};

export const getBranchById = (branch_id) =>
  apiRequest(`/branches/${branch_id}`, "GET");

export const getBranchesByCompanyId = async (companyId) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const response = await fetch(`${BASE_URL}/companies/${companyId}/branches`, {
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
export const updateBranch = (_id, updateData) =>
  apiRequest(`/branches/${_id}`, "PUT", updateData);

export const deleteBranch = (branchId) => {
  return apiRequest(`/branches/${branchId}`, "DELETE");
};

// ** Envanter CRUD İstekleri **
export const createInventory = (inventoryData) =>
  apiRequest("/inventory/", "POST", inventoryData);

export const getInventoryByBranch = (branch_id) =>
  apiRequest(`/inventory/branch/${branch_id}`, "GET");

export const getInventoryById = (inventory_id) =>
  apiRequest(`/inventory/${inventory_id}`, "GET");

export const updateInventory = (inventory_id, updateData) =>
  apiRequest(`/inventory/${inventory_id}`, "PUT", updateData);

export const deleteInventory = (inventory_id) =>
  apiRequest(`/inventory/${inventory_id}`, "DELETE");

export const getAllInventory = () => apiRequest("/inventory/", "GET");

// ** Alt Şube CRUD İstekleri **
export const createSubBranch = async (subBranchData) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const response = await fetch(`${BASE_URL}/branches/sub-branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Token'ı Authorization header'ına ekle
    },
    body: JSON.stringify(subBranchData), // Body'yi JSON formatına çevir
  });

  if (!response.ok) {
    const error = await response.json(); // Hata mesajını al
    throw new Error(error.detail || "Alt şube eklenirken bir hata oluştu."); // Hata mesajını döndür
  }

  return response.json(); // Başarılı ise yanıtı döndür
};

export const getSubBranchesByBranchId = async (branchId) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const response = await fetch(`${BASE_URL}/branches/sub-branches/${branchId}`, {
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
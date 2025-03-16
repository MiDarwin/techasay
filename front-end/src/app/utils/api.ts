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
export const getAllBranches = async (limit = 50) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const response = await fetch(`${BASE_URL}/branches?limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Token'ı Authorization header'ına ekle
    }
  });

  if (!response.ok) {
    throw new Error("Tüm şubeler alınırken bir hata oluştu.");
  }

  return await response.json(); // JSON formatında dönen veriyi çöz
};

export const getBranchById = (branch_id) =>
  apiRequest(`/branches/${branch_id}`, "GET");

export const getBranchesByCompanyId = async (companyId, city = "", search = "") => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const params = new URLSearchParams(); // Query parametrelerini oluşturmak için URLSearchParams kullanılır

  if (city) params.append("city", city); // Eğer city varsa ekle
  if (search) params.append("textinput", search); // Eğer search varsa ekle

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
  apiRequest(`/inventory/branch/${branch_id}`, "GET");

export const getInventoryById = (inventory_id) =>
  apiRequest(`/inventory/${inventory_id}`, "GET");
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
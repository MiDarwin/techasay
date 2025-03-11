const BASE_URL = "http://127.0.0.1:8000";

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

export const updateCompany = (_id, updateData) =>
  apiRequest(`/companies/${_id}`, "PUT", updateData);

export const deleteCompany = (_id) =>
  apiRequest(`/companies/${_id}`, "DELETE");

// Şube CRUD İstekleri
export const createBranch = (branchData) =>
  apiRequest("/branches/", "POST", branchData);

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

export const getBranchesByCompanyId = (company_id) =>
  apiRequest(`/branches/company/${company_id}`, "GET");

export const updateBranch = (_id, updateData) =>
  apiRequest(`/branches/${_id}`, "PUT", updateData);

export const deleteBranch = (_id) =>
  apiRequest(`/branches/${_id}`, "DELETE");
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

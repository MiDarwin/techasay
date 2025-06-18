import { headers } from "next/headers";

const BASE_URL = "http://127.0.1:8000"; //"http://127.0.1:8000""http://45.132.181.87:8000"

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
  apiRequest("/api/user/register", "POST", userData);

// Kullanıcı giriş yapma (login)
export const loginUser = (email, password) =>
  apiRequest("/api/user/login", "POST", { email, password });

// Mevcut kullanıcı bilgilerini alma
export const getCurrentUser = () => {
  const token = localStorage.getItem("access_token"); // localStorage'dan token al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  return apiRequest("/api/user/users/me", "GET", null, token); // Token'ı apiRequest'e gönder
};
export const updatePassword = (passwordData) =>
  apiRequest("/api/user/users/update-password", "PUT", passwordData);
// Tüm kullanıcıları getirme
export const getAllUsers = async () => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  return apiRequest("/api/user/users/with-permissions", "GET", null, token); // Tüm kullanıcıları getiren API
};
export const getAllUsersPermissions = async () => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  return apiRequest('/api/permissions/permissionss', "GET", null, token); // Tüm kullanıcıları getiren API
};
// Kullanıcının yetkilerini getirme
export const getUserPermissions = (searchValue = "") => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }

  const queryParam = searchValue ? `?search=${searchValue}` : ""; // Arama parametresi ekle
  return apiRequest(`/api/user/users/with-permissions${queryParam}`, "GET", null, token); // Yetki API'sine istek
};
export const updateUserPermissions = (userId, permissions) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }

  return apiRequest(
    `/api/user/users/${userId}/permissions`, // API endpoint
    "PUT", // HTTP yöntemi
    { permissions }, // Gövde (body)
    token // Authorization token
  );
};
// Şirket CRUD İstekleri
export const createCompany = (companyData) =>
  apiRequest('/api/companies/companies', "POST", companyData);

export const getAllCompanies = () => apiRequest('/api/companies/companies', "GET");

export const getCompanyById = (_id) => apiRequest(`/api/companies/companies/${_id}`, "GET");

export const getCompanyByCompanyId = (company_id) =>
  apiRequest(`/api/companies/companies/by_company_id/${company_id}`, "GET");

export const updateCompany = (company_id, updateData) =>
  apiRequest(`/api/companies/companies/${company_id}`, "PUT", updateData);

export const deleteCompany = (company_id) =>
  apiRequest(`/api/companies/companies/${company_id}`, "DELETE");

// Şube CRUD İstekleri
export const createBranch = (companyId, branchData) => 
  apiRequest(`/api/branches/companies/${companyId}/branches`, "POST", branchData);
export const getAllBranches = async (limit = 50, city = null) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const url = `${BASE_URL}/api/branches/branches?limit=${limit}${city ? `&city=${city}` : ""}`;
  
  const response = await fetch(url, {
    method: "GET", // GET isteği
    headers: {
      "Authorization": `${token}`, // Token'ı Authorization başlığına ekle
      "Content-Type": "application/json", // Verinin türünü belirt
    },
  });

  if (!response.ok) {
    throw new Error("Şubeler alınırken bir hata oluştu.");
  }

  return await response.json();
};

  

export const getBranchById = (branch_id) =>
  apiRequest(`/api/branches/branches/${branch_id}`, "GET");

export const getBranchesByCompanyId = async (
  companyId,
  limit = 50,
  city = "",
  districtFilter = "",
  search = ""
) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const params = new URLSearchParams(); // Query parametrelerini oluşturmak için URLSearchParams kullanılır

  if (city) params.append("city", city); // Eğer city varsa ekle
  if (search) params.append("textinput", search); // Eğer search varsa ekle
  if (districtFilter) params.append("district", districtFilter);
  params.append("limit", limit); // Limit parametresini ekle

  const response = await fetch(
    `${BASE_URL}/api/branches/companies/${companyId}/branches?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Token'ı Authorization header'ına ekle
      },
    }
  );

  if (!response.ok) {
    throw new Error("Şubelere erişim sağlanırken bir hata oluştu.");
  }

  return response.json();
};
export const updateBranch = async (branchId, updateData) => {
  const response = await fetch(`${BASE_URL}/api/branches/branches/${branchId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  
};

export const deleteBranch = (branchId) => {
  return apiRequest(`/api/branches/branches/${branchId}`, "DELETE");
};
export const exportBranches = async (company = "", city = "", district = "") => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const params = new URLSearchParams(); // Query parametrelerini oluşturmak için URLSearchParams kullanılır

  if (company) params.append("company_id", company); // Eğer şirket belirtilmişse ekle
  if (city) params.append("city", city); // Eğer şehir belirtilmişse ekle
  if (district) params.append("district", district); // Eğer ilçe belirtilmişse ekle

  const url = `${BASE_URL}/api/branches/branches/export?${params.toString()}`; // API URL'sini oluştur

  const response = await fetch(url, {
    method: "GET", // GET isteği
    headers: {
      Authorization: `Bearer ${token}`, // Token'ı Authorization başlığına ekle
    },
  });

  if (!response.ok) {
    throw new Error("Excel dosyası indirilirken bir hata oluştu."); // Hata durumunda bir mesaj at
  }

  // Gelen dosyayı indirmek için bir Blob oluştur
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "subeler.xlsx"; // Dosya adı
  document.body.appendChild(link);
  link.click();
  link.remove();
};
export const uploadBranches = async (file) => {
  const token = localStorage.getItem("access_token"); // Token'ı localStorage'dan al
  const url = `${BASE_URL}/api/branches/branches/import`; // API URL'sini ayarla

  const formData = new FormData();
  formData.append("file", file); // Excel dosyasını formData'ya ekle

  const response = await fetch(url, {
    method: "POST", // POST isteği
    headers: {
      Authorization: `Bearer ${token}`, // Token'ı Authorization başlığına ekle
    },
    body: formData, // FormData'yı body olarak gönder
  });

  if (!response.ok) {
    const errorData = await response.json(); // Hata mesajını al
    throw new Error(errorData.detail || "Şubeler yüklenirken bir hata oluştu."); // Hata durumunda bir mesaj at
  }

  return await response.json(); // Başarılı olursa sonucu dön
};
// ** Envanter CRUD İstekleri **
export const createInventory = async (payload: {
  branch_id: number;
  details: Record<string, any>;
}): Promise<InventoryOut> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/api/inventory`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),  // <-- burada branch_id ve details girilmeli
  });

  const data = await res.json();
  if (!res.ok) {
    // data.detail FastAPI’den geliyor
    throw new Error(data.detail || "Envanter oluşturmada hata");
  }
  return data as InventoryOut;
};
export const getInventoryByBranch = async (
  branch_id?: number,
  limit?: number,
  q?: string
): Promise<InventoryOut[]> => {
  if (!branch_id) return [];
  const token = localStorage.getItem("access_token");
  let url = `${BASE_URL}/api/inventory?branch_id=${branch_id}`;
  if (limit) url += `&limit=${limit}`;
  if (q)     url += `&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Envanter alınamadı");
  return data as InventoryOut[];
};

export const getcombinedinventoryByBranch = (branch_id) =>
  apiRequest(`${BASE_URL}/api/inventory/branches/${branch_id}/combined-inventory`, "GET");

export const updateInventory = async (
  inventory_id: number,
  updates: Record<string, any>
) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/api/inventory/${inventory_id}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Envanter güncellemede hata");
  return data as InventoryOut;
};
export const getInventoryFieldsByCompany = async (
  company_id: number
): Promise<string[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${BASE_URL}/api/inventory/fields?company_id=${company_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Alan önerileri alınamadı");
  return data as string[];
};
export const getInventoryFieldsByCompanyJust = async (
  company_id: number
): Promise<string[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${BASE_URL}/api/inventory/fields/company?company_id=${company_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Alan önerileri alınamadı");
  return data as string[];
};
export const deleteInventory = (inventoryId) =>
  apiRequest(`${BASE_URL}/api/inventory/inventories/${inventoryId}`, "DELETE");

export const getAllInventory = (companyName = "", branchName = "") => {
  const params = new URLSearchParams();

  if (companyName) params.append("company_name", companyName); // Şirket adı
  if (branchName) params.append("branch_name", branchName); // Şube adı

  return apiRequest(`${BASE_URL}/api/inventory/inventories?${params.toString()}`, "GET");
};
export const getInventoryByCompany = async (
  company_id?: number,
  limit?: number,
  q?: string
): Promise<InventoryOut[]> => {
  if (!company_id) return [];
  const token = localStorage.getItem("access_token");
  let url = `${BASE_URL}/api/inventory?company_id=${company_id}`;
  if (limit) url += `&limit=${limit}`;
  if (q)     url += `&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Envanter alınamadı");
  return data as InventoryOut[];
};
// Excel import
export const importInventory = async (file: File) => {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/api/inventory/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Excel import hatası");
  return data as {
    added: number;
    updated: number;
    skipped: number;
    skipped_branches: string[];
  };
};
export const importInventoryByCompany = async (
  company_id: number,
  file: File
): Promise<InventoryImportResponse> => {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${BASE_URL}/api/inventory/import/company/${company_id}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Excel import hatası");
  return data as InventoryImportResponse;
};
// Excel export
export const downloadInventoryExcel = async (
  company_id?: number,
  branch_id?: number,
  limit?: number
) => {
  const token = localStorage.getItem("access_token");
  let url = `${BASE_URL}/api/inventory/export?`;
  if (branch_id) url += `branch_id=${branch_id}`;
  else if (company_id) url += `company_id=${company_id}`;
  if (limit) url += `&limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Excel indirilemedi");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "envanter.xlsx";
  a.click();
};
// ** Alt Şube CRUD İstekleri **
export const createSubBranch = async (branchId, subBranchData) => {
  const response = await fetch(`${BASE_URL}/api/branches/branches/${branchId}/sub-branches`, {
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
  const response = await fetch(`${BASE_URL}/api/branches/branches/${branchId}/sub-branches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Token'ı Authorization header'ına ekle
    },
  });

  

  return response.json();
};

// Alt Şube Güncelleme ve Silme İstekleri
export const updateSubBranch = async (subBranchId, updateData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${BASE_URL}/api/branches/branches/sub-branches/${subBranchId}`, {
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
  const response = await fetch(`${BASE_URL}/api/branches/branches/sub-branches/${subBranchId}`, {
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
// Envanter modellerini ve türlerini getir
export const getInventoryHelpers = async () => {
  return apiRequest("/api/inventory-helper/inventory-helpers", "GET");
};

// Belirli bir modele göre türleri getir
export const getModelsByDeviceType = async (deviceType) => {
  return apiRequest(`/api/inventory-helper/inventory-helpers`, "GET");
};

// Yeni bir envanter türü ekle
export const createDeviceType = async (deviceType) => {
  return apiRequest("/api/inventory-helper/inventory-helpers/types", "POST", { device_type: deviceType });
};

// Yeni bir modeli belirli bir cihaz türüne ekle
export const addModelToDeviceType = async (deviceTypeId, modelName) => {
  return apiRequest(`/api/inventory-helper/inventory-helpers/${deviceTypeId}/models`, "POST", { model_name: modelName });
};
export const deleteDeviceType = async (helperId) => {
  return apiRequest(`/api/inventory-helper/inventory-helpers/${helperId}`, "DELETE");
};
export const deleteModelFromDeviceType = async (helperId, modelName) => {
  return apiRequest(`/api/inventory-helper/inventory-helpers/${helperId}/models/${encodeURIComponent(modelName)}`, "DELETE");
};
// Bir modeli ve altındaki türleri güncelle
export const updateInventoryHelper = async (helperId, updatedData) => {
  return apiRequest(`/api/inventory-helper/inventory-helpers/${helperId}`, "PUT", updatedData);
};
export const getArchivedInventory = async () => {
  return apiRequest(`/api/inventory/archived_inventories`, "GET");
};
// Favori ekleme API çağrısı
export const addFavoriteBranch = async (branchId) => {
  const token = localStorage.getItem("access_token"); // Kullanıcının token'ını al
  const url = `${BASE_URL}/api/branches/branches/${branchId}/favorites`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `${token}`, // Bearer token ekle
      "Content-Type": "application/json", // JSON formatını belirt
    },
  });

  if (!response.ok) {
    throw new Error("Favori ekleme işlemi başarısız oldu.");
  }

  return await response.json(); // API yanıtını döndür
};

// Favori silme API çağrısı
export const removeFavoriteBranch = async (branchId) => {
  const token = localStorage.getItem("access_token"); // Kullanıcının token'ını al
  const url = `${BASE_URL}/api/branches/branches/${branchId}/favorites`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `${token}`, // Bearer token ekle
      "Content-Type": "application/json", // JSON formatını belirt
    },
  });

  if (!response.ok) {
    throw new Error("Favori silme işlemi başarısız oldu.");
  }

  return await response.json(); // API yanıtını döndür
};
// Şube Ziyaretlerini Getirme
export const getBranchVisits = async (branchId) => {
  const token = localStorage.getItem("access_token"); // Token'ı al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }

  const response = await fetch(`${BASE_URL}/api/visits/branches/${branchId}/visits`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Token'ı Authorization başlığına ekle
      "Content-Type": "application/json", // JSON formatını belirt
    },
  });

  if (response.status === 404) {
    // Eğer 404 dönüyorsa, şubeye ait ziyaret bulunmamaktadır.
    return []; // Boş bir dizi döndür
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Ziyaret verileri alınamadı.");
  }

  return await response.json(); // JSON yanıtını döndür
};

// Şube Ziyareti Oluşturma
export const createBranchVisit = async (branchId, formData) => {
  const token = localStorage.getItem("access_token"); // Token'ı al
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }

  const response = await fetch(`${BASE_URL}/api/visits/branches/${branchId}/visits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Token'ı Authorization başlığına ekle
    },
    body: formData, // FormData kullanıldığı için Content-Type otomatik ayarlanır
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Ziyaret oluşturulamadı.");
  }

  return await response.json(); // JSON yanıtını döndür
};
export const getPhotoUrl = (photoId) => {
  if (!photoId) {
    throw new Error("Fotoğraf ID'si bulunamadı.");
  }

  // Fotoğraf URL'si backend'den gelen doğru adresle oluşturuluyor
  return `${BASE_URL}/api/visit_images/${photoId}`;
};
export const createTask = async (taskData) => {
  const token = localStorage.getItem("access_token")
  return apiRequest('${BASE_URL}/api/tasks/tasks', "POST", taskData, token)
}
export const updateTaskStatus = async (taskId, updateData) => {
  const token = localStorage.getItem("access_token")
  return apiRequest(`${BASE_URL}/api/tasks/tasks/${taskId}`, "PATCH", updateData, token)
}
export const getTasks =async ()=>{
  const token = localStorage.getItem("access_token"); 
  if (!token) {
    throw new Error("Erişim tokenı bulunamadı. Lütfen giriş yapın.");
  }
  const response = await fetch(`${BASE_URL}/api/tasks/tasks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Token'ı Authorization başlığına ekle
      "Content-Type": "application/json", // JSON formatını belirt
    },
  });
  return await response.json();
}
export const getBranchCoords = async (link: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${BASE_URL}/api/branches/coords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ link }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Koordinatlar alınamadı.");
  }
  // { latitude: number, longitude: number }
  return await response.json();
};
export const optimizeRoute = async ({
  start,
  end,
  branch_ids,
  priority_branch_ids
}: {
  start: [number, number];
  end: [number, number];
  branch_ids: number[];
  priority_branch_ids: number[];
}) => {
  const token = localStorage.getItem("access_token");
  // 2) Mutlak URL yerine göreli path kullanıyoruz:
  const res = await fetch(`/api/route/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ start, end, branch_ids, priority_branch_ids }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Rota oluşturulamadı");
  return data;
};
export const getBranchesCount = async ({
  company_id,
  city,
  district,
  textinput,
}: {
  company_id?: number;
  city?: string;
  district?: string;
  textinput?: string;
}) => {
  const token = localStorage.getItem("access_token");
  const params = new URLSearchParams();
  if (company_id != null) params.append("company_id", company_id.toString());
  if (city)      params.append("city", city);
  if (district)  params.append("district", district);
  if (textinput) params.append("textinput", textinput);

  const res = await fetch(
    `${BASE_URL}/api/branches/count?${params.toString()}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();  // { count: number, sub_count: number }
  if (!res.ok) throw new Error(data.detail || "Şube sayısı alınamadı");
  return {
      count: data.count as number,
      subCount: data.sub_count as number,
      };
};
export const updateBranchCoords = async (): Promise<{
  total: number;
  updated: number;
}> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/api/branches/coords/update`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  const data = await res.json(); // { total, updated }
  if (!res.ok) {
    throw new Error(data.detail || "Koordinat güncelleme başarısız");
  }
  return {
    total: data.total,
    updated: data.updated
  };
};
/* ----------- 1) Şube bazında BPET listesi ------------- */
export const getBpetsByBranch = async (branchId) => {
  return apiRequest(`/api/bpet-routes/branch/${branchId}`,"GET");
};

/* ----------- 2) Depodaki BPET’ler ---------------------- */
export const getBpetsInWarehouse = async () => {
  return apiRequest(`/api/bpet-routes/warehouse`);
};

/* ----------- 3) BPET geçmişi --------------------------- */
export const getBpetHistory = async (bpetId) => {
  return apiRequest(`/api/bpet-routes/${bpetId}/history`);
};

/* ----------- 4) Yeni BPET oluştur ---------------------- */
export const createBpet = async ({
  product_name,
  attributes,
  branch_id = null,
}) => {
  return apiRequest("/api/bpet-routes", "POST", { product_name, attributes, branch_id });
};

/* ----------- 5) BPET güncelle (tek) -------------------- */
export const updateBpet = async (bpetId, payload) => {
  // payload = { branch_id: ..., attributes: {...} }
  return apiRequest(`/api/bpet-routes/${bpetId}`, "PATCH", payload);
};

/* ----------- 6) Toplu depoya kaldır -------------------- */
export const bulkDismountBpets = async (bpetIds = [], note = "") => {
  return apiRequest("/api/bpet-routes/bulk-dismount", "POST", {
    bpet_ids: bpetIds,
    note,
  });
};


// 🔄 Güncel imza: id + limit (opsiyonel) ⇒ DİZİ garanti
export async function getErrorsByBpet(
  bpetId: number,
  limit = 5
): Promise<ErrorSummary[]> {
  const data = await apiRequest(`/api/bpet-error/${bpetId}`, "GET");

  // Postman’dan kesin dizi geliyor ama yine de güvenlik
  return Array.isArray(data) ? data.filter(Boolean) : data ? [data] : [];
}

/* Tip – alan adlarını opsiyonel/toleranslı yap */
export interface ErrorSummary {
  id: number;
  description?: string;
  occurred_at?: string; // snake
  occurredAt?: string;  // camel (olursa)
  severity?: "info" | "warning" | "critical";
  notes?: string;
  bpet_id?: number;
}

// src/components/CompanyPage.jsx

"use client"; // Next.js 13 için client component olduğunu belirtir

import React, { useState, useEffect } from 'react';
import CompanyForm from './CompanyForm';
import CompanyTable from './CompanyTable';
import BranchForm from './BranchForm';
import BranchTable from './BranchTable';
import { 
  createCompany, 
  getAllCompanies, 
  updateCompany, 
  deleteCompany,
  createBranch,
  getAllBranches,
  updateBranch,
  deleteBranch,
} from '../utils/api';

const CompanyPage = () => {
  const [darkMode, setDarkMode] = useState(true); // Tema durumu
  const [activeTab, setActiveTab] = useState('company'); // 'company' veya 'branch'
  
  // Şirket verileri
  const [companies, setCompanies] = useState([]); 
  const [companyError, setCompanyError] = useState(''); 
  const [companyLoading, setCompanyLoading] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false); 
  const [currentCompany, setCurrentCompany] = useState(null); 
  const [success, setSuccess] = useState('');
  // Şube verileri
  const [branches, setBranches] = useState([]); 
  const [branchError, setBranchError] = useState(''); 
  const [branchLoading, setBranchLoading] = useState(false); 
  const [isBranchEditMode, setIsBranchEditMode] = useState(false); 
  const [currentBranch, setCurrentBranch] = useState(null); 

  // Şirket verilerini çekme
  const fetchCompanies = async () => {
    try {
      setCompanyLoading(true);
      const data = await getAllCompanies();
      setCompanies(data);
      setCompanyLoading(false);
    } catch (err) {
      setCompanyError(err.detail || 'Şirketler alınırken bir hata oluştu.');
      setCompanyLoading(false);
    }
  };

  // Şube verilerini çekme
  const fetchBranches = async () => {
    try {
      setBranchLoading(true);
      const data = await getAllBranches();
      setBranches(data);
      setBranchLoading(false);
    } catch (err) {
      setBranchError(err.detail || 'Şubeler alınırken bir hata oluştu.');
      setBranchLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchBranches();
  }, []);

  // Tema geçişi
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Şirket ekleme sırasında
const handleAddCompany = async (companyData) => {
  try {
    await createCompany(companyData);
    fetchCompanies();
    setCompanyError('');
    setSuccess('Şirket başarıyla eklendi!');
  } catch (err) {
    setCompanyError(err.detail || 'Şirket eklenirken bir hata oluştu.');
  }
};


  /// Şirket güncelleme fonksiyonu
  const handleUpdateCompany = async (_id, updateData) => {
    // CompanyPage.jsx içinde
console.log("Güncellenmiş Şirket Verisi:", updateData);
    try {
      await updateCompany(_id, updateData);
      fetchCompanies();
      setIsEditMode(false);
      setCurrentCompany(null);
      setCompanyError('');
    } catch (err) {
      // Hatanın yapısını kontrol etmek için loglama
      console.error('Şirket güncellenirken hata oluştu:', err);
      // FastAPI'nin döndürdüğü hataları doğru şekilde gösterdiğinizden emin olun
      if (err.detail) {
        setCompanyError(err.detail.map(detail => detail.msg).join(', '));
      } else {
        setCompanyError('Şirket güncellenirken bir hata oluştu.');
      }
    }
  };

  // Şirket silme
  const handleDeleteCompany = async (_id) => {
    if (window.confirm('Bu şirketi silmek istediğinize emin misiniz?')) {
      try {
        await deleteCompany(_id);
        fetchCompanies();
        setCompanyError('');
      } catch (err) {
        setCompanyError(err.detail || 'Şirket silinirken bir hata oluştu.');
      }
    }
  };

  // Şirket güncelleme formunu açma
  const openEditModal = (company) => {
    setIsEditMode(true);
    setCurrentCompany(company);
  };

  // Şirket güncelleme formunu kapatma
  const closeEditModal = () => {
    setIsEditMode(false);
    setCurrentCompany(null);
  };

  // Şube ekleme
  const handleAddBranch = async (branchData) => {
    try {
      await createBranch(branchData);
      fetchBranches();
      setBranchError('');
    } catch (err) {
      setBranchError(err.detail || 'Şube eklenirken bir hata oluştu.');
    }
  };

  // Şube güncelleme
  const handleUpdateBranch = async (branch_id, updateData) => {
    try {
      await updateBranch(branch_id, updateData);
      fetchBranches();
      setIsBranchEditMode(false);
      setCurrentBranch(null);
      setBranchError('');
    } catch (err) {
      setBranchError(err.detail || 'Şube güncellenirken bir hata oluştu.');
    }
  };

  // Şube silme
  const handleDeleteBranch = async (branch_id) => {
    if (window.confirm('Bu şubeyi silmek istediğinize emin misiniz?')) {
      try {
        await deleteBranch(branch_id);
        fetchBranches();
        setBranchError('');
      } catch (err) {
        setBranchError(err.detail || 'Şube silinirken bir hata oluştu.');
      }
    }
  };

  // Şube güncelleme formunu açma
  const openBranchEditModal = (branch) => {
    setIsBranchEditMode(true);
    setCurrentBranch(branch);
  };

  // Şube güncelleme formunu kapatma
  const closeBranchEditModal = () => {
    setIsBranchEditMode(false);
    setCurrentBranch(null);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-white"} text-gray-800 dark:text-white transition-colors duration-300`}>
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Şirket ve Şube Yönetimi</h1>
            <button
              onClick={toggleDarkMode}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors duration-300"
            >
              {darkMode ? "Açık Moda Geç" : "Karanlık Moda Geç"}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Sekme Butonları */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('company')}
              className={`mr-4 px-6 py-3 rounded-md font-semibold transition-colors duration-300 ${
                activeTab === 'company'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Şirket Ekle
            </button>
            <button
              onClick={() => setActiveTab('branch')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors duration-300 ${
                activeTab === 'branch'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Şube Ekle
            </button>
          </div>

          {/* Şirket Yönetimi */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <CompanyForm
                onSubmit={isEditMode ? handleUpdateCompany : handleAddCompany}
                initialData={currentCompany || {}}
                isEditMode={isEditMode}
                onCancel={closeEditModal}
              />
              {companyError && (
                <div className="bg-red-500 text-white p-3 rounded mt-4">
                  {companyError}
                </div>
              )}
              <CompanyTable
                companies={companies}
                onEdit={(company) => {
                  openEditModal(company);
                }}
                onDelete={handleDeleteCompany}
              />
            </div>
          )}

          {/* Şube Yönetimi */}
          {activeTab === 'branch' && (
            <div className="space-y-6">
              <BranchForm
                onSubmit={isBranchEditMode ? handleUpdateBranch : handleAddBranch}
                initialData={currentBranch || {}}
                isEditMode={isBranchEditMode}
                onCancel={closeBranchEditModal}
                companies={companies}
              />
              {branchError && (
                <div className="bg-red-500 text-white p-3 rounded mt-4">
                  {branchError}
                </div>
              )}
              <BranchTable
                branches={branches}
                companies={companies.reduce((acc, company) => {
                  acc[company.company_id] = company.company;
                  return acc;
                }, {})}
                onEdit={(branch) => {
                  openBranchEditModal(branch);
                }}
                onDelete={handleDeleteBranch}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CompanyPage;
// src/components/CompanyPage.jsx

"use client"; // Next.js 13 için client component olduğunu belirtir

import React, { useState, useEffect } from 'react';
import CompanyForm from './CompanyForm';
import CompanyTable from './CompanyTable';
import { 
  createCompany, 
  getAllCompanies, 
  updateCompany, 
  deleteCompany 
} from '../utils/api';

const CompanyPage = () => {
  const [darkMode, setDarkMode] = useState(true); // Tema durumu
  const [companies, setCompanies] = useState([]); // Şirket verileri
  const [error, setError] = useState(''); // Hata mesajı
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const [isEditMode, setIsEditMode] = useState(false); // Güncelleme modu kontrolü
  const [currentCompany, setCurrentCompany] = useState(null); // Güncellenmek istenen şirket

  // Şirket verilerini çekme
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompanies();
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      setError(err.detail || 'Şirketler alınırken bir hata oluştu.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Tema geçişi
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Şirket ekleme
  const handleAddCompany = async (companyData) => {
    try {
      await createCompany(companyData);
      fetchCompanies();
      setError('');
    } catch (err) {
      setError(err.detail || 'Şirket eklenirken bir hata oluştu.');
    }
  };

  // Şirket güncelleme
  const handleUpdateCompany = async (_id, updateData) => {
    try {
      await updateCompany(_id, updateData);
      fetchCompanies();
      setIsEditMode(false);
      setCurrentCompany(null);
      setError('');
    } catch (err) {
      setError(err.detail || 'Şirket güncellenirken bir hata oluştu.');
    }
  };

  // Şirket silme
  const handleDeleteCompany = async (_id) => {
    if (window.confirm('Bu şirketi silmek istediğinize emin misiniz?')) {
      try {
        await deleteCompany(_id);
        fetchCompanies();
        setError('');
      } catch (err) {
        setError(err.detail || 'Şirket silinirken bir hata oluştu.');
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
    setError('');
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen p-8 transition-colors duration-300 relative font-sans`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 opacity-20"></div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-indigo-600">Şirket Yönetimi</h1>
        <button
          onClick={toggleDarkMode}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {darkMode ? 'Açık Mod' : 'Karanlık Mod'}
        </button>
      </div>

      {/* Hata Mesajları */}
      {error && (
        <div className="bg-red-500 text-white p-4 mb-4 rounded">
          {error}
        </div>
      )}

      {/* Şirket Ekleme/Güncelleme Formu */}
      <div className="mb-8">
        <CompanyForm
          onSubmit={isEditMode ? (data) => handleUpdateCompany(currentCompany._id, data) : handleAddCompany}
          initialData={isEditMode ? currentCompany : null}
          isEditMode={isEditMode}
          onCancel={closeEditModal}
          darkMode={darkMode}
        />
      </div>

      {/* Şirket Listesi */}
      <div>
        <h2 className="text-2xl font-medium mb-4 text-indigo-600">Şirketler</h2>
        {loading ? (
          <p>Şirketler yükleniyor...</p>
        ) : (
          <CompanyTable 
            companies={companies} 
            onEdit={openEditModal} 
            onDelete={handleDeleteCompany} 
            darkMode={darkMode} 
          />
        )}
      </div>
    </div>
  );
};

export default CompanyPage;
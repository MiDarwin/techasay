"use client";
import React, { useState, useEffect } from 'react';
import CompanyForm from './CompanyForm';
import CompanyTable from './CompanyTable';
import { 
  createCompany, 
  getAllCompanies, 
  updateCompany, 
  deleteCompany
} from '../../utils/api';

const CompanyManager = () => {
  const [companies, setCompanies] = useState([]);
  const [companyError, setCompanyError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  // Şirketleri çek
  const fetchCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setCompanyError(err.detail || 'Şirketler alınırken hata oluştu.');
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Şirket ekle
  const handleAddCompany = async (companyData) => {
    try {
      await createCompany(companyData);
      fetchCompanies();
      setCompanyError('');
    } catch (err) {
      setCompanyError(err.detail || 'Şirket eklenirken hata oluştu.');
    }
  };

  // Şirket güncelle
  const handleUpdateCompany = async (_id, updateData) => {
    try {
      await updateCompany(_id, updateData);
      fetchCompanies();
      setIsEditMode(false);
      setCurrentCompany(null);
    } catch (err) {
      setCompanyError(err.detail || 'Şirket güncellenirken hata oluştu.');
    }
  };

  // Şirket sil
  const handleDeleteCompany = async (_id) => {
    try {
      await deleteCompany(_id);
      fetchCompanies();
    } catch (err) {
      setCompanyError(err.detail || 'Şirket silinirken hata oluştu.');
    }
  };

  // Düzenleme modalını aç/kapa
  const openEditModal = (company) => {
    setIsEditMode(true);
    setCurrentCompany(company);
  };
  const closeEditModal = () => {
    setIsEditMode(false);
    setCurrentCompany(null);
  };

  return (
    <div>
      {/* Form */}
      <CompanyForm
        onSubmit={isEditMode ? handleUpdateCompany : handleAddCompany}
        initialData={currentCompany || {}}
        isEditMode={isEditMode}
        onCancel={closeEditModal}
      />

      {/* Hata mesajı */}
      {companyError && <div className="error">{companyError}</div>}

      {/* Liste */}
      <CompanyTable
        companies={companies}
        onEdit={openEditModal}
        onDelete={handleDeleteCompany}
      />
    </div>
  );
};

export default CompanyManager;

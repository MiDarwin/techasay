"use client";
import React, { useState, useEffect } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";
import {
  createBranch,
  getAllBranches,
  updateBranch,
  deleteBranch,
  getInventoryByBranch,
} from "../../utils/api";

  const BranchManager = () => {
    const [branches, setBranches] = useState([]);
    const [branchError, setBranchError] = useState("");
    const [isBranchEditMode, setIsBranchEditMode] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [branchLoading, setBranchLoading] = useState(false); 
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
  const handleUpdateBranch = async (_id, updateData) => {
    try {
      await updateBranch(_id, updateData);
      fetchBranches();
      setIsBranchEditMode(false);
      setCurrentBranch(null);
      setBranchError('');
    } catch (err) {
      console.error('Şube güncellenirken hata oluştu:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        const errorMessages = err.response.data.detail.map(detail => detail.msg).join(', ');
        setBranchError(errorMessages);
      } else {
        setBranchError('Şube güncellenirken bir hata oluştu.');
      }
    }
  };

  // Şube silme
  const handleDeleteBranch = async (_id) => {
    if (window.confirm('Bu şubeyi silmek istediğinize emin misiniz?')) {
      try {
        await deleteBranch(_id);
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
  
  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div>
      <BranchForm
        onSubmit={
          isBranchEditMode
            ? (updateData) => handleUpdateBranch(currentBranch._id, updateData)
            : handleAddBranch
        }
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
          acc[company._id] = company.company;
          return acc;
        }, {})}
        onEdit={openBranchEditModal}
        onDelete={handleDeleteBranch}
      />
    </div>
  );
};
export default BranchManager;

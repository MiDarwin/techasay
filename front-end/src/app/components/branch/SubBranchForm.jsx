import React, { useState } from "react";
import PropTypes from "prop-types";

const SubBranchForm = ({ parentBranch, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    branch_name: "", // branch_name zorunlu
    branch_note: "", // şube notu isteğe bağlı
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Form verilerini gönder
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {parentBranch.name} Alt Şube Ekleme
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="branch_name" className="block text-sm font-medium">
            Alt Şube Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="branch_name"
            name="branch_name"
            value={formData.branch_name}
            onChange={handleChange}
            required // Sadece branch_name alanı zorunlu
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="branch_note" className="block text-sm font-medium">
            Şube Notu
          </label>
          <textarea
            id="branch_note"
            name="branch_note"
            value={formData.branch_note}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            İptal
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

SubBranchForm.propTypes = {
  parentBranch: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SubBranchForm;

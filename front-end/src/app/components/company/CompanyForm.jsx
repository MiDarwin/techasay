// src/components/CompanyForm.jsx

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import "../../styles/styles.css"

const CompanyForm = ({ onSubmit, initialData, isEditMode, onCancel, darkMode }) => {
  const [form, setForm] = useState({
    name: '',
    company_id: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    company_id: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        company_id: initialData.company_id?.toString() || '',
      });
    } else {
      setForm({
        name: '',
        company_id: '',
      });
    }
    setErrors({
      name: '',
      company_id: '',
    });
  }, [initialData]);

  const validate = () => {
    const newErrors = { name: '', company_id: '' };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = 'Şirket adı zorunludur.';
      isValid = false;
    }

    if (!form.company_id.trim()) {
      newErrors.company_id = 'company_id zorunludur.';
      isValid = false;
    } else if (!/^\d{6}$/.test(form.company_id)) {
      newErrors.company_id = 'company_id 6 haneli bir sayı olmalıdır.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        name: form.name.trim(),
        company_id: parseInt(form.company_id, 10),
      };
      if (isEditMode && initialData && initialData._id) {
        onSubmit(initialData._id, submissionData); // _id ve updateData birlikte gönderiliyor
      } else {
        onSubmit(submissionData); // Yeni ekleme durumunda sadece updateData
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100'} p-6 rounded shadow-md`}
    >
      <h2 className="text-2xl font-medium mb-4 text-indigo-600">
        {isEditMode ? 'Şirketi Güncelle' : 'Şirket Ekle'}
      </h2>

      {/* Şirket Adı */}
      <div className="mb-4">
        <label htmlFor="name" className="block mb-2">
          Şirket Adı
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className={`${
            darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
          } w-full p-2 rounded border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Şirket Adı Giriniz"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* company_id */}
      <div className="mb-4">
        <label htmlFor="company_id" className="block mb-2">
          Şirket ID (6 Haneli)
        </label>
        <input
          type="number"
          id="company_id"
          name="company_id"
          value={form.company_id}
          onChange={handleChange}
          required
          className={`${
            darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
          } w-full p-2 rounded border ${
            errors.company_id ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="100000 - 999999 arasında bir ID giriniz"
          min="100000"
          max="999999"
        />
        {errors.company_id && (
          <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {isEditMode ? 'Güncelle' : 'Ekle'}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
};

export default CompanyForm;
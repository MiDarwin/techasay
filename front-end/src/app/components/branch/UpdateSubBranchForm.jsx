import React, { useState } from "react";
import PropTypes from "prop-types";

const UpdateSubBranchForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "", // branch_name yerine name kullanıldı
    branch_note: initialData.branch_note || "",
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
      <h2 className="text-xl font-bold mb-4">Alt Şubeyi Güncelle</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Alt Şube Adı
          </label>
          <input
            type="text"
            id="name"
            name="name" // branch_name yerine name kullanıldı
            value={formData.name} // Doğru değişken bağlandı
            onChange={handleChange}
            required
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

UpdateSubBranchForm.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string, // branch_name yerine name kullanıldı
    branch_note: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default UpdateSubBranchForm;

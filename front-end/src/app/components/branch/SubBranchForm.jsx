import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
} from "@mui/material";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solidrgb(19, 35, 51)",
  boxShadow: 24,
  p: 4,
};
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
    <Box
      sx={{
        ...style,
        backgroundColor: "#f5f5f5", // Arka plan rengi
        borderRadius: "10px", // Köşeleri yuvarlatma
        boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Gölge efekti
        padding: "20px",
        maxHeight: "90vh", // Maksimum yükseklik
        overflow: "auto", // Scroll özelliği
      }}
    >
      <div
        className="p-6 rounded-lg shadow-md"
        style={{ color: "gray", textAlign: "center" }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "gray", textAlign: "center" }} // Başlık rengi ve ortalama
        >
          {parentBranch.name} Alt Şube Ekleme
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="branch_name"
              className="block text-sm font-medium mb-2"
              style={{ color: "#6B7280" }} // Metin rengi
            >
              Alt Şube Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="branch_name"
              name="branch_name"
              value={formData.branch_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "gray",
                color: "#6B7280",
              }}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="branch_note"
              className="block text-sm font-medium mb-2"
              style={{ color: "#6B7280" }}
            >
              Şube Notu
            </label>
            <textarea
              id="branch_note"
              name="branch_note"
              value={formData.branch_note}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "gray",
                color: "#6B7280",
              }}
            />
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: "#B17F59", // İptal butonu arka plan rengi
                color: "#FFFFFF", // İptal butonu metin rengi
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              className="ml-4 px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: "#A5B68D", // Kaydet butonu arka plan rengi
                color: "#FFFFFF", // Kaydet butonu metin rengi
              }}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </Box>
  );
};

SubBranchForm.propTypes = {
  parentBranch: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SubBranchForm;

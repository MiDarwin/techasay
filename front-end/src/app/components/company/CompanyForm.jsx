import React, { useState, useEffect } from "react";
import "../../styles/styles.css";
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
const CompanyForm = ({
  onSubmit,
  initialData,
  isEditMode,
  onCancel,
  darkMode,
}) => {
  const [form, setForm] = useState({
    name: "",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
      });
    } else {
      setForm({
        name: "",
      });
    }
    setErrors({ name: "" });
  }, [initialData]);

  const validate = () => {
    const newErrors = { name: "", company_id_suffix: "" };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Şirket adı zorunludur.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        name: form.name.trim(),
      };
      if (isEditMode && initialData && initialData.company_id) {
        onSubmit(initialData.company_id, submissionData); // company_id kullan
      } else {
        onSubmit(submissionData);
      }
    }
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
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded-lg shadow-lg ${
          darkMode ? "bg-gray-800 bg-opacity-50" : "bg-gray-100"
        }`}
      >
        <h2
          className="text-2xl font-medium mb-4 text-indigo-500"
          style={{ color: "gray" }}
        >
          {isEditMode ? "Şirketi Güncelle" : "Şirket Ekle"}
        </h2>
        <div className="mb-4">
          <TextField
            id="name"
            name="name"
            label="Şirket Adı"
            variant="outlined"
            value={form.name}
            onChange={handleChange}
            required
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            sx={{
              backgroundColor: darkMode ? "rgba(55, 65, 81, 1)" : "white",
              color: darkMode ? "white" : "black",
            }}
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div></div>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            style={{ backgroundColor: "#A5B68D", color: "#FFFFFF" }}
          >
            {isEditMode ? "Güncelle" : "Ekle"}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: "#B17F59", color: "#FFFFFF" }}
            >
              İptal
            </button>
          )}
        </div>
      </form>
    </Box>
  );
};

export default CompanyForm;

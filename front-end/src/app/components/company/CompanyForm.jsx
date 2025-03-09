import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField"; // MUI TextField bileşeni eklendi
import "../../styles/styles.css";

const CompanyForm = ({
  onSubmit,
  initialData,
  isEditMode,
  onCancel,
  darkMode,
}) => {
  const [form, setForm] = useState({
    name: "",
    company_id_prefix: "", // İlk 2 haneyi tutacak (sektöre bağlı)
    company_id_suffix: "", // Son 4 haneyi tutacak (kullanıcı girecek)
  });

  const [errors, setErrors] = useState({
    name: "",
    company_id_suffix: "",
  });

  // **Sektörler ve İlk 2 Haneye Karşılık Gelen Değerler**
  const sectors = {
    Bankacılık: "10",
    Yemek: "20",
    Enerji: "30",
    Tekstil: "40",
    İnşaat: "50",
    Sağlık: "60",
    Teknoloji: "70",
    OSB: "80",
    Lojistik: "90",
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        company_id_prefix: initialData.company_id?.toString().slice(0, 2) || "",
        company_id_suffix: initialData.company_id?.toString().slice(2) || "",
      });
    } else {
      setForm({
        name: "",
        company_id_prefix: "",
        company_id_suffix: "",
      });
    }
    setErrors({
      name: "",
      company_id_suffix: "",
    });
  }, [initialData]);

  const validate = () => {
    const newErrors = { name: "", company_id_suffix: "" };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Şirket adı zorunludur.";
      isValid = false;
    }

    if (!form.company_id_suffix.trim()) {
      newErrors.company_id_suffix = "Şirket ID’nin son 4 hanesi zorunludur.";
      isValid = false;
    } else if (!/^\d{4}$/.test(form.company_id_suffix)) {
      newErrors.company_id_suffix =
        "Şirket ID’nin son 4 hanesi 4 haneli bir sayı olmalıdır.";
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
      [e.target.name]: "",
    });
  };

  const handleSectorChange = (e) => {
    const selectedPrefix = sectors[e.target.value] || "";
    setForm((prev) => ({
      ...prev,
      company_id_prefix: selectedPrefix, // Sektöre göre prefix ayarlanıyor
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        name: form.name.trim(),
        company_id: parseInt(
          `${form.company_id_prefix}${form.company_id_suffix}`,
          10
        ), // Prefix ve Suffix birleştirilerek ID oluşturuluyor
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
      className={`${
        darkMode ? "bg-gray-800 bg-opacity-50" : "bg-gray-100"
      } p-6 rounded shadow-md`}
    >
      <h2 className="text-2xl font-medium mb-4 text-indigo-600">
        {isEditMode ? "Şirketi Güncelle" : "Şirket Ekle"}
      </h2>

      {/* Şirket Adı */}
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

      {/* Şirket Türü (Sektör) */}
      <div className="mb-4">
        <label htmlFor="sector" className="block mb-2">
          Sektör
        </label>
        <select
          id="sector"
          name="sector"
          onChange={handleSectorChange}
          className={`${
            darkMode ? "bg-gray-700 text-white" : "bg-white text-black"
          } w-full p-2 rounded border border-gray-300`}
        >
          <option value="">Sektör Seçiniz</option>
          {Object.keys(sectors).map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      {/* Şirket ID (Prefix ve Suffix) */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <TextField
            id="company_id_prefix"
            name="company_id_prefix"
            label="Şirket ID Prefix"
            variant="outlined"
            value={form.company_id_prefix}
            InputProps={{
              readOnly: true,
              // Bu, giriş alanını tamamen etkileşim dışı bırakmaz, sadece salt okunur yapar
            }}
            fullWidth
            inputProps={{
              tabIndex: -1, // Klavye ile odaklanmayı engeller
            }}
            sx={{
              backgroundColor: darkMode ? "rgba(55, 65, 81, 1)" : "white",
              color: darkMode ? "white" : "black",
              pointerEvents: "none", // Fare ile etkileşimi engeller
            }}
          />
        </div>
        <div>
          <TextField
            id="company_id_suffix"
            name="company_id_suffix"
            label="Şirket ID (Son 4 Hane)"
            variant="outlined"
            value={form.company_id_suffix}
            onChange={handleChange}
            required
            error={!!errors.company_id_suffix}
            helperText={errors.company_id_suffix}
            fullWidth
            slotProps={{
              htmlInput: {
                maxLength: 4, // Maksimum 4 karakter girilebilir
                pattern: "[0-9]*", // Sadece rakam girilmesini sağlar
                inputMode: "numeric", // Mobil cihazlarda numpad klavyesini açar
              },
            }}
            onKeyDown={(e) => {
              // Rakam ve kontrol tuşları dışındaki tuşların girişini engelle
              if (
                !(
                  (
                    (e.key >= "0" && e.key <= "9") || // Rakamlar
                    e.key === "Backspace" || // Silme
                    e.key === "Delete" || // Silme
                    e.key === "ArrowLeft" || // Sol ok
                    e.key === "ArrowRight" || // Sağ ok
                    e.key === "Tab"
                  ) // Tab
                )
              ) {
                e.preventDefault();
              }
            }}
            sx={{
              backgroundColor: darkMode ? "rgba(55, 65, 81, 1)" : "white",
              color: darkMode ? "white" : "black",
            }}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {isEditMode ? "Güncelle" : "Ekle"}
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

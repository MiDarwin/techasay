import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { turkishCities } from "./cities";

const BranchForm = ({
  onSubmit,
  companies,
  initialData = {},
  isEditMode,
  onCancel,
}) => {
  const [companyId, setCompanyId] = useState(initialData.company_id || "");
  const [branchName, setBranchName] = useState(initialData.branch_name || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [city, setCity] = useState(initialData.city || "");
  const [phoneNumber, setPhoneNumber] = useState(
    initialData.phone_number || ""
  );
  const [branchNote, setBranchNote] = useState(initialData.branch_note || "");
  const [locationLink, setLocationLink] = useState(
    initialData.location_link || ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("initialData:", initialData); // Bu satır eklendi
    setCompanyId(initialData.company_id || "");
    setBranchName(initialData.branch_name || "");
    setAddress(initialData.address || "");
    setCity(initialData.city || "");
    setPhoneNumber(initialData.phone_number || "");
    setBranchNote(initialData.branch_note || "");
    setLocationLink(initialData.location_link || "");
    setError("");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !branchName || !address || !city || !phoneNumber) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    const handleUpdateBranch = async (updatedData) => {
      try {
        await updateBranch(selectedBranch._id, updatedData);
        alert("Şube başarıyla güncellendi.");
        setIsEditMode(false); // Düzenleme modunu kapat
        // Tabloyu güncellemek için yeni verileri çekebilirsiniz
      } catch (err) {
        alert(err.message || "Şubeyi güncellerken bir hata oluştu.");
      }
    };
    const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
    const normalizedPhoneNumber = phoneNumber.replace(/\s/g, "");
    if (!phoneRegex.test(normalizedPhoneNumber)) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }

    try {
      await onSubmit({
        company_id: parseInt(companyId, 10), // Şirket ID'sinin doğru olduğunu kontrol et
        branch_name: branchName,
        address,
        city,
        phone_number: normalizedPhoneNumber,
        branch_note: branchNote,
        location_link: locationLink,
      });
      // Formu sıfırla
    } catch (submissionError) {
      setError("Şubeyi eklerken veya güncellerken bir hata oluştu.");
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:shadow-2xl"
      style={{ backgroundColor: "#F8F1E4" }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: "#A5B68D", textAlign: "center" }}
      >
        {isEditMode ? "Şubeyi Güncelle" : "Yeni Şube Ekle"}
      </h2>
      {error && (
        <div
          className="bg-red-500 text-white p-2 rounded mb-4 shadow-md"
          style={{ fontWeight: "bold" }}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="companyId"
              className="block text-gray-700 dark:text-gray-200 mb-2 font-medium"
            >
              Şirket Seçin
            </label>
            <select
              id="companyId"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                         text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>
                Şirket Adı Seçin
              </option>
              {companies.map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="branchName"
              className="block text-gray-700 dark:text-gray-200 mb-2 font-medium"
            >
              Şube Adı
            </label>
            <input
              id="branchName"
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                         text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Şube Adı Girin"
              required
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-gray-700 dark:text-gray-200 mb-2 font-medium"
            >
              Adres
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                         text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Adres Girin"
              required
            />
          </div>
          <div>
            <label
              htmlFor="city"
              className="block text-gray-700 dark:text-gray-200 mb-2 font-medium"
            >
              Şehir
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                         text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>
                Şehir Seçin
              </option>
              {turkishCities.map((cityName, index) => (
                <option key={index} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-gray-700 dark:text-gray-200 mb-2 font-medium"
            >
              Telefon Numarası
            </label>
            <input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                         text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Telefon Numarası Girin"
              required
            />
          </div>
        </div>

        {/* Şube Notu ve Konum Linki */}
        <div>
          <label
            htmlFor="branchNote"
            className="block text-gray-700 dark:text-gray-200 mb-2 font-medium"
          >
            Şube Notu (Opsiyonel)
          </label>
          <textarea
            id="branchNote"
            value={branchNote}
            onChange={(e) => setBranchNote(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Şube Notu Girin"
          />
        </div>

        <div>
          <label
            htmlFor="locationLink"
            className="block text-gray-700 dark:text-gray-200 mb-2 font-medium"
          >
            Şube Konum Linki (Opsiyonel)
          </label>
          <input
            id="locationLink"
            type="text"
            value={locationLink}
            onChange={(e) => setLocationLink(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Şube Konum Linki Girin"
          />
        </div>

        {/* Form Düğmeleri */}
        <div className="flex justify-between mt-6">
          {isEditMode && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            className="py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: "#A5B68D",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#8FA781")} // Hover rengi
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#A5B68D")} // Normal renk
          >
            {isEditMode ? "Güncelle" : "Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
};

BranchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  companies: PropTypes.arrayOf(
    PropTypes.shape({
      company_id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  initialData: PropTypes.shape({
    company_id: PropTypes.number,
    name: PropTypes.string, // "branch_name" yerine "name"
    address: PropTypes.string,
    city: PropTypes.string,
    phone_number: PropTypes.string,
    branch_note: PropTypes.string,
    location_link: PropTypes.string,
  }),
  isEditMode: PropTypes.bool,
  onCancel: PropTypes.func,
};

BranchForm.defaultProps = {
  initialData: {},
  isEditMode: false,
  onCancel: () => {},
};

export default BranchForm;

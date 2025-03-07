import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const BranchForm = ({
  onSubmit,
  companies,
  initialData = {},
  isEditMode,
  onCancel,
}) => {
  const [companyId, setCompanyId] = useState(initialData.company_id || ""); // company_id tutuluyor
  const [branchName, setBranchName] = useState(initialData.branch_name || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [city, setCity] = useState(initialData.city || "");
  const [phoneNumber, setPhoneNumber] = useState(
    initialData.phone_number || ""
  );
  const [error, setError] = useState("");

  // initialData değiştiğinde form alanlarını güncelle
  useEffect(() => {
    setCompanyId(initialData.company_id || "");
    setBranchName(initialData.branch_name || "");
    setAddress(initialData.address || "");
    setCity(initialData.city || "");
    setPhoneNumber(initialData.phone_number || "");
    setError("");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form Validasyonu
    if (!companyId || !branchName || !address || !city || !phoneNumber) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    // Telefon Numarası Formatı Doğrulama
    const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
    const normalizedPhoneNumber = phoneNumber.replace(/\s/g, ""); // Boşlukları kaldır
    if (!phoneRegex.test(normalizedPhoneNumber)) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }

    try {
      // Hata yoksa, onSubmit fonksiyonunu çağır
      await onSubmit({
        company_id: parseInt(companyId, 10), // İşlemler için company_id gönderiliyor
        branch_name: branchName,
        address,
        city,
        phone_number: normalizedPhoneNumber,
      });

      // Formu sıfırla (sadece ekleme modunda)
      if (!isEditMode) {
        setCompanyId("");
        setBranchName("");
        setAddress("");
        setCity("");
        setPhoneNumber("");
      }

      setError("");
    } catch (submissionError) {
      setError("Şubeyi eklerken veya güncellerken bir hata oluştu.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
        {isEditMode ? "Şubeyi Güncelle" : "Yeni Şube Ekle"}
      </h2>
      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Şirket Seçimi */}
        <div>
          <label
            htmlFor="companyId"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Şirket Seçin
          </label>
          <select
            id="companyId"
            value={companyId} // company_id burada tutuluyor
            onChange={(e) => setCompanyId(e.target.value)} // company_id'yi güncelliyoruz
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="" disabled>
              Şirket Adı Seçin
            </option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name} {/* Kullanıcıya company_name gösteriliyor */}
              </option>
            ))}
          </select>
        </div>

        {/* Şube Adı */}
        <div>
          <label
            htmlFor="branchName"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Şube Adı
          </label>
          <input
            id="branchName"
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Şube Adı Girin"
            required
          />
        </div>

        {/* Adres */}
        <div>
          <label
            htmlFor="address"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Adres
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Adres Girin"
            required
          />
        </div>

        {/* Şehir */}
        <div>
          <label
            htmlFor="city"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Şehir
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Şehir Girin"
            required
          />
        </div>

        {/* Telefon Numarası */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Telefon Numarası
          </label>
          <input
            id="phoneNumber"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Telefon Numarası Girin"
            required
          />
        </div>

        {/* Form Düğmeleri */}
        <div className="flex justify-between">
          {isEditMode && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-200"
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
    branch_name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    phone_number: PropTypes.string,
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

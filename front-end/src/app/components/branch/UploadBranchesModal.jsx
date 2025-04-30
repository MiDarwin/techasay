import React, { useState } from "react";
import { uploadBranches } from "../../utils/api"; // API fonksiyonunu import et
import "./Modal.css"; // Modal için stil dosyası
import Modal from "./Modal"; // Var olan modal bileşeni

const UploadBranchesModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(""); // Başarı veya hata mesajı
  const [isUploading, setIsUploading] = useState(false); // Yükleme işlemi sırasında butonu devre dışı bırakmak için

  const requiredHeaders = [
    "branch_name",
    "address",
    "city",
    "district",
    "phone_number",
    "company_id",
  ];
  const optionalHeaders = ["branch_note", "location_link", "phone_number_2"];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Kullanıcının seçtiği dosyayı al
    setMessage(""); // Dosya seçildiğinde mesajı sıfırla
  };

  const handleUpload = async () => {
    // Dosya seçilmemişse hata mesajı göster ve modalı açık tut
    if (!file) {
      setMessage("Lütfen bir Excel dosyası seçin."); // Dosya seçilmedi uyarısı
      return;
    }

    setIsUploading(true); // Yükleme işlemi başladığında butonu devre dışı bırak
    try {
      const result = await uploadBranches(file); // API'ye dosyayı yükle
      setMessage(result.message); // Başarı mesajını göster
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setMessage(error.message); // Hata mesajını göster
    } finally {
      setIsUploading(false); // İşlem tamamlandıktan sonra butonu aktif hale getir
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ color: "black" }} className="text-xl font-bold mb-4">
        Excel Dosyası Yükle
      </h2>
      <p style={{ color: "black" }}>
        Lütfen aşağıdaki başlıkları içeren bir Excel dosyası yükleyin:
      </p>
      <ul className="mb-4">
        {requiredHeaders.map((header) => (
          <li style={{ color: "black" }} key={header} className="font-semibold">
            {header}
          </li>
        ))}
        {optionalHeaders.map((header) => (
          <li key={header} style={{ color: "black" }} className="font-normal">
            {header}
          </li>
        ))}
      </ul>
      <div style={{ color: "black" }} className="mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
      </div>
      {message && (
        <p
          className={`text-sm ${
            message.includes("başarıyla") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="button" // Varsayılan form gönderme davranışını engelle
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2"
        >
          Kapat
        </button>
        <button
          type="button" // Varsayılan form gönderme davranışını engelle
          onClick={handleUpload}
          disabled={isUploading} // Yükleme sırasında butonu devre dışı bırak
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isUploading ? "Yükleniyor..." : "Yükle"}
        </button>
      </div>
    </Modal>
  );
};

export default UploadBranchesModal;

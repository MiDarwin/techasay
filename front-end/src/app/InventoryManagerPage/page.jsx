"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js yönlendirme hook'u
import {
  getModelsByDeviceType,
  createDeviceType,
  addModelToDeviceType,
  deleteDeviceType,
  deleteModelFromDeviceType,
} from "../utils/api";
import "../styles/styles.css";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
const InventoryManagerPage = () => {
  const [deviceTypes, setDeviceTypes] = useState([]); // Cihaz türleri
  const [selectedDeviceType, setSelectedDeviceType] = useState(null); // Seçilen cihaz türü
  const [newDeviceType, setNewDeviceType] = useState(""); // Yeni cihaz türü ekleme
  const [newModelName, setNewModelName] = useState(""); // Yeni model ekleme
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  // Cihaz türlerini getir
  useEffect(() => {
    const fetchDeviceTypes = async () => {
      try {
        setLoading(true);
        const data = await getModelsByDeviceType(); // API çağrısı
        setDeviceTypes(data);
      } catch (err) {
        console.error("Cihaz türleri alınamadı:", err);
        setError("Cihaz türleri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceTypes();
  }, []);

  // Yeni cihaz türü ekle
  const handleAddDeviceType = async () => {
    if (!newDeviceType.trim()) {
      alert("Lütfen cihaz türü adı girin.");
      return;
    }

    try {
      setLoading(true);
      const newType = await createDeviceType(newDeviceType);
      setDeviceTypes((prev) => [...prev, newType]);
      setNewDeviceType(""); // Input'u temizle
    } catch (err) {
      console.error("Cihaz türü eklenemedi:", err);
      alert("Cihaz türü eklenemedi.");
    } finally {
      setLoading(false);
    }
  };
  // Cihaz türlerini getir
  const fetchDeviceTypes = async () => {
    try {
      setLoading(true);
      const data = await getModelsByDeviceType(); // API çağrısı
      setDeviceTypes(data);
    } catch (err) {
      console.error("Cihaz türleri alınamadı:", err);
      setError("Cihaz türleri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect içinde çağırma
  useEffect(() => {
    fetchDeviceTypes();
  }, []);
  // Yeni model ekle (Mevcut cihaz türüne ekleme)
  const handleAddModel = async () => {
    if (!newModelName.trim() || !selectedDeviceType) {
      alert("Lütfen bir model adı girin ve bir cihaz türü seçin.");
      return;
    }

    try {
      setLoading(true);
      await addModelToDeviceType(selectedDeviceType.id, newModelName);

      // Yeni model eklendikten sonra cihaz türlerini yeniden çek
      const updatedDeviceTypes = await getModelsByDeviceType();
      setDeviceTypes(updatedDeviceTypes);

      // Seçili cihaz türünü tekrar bul ve set et
      const updatedSelectedType = updatedDeviceTypes.find(
        (type) => type.id === selectedDeviceType.id
      );
      setSelectedDeviceType(updatedSelectedType || null);

      setNewModelName(""); // Input'u temizle
    } catch (err) {
      console.error("Model eklenemedi:", err);
      alert("Model eklenemedi.");
    } finally {
      setLoading(false);
    }
  };
  // Cihaz Türünü Silme Handler'ı
  const handleDeleteDeviceType = async (helperId) => {
    if (!window.confirm("Bu cihaz türünü silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteDeviceType(helperId);
      const updatedDeviceTypes = deviceTypes.filter(
        (type) => type.id !== helperId
      );
      setDeviceTypes(updatedDeviceTypes);
      alert("Cihaz türü başarıyla silindi.");

      // Eğer silinen tür seçiliyse seçimi kaldır veya başka bir türü seç
      if (selectedDeviceType && selectedDeviceType.id === helperId) {
        if (updatedDeviceTypes.length > 0) {
          setSelectedDeviceType(updatedDeviceTypes[0]); // İlk türü seç
        } else {
          setSelectedDeviceType(null); // Hiç cihaz türü kalmadıysa seçimi kaldır
        }
      }
    } catch (err) {
      console.error("Cihaz türü silinemedi:", err);
      alert("Cihaz türü silinemedi. Altında kayıtlı modeller olabilir."); // Sunucudan gelen hata mesajını da kullanabilirsiniz
    } finally {
      setLoading(false);
    }
  };

  // Cihaz Modelini Silme Handler'ı
  const handleDeleteModel = async (helperId, modelName) => {
    if (
      !window.confirm(
        `"${modelName}" modelini silmek istediğinize emin misiniz?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const updatedType = await deleteModelFromDeviceType(helperId, modelName);

      // Cihaz Türlerini güncelle
      const updatedDeviceTypes = deviceTypes.map((type) =>
        type.id === updatedType.id ? updatedType : type
      );
      setDeviceTypes(updatedDeviceTypes);
      alert(`"${modelName}" modeli başarıyla silindi.`);

      // Seçili cihaz türünü tekrar bul ve set et
      const updatedSelectedType = updatedDeviceTypes.find(
        (type) => type.id === helperId
      );
      setSelectedDeviceType(updatedSelectedType || null);
    } catch (err) {
      console.error("Model silinemedi:", err);
      alert("Model silinemedi. Bu model başka kayıtlarla ilişkili olabilir.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="inventory-container" style={{ backgroundColor: "#903749" }}>
      <h1 className="inventory-title" style={{ color: "#fff" }}>
        Envanter Kontrol
      </h1>

      <div className="inventory-grid">
        {/* Sol taraf: Cihaz Türleri */}
        <div className="inventory-left">
          <h2>Cihaz Türleri</h2>
          <div className="add-device-type" style={{ color: "black" }}>
            <input
              type="text"
              placeholder="Yeni cihaz türü ekle"
              value={newDeviceType}
              onChange={(e) => setNewDeviceType(e.target.value)}
            />
            <button onClick={handleAddDeviceType}>Ekle</button>
          </div>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <ul className="device-types-list" style={{ color: "black" }}>
              {deviceTypes.map((type) => (
                <li
                  key={type.id}
                  className={`device-type ${
                    selectedDeviceType?.id === type.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedDeviceType(type)}
                >
                  <span>{type.device_type}</span>
                  <Tooltip title="Sil">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation(); // Liste öğesinin seçilmesini engellemek için
                        handleDeleteDeviceType(type.id);
                      }}
                      color="error"
                      aria-label="Sil"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Orta kısım */}
        <div className="inventory-arrow" style={{ color: "#fff" }}>
          {selectedDeviceType && <span>→</span>}
        </div>

        {/* Sağ taraf: Modeller */}
        <div className="inventory-right">
          <h2>Modeller</h2>
          {selectedDeviceType ? (
            <>
              <ul className="models-list" style={{ color: "black" }}>
                {selectedDeviceType.device_models.map((model, index) => (
                  <li key={index} className="model-item">
                    <span>{model}</span>
                    <Tooltip title="Sil">
                      <IconButton
                        onClick={() => {
                          handleDeleteModel(selectedDeviceType.id, model);
                        }}
                        color="error"
                        aria-label="Sil"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </li>
                ))}
              </ul>
              <div className="add-model">
                <input
                  type="text"
                  placeholder="Yeni model ekle"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  style={{ color: "black" }}
                />
                <button onClick={handleAddModel}>Ekle</button>
              </div>
            </>
          ) : (
            <p style={{ color: "black" }}>Lütfen bir cihaz türü seçin.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagerPage;

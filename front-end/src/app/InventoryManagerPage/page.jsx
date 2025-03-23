"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js yönlendirme hook'u
import {
  getModelsByDeviceType,
  createDeviceType,
  addModelToDeviceType,
} from "../utils/api";
import "../styles/styles.css";

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

  // Yeni model ekle (Mevcut cihaz türüne ekleme)
  const handleAddModel = async () => {
    if (!newModelName.trim() || !selectedDeviceType) {
      alert("Lütfen bir model adı girin ve bir cihaz türü seçin.");
      return;
    }

    try {
      setLoading(true);
      const updatedHelper = await addModelToDeviceType(
        selectedDeviceType.id,
        newModelName
      );

      // Seçili cihaz türüne modeli ekleyerek state'i güncelle
      setDeviceTypes((prev) =>
        prev.map((type) =>
          type.id === selectedDeviceType.id
            ? {
                ...type,
                device_models: [
                  ...type.device_models,
                  { model_name: newModelName },
                ],
              }
            : type
        )
      );

      setNewModelName(""); // Input'u temizle
    } catch (err) {
      console.error("Model eklenemedi:", err);
      alert("Model eklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventory-container">
      <h1 className="inventory-title">Envanter Kontrol</h1>
      <button className="back-button" onClick={() => router.push("/")}>
        Geri Dön
      </button>

      <div className="inventory-grid">
        {/* Sol taraf: Cihaz Türleri */}
        <div className="inventory-left">
          <h2>Cihaz Türleri</h2>
          <div className="add-device-type">
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
            <ul className="device-types-list">
              {deviceTypes.map((type) => (
                <li
                  key={type.id}
                  className={`device-type ${
                    selectedDeviceType?.id === type.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedDeviceType(type)}
                >
                  {type.device_type}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Orta kısım */}
        <div className="inventory-arrow">
          {selectedDeviceType && <span>→</span>}
        </div>

        {/* Sağ taraf: Modeller */}
        <div className="inventory-right">
          <h2>Modeller</h2>
          {selectedDeviceType ? (
            <>
              <ul className="models-list">
                {selectedDeviceType.device_models.map((model, index) => (
                  <li key={index} className="model-item">
                    {model}
                  </li>
                ))}
              </ul>
              <div className="add-model">
                <input
                  type="text"
                  placeholder="Yeni model ekle"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                />
                <button onClick={handleAddModel}>Ekle</button>
              </div>
            </>
          ) : (
            <p>Lütfen bir cihaz türü seçin.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagerPage;

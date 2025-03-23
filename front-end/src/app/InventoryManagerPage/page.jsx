"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js yönlendirme hook'u
import {
  getInventoryHelpers,
  getModelsByDeviceType,
  addNewInventoryType,
} from "../utils/api";
import adminPanelStyles from "../styles/adminPanelStyles";

const InventoryManagerPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter(); // Yönlendirme hook'u

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const data = await getInventoryHelpers();
        setModels(data);
      } catch (err) {
        console.error("Modeller alınamadı:", err);
        setError("Modeller alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleModelSelect = async (model) => {
    setSelectedModel(model);
    setLoading(true);
    try {
      const data = await getModelsByDeviceType(model.device_type);
      setTypes(data);
    } catch (err) {
      console.error("Türler alınamadı:", err);
      setError("Türler alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async () => {
    if (!newType) {
      alert("Lütfen bir tür adı girin.");
      return;
    }

    try {
      setLoading(true);
      await addNewInventoryType(selectedModel.device_type, newType);
      setTypes((prevTypes) => [...prevTypes, newType]);
      setNewType("");
    } catch (err) {
      console.error("Tür eklenemedi:", err);
      setError("Tür eklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminPanelStyles.container}>
      <h1 style={adminPanelStyles.title}>Envanter Model Yönetimi</h1>
      <button
        style={adminPanelStyles.permissionButton}
        onClick={() => router.push("/")} // Geri dönüş
      >
        Geri Dön
      </button>
      <div>
        <h2>Modeller</h2>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <ul>
            {models.map((model) => (
              <li
                key={model.id}
                style={{
                  cursor: "pointer",
                  color: selectedModel?.id === model.id ? "blue" : "black",
                }}
                onClick={() => handleModelSelect(model)}
              >
                {model.device_type}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedModel && (
        <div>
          <h2>{selectedModel.device_type} Türleri</h2>
          <ul>
            {types.map((type, index) => (
              <li key={index}>{type}</li>
            ))}
          </ul>
          <div>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Yeni tür adı"
              style={adminPanelStyles.searchInput}
            />
            <button
              onClick={handleAddType}
              style={adminPanelStyles.permissionButton}
            >
              Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagerPage;

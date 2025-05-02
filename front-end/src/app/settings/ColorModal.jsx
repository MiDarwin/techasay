import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const ColorModal = ({ open, handleClose }) => {
  const [colors, setColors] = useState({
    tableRowOdd: "#395B64",
    tableRowEven: "#E7F6F2",
    tableHeader: "#E7F6F2",
    subBranchRow: "#EDE8DC",
    filterContainer: "#E7F6F2",
    button: "#28a745",
  });

  // Renk anahtarlarıyla ilgili daha kullanıcı dostu metinler
  const colorLabels = {
    tableRowOdd: "1. Satır Rengi",
    tableRowEven: "2. Satır Rengi",
    tableHeader: "Tablo Başlığı Rengi",
    subBranchRow: "Alt Dal Satırı Rengi",
    filterContainer: "Filtre Konteynır Rengi",
    button: "Buton Rengi",
  };

  useEffect(() => {
    const savedColors = localStorage.getItem("tableColors");
    if (savedColors) {
      setColors(JSON.parse(savedColors));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColors({ ...colors, [name]: value });
  };

  const handleSave = () => {
    localStorage.setItem("tableColors", JSON.stringify(colors));
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "white",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <h3 style={{ color: "black" }}>Renk Ayarları</h3>
        {Object.keys(colors).map((key) => (
          <div key={key} style={{ marginBottom: "10px" }}>
            <label style={{ color: "black" }}>{colorLabels[key]}:</label>
            <input
              type="color"
              name={key}
              value={colors[key]}
              onChange={handleChange}
              style={{ marginLeft: "10px" }}
            />
          </div>
        ))}
        <Button variant="contained" color="primary" onClick={handleSave}>
          Kaydet
        </Button>
      </Box>
    </Modal>
  );
};

export default ColorModal;

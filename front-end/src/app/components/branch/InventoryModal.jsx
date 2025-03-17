import React from "react";
import PropTypes from "prop-types";
import { Modal, Box, Typography, Divider } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid rgb(28, 62, 95)",
  boxShadow: 24,
  p: 4,
};

const InventoryModal = ({ isOpen, onClose, inventory, branchName }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        {/* Başlık */}
        {branchName && (
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: "#1976d2", // Başlık rengi
              fontWeight: "bold",
              textAlign: "center",
              mb: 2,
            }}
          >
            {branchName} Şubesi Envanteri
          </Typography>
        )}

        {/* Bölme Çizgisi */}
        <Divider sx={{ mb: 2 }} />

        {/* Envanter Listesi */}
        <Box mt={2}>
          {inventory.length > 0 ? (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {inventory.map((item, index) => (
                <li
                  key={`${item.device_model}-${item.device_type}-${index}`}
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff", // Kart arka planı
                  }}
                >
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: "#424242", fontWeight: "bold", mb: 1 }}
                  >
                    Şube Adı:{" "}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{ fontWeight: "normal" }}
                  >
                    {item.branch_name || branchName}
                  </Typography>
                  {/* Ürün Modeli */}
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: "#424242", fontWeight: "bold", mb: 1 }}
                  >
                    Ürün Modeli:{" "}
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ fontWeight: "normal" }}
                    >
                      {item.device_model}
                    </Typography>
                  </Typography>
                  {/* Ürün Türü */}
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: "#424242", fontWeight: "bold", mb: 1 }}
                  >
                    Ürün Türü:{" "}
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ fontWeight: "normal" }}
                    >
                      {item.device_type}
                    </Typography>
                  </Typography>
                  {/* Ürün Adedi */}
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: "#424242", fontWeight: "bold", mb: 1 }}
                  >
                    Ürün Adedi:{" "}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{ fontWeight: "normal" }}
                  >
                    {item.quantity}
                  </Typography>
                  {/* Ürün Notu */}
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: "#424242", fontWeight: "bold" }}
                  >
                    Ürün Notu:{" "}
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ fontWeight: "normal" }}
                    >
                      {item.note || "Yok"}
                    </Typography>
                  </Typography>
                </li>
              ))}
            </ul>
          ) : (
            <Typography
              variant="body1"
              sx={{ color: "#9e9e9e", textAlign: "center" }}
            >
              Bu şubeye ait envanter bulunamadı.
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

InventoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  inventory: PropTypes.arrayOf(
    PropTypes.shape({
      branch_name: PropTypes.string.isRequired,
      device_model: PropTypes.string.isRequired,
      device_type: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      note: PropTypes.string,
    })
  ).isRequired,
  branchName: PropTypes.string.isRequired,
};

export default InventoryModal;

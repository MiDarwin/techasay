import React from "react";
import PropTypes from "prop-types";
import { Modal, Box, Typography } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #1976d2",
  boxShadow: 24,
  p: 4,
};

const InventoryModal = ({ isOpen, onClose, inventory, branchName }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        {branchName && (
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {branchName} Envanteri:
          </Typography>
        )}
        <Box mt={2}>
          {inventory.length > 0 ? (
            <ul>
              {inventory.map((item, index) => (
                <li
                  key={`${item.device_model}-${item.device_type}-${index}`}
                  style={{ marginBottom: "10px" }}
                >
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    Ürün Modeli:
                  </Typography>{" "}
                  <Typography variant="body1" component="span">
                    {item.device_model}
                  </Typography>
                  <br />
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    Ürün Türü:
                  </Typography>{" "}
                  <Typography variant="body1" component="span">
                    {item.device_type}
                  </Typography>
                  <br />
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    Ürün Adedi:
                  </Typography>{" "}
                  <Typography variant="body1" component="span">
                    {item.quantity}
                  </Typography>
                  <br />
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="bold"
                  >
                    Ürün Notu:
                  </Typography>{" "}
                  <Typography variant="body1" component="span">
                    {item.note || "Yok"}
                  </Typography>
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No inventory found for this branch.</Typography>
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
      device_model: PropTypes.string.isRequired,
      device_type: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      note: PropTypes.string,
    })
  ).isRequired,
  branchName: PropTypes.string.isRequired,
};

export default InventoryModal;

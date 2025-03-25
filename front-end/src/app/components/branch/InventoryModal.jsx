import React from "react";
import PropTypes from "prop-types";
import { Modal, Box, Typography, Divider, Card, Grid } from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid rgb(28, 62, 95)",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflow: "hidden",
};

const cardStyle = {
  p: 3,
  mb: 2,
  border: "1px solid #e0e0e0",
  borderRadius: 1,
  backgroundColor: "background.default",
};

const InventoryModal = ({ isOpen, onClose, inventory, branchName }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box mb={4}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              textAlign: "center",
              mb: 1,
            }}
          >
            Envanter Listesi
          </Typography>
        </Box>

        <Divider
          sx={{
            my: 3,
            borderBottom: "2px solid #1976d2",
            width: "100px",
            mx: "auto",
          }}
        />

        <Box>
          {inventory.length > 0 ? (
            <Box>
              {inventory.map((item, index) => (
                <Card
                  key={`${item.device_model}-${item.device_type}-${index}`}
                  sx={cardStyle}
                >
                  <Box py={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography
                          variant="body1"
                          component="div"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                            mb: 1,
                          }}
                        >
                          Şube Adı:
                        </Typography>
                        <Typography variant="body1" component="span">
                          {item.branch_name || branchName}
                        </Typography>
                      </Grid>
                      <Grid item container xs={12} sm={6} lg={6}>
                        <Grid item xs={12}>
                          <Typography
                            variant="body1"
                            component="div"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 500,
                              mb: 1,
                            }}
                          >
                            Ürün Modeli:
                          </Typography>
                          <Typography variant="body1" component="span">
                            {item.device_model}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant="body1"
                            component="div"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 500,
                              mb: 1,
                            }}
                          >
                            Ürün Türü:
                          </Typography>
                          <Typography variant="body1" component="span">
                            {item.device_type}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item container xs={12} sm={6} lg={6}>
                        <Grid item xs={12}>
                          <Typography
                            variant="body1"
                            component="div"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 500,
                              mb: 1,
                            }}
                          >
                            Ürün Adedi:
                          </Typography>
                          <Typography
                            variant="body1"
                            component="span"
                            sx={{ fontWeight: 600 }}
                          >
                            {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant="body1"
                            component="div"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 500,
                              mb: 1,
                            }}
                          >
                            Ürün Notu:
                          </Typography>
                          <Typography variant="body1" component="span">
                            {item.note || "Yok"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: "text.secondary",
                  fontWeight: 400,
                }}
              >
                Bu şubeye ait envanter bulunamadı.
              </Typography>
            </Box>
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
      branch_name: PropTypes.string,
      device_model: PropTypes.string.isRequired,
      device_type: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      note: PropTypes.string,
    })
  ).isRequired,
  branchName: PropTypes.string.isRequired,
};

export default InventoryModal;

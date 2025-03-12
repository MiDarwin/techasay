import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Paper,
  Modal,
  Box,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BackpackIcon from "@mui/icons-material/Backpack"; // Envanter ikonu
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Konum ikonu
import { getInventoryByBranch } from "../../utils/api"; // API'den envanter almak için kullanılan fonksiyon

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

const BranchTable = ({ branches, companies, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  const handleOpen = async (branchId) => {
    setSelectedBranchId(branchId);
    const data = await getInventoryByBranch(branchId); // API'den envanteri al
    setInventory(data);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const openLocationLink = (link) => {
    // Eğer link http:// veya https:// ile başlamıyorsa, bu ön ekleri ekle
    const formattedLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `http://${link}`;

    window.open(formattedLink, "_blank"); // Yeni sekmede aç
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: "8px", boxShadow: 3 }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
                color: "#ffffff",
                "& th": {
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                },
              }}
            >
              <TableCell>Şirket Adı</TableCell>
              <TableCell>Şehir</TableCell>
              <TableCell>Şube Adı</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Telefon Numarası</TableCell>
              <TableCell>Şube Notu</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch, index) => (
              <TableRow
                key={branch._id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f7f9fc" : "#ffffff",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                }}
              >
                <TableCell>{branch.company_name}</TableCell>
                <TableCell>{branch.city}</TableCell>
                <TableCell>{branch.branch_name}</TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>{branch.phone_number}</TableCell>
                <TableCell>{branch.branch_note || "Yok"}</TableCell>
                <TableCell>
                  {/* Konum İkonu */}
                  {branch.location_link && (
                    <Tooltip title="Konum Göster">
                      <IconButton
                        onClick={() => openLocationLink(branch.location_link)} // Yeni fonksiyonu çağır
                        color="primary"
                        aria-label="Konum Göster"
                      >
                        <LocationOnIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Düzenle">
                    <IconButton
                      onClick={() => onEdit(branch)}
                      color="warning"
                      aria-label="Düzenle"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton
                      onClick={() => onDelete(branch._id)}
                      color="error"
                      aria-label="Sil"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Şube Envanterini Görüntüle">
                    <IconButton
                      onClick={() => handleOpen(branch._id)}
                      color="primary"
                      aria-label="Şube Envanterini Görüntüle"
                    >
                      <BackpackIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Envanter Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {selectedBranchId && (
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              {
                branches.find((branch) => branch._id === selectedBranchId)
                  ?.branch_name
              }{" "}
              Envanteri:
            </Typography>
          )}
          <Box mt={2}>
            {inventory.length > 0 ? (
              <ul>
                {inventory.map((item) => (
                  <li key={item.id} style={{ marginBottom: "10px" }}>
                    <Typography
                      variant="body1"
                      component="span"
                      fontWeight="bold"
                    >
                      Ürün Modeli:
                    </Typography>
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
                    </Typography>
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
                    </Typography>
                    <Typography variant="body1" component="span">
                      {item.quantity}
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
    </>
  );
};

BranchTable.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      company_id: PropTypes.number.isRequired,
      branch_name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      phone_number: PropTypes.string.isRequired,
      location_link: PropTypes.string, // location_link alanı
      branch_note: PropTypes.string,
    })
  ).isRequired,
  companies: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BranchTable;

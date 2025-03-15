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
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage"; // Alt şube ikonu
import {
  getInventoryByBranch,
  getSubBranchesByBranchId,
  deleteSubBranch,
  updateBranch, // Alt şube silme API çağrısı
} from "../../utils/api"; // API'den envanter ve alt şubeleri almak için kullanılan fonksiyonlar
import UpdateBranchModal from "./UpdateBranchModal";
import SubBranchTable from "./SubBranchTable"; // Alt şube tablosu bileşeni

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
  const [openInventory, setOpenInventory] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null); // Genişletilmiş (expanded) satırı takip etmek için
  const [subBranches, setSubBranches] = useState([]); // Alt şube verilerini tutmak için
  const [loading, setLoading] = useState(false); // Yükleme durumunu takip etmek için

  const handleOpenInventory = async (branchId) => {
    setSelectedBranchId(branchId);
    const data = await getInventoryByBranch(branchId); // API'den envanteri al
    setInventory(data);
    setOpenInventory(true);
  };

  const handleEditClick = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };
  // Alt şubeleri yükleme fonksiyonu
  const handleExpandClick = async (branchId) => {
    if (expandedRow === branchId) {
      // Eğer zaten açık olan satıra tıklanırsa, gizle
      setExpandedRow(null);
      setSubBranches([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getSubBranchesByBranchId(branchId); // Backend'den alt şubeleri al
      setSubBranches(data); // Alt şubeleri state'e ata
      setExpandedRow(branchId); // Genişletilmiş satırı güncelle
      setLoading(false);
    } catch (err) {
      alert("Alt şubeler yüklenirken bir hata oluştu.");
      setLoading(false);
    }
  };

  const openLocationLink = (link) => {
    const formattedLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `http://${link}`;

    window.open(formattedLink, "_blank");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
  };
  const handleCloseInventory = () => setOpenInventory(false);
  const handleUpdateBranch = async (branchId, updatedData) => {
    try {
      // Correct API call with branch_id in the URL
      await updateBranch(branchId, updatedData);
      alert("Şube başarıyla güncellendi.");
      // Tabloyu yeniden yükleyin veya güncellenen veriyi tabloya yansıtın
    } catch (error) {
      alert("Şube güncellerken bir hata oluştu.");
    }
  };

  const handleDeleteSubBranch = async (subBranchId) => {
    if (window.confirm("Bu alt şubeyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteSubBranch(subBranchId);
        // Alt şube silindikten sonra alt şubeleri tekrar al
        const data = await getSubBranchesByBranchId(selectedBranchId);
        setSubBranches(data);
      } catch (err) {
        alert(err.detail || "Alt şube silinirken bir hata oluştu.");
      }
    }
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
              <React.Fragment key={branch.id}>
                <TableRow
                  key={branch.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f7f9fc" : "#ffffff",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                >
                  <TableCell>{branch.company_name}</TableCell>
                  <TableCell>{branch.city}</TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>{branch.phone_number}</TableCell>
                  <TableCell>{branch.branch_note || "Yok"}</TableCell>
                  <TableCell>
                    {branch.location_link && (
                      <Tooltip title="Konum Göster">
                        <IconButton
                          onClick={() => openLocationLink(branch.location_link)}
                          color="primary"
                          aria-label="Konum Göster"
                        >
                          <LocationOnIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Düzenle">
                      <IconButton
                        onClick={() => handleEditClick(branch)}
                        color="warning"
                        aria-label="Düzenle"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        onClick={() => onDelete(branch.id)}
                        color="error"
                        aria-label="Sil"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Şube Envanterini Görüntüle">
                      <IconButton
                        onClick={() => handleOpenInventory(branch._id)}
                        color="primary"
                        aria-label="Şube Envanterini Görüntüle"
                      >
                        <BackpackIcon />
                      </IconButton>
                    </Tooltip>

                    {branch.has_sub_branches && (
                      <Tooltip title="Alt Şubeleri Görüntüle">
                        <IconButton
                          onClick={() => handleExpandClick(branch.id)}
                          color="success"
                          aria-label="Alt Şubeleri Görüntüle"
                        >
                          <HolidayVillageIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
                {/* Alt Şube Tablosu */}
                {expandedRow === branch.id && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <SubBranchTable subBranches={subBranches} />
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <UpdateBranchModal
        open={isModalOpen}
        onClose={handleCloseModal}
        branchData={selectedBranch}
        onUpdate={handleUpdateBranch}
      />
      {/* Envanter Modal */}
      <Modal open={openInventory} onClose={handleCloseInventory}>
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
                    <br />
                    <Typography
                      variant="body1"
                      component="span"
                      fontWeight="bold"
                    >
                      Ürün Notu:
                    </Typography>
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
      location_link: PropTypes.string,
      branch_note: PropTypes.string,
      sub_branch: PropTypes.array, // Alt şube durumu
    })
  ).isRequired,
  companies: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BranchTable;

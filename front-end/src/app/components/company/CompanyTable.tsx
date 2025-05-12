import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllUsersPermissions } from "@/app/utils/api";
import tableStyles from "@/app/styles/tableStyles";
import ApartmentIcon from "@mui/icons-material/Apartment";
const CompanyTable = ({ companies, onEdit, onDelete, view }) => {
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userPermissions = await getAllUsersPermissions(); // Kullanıcı izinlerini al
        setPermissions(userPermissions); // İzinleri state'e ata
      } catch (error) {
        console.error("Kullanıcı izinleri alınırken hata oluştu:", error);
      }
    };

    fetchPermissions();
  }, []);
  return (
    <>
      {view === "list" && (
        <TableContainer component={Paper} sx={tableStyles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow sx={tableStyles.tableHeader}>
                <TableCell>Şirket ID</TableCell>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.company_id} sx={tableStyles.tableRow}>
                  <TableCell>{company.company_id}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>
                    {permissions.includes("companyEdit") && (
                      <Tooltip title="Düzenle">
                        <IconButton
                          onClick={() => onEdit(company)}
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {permissions.includes("companyDelete") && (
                      <Tooltip title="Sil">
                        <IconButton
                          onClick={() => onDelete(company.company_id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Hiç Şirket Bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {view === "card" && (
        <Grid container spacing={2}>
          {companies.map((c) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={c.company_id}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  height: 320,
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: "#EDF2F7",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
              >
                <CardHeader title={c.name} subheader={`ID: ${c.company_id}`} />
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Buraya isterseniz daha fazla şirket detayı ekleyebilirsiniz */}
                  <Typography variant="body2">
                    <strong>Not:</strong> {c.note || "—"}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions
                  sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
                >
                  {/* Düzenle */}
                  {permissions.includes("companyEdit") && (
                    <Tooltip title="Düzenle" arrow>
                      <IconButton onClick={() => onEdit(c)} color="warning">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Sil */}
                  {permissions.includes("companyDelete") && (
                    <Tooltip title="Sil" arrow>
                      <IconButton
                        onClick={() => onDelete(c.company_id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default CompanyTable;

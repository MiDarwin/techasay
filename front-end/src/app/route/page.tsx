"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Divider,
  InputAdornment,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SearchIcon from "@mui/icons-material/Search";
import { turkishCities } from "../components/branch/cities";
import { getAllCompanies, getAllBranches, optimizeRoute } from "../utils/api";

// Öntanımlı başlangıç/bitiş noktaları
const defaultCoords = [
  {
    label: "İstanbul Maltepe Ofis",
    coords: [40.93660461173823, 29.13656340374358],
  },
  { label: "Adana-Mustafa", coords: [37.005759555378546, 35.31272054515989] },
];

const RoutePage = () => {
  // Veri yükleme state'leri
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtreler
  const [companyFilter, setCompanyFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [districts, setDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Seçimler
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [priorityBranches, setPriorityBranches] = useState([]);

  // Başlangıç/Bitiş koordinat seçimleri
  const [radioValue, setRadioValue] = useState(defaultCoords[0].label);
  const [startCoords, setStartCoords] = useState(defaultCoords[0].coords);
  const [endCoords, setEndCoords] = useState(defaultCoords[0].coords);

  // Veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compData, branchData] = await Promise.all([
          getAllCompanies(),
          getAllBranches(),
        ]);
        setCompanies(compData);
        setBranches(branchData);
      } catch (err) {
        console.error(err);
        setError("Veri yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // İl değişince ilçeler
  useEffect(() => {
    if (cityFilter) {
      setDistricts(turkishCities[cityFilter] || []);
    } else {
      setDistricts([]);
      setDistrictFilter("");
    }
  }, [cityFilter]);

  // Filtrelenmiş şubeler
  const filtered = branches.filter(
    (b) =>
      (!companyFilter || b.company_id === companyFilter) &&
      (!cityFilter || b.city === cityFilter) &&
      (!districtFilter || b.district === districtFilter) &&
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Şube seçme
  const handleSelectBranch = (id) => {
    setSelectedBranches((prev) => {
      const next = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      // Deselected ise öncelikten çıkar
      if (!next.includes(id)) {
        setPriorityBranches((p) => p.filter((i) => i !== id));
      }
      return next;
    });
  };

  // Öncelik toggle
  const handleTogglePriority = (id) => {
    setPriorityBranches((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    // Seçilmemişse seç
    setSelectedBranches((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  // Radio change
  const handleRadioChange = (e) => {
    const label = e.target.value;
    setRadioValue(label);
    const found = defaultCoords.find((d) => d.label === label);
    if (found) {
      setStartCoords(found.coords);
      setEndCoords(found.coords);
    }
  };

  // Manual coord input
  const handleStartInput = (e) => {
    const parts = e.target.value.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !parts.some(isNaN)) setStartCoords(parts);
  };
  const handleEndInput = (e) => {
    const parts = e.target.value.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !parts.some(isNaN)) setEndCoords(parts);
  };

  // Rota oluştur
  const handleCreateRoute = async () => {
    try {
      const res = await optimizeRoute({
        start: startCoords,
        end: endCoords,
        branch_ids: selectedBranches,
        priority_branch_ids: priorityBranches,
      });
      window.open(res.google_maps_url, "_blank");
    } catch (err) {
      console.error(err);
      alert(err.detail || "Rota oluşturulamadı.");
    }
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2}>
        Rota Oluştur
      </Typography>

      {/* Başlangıç/Bitiş Noktası */}
      <Typography variant="h6" mb={1}>
        Başlangıç/Bitiş Noktası
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup row value={radioValue} onChange={handleRadioChange}>
          {defaultCoords.map((opt) => (
            <FormControlLabel
              key={opt.label}
              value={opt.label}
              control={<Radio />}
              label={opt.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Box display="flex" gap={2} mt={2} mb={3}>
        <TextField
          fullWidth
          label="Başlangıç Koordinatı (lat, lng)"
          value={startCoords.join(", ")}
          onChange={handleStartInput}
        />
        <TextField
          fullWidth
          label="Bitiş Koordinatı (lat, lng)"
          value={endCoords.join(", ")}
          onChange={handleEndInput}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Filtreleme ve Arama */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Şirket"
          select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {companies.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Şehir"
          select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {Object.keys(turkishCities).map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="İlçe"
          select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          sx={{ minWidth: 200 }}
          disabled={!cityFilter}
        >
          <MenuItem value="">Tümü</MenuItem>
          {districts.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Şube Ara"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Şube Tablosu */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Şube Adı</TableCell>
            <TableCell>Şirket</TableCell>
            <TableCell>Şehir</TableCell>
            <TableCell>İlçe</TableCell>
            <TableCell align="center">Öncelik</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((b) => (
            <TableRow key={b.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedBranches.includes(b.id)}
                  onChange={() => handleSelectBranch(b.id)}
                />
              </TableCell>
              <TableCell>{b.name}</TableCell>
              <TableCell>{b.company_name}</TableCell>
              <TableCell>{b.city}</TableCell>
              <TableCell>{b.district}</TableCell>
              <TableCell align="center">
                <IconButton onClick={() => handleTogglePriority(b.id)}>
                  <RocketLaunchIcon
                    color={
                      priorityBranches.includes(b.id) ? "primary" : "disabled"
                    }
                  />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button
          variant="contained"
          startIcon={<RocketLaunchIcon />}
          onClick={handleCreateRoute}
        >
          Rota Oluştur
        </Button>
      </Box>
    </Box>
  );
};

export default RoutePage;

const tableStyles = {
  tableContainer: {
    borderRadius: "8px",
    boxShadow: "3px 3px 10px rgba(0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#E7F6F2",
    color: "#ffffff",
    "& th": {
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#395B64", // Tek satırlar
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#E7F6F2", // Çift satırlar
    },
    "&:hover": {
      backgroundColor: "#A5C9CA", // Hover efekti
    },
  },
  subBranchRow: {
    backgroundColor: "#EDE8DC", // Alt şube arka plan rengi
  },
  // Form ve filtre bileşenleri
  filterContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0.1)",
    border: "1px solid #ccc",
    backgroundColor: "#E7F6F2",
  },
  selectInput: {
    backgroundColor: "#F8F1E4",
    borderWidth: "1px",
    borderColor: "#A5B68D",
    padding: "8px",
    marginRight: "8px",
    borderRadius: "8px",
  },
  textInput: {
    backgroundColor: "#F8F1E4",
    borderWidth: "1px",
    borderColor: "#A5B68D",
    padding: "8px",
    marginRight: "8px",
    borderRadius: "8px",
    flexGrow: 1, // Tüm alanı kapla
  },
  button: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    "&:hover": {
      backgroundColor: "#218838",
    },
  },
};

export default tableStyles;

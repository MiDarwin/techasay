const getColors = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("tableColors")) || {};
  }
  return {};
};
const colors = getColors();

const tableStyles = {
  tableContainer: {
    borderRadius: "8px",
    boxShadow: "3px 3px 10px rgba(0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: colors.tableHeader || "#E7F6F2",
    color: "#ffffff",
    "& th": {
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
  },
  tableHeaderBackground: {
    backgroundColor: colors.tableHeader || "#E7F6F2",
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: colors.tableRowOdd || "#395B64",
    },
    "&:nth-of-type(even)": {
      backgroundColor: colors.tableRowEven || "#E7F6F2",
    },
    "&:hover": {
      backgroundColor: "#A5C9CA",
    },
  },
  subBranchRow: {
    backgroundColor: colors.subBranchRow || "#EDE8DC",
  },
  // Form ve filtre bileşenleri
  filterContainer: {
    backgroundColor: colors.filterContainer || "#E7F6F2",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0.1)",
    border: "1px solid #ccc",
    padding: "16px",
    marginBottom: "16px",
  },
  selectInput: {
    backgroundColor: "#FFF",
    borderWidth: "1px",
    borderColor: "black",
    padding: "8px",
    marginRight: "8px",
    borderRadius: "8px",
    color: "black",
  },
  textInput: {
    backgroundColor: "#FFF",
    borderWidth: "1px",
    borderColor: "black",
    padding: "8px",
    marginRight: "8px",
    borderRadius: "8px",
    color: "black",
  },
  button: {
    backgroundColor: colors.button || "#28a745",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    padding: "8px 16px",
    border: "none",
    transition: "background-color 0.3s ease",
  },

  buttonHover: {
    "&:hover": {
      backgroundColor: "#218838",
    },
  },
  modalBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "fit-content",
    maxWidth: "90vw",
    maxHeight: "90vh",
    bgcolor: "#F8F1E4",
    boxShadow: "0px 4px 10px rgba(0, 0, 0.2)",
    p: 4,
    borderRadius: "10px",
    overflow: "auto",
  },
  modalTitle: {
    color: "#A5B68D",
    textAlign: "center",
    fontWeight: "bold",
  },
  formControl: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#A5B68D" },
      "&:hover fieldset": { borderColor: "#8FA781" },
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#A5B68D" },
      "&:hover fieldset": { borderColor: "#8FA781" },
    },
  },
  submitButton: {
    mt: 2,
    backgroundColor: "#A5B68D",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#8FA781",
    },
  },
};

export default tableStyles;

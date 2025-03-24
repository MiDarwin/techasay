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
  },
  textInput: {
    backgroundColor: "#FFF",
    borderWidth: "1px",
    borderColor: "black",
    padding: "8px",
    marginRight: "8px",
    borderRadius: "8px",
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
};

export default tableStyles;

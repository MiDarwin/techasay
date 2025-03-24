const settingsStyles = {
  container: {
    backgroundColor: "#EDE8DC",
    padding: "20px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  userBox: {
    position: "absolute", // Sağ üst köşede yer almak için
    top: "20px", // Sayfanın üstünden boşluk
    right: "20px", // Sayfanın sağından boşluk
    display: "flex", // Simge ve isim yanyana
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF", // Kutu arka plan rengi
    borderRadius: "15px", // Kenarları yumuşat
    boxShadow: "0px 4px 6px rgba(0, 0, 0.1)", // Hafif gölge ekle
    padding: "5px 10px", // İç boşluk
    gap: "10px", // Simge ve isim arasındaki boşluk
  },
  iconContainer: {
    marginBottom: "20px", // Yazılarla simge arasına boşluk ekle
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: "70px", // Simge boyutunu biraz büyüt
    color: "#333", // Renk değişikliği
    cursor: "pointer",
  },
  welcomeMessage: {
    fontSize: "1.5rem",
    color: "#A5B68D",
    marginBottom: "10px",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "5px",
    textAlign: "center",
  },
  description: {
    fontSize: "1rem",
    color: "#666",
    textAlign: "center",
    marginBottom: "20px",
  },
  table: {
    width: "80%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  tableHeader: {
    fontSize: "1rem",
    color: "#FFF",
    backgroundColor: "#A5B68D",
    padding: "10px",
    textAlign: "center",
    border: "1px solid #ddd",
  },
  tableCell: {
    fontSize: "1rem",
    color: "#A5B68D",
    padding: "10px",
    textAlign: "center",
    border: "1px solid #ddd",
  },
  greenTick: {
    color: "#A5B68D",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  redCross: {
    color: "red",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  box: {
    backgroundColor: "#FFF", // Kutunun arka plan rengi
    borderRadius: "15px", // Kenarları yumuşat
    boxShadow: "0px 4px 8px rgba(0, 0, 0.1)", // Hafif gölge efekti
    padding: "20px",
    maxWidth: "600px", // Kutunun genişliği
    margin: "50px auto", // Ortalamak için
    display: "flex",
    flexDirection: "column",
    gap: "20px", // Elemanlar arasındaki boşluk
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // Simge ile isim arasında boşluk
    justifyContent: "space-between", // Kullanıcı adı ile çıkış simgesini iki yana dağıt
    borderBottom: "1px solid #ddd", // Alt çizgi
    paddingBottom: "10px",
  },
  icon: {
    fontSize: "50px", // Kullanıcı simgesi boyutu
    color: "#333", // Kullanıcı simgesi rengi
  },
  logoutIcon: {
    fontSize: "30px", // Çıkış simgesi boyutu
    color: "#FF6347", // Kırmızı renk
    cursor: "pointer", // Tıklanabilir simge
  },
  userName: {
    fontSize: "1.5rem", // Kullanıcı adı boyutu
    fontWeight: "bold",
    color: "#333", // Yazı rengi
  },
  iconWrapper: {
    position: "relative", // Tooltip'i konumlandırmak için
    display: "inline-block",
  },
  tooltip: {
    visibility: "hidden", // Varsayılan olarak görünmez
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "center",
    borderRadius: "5px",
    padding: "5px",
    position: "absolute",
    zIndex: 1,
    bottom: "150%", // İkonun üstüne yerleştirmek için
    left: "50%",
    transform: "translateX(-50%)",
    opacity: 0, // Görünmezlik için başlangıç değeri
    transition: "opacity 0.3s", // Geçiş animasyonu
  },
  iconWrapperHover: {
    ":hover span": {
      visibility: "visible", // Hover sırasında görünür yap
      opacity: 1, // Görünürlük değerini artır
    },
  },
  changePassword: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Yazı ve simgeyi iki yana dağıt
    padding: "10px 0",
    borderBottom: "1px solid #ddd", // Alt çizgi
  },
  editIcon: {
    fontSize: "20px", // Kalem simgesi boyutu
    color: "#666", // Kalem simgesi rengi
    cursor: "pointer", // Tıklanabilir simge
  },
  permissions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  permissionsTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#333",
  },
  permissionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Yazı ve switch'i iki yana dağıt
    padding: "10px",
    backgroundColor: "#F9F9F9", // Yetki satırının arka planı
    borderRadius: "10px", // Kenarları yumuşat
    boxShadow: "0px 2px 4px rgba(0, 0, 0.05)", // Hafif gölge efekti
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "400px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0.2)",
    padding: "20px",
    textAlign: "center",
  },
  modalTitle: {
    marginBottom: "20px",
    fontWeight: "bold",
    fontSize: "18px",
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
    marginTop: "10px",
  },
  successText: {
    color: "green",
    fontSize: "14px",
    marginTop: "10px",
  },
  submitButton: {
    marginTop: "20px",
    backgroundColor: "#6B7280",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default settingsStyles;

from pydantic import BaseModel
from typing import Optional

class ExcelData(BaseModel):
    wan_ip: str
    gsm_no: str
    lokal_ip: str
    cihaz_model: str
    vpn_isim: Optional[str] = None
    ipsec_blok: Optional[str] = None
    cihaz_seri_no: Optional[str] = None
    mac_address: Optional[str] = None
    imei: Optional[str] = None
    durum: Optional[str] = None
    planlama_tarihi: Optional[str] = None
    unvani: Optional[str] = None
    il: Optional[str] = None
    adres: Optional[str] = None
    yetkili_ad_soyad: Optional[str] = None
    yetkili_gsm: Optional[str] = None
    enlem: Optional[float] = None
    boylam: Optional[float] = None
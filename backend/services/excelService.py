import pandas as pd
from database import db
import math


def normalize_string(value):
    """
    Verilen string değeri normalize eder: İlk harf büyük, diğer harfler küçük.
    """
    if isinstance(value, str):
        return value.strip().capitalize()  # İlk harfi büyük, diğerlerini küçük yap
    return value


async def process_excel_file(file):
    """Excel dosyasını işle ve veritabanına yeni kayıtları ekle."""
    # Excel dosyasını oku
    df = pd.read_excel(file)

    # Verileri dictionary formatına çevir
    records = df.to_dict("records")

    # Yeni kayıt edilen "ÜNVANI" sayısı için sayaç
    new_records_count = 0
    duplicate_records_count = 0

    for record in records:
        # İlgili alanları normalize et
        record["İL"] = normalize_string(record.get("İL"))  # İl alanını normalize et
        record["Durum"] = normalize_string(record.get("Durum"))  # Durum alanını normalize et
        record["ÜNVANI"] = normalize_string(record.get("ÜNVANI"))  # Ünvanı alanını normalize et

        UNVANI = record.get("ÜNVANI")  # "ÜNVANI" sütununu al
        if not UNVANI:
            print("Boş ÜNVANI bilgisi bulundu, bu kayıt atlanıyor...")
            continue  # "ÜNVANI" boşsa, bu satırı atla

        # "ÜNVANI" bilgisinin veritabanında mevcut olup olmadığını kontrol et
        existing_data = await db.excel_data.find_one({"ÜNVANI": UNVANI})
        if existing_data:
            # Eğer "ÜNVANI" zaten varsa, bu satırı atla
            duplicate_records_count += 1
            print(f"Mevcut ÜNVANI bulundu: {UNVANI}, bu kayıt atlanıyor...")
            continue

        # Yeni "ÜNVANI" bilgisini veritabanına ekle
        try:
            await db.excel_data.insert_one(record)
            new_records_count += 1
        except Exception as e:
            print(f"ÜNVANI {UNVANI} olan kaydı eklerken hata oluştu: {str(e)}")

    return {
        "mesaj": "Excel verileri başarıyla işlendi.",
        "yeni_kayit_sayisi": new_records_count,
        "tekrar_edilen_kayit_sayisi": duplicate_records_count,
    }


def clean_mongo_record(record):
    """
    MongoDB'den dönen kayıtları JSON uyumlu hale getir.
    """
    if isinstance(record, dict):
        # ObjectId'yi string'e çevir
        record["_id"] = str(record["_id"]) if "_id" in record else None

        # NaN veya None değerlerini temizle
        for key, value in record.items():
            if value is None or (isinstance(value, float) and math.isnan(value)):
                record[key] = None  # JSON'da None, null olarak döner

    return record


async def get_existing_excel_data():
    """MongoDB'deki mevcut Excel verilerini döndür."""
    # Tüm verileri çek
    data = await db.excel_data.find({}).to_list(length=None)

    # Verileri temizle (NaN veya None değerlerini JSON uyumlu hale getir)
    return [clean_mongo_record(record) for record in data]
import pandas as pd
from database import db
import math


async def process_excel_file(file):
    """Excel dosyasını işle ve veritabanına yeni kayıtları ekle."""
    # Excel dosyasını oku
    df = pd.read_excel(file)

    # Verileri dictionary formatına çevir
    records = df.to_dict("records")

    # Yeni kayıt edilen IMEI'ler için bir sayaç
    new_records_count = 0
    duplicate_records_count = 0

    for record in records:
        IMEI = record.get("IMEI")  # IMEI numarasını al
        if not IMEI:
            print("Boş IMEI numarası bulundu, atlanıyor...")
            continue  # IMEI boşsa, bu satırı atla

        # IMEI'nin veritabanında mevcut olup olmadığını kontrol et
        existing_data = await db.excel_data.find_one({"IMEI": IMEI})
        if existing_data:
            # Eğer IMEI zaten varsa, bu satırı atla
            duplicate_records_count += 1
            print(f"Duplicate IMEI found: {IMEI}, skipping...")
            continue

        # Yeni IMEI'yi veritabanına ekle
        try:
            await db.excel_data.insert_one(record)
            new_records_count += 1
        except Exception as e:
            print(f"Error inserting record with IMEI {IMEI}: {str(e)}")

    return {
        "message": "Excel data processed successfully.",
        "new_records_count": new_records_count,
        "duplicate_records_count": duplicate_records_count,
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
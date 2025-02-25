import pandas as pd
from database import db
import math

async def process_excel_file(file):
    """Excel dosyasını işle ve veritabanına kaydet."""
    # Excel dosyasını oku
    df = pd.read_excel(file)

    # Verileri dictionary formatına çevir
    records = df.to_dict("records")

    # Her bir veriyi kontrol ederek MongoDB'ye ekle
    for record in records:
        existing_data = await db.excel_data.find_one({"wan_ip": record.get("Wan IP")})  # Wan IP eşsiz kabul ediliyor
        if not existing_data:
            await db.excel_data.insert_one(record)
        else:
            print(f"Duplicate data found for WAN IP: {record.get('Wan IP')}, skipping...")

    return {"message": "Excel data processed successfully."}


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
import pandas as pd
from database import db

async def process_excel_file(file):
    """Excel dosyasını işle ve veritabanına kaydet."""
    # Excel dosyasını oku
    df = pd.read_excel(file)

    # Verileri dictionary formatına çevir
    records = df.to_dict("records")

    # Her bir veriyi kontrol ederek MongoDB'ye ekle
    for record in records:
        existing_data = await db.excel_data.find_one({"wan_ip": record["Wan IP"]})  # Wan IP eşsiz kabul ediliyor
        if not existing_data:
            await db.excel_data.insert_one(record)
        else:
            print(f"Duplicate data found for WAN IP: {record['Wan IP']}, skipping...")

    return {"message": "Excel data processed successfully."}
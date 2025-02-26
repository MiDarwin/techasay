import pandas as pd
from datetime import datetime, timedelta
from database import db

async def process_hata_log(file):
    """
    Log dosyasını işle ve başarısız ping hatalarını analiz et.
    """
    df = pd.read_excel(file)

    # Verileri kontrol ve işleme
    records = df.to_dict("records")
    yeni_kayitlar = 0
    tekrar_edilen_kayitlar = 0
    kritik_hatalar = []

    for record in records:
        unvani = record.get("ÜNVANI")
        tarih = record.get("Tarih")
        saat = record.get("Saat")
        basarili = record.get("Başarılı")
        basarisiz = record.get("Başarısız")

        # Tarih ve saat birleştirilerek datetime formatına dönüştürülür
        try:
            datetime_kayit = datetime.strptime(f"{tarih} {saat}", "%d.%m.%Y %H:%M:%S")
        except Exception as e:
            print(f"Geçersiz tarih formatı: {tarih} {saat}. Hata: {e}")
            continue

        # Aynı tarih ve saatli kaydın önceden girilip girilmediğini kontrol et
        existing_log = await db.bpet_hata_log.find_one({
            "ÜNVANI": unvani,
            "TarihSaat": datetime_kayit
        })

        if existing_log:
            tekrar_edilen_kayitlar += 1
            continue

        # Eğer başarısız ping sayısı başarılı ping sayısından fazla ise hata olarak kaydedilir
        if basarisiz > basarili:
            yeni_kayitlar += 1

            # Hata logunu kaydet
            await db.bpet_hata_log.insert_one({
                "ÜNVANI": unvani,
                "TarihSaat": datetime_kayit,
                "Başarılı": basarili,
                "Başarısız": basarisiz
            })

            # Son 2 haftadaki hataları kontrol et
            two_weeks_ago = datetime.now() - timedelta(days=14)
            recent_errors = await db.bpet_hata_log.count_documents({
                "ÜNVANI": unvani,
                "TarihSaat": {"$gte": two_weeks_ago}
            })

            if recent_errors > 5:
                kritik_hatalar.append(f"BU noktada 2 haftada 5'i geçecek şekilde sorun yaşandı: {unvani}")

    # Eski hataları sil (2 haftadan eski olanlar)
    await db.bpet_hata_log.delete_many({
        "TarihSaat": {"$lt": datetime.now() - timedelta(days=14)}
    })

    # Yanıt döndür
    return {
        "mesaj": "Log dosyası başarıyla işlendi.",
        "yeni_kayit_sayisi": yeni_kayitlar,
        "tekrar_edilen_kayitlar": tekrar_edilen_kayitlar,
        "kritik_hatalar": kritik_hatalar
    }
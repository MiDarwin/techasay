from datetime import datetime, timedelta
import pandas as pd  # Pandas eksik, eklendi
from database import db  # MongoDB bağlantısı için gerekli dosya

async def process_hata_log(file):
    # Excel dosyasını DataFrame olarak yükle
    try:
        df = pd.read_excel(file)
    except Exception as e:
        raise ValueError(f"Dosya okunamadı: {e}")

    records = df.to_dict("records")
    yeni_kayitlar = 0
    tekrar_edilen_kayitlar = 0
    kritik_hatalar = []

    for record in records:
        unvani = record.get("ÜNVANI")
        tarih = record.get("Tarih")
        saat = record.get("Saat")
        basarili = record.get("Başarılı", 0)
        basarisiz = record.get("Başarısız", 0)
        ip_adresi = record.get("IP", "")

        if not unvani or not tarih or not saat:
            # Zorunlu alanlardan biri yoksa işleme devam etme
            continue

        # Tarih ve saat birleştirilerek datetime formatına dönüştürülür
        try:
            datetime_kayit = datetime.strptime(f"{tarih} {saat}", "%d.%m.%Y %H:%M:%S")
        except Exception as e:
            print(f"Geçersiz tarih formatı: {tarih} {saat}. Hata: {e}")
            continue

        # (UNVANI, datetime_kayit) kontrolü yap
        existing_entry = await db.bpet_ping_log.find_one(
            {"_id": unvani.upper(), "kritik_hata_sayisi": {"$elemMatch": {"$eq": datetime_kayit.strftime("%d.%m.%Y")}}}
        )
        if existing_entry:
            tekrar_edilen_kayitlar += 1
            continue

        # Eğer başarısız sayısı başarılı sayısından fazla ise kritik hata kabul edelim
        if basarisiz > basarili:
            yeni_kayitlar += 1
            _id = unvani.upper()
            now = datetime.now()

            doc = await db.bpet_ping_log.find_one({"_id": _id})
            if not doc:
                doc = {
                    "_id": _id,
                    "ip_adresi": ip_adresi,
                    "kritik_hata_sayisi": [],
                    "kontrol_durumu": "kontrol_edilmedi",
                    "son_kontrol_tarihi": None,
                    "son_guncelleme": now
                }
                await db.bpet_ping_log.insert_one(doc)

            kritik_listesi = doc.get("kritik_hata_sayisi", [])
            yeni_tarih_str = datetime_kayit.strftime("%d.%m.%Y")
            kritik_listesi.append(yeni_tarih_str)

            # 14 günden eski kayıtları temizle
            two_weeks_ago = (now - timedelta(days=14)).date()
            kritik_listesi = [
                t_str for t_str in kritik_listesi
                if datetime.strptime(t_str, "%d.%m.%Y").date() >= two_weeks_ago
            ]

            doc["kritik_hata_sayisi"] = kritik_listesi
            doc["son_guncelleme"] = now

            await db.bpet_ping_log.update_one(
                {"_id": _id},
                {"$set": doc}
            )

            if len(kritik_listesi) >= 5:
                kritik_hatalar.append(f"Son 2 haftada 5'i aşan kritik hata: {unvani}")
                mevcut_gecmis = await db.gecmis_log.find_one({"_id": _id})
                if not mevcut_gecmis:
                    gecmis_data = {
                        "_id": _id,
                        "ip_adresi": doc["ip_adresi"],
                        "kritik_hata_sayisi": kritik_listesi,
                        "toplam_hata_sayisi": len(kritik_listesi),
                        "transfer_tarihi": now,
                        "kontrol_notu": ""
                    }
                    await db.gecmis_log.insert_one(gecmis_data)
                else:
                    await db.gecmis_log.update_one(
                        {"_id": _id},
                        {"$set": {
                            "ip_adresi": doc["ip_adresi"],
                            "kritik_hata_sayisi": kritik_listesi,
                            "toplam_hata_sayisi": len(kritik_listesi),
                            "transfer_tarihi": now
                        }}
                    )

    return {
        "mesaj": "Log dosyası başarıyla işlendi.",
        "yeni_kayit_sayisi": yeni_kayitlar,
        "tekrar_edilen_kayitlar": tekrar_edilen_kayitlar,
        "kritik_hatalar": kritik_hatalar
    }
async def get_top_critical_logs_service(limit: int):
    """
    MongoDB'den en yüksek kritik hata sayısına sahip ilk `limit` kaydı getirir.
    :param limit: Döndürülecek maksimum kayıt sayısı
    :return: Kritik hata sayısına göre sıralanmış kayıtların listesi
    """
    try:
        # MongoDB'den en yüksek kritik hata sayısına göre sıralanmış kayıtları al
        logs_cursor = db.bpet_ping_log.aggregate([
            {"$addFields": {"kritik_hata_sayisi_uzunluk": {"$size": "$kritik_hata_sayisi"}}},  # Kritik hata uzunluğunu hesapla
            {"$sort": {"kritik_hata_sayisi_uzunluk": -1}},  # Kritik hata uzunluğuna göre sırala
            {"$limit": limit}  # İlk `limit` kadar kaydı al
        ])
        # Sıralanmış kayıtları listeye dönüştür
        top_logs = await logs_cursor.to_list(length=limit)
        return top_logs
    except Exception as e:
        # Hata durumunda özel bir hata fırlat
        raise RuntimeError(f"Veritabanı sorgusu sırasında bir hata oluştu: {e}")
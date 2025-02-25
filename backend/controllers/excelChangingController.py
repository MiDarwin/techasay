import pandas as pd
from datetime import datetime
import os
import shutil
import pandas as pd
import numpy as np
EXCEL_FILE = "uploaded_excels/WoW.xlsx"
BACKUP_FOLDER = "backups"
LOG_FILE = "change_log.txt"

os.makedirs(BACKUP_FOLDER, exist_ok=True)

def backup_excel():
    """Excel dosyasını yedekle."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_FOLDER, f"backup_{timestamp}.xlsx")
    shutil.copy(EXCEL_FILE, backup_path)
    return backup_path

def log_change(action, details, user_id):
    """Değişiklikleri logla."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as log_file:
        log_file.write(f"{timestamp} | User ID: {user_id} | Action: {action} | Details: {details}\n")


async def add_row_to_excel(data, user_id):
    """Excel dosyasına yeni bir satır ekle."""
    # Yedek al
    backup_excel()

    # Excel'i yükle ve yeni satırı ekle
    df = pd.read_excel(EXCEL_FILE)
    df = pd.concat([df, pd.DataFrame([data])], ignore_index=True)
    df.to_excel(EXCEL_FILE, index=False)

    # Log kaydı oluştur
    log_change("Add", f"New row added: {data}", user_id)

    return {"message": "Row added successfully", "new_row": data}


async def update_excel_row(data, user_id):
    """Excel dosyasındaki bir satırı güncelle."""
    # Yedek al
    backup_excel()

    # Gerekli verileri al
    row_index = data.get("row_index")
    column_name = data.get("column_name")
    new_value = data.get("new_value")

    if not row_index or not column_name or new_value is None:
        raise ValueError("row_index, column_name, and new_value are required.")

    # Excel'i yükle ve güncelleme yap
    df = pd.read_excel(EXCEL_FILE)
    old_value = df.at[row_index, column_name]
    df.at[row_index, column_name] = new_value
    df.to_excel(EXCEL_FILE, index=False)

    # Log kaydı oluştur
    log_change(
        "Update",
        f"Row {row_index}, Column '{column_name}': '{old_value}' -> '{new_value}'",
        user_id
    )

    return {"message": "Row updated successfully", "updated_row": row_index}


async def delete_excel_row(row_index, user_id):
    """Excel dosyasındaki bir satırı sil ve yeniden sıralama yap."""
    backup_excel()

    df = pd.read_excel(EXCEL_FILE)

    if row_index >= len(df):
        raise ValueError(f"Row index {row_index} is out of bounds. Max index: {len(df) - 1}")

    deleted_row = df.iloc[row_index].to_dict()

    # Satırı sil
    df = df.drop(index=row_index).reset_index(drop=True)

    # NaN olan satırları None olarak değiştirelim
    df = df.applymap(lambda x: None if isinstance(x, float) and np.isnan(x) else x)

    # Excel'e geri yaz
    df.to_excel(EXCEL_FILE, index=False)

    log_change("Delete", f"Row {row_index} deleted: {deleted_row}", user_id)

    return {"message": "Row deleted successfully", "deleted_row": deleted_row}
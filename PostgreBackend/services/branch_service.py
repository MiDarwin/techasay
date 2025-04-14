# services/branch_service.py
from http.client import HTTPException
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.branch import Branch
from models.company import Company
from models.favorite_branches import favorite_branches
from models.user import User
from schemas import company
from schemas.branch import BranchCreate, BranchResponse,BranchUpdate
from sqlalchemy.orm import joinedload, Session  # Ekle
from sqlalchemy import or_
from sqlalchemy.orm import selectinload
from models.favorite_branches import favorite_branches
from sqlalchemy import delete
from tempfile import NamedTemporaryFile
from openpyxl import Workbook
import pandas as pd


async def create_branch(db: AsyncSession, branch: BranchCreate, company_id: int):
    db_branch = Branch(
        branch_name=branch.branch_name,
        address=branch.address,
        city=branch.city,
        district=branch.district,
        phone_number=branch.phone_number,
        branch_note=branch.branch_note,
        location_link=branch.location_link,
        company_id=company_id,
        phone_number_2=branch.phone_number_2
    )

    db.add(db_branch)
    await db.commit()
    await db.refresh(db_branch)

    # Şirketi yükleyin
    company_result = await db.execute(select(Company).filter(Company.id == company_id))
    company = company_result.scalars().first()

    return BranchResponse(
        id=db_branch.id,
        name=db_branch.branch_name,
        address=db_branch.address,
        city=db_branch.city,
        district=db_branch.district,
        phone_number=db_branch.phone_number,
        company_id=db_branch.company_id,
        company_name=company.name if company else "",  # Şirket adı varsa
        branch_note=db_branch.branch_note,
        location_link=db_branch.location_link,
    created_date = db_branch.created_date.strftime("%d/%m/%Y")
    )


async def get_branches(db: AsyncSession, company_id: int, skip: int = 0, limit: int = 10, city: str = None,
                       district: str = None,textinput: str = None):
    query = select(Branch).options(joinedload(Branch.company)).filter(Branch.company_id == company_id)

    if city:  # Eğer city parametresi varsa, city'e göre filtrele
        query = query.filter(Branch.city.ilike(f"%{city}%"))
    if district:  # Eğer district parametresi varsa, district'e göre filtrele
        query = query.filter(Branch.district.ilike(f"%{district}%"))
    if textinput:  # Eğer textinput varsa, name, address, city ve phone_number'da arama yap
        query = query.filter(
            or_(
                Branch.branch_name.ilike(f"%{textinput}%"),
                Branch.address.ilike(f"%{textinput}%"),
                Branch.city.ilike(f"%{textinput}%"),
                Branch.district.ilike(f"%{textinput}%"),  # İlçe içinde de aramayı dahil ettik
                Branch.phone_number.ilike(f"%{textinput}%")
            )
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    branches = result.scalars().all()
    branch_responses = []
    for branch in branches:
        # Alt şubeler olup olmadığını kontrol et
        sub_branch_query = select(Branch).filter(Branch.parent_branch_id == branch.id)
        sub_branch_result = await db.execute(sub_branch_query)
        has_sub_branches = sub_branch_result.scalars().first() is not None

        branch_responses.append({
            "id": branch.id,
            "name": branch.branch_name,
            "address": branch.address,
            "city": branch.city,
            "district": branch.district,  # İlçe bilgisi ekleniyor
            "phone_number": branch.phone_number,
            "company_id": branch.company_id,
            "company_name": branch.company.name if branch.company else None,
            "location_link": branch.location_link,
            "branch_note": branch.branch_note if hasattr(branch, 'branch_note') else "",
            "parent_branch_id": branch.parent_branch_id,
            "phone_number_2": branch.phone_number_2,
            "has_sub_branches": has_sub_branches, # Yeni alan eklendi
            "created_date": branch.created_date.strftime("%d/%m/%Y")  # Tarih formatı: Gün/Ay/Yıl

        })

    return branch_responses

async def get_branch_by_id(db: AsyncSession, branch_id: int):
    result = await db.execute(select(Branch).filter(Branch.id == branch_id))
    return result.scalars().first()

async def update_branch(db: AsyncSession, branch_id: int, branch_data: BranchUpdate):
    db_branch = await get_branch_by_id(db, branch_id)
    if db_branch:
        # Sadece gönderilen (set edilmiş) alanları al
        for key, value in branch_data.dict(exclude_unset=True).items():
            setattr(db_branch, key, value)
        await db.commit()
        await db.refresh(db_branch)
        return db_branch
    return None

async def delete_branch(db: AsyncSession, branch_id: int):
    db_branch = await get_branch_by_id(db, branch_id)
    if db_branch:
        await db.delete(db_branch)
        await db.commit()
        return db_branch
    return None
async def get_all_branches(db: AsyncSession, user_id: int, limit: int = 50, city: Optional[str] = None):
    # Adım 2: Kullanıcının favori şubelerini al
    favorite_query = select(favorite_branches.c.branch_id).where(favorite_branches.c.user_id == user_id)
    favorite_result = await db.execute(favorite_query)
    favorite_branch_ids = [row.branch_id for row in favorite_result.fetchall()]  # Favori şube ID'lerini çıkar

    # Adım 3: Favori şubelerin bilgilerini al
    favorite_branches_list = []  # Liste için farklı bir isim kullanıldı
    if favorite_branch_ids:
        favorite_branch_query = select(Branch).options(joinedload(Branch.company)).where(Branch.id.in_(favorite_branch_ids))
        if city:
            favorite_branch_query = favorite_branch_query.filter(Branch.city == city)
        favorite_result = await db.execute(favorite_branch_query)
        favorite_branches_list = favorite_result.scalars().all()

    # Adım 4: Favori olmayan şubeleri sorgula
    all_branches_query = select(Branch).options(joinedload(Branch.company)).filter(Branch.company_id.isnot(None))
    if city:
        all_branches_query = all_branches_query.filter(Branch.city == city)
    if favorite_branch_ids:
        all_branches_query = all_branches_query.filter(~Branch.id.in_(favorite_branch_ids))  # Favori şubeleri hariç tut
    all_branches_query = all_branches_query.limit(limit)
    all_branches_result = await db.execute(all_branches_query)
    all_branches = all_branches_result.scalars().all()

    # Adım 5: Favori şubeleri ve diğer şubeleri birleştir
    branch_responses = []
    for branch in favorite_branches_list + all_branches:
        # Alt şubeler olup olmadığını kontrol et
        sub_branch_query = select(Branch).filter(Branch.parent_branch_id == branch.id)
        sub_branch_result = await db.execute(sub_branch_query)
        has_sub_branches = sub_branch_result.scalars().first() is not None

        branch_responses.append({
            "id": branch.id,
            "name": branch.branch_name,
            "address": branch.address,
            "city": branch.city,
            "district": branch.district,
            "phone_number": branch.phone_number,
            "company_id": branch.company_id,
            "company_name": branch.company.name if branch.company else None,
            "location_link": branch.location_link,
            "phone_number_2": branch.phone_number_2,
            "branch_note": branch.branch_note if hasattr(branch, 'branch_note') else "",
            "parent_branch_id": branch.parent_branch_id,
            "has_sub_branches": has_sub_branches,
            "created_date": branch.created_date.strftime("%d/%m/%Y"),
            "is_favorite": branch.id in favorite_branch_ids  # Favori mi kontrolü
        })

    # Adım 6: Sonuçları döndür
    return branch_responses

async def create_sub_branch(db: AsyncSession, branch: BranchCreate, parent_branch_id: int):
    # Alt şube ekleme işlemi
    db_branch = Branch(
        branch_name=branch.branch_name,
        address=branch.address,
        city=branch.city,
        phone_number=branch.phone_number,
        branch_note=branch.branch_note,
        location_link=branch.location_link,
        parent_branch_id=parent_branch_id,  # Alt şube için parent_branch_id atanır
    created_date = datetime.utcnow()
    )

    db.add(db_branch)
    await db.commit()
    await db.refresh(db_branch)

    # Üst şube bilgisi yüklenir
    parent_branch_result = await db.execute(
        select(Branch).options(selectinload(Branch.company)).filter(Branch.id == parent_branch_id)
    )
    parent_branch = parent_branch_result.scalars().first()

    return BranchResponse(
        id=db_branch.id,
        name=db_branch.branch_name,
        address=db_branch.address,
        city=db_branch.city,
        phone_number=db_branch.phone_number,
        parent_branch_id=db_branch.parent_branch_id,
        branch_note=db_branch.branch_note,
        location_link=db_branch.location_link,
        company_id=parent_branch.company_id if parent_branch else None,  # Üst şube şirketi
        company_name=parent_branch.company.name if parent_branch and parent_branch.company else None  # Şirket adı
    )
async def get_sub_branches(db: AsyncSession, parent_branch_id: int):
    """Belirtilen parent_branch_id'ye ait alt şubeleri getirir."""
    query = select(Branch).filter(Branch.parent_branch_id == parent_branch_id)
    result = await db.execute(query)
    sub_branches = result.scalars().all()

    return [
        {
            "id": branch.id,
            "name": branch.branch_name,
            "address": branch.address,
            "city": branch.city,
            "phone_number": branch.phone_number,
            "company_id": branch.company_id,
            "location_link": branch.location_link,
            "branch_note": branch.branch_note if hasattr(branch, 'branch_note') else "",
            "parent_branch_id": branch.parent_branch_id,
        }
        for branch in sub_branches
    ]


async def add_favorite_branch(db: AsyncSession, user_id: int, branch_id: int):
    # Kullanıcıyı asenkron olarak sorgula
    user_query = select(User).where(User.id == user_id)
    result_user = await db.execute(user_query)
    user = result_user.scalars().first()  # İlk sonucu al

    # Şubeyi asenkron olarak sorgula
    branch_query = select(Branch).where(Branch.id == branch_id)
    result_branch = await db.execute(branch_query)
    branch = result_branch.scalars().first()  # İlk sonucu al

    if not user or not branch:
        raise HTTPException(status_code=404, detail="Kullanıcı veya şube bulunamadı.")

    # Favoriler kontrolü
    existing_favorite_query = select(favorite_branches).where(
        favorite_branches.c.user_id == user_id,
        favorite_branches.c.branch_id == branch_id
    )
    result = await db.execute(existing_favorite_query)
    existing_favorite = result.scalars().first()

    if existing_favorite:
        return {"message": "Şube zaten favorilerde."}

    # Favori ekleme işlemi
    insert_query = favorite_branches.insert().values(user_id=user_id, branch_id=branch_id)
    await db.execute(insert_query)
    await db.commit()
    return {"message": "Favori şube başarıyla eklendi."}
async def remove_favorite_branch(db: AsyncSession, user_id: int, branch_id: int):
    # Kullanıcı favorisi olup olmadığını kontrol et
    favorite_query = select(favorite_branches).where(
        favorite_branches.c.user_id == user_id,
        favorite_branches.c.branch_id == branch_id
    )
    favorite_result = await db.execute(favorite_query)
    favorite_record = favorite_result.fetchone()  # Favori kaydını al

    if not favorite_record:
        return {"message": "Şube zaten favori değil."}

    # Favori kaydını sil
    delete_query = delete(favorite_branches).where(
        favorite_branches.c.user_id == user_id,
        favorite_branches.c.branch_id == branch_id
    )
    await db.execute(delete_query)
    await db.commit()  # Değişiklikleri asenkron olarak kaydet

    return {"message": "Favori şube başarıyla kaldırıldı."}
async def get_filtered_branches(db: AsyncSession, company_id=None, city=None, district=None):
    """
    Filtreleme kriterlerine göre şubeleri getirir.
    """
    query = select(Branch).options(joinedload(Branch.company))  # Şirket bilgilerini yükle

    if company_id:
        query = query.filter(Branch.company_id == company_id)

    if city:
        query = query.filter(Branch.city.ilike(f"%{city}%"))

    if district:
        query = query.filter(Branch.district.ilike(f"%{district}%"))

    result = await db.execute(query)
    return result.scalars().all()

async def create_excel_file(branches):
    """
    Şube bilgilerini kullanarak bir Excel dosyası oluşturur.
    """
    # Excel dosyasını oluştur
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Şubeler"

    # Başlıkları ekle
    headers = [
        "Şube Adı",
        "Şirket Adı",
        "Şehir",
        "İlçe",
        "Telefon Numarası",
        "Telefon Numarası 2",
        "Şube Notu",
        "Konum Bağlantısı",
        "Oluşturulma Tarihi"
    ]
    sheet.append(headers)

    # Şubeleri Excel'e yaz
    for branch in branches:
        sheet.append([
            branch.branch_name,
            branch.company.name if branch.company else "Bilinmiyor",
            branch.city,
            branch.district,
            branch.phone_number,
            branch.phone_number_2,
            branch.branch_note,
            branch.location_link,
            branch.created_date.strftime("%d/%m/%Y") if branch.created_date else None
        ])

    # Geçici bir dosyaya yaz
    temp_file = NamedTemporaryFile(delete=False, suffix=".xlsx")
    workbook.save(temp_file.name)
    temp_file.close()
    return temp_file.name
async def process_excel_file(file, db: AsyncSession, user_id: int):
    """
    Excel dosyasını işleyerek şubeleri ekler veya günceller.

    Args:
        file: Upload edilen Excel dosyası.
        db: Veritabanı oturumu.
        user_id: Token'dan alınan kullanıcı ID'si.

    Returns:
        dict: İşlem sonucu, eklenen, güncellenen ve eklenmeyen şube sayıları.
    """
    # Excel dosyasını oku
    try:
        # Excel dosyasını oku
        df = pd.read_excel(file.file, dtype=str)  # Excel dosyasını pandas ile oku
        df = df.replace({pd.NA: None, "nan": None})  # Pandas'ın `nan` ve `pd.NA` değerlerini `None` ile değiştir
    except Exception as e:
        raise ValueError("Excel dosyası okunamadı, lütfen dosyayı kontrol edin.")

    required_columns = ["branch_name", "address", "city", "district",
                        "phone_number", "company_id"]
    for column in required_columns:
        if column not in df.columns:
            raise ValueError(f"Excel dosyasında '{column}' sütunu eksik.")

    added_count = 0
    updated_count = 0
    skipped_count = 0

    for index, row in df.iterrows():
        try:
            company_id = int(row["company_id"])  # company_id'yi int'e dönüştür
        except ValueError:
            skipped_count += 1
            continue  # Geçersiz company_id varsa satırı atla

        # Şirket ID'nin varlığını kontrol et
        company = await db.execute(select(Company).filter(Company.id == company_id))
        company = company.scalars().first()

        if not company:
            skipped_count += 1
            continue  # Şirket yoksa bu satır atlanır

        # Şube var mı kontrol et
        existing_branch = await db.execute(
            select(Branch).filter(
                Branch.branch_name == row["branch_name"],
                Branch.city == row["city"],
                Branch.district == row["district"],
                Branch.company_id == company_id
            )
        )
        existing_branch = existing_branch.scalars().first()

        if existing_branch:
            updated = False
            if existing_branch.address != row["address"]:
                existing_branch.address = row["address"]
                updated = True
            if existing_branch.phone_number != row["phone_number"]:
                existing_branch.phone_number = row["phone_number"]
                updated = True
            if existing_branch.phone_number_2 != row.get("phone_number_2"):
                existing_branch.phone_number_2 = row.get("phone_number_2")
                updated = True
            if existing_branch.branch_note != row.get("branch_note"):
                existing_branch.branch_note = row.get("branch_note")
                updated = True
            if existing_branch.location_link != row.get("location_link"):
                existing_branch.location_link = row.get("location_link")
                updated = True

            if updated:
                updated_count += 1
            else:
                skipped_count += 1
        else:
            # Yeni şube ekle
            new_branch = Branch(
                branch_name=row["branch_name"],
                address=row["address"],
                city=row["city"],
                district=row["district"],
                phone_number=row["phone_number"],
                phone_number_2=row.get("phone_number_2"),
                branch_note=row.get("branch_note"),
                location_link=row.get("location_link"),
                company_id=company_id
            )
            db.add(new_branch)
            added_count += 1

    # Veritabanı değişikliklerini kaydet
    await db.commit()

    return {
        "added_count": added_count,
        "updated_count": updated_count,
        "skipped_count": skipped_count
    }
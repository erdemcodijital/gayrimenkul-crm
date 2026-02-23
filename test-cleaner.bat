@echo off
echo ================================================
echo    Google Maps Data Cleaner - Test
echo ================================================
echo.

REM Örnek dosyayı kopyala
if not exist scraped-data.json (
    echo Ornek veri kopyalaniyor...
    copy scraped-data-example.json scraped-data.json
    echo.
)

echo Temizleme basladi...
echo.
node data-cleaner.js

echo.
echo ================================================
echo Sonuclar:
echo ================================================
if exist cleaned-data.json (
    echo [OK] cleaned-data.json olusturuldu
)
if exist cleaned-data.csv (
    echo [OK] cleaned-data.csv olusturuldu
)
if exist duplicates.json (
    echo [OK] duplicates.json olusturuldu
)
if exist invalid-data.json (
    echo [OK] invalid-data.json olusturuldu
)
if exist cleaning-stats.json (
    echo [OK] cleaning-stats.json olusturuldu
)

echo.
echo Tamamlandi! Dosyalari kontrol edin.
echo.
pause

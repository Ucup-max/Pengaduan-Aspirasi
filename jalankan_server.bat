@echo off
title Server Portal Aspirasi Mahasiswa v2.1
echo ========================================================
echo   MENJALANKAN PORTAL ASPIRASI MAHASISWA (NEXT.JS v2)
echo ========================================================
echo.

cd /d "%~dp0web-v2"
set "PATH=D:\;%PATH%"

echo Membuka server di http://localhost:3000 ...
echo Tekan Ctrl+C jika ingin menghentikan server.
echo.

call D:\npm.cmd run dev
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Terjadi kendala saat menjalankan server.
  echo Mencoba alternatif dengan npx next dev --webpack...
  call D:\npx.cmd next dev --webpack
)

pause

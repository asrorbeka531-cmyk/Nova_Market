@echo off
title NOVA Market - Ishga tushirish
echo ===================================================
echo     NOVA Market Onlayn Do'koni Ishga Tushmoqda...
echo ===================================================
python server.py
if errorlevel 1 (
    echo Python server ishlamasa, brauzerda index.html ochilmoqda...
    start index.html
)
pause

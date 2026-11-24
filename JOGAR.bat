@echo off
title VALVULA 77 - MOSH DE ARMA BRANCA
echo ============================================
echo   VALVULA 77 - MOSH DE ARMA BRANCA
echo   Iniciando servidor local na porta 8077...
echo ============================================
start "" http://localhost:8077
python -m http.server 8077
pause

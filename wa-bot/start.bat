@echo off
cd /d "%~dp0"
echo ^[36m=======================================^[0m
echo ^[36m   TCO WhatsApp Bot - Self Hosted^[0m
echo ^[36m=======================================^[0m
echo.
echo ^[33mMemeriksa dependencies...^[0m
if not exist "node_modules" (
    echo ^[33mMenginstall dependencies...^[0m
    npm install
)
echo.
echo ^[32mMenjalankan bot...^[0m
echo ^[90mHealth check: http://localhost:3001/health^[0m
echo ^[90mWebhook:     POST/GET http://localhost:3001/api/trigger-news^[0m
echo.
echo ^[33mTunggu QR code muncul, lalu scan dengan WhatsApp Anda.^[0m
echo.
npx tsx src/index.ts
pause

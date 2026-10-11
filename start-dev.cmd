@echo off
cd /d "%~dp0backend"
start "booking-backend" cmd /k "npm run dev"
cd /d "%~dp0frontend"
start "booking-frontend" cmd /k "npm run dev"
echo.
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:5000/api/v1
echo.

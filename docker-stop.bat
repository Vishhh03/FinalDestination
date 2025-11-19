@echo off
echo Stopping Hotel Booking System containers...
docker-compose down

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ All containers stopped successfully!
) else (
    echo.
    echo ❌ Failed to stop containers!
    exit /b 1
)

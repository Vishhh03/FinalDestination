@echo off
echo Building Docker Image...
echo ========================

cd finaldestination

docker build -t hotel-booking-api:latest .

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Docker image built successfully!
    echo.
    echo To run the container:
    echo   docker run -p 5000:80 -p 5001:443 hotel-booking-api:latest
    echo.
    echo Or use docker-compose:
    echo   cd ..
    echo   docker-compose up
) else (
    echo.
    echo Docker build failed!
    exit /b 1
)

cd ..

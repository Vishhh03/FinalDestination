@echo off
echo Starting Hotel Booking System with Monitoring...
echo ==================================================
echo.
echo Application Services:
echo   - SQL Server (Database)    : Port 1433
echo   - Backend API (ASP.NET)    : Port 5000
echo   - Frontend (Nginx)         : Port 8080
echo.
echo Monitoring Services:
echo   - Prometheus (Metrics)     : Port 9090
echo   - Grafana (Dashboards)     : Port 3000
echo   - Elasticsearch (Logs)     : Port 9200
echo   - Kibana (Log Analysis)    : Port 5601
echo.
echo Starting 7 containers...
docker-compose up -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ All containers started successfully!
    echo.
    echo Application:
    echo   Frontend:  http://localhost:8080
    echo   Backend:   http://localhost:5000
    echo   Swagger:   http://localhost:8080/swagger
    echo.
    echo Monitoring:
    echo   Prometheus: http://localhost:9090
    echo   Grafana:    http://localhost:3000 (admin/admin)
    echo   Kibana:     http://localhost:5601
    echo.
    echo View logs: docker-compose logs -f
    echo Stop:      docker-compose down
) else (
    echo.
    echo ❌ Failed to start containers!
    echo Check Docker Desktop is running
    exit /b 1
)

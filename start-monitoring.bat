@echo off
echo ========================================
echo Hotel Booking System - Production Stack
echo ========================================
echo.
echo Starting services with monitoring...
echo.

docker-compose -f docker-compose.prod.yml up -d

echo.
echo ========================================
echo Services Starting...
echo ========================================
echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak > nul

echo.
echo ========================================
echo Service URLs:
echo ========================================
echo.
echo Application:
echo   Frontend:  http://localhost:8080
echo   Backend:   http://localhost:5000
echo   API Docs:  http://localhost:5000/swagger
echo   Health:    http://localhost:5000/health
echo.
echo Monitoring:
echo   Grafana:      http://localhost:3000 (admin/admin)
echo   Prometheus:   http://localhost:9090
echo   Kibana:       http://localhost:5601
echo   Metrics:      http://localhost:5000/metrics
echo.
echo ========================================
echo Checking service status...
echo ========================================
echo.

docker-compose -f docker-compose.prod.yml ps

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To view logs: docker-compose -f docker-compose.prod.yml logs -f
echo To stop:      docker-compose -f docker-compose.prod.yml down
echo.
echo For detailed monitoring guide, see: deployment/MONITORING_SETUP.md
echo.
pause

@echo off
echo Running Unit Tests...
echo ========================

REM Clean previous test results
if exist finaldestination.tests\TestResults rmdir /s /q finaldestination.tests\TestResults

REM Run tests with coverage
dotnet test finaldestination.tests\finaldestination.tests.csproj ^
  --configuration Release ^
  --logger "trx;LogFileName=test-results.trx" ^
  --collect:"XPlat Code Coverage" ^
  --results-directory .\finaldestination.tests\TestResults

if %ERRORLEVEL% EQU 0 (
    echo.
    echo All tests passed!
    echo.
    echo Test results: finaldestination.tests\TestResults\test-results.trx
    echo Coverage report: finaldestination.tests\TestResults\*\coverage.cobertura.xml
) else (
    echo.
    echo Tests failed!
    exit /b 1
)

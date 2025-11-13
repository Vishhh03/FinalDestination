#!/bin/bash

echo "🧪 Running Unit Tests..."
echo "========================"

# Clean previous test results
rm -rf finaldestination.tests/TestResults

# Run tests with coverage
dotnet test finaldestination.tests/finaldestination.tests.csproj \
  --configuration Release \
  --logger "trx;LogFileName=test-results.trx" \
  --collect:"XPlat Code Coverage" \
  --results-directory ./finaldestination.tests/TestResults

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo ""
    echo "📊 Test results: finaldestination.tests/TestResults/test-results.trx"
    echo "📈 Coverage report: finaldestination.tests/TestResults/*/coverage.cobertura.xml"
else
    echo ""
    echo "❌ Tests failed!"
    exit 1
fi

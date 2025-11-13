# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["finaldestination.csproj", "./"]
RUN dotnet restore "finaldestination.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "finaldestination.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "finaldestination.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Create non-root user
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

COPY --from=publish /app/publish .

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:80/health || exit 1

ENTRYPOINT ["dotnet", "finaldestination.dll"]

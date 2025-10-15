# Troubleshooting Guide: Smart Hotel Booking System

> Common issues and their solutions

## Table of Contents

- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [API Request Issues](#api-request-issues)
- [Performance Issues](#performance-issues)
- [Development Environment Issues](#development-environment-issues)
- [Common Error Messages](#common-error-messages)
- [Debugging Tips](#debugging-tips)

## Database Issues

### Cannot Connect to Database

**Symptoms**:
- "Cannot open database" error
- "A network-related or instance-specific error occurred"
- Application fails to start

**Solutions**:

1. **Check LocalDB Installation**:
   ```bash
   sqllocaldb info
   ```
   If not installed, download SQL Server Express with LocalDB.

2. **Start LocalDB Instance**:
   ```bash
   sqllocaldb start mssqllocaldb
   ```

3. **Verify Connection String**:
   Check `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinalDestinationDB;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

4. **Use In-Memory Database** (temporary solution):
   Set in `appsettings.Development.json`:
   ```json
   {
     "UseLocalDb": false
   }
   ```

### Database Migration Errors

**Symptoms**:
- "Pending model changes" errors
- Schema mismatch errors
- Entity Framework errors

**Solutions**:

1. **Reset Database**:
   ```bash
   dotnet ef database drop
   dotnet ef database update
   ```

2. **Delete and Recreate**:
   ```bash
   sqllocaldb delete mssqllocaldb
   sqllocaldb create mssqllocaldb
   dotnet run
   ```

3. **Clear EF Cache**:
   ```bash
   dotnet ef migrations remove
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

### Sample Data Not Loading

**Symptoms**:
- Empty database after startup
- No sample users/hotels
- Login credentials don't work

**Solutions**:

1. **Check Logs**:
   Look for DataSeeder errors in console output.

2. **Enable Detailed Logging**:
   ```json
   {
     "Logging": {
       "LogLevel": {
         "FinalDestinationAPI.Services.DataSeeder": "Debug"
       }
     }
   }
   ```

3. **Manual Reset**:
   ```bash
   sqllocaldb delete mssqllocaldb
   dotnet run
   ```

## Authentication Issues

### 401 Unauthorized Errors

**Symptoms**:
- "Unauthorized" responses
- JWT token not accepted
- Protected endpoints inaccessible

**Solutions**:

1. **Check Token Format**:
   ```
   Correct: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Wrong:   Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Wrong:   Authorization: Bearer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Verify Token Expiration**:
   - Decode token at https://jwt.io/
   - Check 'exp' claim (Unix timestamp)
   - Login again if expired

3. **Check JWT Configuration**:
   ```json
   {
     "Jwt": {
       "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLongForJWTTokenGeneration!",
       "Issuer": "FinalDestination",
       "Audience": "FinalDestinationUsers",
       "ExpiryInHours": 24
     }
   }
   ```

4. **Get Fresh Token**:
   ```bash
   curl -X POST "https://localhost:5001/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@hotel.com", "password": "Admin123!"}'
   ```

### JWT Key Validation Errors

**Symptoms**:
- "SecurityTokenInvalidSignatureException"
- "IDX10503: Signature validation failed"
- Token validation errors

**Solutions**:

1. **Verify Key Length**:
   - Must be at least 32 characters (256 bits)
   - Check both generation and validation use same key

2. **Check Key Consistency**:
   - Same key in all environment configs
   - No extra spaces or characters
   - Proper escaping in JSON

3. **Reset Configuration**:
   ```json
   {
     "Jwt": {
       "Key": "NewSuperSecretKeyThatIsAtLeast32CharactersLongForJWTTokenGeneration!"
     }
   }
   ```

### 403 Forbidden Errors

**Symptoms**:
- "Forbidden" responses
- "Insufficient permissions"
- Role-based endpoints inaccessible

**Solutions**:

1. **Check User Role**:
   ```bash
   curl -X GET "https://localhost:5001/api/auth/me" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Verify Role Requirements**:
   - Admin endpoints require Admin role
   - Hotel management requires HotelManager or Admin
   - Check controller attributes

3. **Use Correct Test Account**:
   ```
   Admin:         admin@hotel.com / Admin123!
   Hotel Manager: manager@hotel.com / Manager123!
   Guest:         guest@example.com / Guest123!
   ```

## API Request Issues

### 400 Bad Request - Validation Errors

**Symptoms**:
- "Validation failed" messages
- Model binding errors
- Required field errors

**Solutions**:

1. **Check JSON Format**:
   ```json
   // Correct
   {
     "name": "John Doe",
     "email": "john@example.com"
   }
   
   // Wrong - missing quotes
   {
     name: "John Doe",
     email: john@example.com
   }
   ```

2. **Verify Content-Type Header**:
   ```
   Content-Type: application/json
   ```

3. **Check Required Fields**:
   - Review API documentation for required fields
   - Ensure all required fields are provided
   - Check field formats (email, phone, etc.)

4. **Validate Field Lengths**:
   - Name: max 100 characters
   - Email: valid email format
   - Password: min 8 characters

### 404 Not Found Errors

**Symptoms**:
- "Resource not found" messages
- Incorrect endpoint URLs
- ID-based endpoints failing

**Solutions**:

1. **Verify Endpoint URLs**:
   ```
   Correct: GET /api/hotels
   Wrong:   GET /api/hotel
   
   Correct: GET /api/hotels/1
   Wrong:   GET /api/hotels/id/1
   ```

2. **Check Resource IDs**:
   - Verify resource exists in database
   - Use valid IDs from sample data
   - Check for typos in ID

3. **Use Swagger UI**:
   - Navigate to https://localhost:5001/swagger
   - Browse available endpoints
   - Test with provided examples

### CORS Errors

**Symptoms**:
- "CORS policy" errors in browser
- Cross-origin request blocked
- Preflight request failures

**Solutions**:

1. **Development Environment**:
   CORS is enabled by default in development.

2. **Check Configuration**:
   ```csharp
   // In Program.cs
   app.UseCors("DevelopmentPolicy");
   ```

3. **Production Setup**:
   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("ProductionPolicy", policy =>
       {
           policy.WithOrigins("https://yourdomain.com")
                 .AllowAnyMethod()
                 .AllowAnyHeader();
       });
   });
   ```

## Performance Issues

### Slow API Responses

**Symptoms**:
- Long response times
- Timeout errors
- Poor user experience

**Solutions**:

1. **Check Caching**:
   ```bash
   # First request (slower - database)
   curl -w "Time: %{time_total}s\n" "https://localhost:5001/api/hotels"
   
   # Second request (faster - cache)
   curl -w "Time: %{time_total}s\n" "https://localhost:5001/api/hotels"
   ```

2. **Enable Query Logging**:
   ```json
   {
     "Logging": {
       "LogLevel": {
         "Microsoft.EntityFrameworkCore.Database.Command": "Information"
       }
     }
   }
   ```

3. **Monitor Database Queries**:
   - Check logs for slow queries
   - Verify indexes are used
   - Look for N+1 query problems

4. **Clear Cache**:
   ```bash
   # Restart application
   dotnet run
   ```

### Memory Issues

**Symptoms**:
- OutOfMemoryException
- Application crashes
- High memory usage

**Solutions**:

1. **Reduce Cache Expiration**:
   ```json
   {
     "Cache": {
       "DefaultExpirationMinutes": 10,
       "HotelCacheExpirationMinutes": 5
     }
   }
   ```

2. **Monitor Memory**:
   - Use Task Manager or Activity Monitor
   - Check for memory leaks
   - Review custom code for issues

## Development Environment Issues

### Port Conflicts

**Symptoms**:
- "Port already in use" errors
- Application fails to start
- Connection refused errors

**Solutions**:

1. **Find Process Using Port**:
   ```bash
   # Windows
   netstat -ano | findstr :5001
   
   # Kill process
   taskkill /PID <process_id> /F
   ```

2. **Change Port**:
   Edit `Properties/launchSettings.json`:
   ```json
   {
     "applicationUrl": "https://localhost:7001;http://localhost:5001"
   }
   ```

### SSL Certificate Issues

**Symptoms**:
- SSL certificate warnings
- HTTPS connection errors
- Certificate trust issues

**Solutions**:

1. **Trust Certificate**:
   ```bash
   dotnet dev-certs https --trust
   ```

2. **Regenerate Certificate**:
   ```bash
   dotnet dev-certs https --clean
   dotnet dev-certs https --trust
   ```

### Hot Reload Not Working

**Symptoms**:
- Changes not reflected
- Must restart manually
- File watching problems

**Solutions**:

1. **Use Watch Mode**:
   ```bash
   dotnet watch run
   ```

2. **Check File Permissions**:
   - Ensure files not read-only
   - Check antivirus interference
   - Verify file system permissions

## Common Error Messages

### "The ConnectionString property has not been initialized"

**Cause**: Missing or incorrect connection string

**Solution**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinalDestinationDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### "Unable to resolve service for type"

**Cause**: Dependency injection not configured

**Solution**:
```csharp
// Check Program.cs
builder.Services.AddScoped<IServiceInterface, ServiceImplementation>();
```

### "Sequence contains no elements"

**Cause**: Query returning no results when expecting one

**Solution**:
- Use `FirstOrDefault()` instead of `First()`
- Check if data exists
- Verify sample data is seeded

### "A task was canceled"

**Cause**: Request timeout or cancellation

**Solution**:
- Check for long-running operations
- Verify database connectivity
- Increase timeout if necessary

## Debugging Tips

### Enable Detailed Logging

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information",
      "FinalDestinationAPI": "Debug"
    }
  }
}
```

### Use Swagger UI for Testing

1. Navigate to https://localhost:5001/swagger
2. Click "Authorize" button
3. Enter JWT token: `Bearer <your-token>`
4. Test endpoints with examples

### Check Application Logs

- View console output for errors
- Look for stack traces
- Check Entity Framework query logs

### Verify Sample Data

```bash
# Check if sample data loaded
curl "https://localhost:5001/api/hotels"

# Should return 6 hotels
# If empty, check DataSeeder logs
```

### Test Authentication Flow

```bash
# 1. Register
curl -X POST "https://localhost:5001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com", "password": "Test123!", "role": "Guest"}'

# 2. Login
curl -X POST "https://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'

# 3. Use token
curl -X GET "https://localhost:5001/api/auth/me" \
  -H "Authorization: Bearer <token>"
```

### Database Inspection

```bash
# Connect with SSMS
Server: (localdb)\mssqllocaldb
Database: FinalDestinationDB
Authentication: Windows Authentication

# Or use sqlcmd
sqlcmd -S "(localdb)\mssqllocaldb" -d FinalDestinationDB -E
```

### Performance Monitoring

```bash
# Monitor response times
curl -w "Time: %{time_total}s\n" "https://localhost:5001/api/hotels"

# Check memory in Task Manager
# Monitor CPU usage
```

## Getting Help

If issues persist:

1. **Check Documentation**:
   - [Setup Guide](SETUP_GUIDE.md)
   - [API Reference](API_REFERENCE.md)
   - [Architecture](ARCHITECTURE.md)

2. **Review Logs**:
   - Console output
   - Application logs
   - Database logs

3. **Verify Environment**:
   - .NET 8 SDK installed
   - SQL Server LocalDB running
   - Correct configuration

4. **Test with Swagger**:
   - Use Swagger UI for testing
   - Verify endpoints work
   - Check request/response formats

5. **Contact Support**:
   - Open GitHub issue
   - Provide error messages
   - Include steps to reproduce

## Verification Checklist

- [ ] .NET 8 SDK installed and working
- [ ] SQL Server LocalDB installed and running
- [ ] Project builds without errors
- [ ] Database connection successful
- [ ] Application starts on correct ports
- [ ] Swagger UI accessible
- [ ] Sample data loaded
- [ ] Authentication working
- [ ] API endpoints responding

---

**Still having issues?** Check the [Setup Guide](SETUP_GUIDE.md) or open an issue on GitHub.

**Last Updated**: October 2025


## Common Frontend Issues

### Problem: "Cannot connect to API" or CORS errors

**Symptoms:**
- Error: "Access to fetch at 'file:///C:/api/hotels' has been blocked by CORS"
- Error: "Cannot connect to API"  
- Opening `index.html` directly shows errors

**Cause:** Opening `index.html` directly from file system (`file://` protocol)

**Solution:**
```bash
# Always run the API first
cd finaldestination
dotnet run

# Then open in browser: https://localhost:5001
```

**⚠️ Never** double-click `index.html` - always access through the running API server at https://localhost:5001!

The frontend is served automatically by the API and will work correctly when accessed through the web server.

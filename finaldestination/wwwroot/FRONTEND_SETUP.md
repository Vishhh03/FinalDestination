# Frontend Setup Guide

## 🚀 How to Run the Frontend

You have **two options** for running the frontend:

### **Option 1: Served from API (Recommended) ✅**

The frontend is automatically served by the ASP.NET Core API.

1. **Start the API**:

   ```bash
   cd finaldestination
   dotnet run
   ```

2. **Open in browser**:

   ```
   https://localhost:5001
   ```

3. **That's it!** The frontend will work perfectly with relative API URLs.

**⚠️ Important**: **Don't open `index.html` directly!** Opening the file with `file://` protocol causes CORS errors. Always run `dotnet run` first.

---

### **Option 2: Using Live Server (Development)**

If you want to use VS Code Live Server for frontend development:

1. **Start the API first**:

   ```bash
   cd finaldestination
   dotnet run
   ```

   Make sure it's running on `https://localhost:5001`

2. **Open `wwwroot/index.html` with Live Server**:

   - Right-click on `index.html`
   - Select "Open with Live Server"
   - It will open on `http://localhost:5500`

3. **The frontend will automatically detect** it's running on Live Server and use the full API URL (`https://localhost:5001/api`)

---

## 🔧 Configuration

The frontend automatically detects which port it's running on:

- **Port 5001 or 5000**: Uses relative URLs (`/api`)
- **Port 5500, 5501, or 3000**: Uses full URL (`https://localhost:5001/api`)

This is configured in `js/config.js`:

```javascript
baseURL: (() => {
  const port = window.location.port;
  if (port === "5500" || port === "5501" || port === "3000") {
    return "https://localhost:5001/api";
  }
  return "/api";
})();
```

---

## ⚠️ Troubleshooting

### **404 Error: Cannot find API**

**Problem**: Getting 404 errors when trying to load hotels or other data.

**Solution**:

1. Make sure the API is running:

   ```bash
   cd finaldestination
   dotnet run
   ```

2. Verify the API is accessible:

   - Open `https://localhost:5001` in your browser
   - You should see the Swagger UI

3. Check the browser console for the actual URL being called

---

### **CORS Error**

**Problem**: Getting CORS policy errors in the console.

**Solution**: The API already has CORS enabled for development. Make sure you're running the API in Development mode.

---

### **SSL Certificate Error**

**Problem**: Browser shows SSL certificate warning.

**Solution**: Trust the development certificate:

```bash
dotnet dev-certs https --trust
```

---

### **API Not Running**

**Problem**: "Cannot connect to API" error.

**Solution**:

1. Start the API:

   ```bash
   cd finaldestination
   dotnet run
   ```

2. Wait for the message:

   ```
   Now listening on: https://localhost:5001
   ```

3. Then refresh your frontend

---

## 📝 Default Test Accounts

Use these accounts to test the application:

### **Admin Account**

- Email: `admin@hotel.com`
- Password: `Admin123!`
- Can: Approve hotel manager applications, manage all data

### **Hotel Manager Account**

- Email: `manager@hotel.com`
- Password: `Manager123!`
- Can: Create and manage hotels

### **Guest Account**

- Email: `guest@example.com`
- Password: `Guest123!`
- Can: Book hotels, write reviews, earn loyalty points

---

## 🎯 Quick Start Checklist

- [ ] API is running on `https://localhost:5001`
- [ ] Browser can access `https://localhost:5001` (Swagger UI loads)
- [ ] SSL certificate is trusted
- [ ] Frontend is opened (either from API or Live Server)
- [ ] Browser console shows no errors

---

## 🔍 Checking API Status

### **Method 1: Browser**

Open `https://localhost:5001` - you should see Swagger UI

### **Method 2: cURL**

```bash
curl https://localhost:5001/api/hotels
```

### **Method 3: Browser Console**

```javascript
fetch("https://localhost:5001/api/hotels")
  .then((r) => r.json())
  .then(console.log);
```

---

## 💡 Development Tips

### **Hot Reload**

- **API**: Use `dotnet watch run` for automatic restart on code changes
- **Frontend**: Use Live Server for automatic browser refresh on file changes

### **Debugging**

- **API**: Use Visual Studio debugger or VS Code with C# extension
- **Frontend**: Use browser DevTools (F12)

### **API Documentation**

- Swagger UI: `https://localhost:5001`
- All endpoints documented with examples

---

## 🚀 Production Deployment

For production, the frontend should be served from the API:

1. Build the API:

   ```bash
   dotnet publish -c Release
   ```

2. The frontend files in `wwwroot` are automatically included

3. Deploy the published output to your server

4. The frontend will use relative URLs automatically

---

## 📞 Need Help?

If you're still having issues:

1. Check the browser console (F12) for errors
2. Check the API console for errors
3. Verify the API is running: `https://localhost:5001`
4. Try the recommended Option 1 (served from API)
5. Clear browser cache and try again

---

**Recommended Setup**: Use Option 1 (served from API) for the smoothest experience!

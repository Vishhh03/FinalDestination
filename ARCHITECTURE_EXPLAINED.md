# Architecture Explained - Angular 20 + ASP.NET Core

## Current Setup

### Two Separate Applications

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Setup                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │   Angular Frontend   │      │  ASP.NET Core API    │   │
│  │   (ClientApp/)       │◄────►│  (finaldestination/) │   │
│  │                      │      │                      │   │
│  │  Port: 4200          │      │  Port: 5001          │   │
│  │  npm start           │      │  dotnet run          │   │
│  └──────────────────────┘      └──────────────────────┘   │
│           │                              │                  │
│           │                              │                  │
│           └──────── HTTP Proxy ──────────┘                  │
│              /api → https://localhost:5001/api              │
└─────────────────────────────────────────────────────────────┘
```

## What is wwwroot?

### Before (Old Setup)
```
wwwroot/
├── index.html          # Main HTML file
├── app/                # AngularJS files
├── css/                # Stylesheets
└── js/                 # JavaScript files

ASP.NET Core served these files directly
```

### Now (Current Setup)
```
wwwroot/
└── .gitkeep           # Empty folder (kept for future)

Angular CLI dev server handles everything
```

## Why wwwroot is Empty Now

### Development Mode (Current)
- **Angular CLI** runs on `http://localhost:4200`
- **ASP.NET Core** runs on `https://localhost:5001`
- Angular proxies API calls to backend
- No need for wwwroot

### Production Mode (Future)
When you deploy, you'll:
1. Build Angular: `npm run build`
2. Copy `dist/hotel-frontend/browser/*` to `wwwroot/`
3. ASP.NET Core serves the built Angular app

## Current File Structure

```
FinalDestination/
├── finaldestination/              # Backend (ASP.NET Core)
│   ├── Controllers/               # API endpoints
│   ├── Services/                  # Business logic
│   ├── Data/                      # Database context
│   ├── Models/                    # Data models
│   ├── Program.cs                 # Backend startup
│   └── wwwroot/                   # EMPTY (for now)
│       └── .gitkeep
│
└── finaldestination/ClientApp/    # Frontend (Angular 20)
    ├── src/
    │   ├── app/
    │   │   ├── components/        # Reusable components
    │   │   ├── pages/             # Page components
    │   │   ├── services/          # API services
    │   │   ├── models/            # TypeScript interfaces
    │   │   ├── guards/            # Route guards
    │   │   └── interceptors/      # HTTP interceptors
    │   ├── styles.css             # Global styles
    │   └── index.html             # HTML entry point
    ├── angular.json               # Angular config
    ├── package.json               # Dependencies
    └── proxy.conf.json            # API proxy config
```

## How They Communicate

### API Proxy Configuration
```json
// proxy.conf.json
{
  "/api": {
    "target": "https://localhost:5001",
    "secure": false,
    "changeOrigin": true
  }
}
```

When Angular makes a request to `/api/hotels`:
1. Angular dev server intercepts it
2. Forwards to `https://localhost:5001/api/hotels`
3. Backend processes and responds
4. Angular receives the response

## Running the Application

### Development (Current)

**Terminal 1 - Backend:**
```bash
cd finaldestination
dotnet run
```
Output: `Now listening on: https://localhost:5001`

**Terminal 2 - Frontend:**
```bash
cd finaldestination/ClientApp
npm start
```
Output: `Angular Live Development Server is listening on localhost:4200`

**Browser:**
Open `http://localhost:4200`

### Production (Future Deployment)

**Step 1: Build Angular**
```bash
cd finaldestination/ClientApp
npm run build
```

**Step 2: Copy to wwwroot**
```bash
copy dist/hotel-frontend/browser/* ../wwwroot/
```

**Step 3: Update Program.cs**
```csharp
// Add back static files
app.UseDefaultFiles();
app.UseStaticFiles();

// Fallback to index.html for SPA routing
app.MapFallbackToFile("index.html");
```

**Step 4: Run**
```bash
cd finaldestination
dotnet run
```

Now everything runs on `https://localhost:5001`

## Benefits of Current Setup

### ✅ Development
- **Hot Reload**: Changes reflect instantly
- **Fast Compilation**: Angular CLI optimized
- **Better Debugging**: Source maps, dev tools
- **Separate Concerns**: Frontend and backend independent

### ✅ Production
- **Single Deployment**: One server, one port
- **Optimized Build**: Minified, tree-shaken
- **CDN Ready**: Static files can be served from CDN
- **SEO Friendly**: Server-side rendering possible

## Can You Remove wwwroot?

### Short Answer
**Keep the folder, but it stays empty during development.**

### Why Keep It?
1. **ASP.NET Core expects it** (convention)
2. **Future production builds** will go there
3. **No harm in keeping it** (just has .gitkeep)

### What Was Removed?
✅ Old AngularJS files  
✅ Old JavaScript files  
✅ Old HTML files  
✅ Everything except .gitkeep  

## Summary

| Aspect | Old Setup | New Setup |
|--------|-----------|-----------|
| Frontend | AngularJS in wwwroot | Angular 20 in ClientApp |
| Language | JavaScript | TypeScript |
| Dev Server | ASP.NET Core | Angular CLI |
| Hot Reload | No | Yes |
| Build Tool | None | Angular CLI |
| wwwroot | Full of files | Empty (.gitkeep) |
| Ports | 5001 only | 4200 (dev) + 5001 (api) |

## Next Steps

1. ✅ wwwroot is cleaned (only .gitkeep remains)
2. ✅ Program.cs updated (no static files in dev)
3. ✅ Angular 20 running on port 4200
4. ✅ Backend running on port 5001
5. ✅ Proxy configured for API calls

**You're all set! The wwwroot folder is now just a placeholder for future production builds.**

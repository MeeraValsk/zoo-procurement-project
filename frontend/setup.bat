@echo off
echo 🚀 Setting up Zoo Procurement Hub...
echo.

REM Create .env file for backend
echo # MongoDB Connection > backend\.env
echo # For local MongoDB: >> backend\.env
echo MONGODB_URI=mongodb://localhost:27017/zoo-procure-hub >> backend\.env
echo. >> backend\.env
echo # For MongoDB Atlas (replace with your connection string): >> backend\.env
echo # MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/zoo-procure-hub?retryWrites=true&w=majority >> backend\.env
echo. >> backend\.env
echo # JWT Secret Key >> backend\.env
echo JWT_SECRET=zoo-procure-super-secret-jwt-key-2024 >> backend\.env
echo. >> backend\.env
echo # Server Port >> backend\.env
echo PORT=3000 >> backend\.env

echo ✅ Created backend\.env file
echo.
echo 📋 Next Steps:
echo 1. Choose your MongoDB option:
echo    a) Local MongoDB: Install and start MongoDB locally
echo    b) MongoDB Atlas: Create free account and get connection string
echo.
echo 2. Update backend\.env with your MongoDB connection string
echo.
echo 3. Install dependencies:
echo    npm install
echo    cd backend ^&^& npm install
echo.
echo 4. Seed the database:
echo    cd backend ^&^& node scripts\seedData.js
echo.
echo 5. Start the application:
echo    Backend: cd backend ^&^& npm run dev
echo    Frontend: npm run dev
echo.
echo 6. Open http://localhost:5173 and login with:
echo    Staff: staff1@zoo.com / password123
echo    Supplier: supplier1@greenfeed.com / password123
echo    Admin: admin1@zoo.com / password123
echo    Invoice: invoice1@zoo.com / password123
echo.
echo 🎉 Happy coding!
pause

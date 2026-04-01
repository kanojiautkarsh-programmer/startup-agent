@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\Admin\Documents\StartUp Agent"
rmdir /s /q node_modules\cmdk 2>nul
rmdir /s /q .next 2>nul
npm install
npm run build

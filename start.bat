@echo off

cd /d "C:\Users\psydu\brainrot\server"
start cmd /k "npm start"

cd /d "C:\Users\psydu\brainrot\client"
start cmd /k "npm start"

timeout /t 2 /nobreak >nul

start msedge "http://localhost:5174"

:: start cmd /k "ngrok http --url=tahr-precious-lemur.ngrok-free.app 5174"

@echo off

cd /d "C:\Users\aaron\brain-rot-6000\server"
start cmd /k "npm start"

cd /d "C:\Users\aaron\brain-rot-6000\client"
start cmd /k "npm start"

timeout /t 2 /nobreak >nul

start msedge "http://localhost:5174"

:: start cmd /k "ngrok http --url=tahr-precious-lemur.ngrok-free.app 5174"

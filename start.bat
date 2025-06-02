@echo off
rem — Change to your server folder and launch "npm run server" in a new window
cd /d "C:\Users\aaron\brain-rot-6000\server"
start cmd /k "npm start"

rem — Change to your client folder and launch "npm run client" in a new window
cd /d "C:\Users\aaron\brain-rot-6000\client"
start cmd /k "npm start"

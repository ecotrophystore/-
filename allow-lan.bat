@echo off
echo ========================================================
echo  Porkkalai Thiruvizha - LAN Setup (Run as Administrator)
echo ========================================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrator privileges required!
    echo.
    echo Right-click this file and choose "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [1/3] Removing old rules if any...
netsh advfirewall firewall delete rule name="Vite LAN Port 5173" >nul 2>&1
netsh advfirewall firewall delete rule name="Node.js LAN Inbound" >nul 2>&1

echo [2/3] Allowing port 5173 on ALL network profiles...
netsh advfirewall firewall add rule name="Vite LAN Port 5173" dir=in action=allow protocol=TCP localport=5173 profile=any
if %errorLevel% neq 0 (
    echo [FAILED] Port rule failed.
    pause
    exit /b 1
)

echo [3/3] Allowing Node.js inbound connections...
netsh advfirewall firewall add rule name="Node.js LAN Inbound" dir=in action=allow program="C:\Program Files\nodejs\node.exe" profile=any

set LED_URL=http://192.168.1.47:5173/
echo.
echo ========================================================
echo [SUCCESS] Firewall is now open on your local network!
echo.
echo On your second PC, open Chrome or Edge and type:
echo.
echo    %LED_URL%
echo    (Add ?role=led at the end for LED Screen)
echo.
echo    192.168.1.47:5173/?role=led
echo ========================================================
echo.
pause

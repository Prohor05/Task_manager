@echo off
REM Build Aurora Tasks Windows installer (.exe)
call npm install
call npm run dist
echo Installer is in dist-electron\

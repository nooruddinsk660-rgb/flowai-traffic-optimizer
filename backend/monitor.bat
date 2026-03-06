@echo off
:loop
cls
echo Monitoring FlowAI Intersection Redis Keys...
echo Press Ctrl+C to stop
echo --------------------------------------------
"C:\Program Files\Redis\redis-cli.exe" MGET CP_01:state AIIMS_01:state INA_01:state SAK_01:state NEHRU_01:state ROHINI_01:state
timeout /t 2 >nul
goto loop

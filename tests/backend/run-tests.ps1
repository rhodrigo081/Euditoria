Write-Host "Executando suite de testes automatizados do Backend Euditoria..." -ForegroundColor Cyan
$env:JAVA_HOME = "C:\Users\rhodr\.jdks\openjdk-24.0.1"
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\plugins\maven\lib\maven3\bin\mvn.cmd" test -f ..\..\src\app\pom.xml
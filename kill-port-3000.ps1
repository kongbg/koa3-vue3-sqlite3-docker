# Kill process using port 3000
$ports = netstat -ano | findstr :3000

if ($ports) {
    # Extract process ID and kill process
    $ports | ForEach-Object {
        $processId = ($_ -split '\s+')[-1]
        Write-Host "Killing process $processId"
        taskkill /PID $processId /F
    }
} else {
    Write-Host "No process found using port 3000"
}

# Configuration
$BackupDir = "./backups"
$DbUrl = $env:DATABASE_URL
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir/cropnet_backup_$Timestamp.sql"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

Write-Host "Starting PostgreSQL database backup..."
if ($DbUrl) {
    # Run pg_dump command
    & pg_dump $DbUrl > $BackupFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backup completed successfully! Saved to: $BackupFile" -ForegroundColor Green
        # Cleanup backups older than 7 days
        Get-ChildItem $BackupDir -Filter "cropnet_backup_*.sql" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force
        Write-Host "Old backups cleaned up." -ForegroundColor Gray
    } else {
        Write-Error "Error: pg_dump execution failed."
    }
} else {
    Write-Error "Error: DATABASE_URL environment variable is not defined."
}

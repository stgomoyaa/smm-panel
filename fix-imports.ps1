# Script para actualizar todos los imports
$files = Get-ChildItem -Path "app\api" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Cambiar next/auth a next-auth/next
    $content = $content -replace "from 'next/auth'", "from 'next-auth/next'"
    
    # Cambiar authOptions import path
    $content = $content -replace "from '@/app/api/auth/\[\.\.\./nextauth\]/route'", "from '@/lib/auth'"
    
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Updated all imports successfully!"

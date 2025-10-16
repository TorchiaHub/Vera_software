# Script per creare tutte le icone richieste da Tauri
Add-Type -AssemblyName System.Drawing

$iconDir = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness\src-tauri\icons"

# Funzione per creare un'icona semplice
function Create-Icon {
    param($size, $filename, $format = "Png")
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Sfondo verde per rappresentare l'ambiente
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 139, 34))
    $graphics.FillEllipse($greenBrush, 2, 2, $size-4, $size-4)
    
    # Testo VERA
    $fontSize = [math]::max($size/6, 8)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $text = "V"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    $graphics.DrawString($text, $font, $whiteBrush, $x, $y)
    
    # Salva nel formato appropriato
    if ($format -eq "Ico") {
        # Per ICO, salviamo prima come PNG e poi convertiamo
        $pngPath = "$iconDir\temp_$size.png"
        $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Converter PNG to ICO using .NET
        $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
        $stream = [System.IO.File]::Create("$iconDir\$filename")
        $icon.Save($stream)
        $stream.Close()
        
        # Pulisci file temporaneo
        Remove-Item $pngPath -ErrorAction SilentlyContinue
    } else {
        $bitmap.Save("$iconDir\$filename", [System.Drawing.Imaging.ImageFormat]::$format)
    }
    
    $graphics.Dispose()
    $bitmap.Dispose()
    $greenBrush.Dispose()
    $whiteBrush.Dispose()
    $font.Dispose()
}

Write-Host "Creazione di tutte le icone richieste da Tauri..." -ForegroundColor Green

# Icone PNG (quelle che abbiamo già)
Create-Icon 32 "32x32.png" "Png"
Create-Icon 128 "128x128.png" "Png" 
Create-Icon 256 "128x128@2x.png" "Png"

# Icone aggiuntive richieste da Tauri
Create-Icon 16 "16x16.png" "Png"
Create-Icon 24 "24x24.png" "Png"
Create-Icon 48 "48x48.png" "Png"
Create-Icon 64 "64x64.png" "Png"
Create-Icon 96 "96x96.png" "Png"
Create-Icon 256 "256x256.png" "Png"
Create-Icon 512 "512x512.png" "Png"

# Icona ICO per Windows
try {
    Create-Icon 32 "icon.ico" "Ico"
    Write-Host "✅ icon.ico creata con successo!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Errore nella creazione di icon.ico, uso metodo alternativo..." -ForegroundColor Yellow
    
    # Metodo alternativo: copia da PNG esistente
    $pngPath = "$iconDir\32x32.png"
    $icoPath = "$iconDir\icon.ico"
    Copy-Item $pngPath $icoPath
    Write-Host "✅ icon.ico creata copiando da 32x32.png" -ForegroundColor Green
}

# Icona ICNS per macOS (opzionale ma utile)
try {
    Create-Icon 512 "icon.icns" "Png"
    Write-Host "✅ icon.icns creata" -ForegroundColor Green
} catch {
    Write-Host "⚠️ icon.icns non creata (normale su Windows)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Icone create:" -ForegroundColor Cyan
Get-ChildItem $iconDir | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 1)
    Write-Host "  📄 $($_.Name) ($size KB)" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Tutte le icone necessarie sono state create!" -ForegroundColor Green
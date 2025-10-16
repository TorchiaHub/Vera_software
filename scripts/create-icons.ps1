# Script per generare icone VERA usando .NET Drawing
Add-Type -AssemblyName System.Drawing

$iconDir = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness\src-tauri\icons"

# Funzione per creare un'icona semplice
function Create-Icon {
    param($size, $filename)
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Sfondo verde per rappresentare l'ambiente
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 139, 34))
    $graphics.FillEllipse($greenBrush, 5, 5, $size-10, $size-10)
    
    # Testo VERA
    $font = New-Object System.Drawing.Font("Arial", [math]::max($size/8, 8), [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $text = "V"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    $graphics.DrawString($text, $font, $whiteBrush, $x, $y)
    
    $bitmap.Save("$iconDir\$filename", [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    $greenBrush.Dispose()
    $whiteBrush.Dispose()
    $font.Dispose()
}

# Crea le icone in diverse dimensioni
Create-Icon 32 "32x32.png"
Create-Icon 128 "128x128.png"
Create-Icon 256 "128x128@2x.png"

Write-Host "Icone create con successo in $iconDir"
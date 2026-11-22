param([string]$OutputDirectory = (Join-Path $PSScriptRoot '..\public'))

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $OutputDirectory)) {
  New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}
$OutputDirectory = (Resolve-Path -LiteralPath $OutputDirectory).Path

function New-RoundedRectanglePath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-IconPngBytes([int]$size) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $background = [System.Drawing.Color]::FromArgb(255, 25, 25, 25)
  $orange = [System.Drawing.Color]::FromArgb(255, 255, 102, 0)
  $keyhole = [System.Drawing.Color]::FromArgb(255, 39, 28, 21)

  $backgroundPath = New-RoundedRectanglePath ($size * 0.06) ($size * 0.06) ($size * 0.88) ($size * 0.88) ($size * 0.19)
  $backgroundBrush = New-Object System.Drawing.SolidBrush($background)
  $graphics.FillPath($backgroundBrush, $backgroundPath)

  $shacklePen = New-Object System.Drawing.Pen($orange, [Math]::Max(1.5, $size * 0.085))
  $shacklePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $shacklePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($shacklePen, $size * 0.31, $size * 0.20, $size * 0.38, $size * 0.43, 180, 180)
  $graphics.DrawLine($shacklePen, $size * 0.31, $size * 0.415, $size * 0.31, $size * 0.51)
  $graphics.DrawLine($shacklePen, $size * 0.69, $size * 0.415, $size * 0.69, $size * 0.51)

  $bodyPath = New-RoundedRectanglePath ($size * 0.22) ($size * 0.43) ($size * 0.56) ($size * 0.37) ($size * 0.075)
  $orangeBrush = New-Object System.Drawing.SolidBrush($orange)
  $graphics.FillPath($orangeBrush, $bodyPath)

  $keyholeBrush = New-Object System.Drawing.SolidBrush($keyhole)
  $graphics.FillEllipse($keyholeBrush, $size * 0.455, $size * 0.555, $size * 0.09, $size * 0.09)
  $graphics.FillRectangle($keyholeBrush, $size * 0.48, $size * 0.62, $size * 0.04, $size * 0.09)

  $stream = New-Object System.IO.MemoryStream
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $bytes = $stream.ToArray()

  $stream.Dispose()
  $keyholeBrush.Dispose()
  $orangeBrush.Dispose()
  $bodyPath.Dispose()
  $shacklePen.Dispose()
  $backgroundBrush.Dispose()
  $backgroundPath.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  return ,$bytes
}

[byte[]]$masterBytes = New-IconPngBytes 512
[System.IO.File]::WriteAllBytes((Join-Path $OutputDirectory 'icon.png'), $masterBytes)

$sizes = @(16, 20, 24, 32, 40, 48, 64, 128, 256)
$images = New-Object 'System.Collections.Generic.List[byte[]]'
foreach ($size in $sizes) { $images.Add([byte[]](New-IconPngBytes $size)) }
$iconStream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($iconStream)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$images.Count)
$offset = 6 + (16 * $images.Count)
for ($i = 0; $i -lt $images.Count; $i++) {
  $dimension = if ($sizes[$i] -eq 256) { 0 } else { $sizes[$i] }
  $writer.Write([byte]$dimension)
  $writer.Write([byte]$dimension)
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([uint16]1)
  $writer.Write([uint16]32)
  $writer.Write([uint32]$images[$i].Length)
  $writer.Write([uint32]$offset)
  $offset += $images[$i].Length
}
foreach ($image in $images) { $writer.Write($image) }
$writer.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $OutputDirectory 'icon.ico'), $iconStream.ToArray())
$writer.Dispose()
$iconStream.Dispose()

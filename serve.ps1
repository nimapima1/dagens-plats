# Enkel lokal webbserver för Dagens Plats. Startas via start.bat.
param([int]$Port = 8123, [switch]$NoBrowser)

$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() }
catch {
  Write-Host "Kunde inte starta servern på port $Port. Är den upptagen? Stäng andra fönster med servern och försök igen." -ForegroundColor Red
  exit 1
}

$url = "http://localhost:$Port/"
Write-Host "Dagens Plats körs på $url"
Write-Host "Tryck Ctrl+C eller stäng fönstret för att avsluta."
if (-not $NoBrowser) { Start-Process $url }

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '') { $rel = 'index.html' }
      $file = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
      # Servera bara filer som ligger i projektmappen
      if ($file.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        if ($types.ContainsKey($ext)) { $ctx.Response.ContentType = $types[$ext] }
        $ctx.Response.Headers.Add('Cache-Control', 'no-store')
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $ctx.Response.StatusCode = 404
      }
    } catch {
      $ctx.Response.StatusCode = 500
    } finally {
      $ctx.Response.Close()
    }
  }
} finally {
  $listener.Stop()
}

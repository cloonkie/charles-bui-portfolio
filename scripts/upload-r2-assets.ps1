param(
  [string]$Bucket = "buisite",
  [string]$Source = "r2-upload\assets",
  [string]$CacheControl = "public, max-age=86400"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Source)) {
  throw "Source folder not found: $Source"
}

function Get-ContentType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".webp" { "image/webp"; break }
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".png" { "image/png"; break }
    ".gif" { "image/gif"; break }
    ".svg" { "image/svg+xml"; break }
    ".mp4" { "video/mp4"; break }
    ".pdf" { "application/pdf"; break }
    ".css" { "text/css; charset=utf-8"; break }
    ".js" { "text/javascript; charset=utf-8"; break }
    ".html" { "text/html; charset=utf-8"; break }
    default { "application/octet-stream" }
  }
}

$sourceRoot = (Resolve-Path -LiteralPath $Source).Path
$sourceRootName = Split-Path -Leaf $sourceRoot
$files = Get-ChildItem -LiteralPath $sourceRoot -Recurse -File
$total = $files.Count
$index = 0

foreach ($file in $files) {
  $index += 1
  $relativePath = [System.IO.Path]::GetRelativePath($sourceRoot, $file.FullName)
  $objectKey = "$sourceRootName/$($relativePath -replace "\\", "/")"
  $contentType = Get-ContentType -Path $file.FullName

  Write-Host "[$index/$total] Uploading $objectKey"

  npx wrangler r2 object put "$Bucket/$objectKey" `
    --file "$($file.FullName)" `
    --content-type "$contentType" `
    --cache-control "$CacheControl" `
    --remote
}

Write-Host "Uploaded $total files to R2 bucket '$Bucket'."

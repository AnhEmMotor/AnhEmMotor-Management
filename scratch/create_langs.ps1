$langs = "ara", "de", "el", "fra", "it", "jp", "kor", "nl", "pl", "pt", "rom", "ru", "spa", "swe"
foreach ($lang in $langs) {
    Copy-Item -Path "src\locales\langs\vi.json" -Destination "src\locales\langs\$lang.json"
}
Write-Host "Created 14 language files."

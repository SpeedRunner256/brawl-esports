# Function to prompt user for environment variables
function Get-EnvVariables {
    $envVariables = @{}

    Write-Host "`n=== Discord Bot Configuration ===" -ForegroundColor Cyan

    $envVariables["DISCORD_TOKEN"] = Read-Host "Enter Discord Bot Token"
    $envVariables["CLIENT_ID"] = Read-Host "Enter Client ID"
    $envVariables["GUILD_TOKEN"] = Read-Host "Enter Guild ID"
    $envVariables["LIQUID_TOKEN"] = Read-Host "Enter Liquid Token"

    return $envVariables
}

# Get environment variables from user
$envVariables = Get-EnvVariables

# Create .env file with user input
$envContent = @"
DISCORD_TOKEN=$($envVariables["DISCORD_TOKEN"])
CLIENT_ID=$($envVariables["CLIENT_ID"])
GUILD_ID=$($envVariables["GUILD_ID"])
LIQUID_TOKEN=$($envVariables["LIQUID_TOKEN"])
"@

# Create .env file
Set-Content -Path ".env" -Value $envContent

# Create db directory
New-Item -Path "db" -ItemType "directory" -Force

# Create JSON files in the db directory
$jsonFiles = @(
    "brawler.json",
    "map.json",
    "match.json",
    "player.json",
    "team.json",
    "prediction.json"
    "economy.json",
    "puns.json"
)

foreach ($file in $jsonFiles) {
    New-Item -Path "db\$file" -ItemType "file" -Force
}

Write-Host "`nFile structure and .env configuration created successfully!" -ForegroundColor Green
Write-Host "Created files:"
Write-Host "- .env file with your configuration"
Write-Host "- db folder with the following files:"
foreach ($file in $jsonFiles) {
    Write-Host "  - $file"
}

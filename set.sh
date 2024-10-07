#!/bin/bash

echo -e "\n=== Discord Bot Configuration ==="

# Prompt for environment variables
read -p "Enter Discord Bot Token: " DISCORD_TOKEN
read -p "Enter Client ID: " CLIENT_ID
read -p "Enter Guild Token: " GUILD_TOKEN
read -p "Enter Liquid Token: " LIQUID_TOKEN

# Create .env file with the values
cat > .env << EOF
DISCORD_TOKEN=$DISCORD_TOKEN
CLIENT_ID=$CLIENT_ID
GUILD_TOKEN=$GUILD_TOKEN
LIQUID_TOKEN=$LIQUID_TOKEN
EOF

# Create db directory
mkdir -p db

# Create JSON files in the db directory
json_files=(
    "brawler.json"
    "map.json"
    "match.json"
    "player.json"
    "team.json"
    "prediction.json"
)

# Create each JSON file
for file in "${json_files[@]}"; do
    touch "db/$file"
done

# Print success message
echo -e "\nFile structure and .env configuration created successfully!"
echo "Created files:"
echo "- .env file with your configuration"
echo "- db folder with the following files:"
for file in "${json_files[@]}"; do
    echo "  - $file"
done
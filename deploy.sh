#!/bin/bash

# Configuration variables
LOCAL_DIR="dist/"               # Path to your local site build directory
REMOTE_USER="root"              # SSH username for the server
REMOTE_HOST="ssh.hslpicker.com" # Hostname or IP of the server
REMOTE_DIR="../var/www/brandon/hslpicker.com/html"

# Step 1: Build the site
echo "Starting site build..."
if yarn build; then
	echo "Build succeeded. Proceeding with sync..."
else
	echo "Build failed. Aborting deployment."
	exit 1
fi

# Step 2: Sync the files
echo "Syncing files to the server..."
rsync -avz --exclude='**/.DS_Store' --delete -e "ssh" "$LOCAL_DIR" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"

# Step 3: Check sync status
if [ $? -eq 0 ]; then
	echo "Sync completed successfully."
else
	echo "Error occurred during sync."
	exit 1
fi

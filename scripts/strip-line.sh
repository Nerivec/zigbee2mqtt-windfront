#!/bin/bash

# Script to remove a single line (by number) from all files in a directory

if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <directory> <line_number>"
    echo "Example: $0 /path/to/files 5"
    exit 1
fi

directory="$1"
line_number="$2"

# Validate directory exists
if [[ ! -d "$directory" ]]; then
    echo "Error: Directory '$directory' does not exist."
    exit 1
fi

# Validate line_number is a positive integer
if ! [[ "$line_number" =~ ^[0-9]+$ ]] || [[ "$line_number" -eq 0 ]]; then
    echo "Error: Line number must be a positive integer."
    exit 1
fi

# Process each file in the directory
for file in "$directory"/*; do
    # Skip if not a regular file
    if [[ ! -f "$file" ]]; then
        continue
    fi
    
    # Use sed to delete the specified line
    sed -i "${line_number}d" "$file"
    
    if [[ $? -eq 0 ]]; then
        echo "Processed: $file"
    else
        echo "Error processing: $file"
    fi
done

echo "Done!"

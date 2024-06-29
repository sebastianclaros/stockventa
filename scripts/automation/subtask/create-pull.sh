#!/bin/bash
# Script crea un Issue
# Recibe:
# 1) Titulo del Pull

script_full_path=$(dirname "$0")
source "$script_full_path/library.sh"

branchName=$(git branch --show-current)
issueNumber=$(echo $branchName | cut -d "/" -f 2)
issueType=$(echo $branchName | cut -d "/" -f 1)

# Step 1) Guardian de argumentos
if [ -z "$1" ]; then  
    title="solves #$issueNumber"
else 
    title="$1"
fi

node "$script_full_path/create-pull.mjs" $title $branchName
if [ $? -ne 0 ]; then
    exit 1;
fi

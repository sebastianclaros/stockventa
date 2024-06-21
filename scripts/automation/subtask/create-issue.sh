#!/bin/bash
# Script crea un Issue
# Recibe:
# 1) Titulo del Issue
# 2) Issue Type

script_full_path=$(dirname "$0")
source "$script_full_path/library.sh"


# Step 1) Guardian de argumentos
if [ -z "$1" ]; then  
    doExit "Falta el Titulo del Issue"
else 
    title="$1"
fi

if [ -n "$2" ]; then  
    issueType="$2"
fi

node "$script_full_path/create-issue.mjs" $title $issueType
if [ $? -ne 0 ]; then
    exit 1;
fi

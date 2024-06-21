#!/bin/bash
# Script para listar los requerimientos
# 1) Titulo del Issue
# 2) Issue Type 

script_full_path=$(dirname "$0")
source "$script_full_path/subtask/library.sh"


# Step 1) Guardian de argumentos
if [ -z "$1" ]; then  
    doExit "Falta el Titulo del Issue"
else 
    title="$1"
fi

if [ -n "$2" ]; then
    issueType="$2"
fi

# Guardian de Argumentos
if [ -z "${GITHUB_TOKEN}" ]; then
    doExit "Falta la var de entorno que tiene el token de Github (GITHUB_TOKEN). Para crear uno lea index.md" ;
fi

node "$script_full_path/subtask/create-issue.mjs" $title $issueType
if [ $? -ne 0 ]; then
    exit 1;
fi

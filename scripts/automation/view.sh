#!/bin/bash
# Script para listar los requerimientos
# 1) Filtro si es un numero es el issue, sino es el estado 

script_full_path=$(dirname "$0")
source "$script_full_path/subtask/library.sh"
branchName=$(git branch --show-current)

# Obtiene del current branch los datos:
issueType=$(echo $branchName | cut -d "/" -f 1)
issueNumber=$(echo $branchName | cut -d "/" -f 2)

# Guardian de Argumentos
if [ -z "${GITHUB_TOKEN}" ]; then
    doExit "Falta la var de entorno que tiene el token de Github (GITHUB_TOKEN). Para crear uno lea index.md" ;
fi

node "$script_full_path/subtask/list-issues.mjs" issue "$issueNumber"
if [ $? -ne 0 ]; then
    exit 1;
fi

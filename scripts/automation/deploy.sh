#!/bin/bash
# Script para automatizar las acciones cuando se finaliza un requerimiento
# Recibe:

script_full_path=$(dirname "$0")
source "$script_full_path/subtask/library.sh"
branchName=$(git branch --show-current)

# Guardian de Argumentos
if [ -z "${GITHUB_TOKEN}" ]; then
    doExit "Falta la var de entorno que tiene el token de Github (GITHUB_TOKEN. Para crear uno lea index.md" ;
fi

# Obtiene del current branch los datos:
issueType=$(echo $branchName | cut -d "/" -f 1)
issueNumber=$(echo $branchName | cut -d "/" -f 2)

doInfo "No esta desarrollada esta accion"
#!/bin/bash
# Script para automatizar las acciones cuando se finaliza un requerimiento
# Recibe:
# 1) El issue Number a cambiar

script_full_path=$(dirname "$0")
source "$script_full_path/subtask/library.sh"
branchName=$(git branch --show-current)

# Obtiene del current branch los datos:
issueNumberActual=$(echo $branchName | cut -d "/" -f 2)

# Guardian de Argumentos
if [ -z "${GITHUB_TOKEN}" ]; then
    doExit "Falta la var de entorno que tiene el token de Github (GITHUB_TOKEN). Para crear uno lea index.md" ;
fi

if [ -z "$1" ]; then  
    doExit "Falta el Issue Number" ;
else 
    issueNumber="$1"
fi


doInfo "[INICIO] del script de switch de requerimiento"

# VALIDA QUE NO QUEDEN COSAS PENDIENTES
# Si no esta en la branch intenta crear la branch nueva

# Step 1) Actualiza la documentacion
doInfo "[STEP 1] UPDATE DOCUMENTACION"
$script_full_path/subtask/update-doc.sh 
if [ $? -ne 0 ]; then
    doError "No se pudo actualizar la documentacion";
fi

# Step 2) Valida si la scracth tiene cambios y no fueron bajados al repo 
doInfo "[STEP 2] VALIDA SCRATCH NO TENGA CAMBIOS"
$script_full_path/subtask/validate-scratch.sh $branchName
if [ $? -ne 0 ]; then
    doExit "Hay cambios en la scratch. Para bajarlos sf org retrieve start";
fi

# Step 3) 
doInfo  "[STEP 3] Chequea si hay algo sin commitear"
cambios=$(git status --porcelain=v1 2>/dev/null | wc -l)
if [ "$cambios" -ne 0 ]; then 
    doExit  "Tiene modificaciones pendientes ($cambios)"
fi

# Step 4) Cambia de Branch
doInfo "[STEP 4] CAMBIA LA BRANCH"
git checkout -b $newBranch
if [ $? -ne 0 ]; then
    doExit "No se pudo mover al branch $newBranch. Hagalo manualmente (git checkout -b $newBranch)"
fi

# Step 5) Baja cambios de Main
git fetch
#git merge origin/main

# Step 6) Cambia de scratch
doInfo "[STEP 6] CAMBIA LA SCRATCH"
sf force config set target-org $newScratchName
if [ $? -ne 0 ]; then
    doExit "No se pudo mover al scratch $newScratchName. Hagalo manualmente (sf force config set target-org $newScratchName)"
fi

# Step 7) Deploy por si hubo cambios en main
doInfo "[STEP 7] Subiendo el codigo"
sf project deploy start --target-org $newScratchName
if [ $? -ne 0 ]; then
    doExit "No se pudo subir el codigo"
fi



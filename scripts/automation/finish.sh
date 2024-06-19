#!/bin/bash
# Script para automatizar las acciones cuando se termina el desarrollo de un requerimiento

script_full_path=$(dirname "$0")
source "$script_full_path/subtask/library.sh"
branchName=$(git branch --show-current)
# Recibe:

# Obtiene del current branch los datos:
issueType=$(echo $branchName | cut -d "/" -f 1)
issueNumber=$(echo $branchName | cut -d "/" -f 2)

# Guardian de Argumentos
if [ -z "${GITHUB_TOKEN}" ]; then
    doExit "Falta la var de entorno que tiene el token de Github (GITHUB_TOKEN). Para crear uno lea index.md" ;
fi

# finish.sh
# ├── validate-scratch.sh 
# ├── validate-code.sh
# ├── update-doc.sh
# ├── publish-branch.sh
# ├── create-pull-request.sh ('main')
# ├── move-issue.sh ( issueNumber, 'Completed' )
# ├── deploy-code.sh ( issueNumber, 'qa')
# ├── sanity-test.sh( 'qa')
# └── drop-scracth.sh 

# Variables

##
# CUERPO DEL COMANDO
##

# Si no esta en la branch intenta crear la branch nueva
doInfo "[INICIO] del script de finalizacion de un requerimiento $branchName"

if [ $issueType == 'feature' ]; then 
    # Step 1) Actualiza la documentacion
    doInfo "[UPDATE DOCUMENTACION]"
    $script_full_path/subtask/update-doc.sh 
    if [ $? -ne 0 ]; then
        doError "No se pudo actualizar la documentacion";
    fi

    # Step 2) Valida si la scracth tiene cambios y no fueron bajados al repo 
    doInfo "[VALIDA SCRATCH NO TENGA CAMBIOS]"
    $script_full_path/subtask/validate-scratch.sh $branchName
    if [ $? -ne 0 ]; then
        doExit "Hay cambios en la scratch. Para bajarlos sf org retrieve start";
    fi

    # Step 3) 
    doInfo "[VALIDA CODIGO]"
    $script_full_path/subtask/validate-code.sh 
    if [ $? -ne 0 ]; then
        doExit "Fallo el script de calidad y validacion de codigo";
    fi
fi


# Step 4) 
doInfo "[PUBLICA LA BRANCH]"
$script_full_path/subtask/publish-branch.sh 
if [ $? -ne 0 ]; then
    doExit "No se pudo publicar la branch";
fi

if [ $issueType == 'feature' ]; then 
    # Step 5) 
    doInfo "[ELIMINA LA SCRATCH]"
    $script_full_path/subtask/drop-scratch.sh 
fi

doInfo "[FIN] del script de finalizacion del requerimiento $branchName"

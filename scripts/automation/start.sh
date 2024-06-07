#!/bin/bash
# Script para automatizar las acciones cuando se arranca un requerimiento nuevo
# Recibe:
# 1) El issue Number del Repositorio. Obligatorio
# 2) El issue Type (feature, fix, docs, release). Opcional por omision toma feature

#start.sh (issueNumber, nombreDelRequerimiento, dias=7)
#├── validate-issue.sh ( issueNumber, 'Ready')
#├── create-branch.sh ( issueNumber, nombreDelRequerimiento)
#├── move-issue.sh ( issueNumber, 'In Progress')
#├── assign-user-issue.sh ( issueNumber, me )
#├── assign-branch-issue.sh ( issueNumber, branch )
#└── create-scracth.sh ( issueNumber, nombreDelRequerimiento, dias)


script_full_path=$(dirname "$0")
source "$script_full_path/subtask/library.sh"

# Guardian de Argumentos
if [ -z "$1" ]; then  
    doExit "Falta el Issue Number" ;
else 
    issueNumber="$1"
fi

if [ -z "$2" ]; then  
    issueType="feature"
else 
    issueType="$2"
fi


##
# CUERPO DEL COMANDO
##

doInfo "[INICIO] del script de comienzo del requerimiento $issueNumber"

# Step 1) Valida que Issue este en la Columna Ready
doInfo "[VALIDA ISSUE ESTE EN Ready]"
$script_full_path/subtask/validate-issue.sh $issueNumber Ready
if [ $? -ne 0 ]; then
    doExit "Por favor verifique que el issue $issueNumber este en la columna Ready $?"
fi

branchName="$issueType/$issueNumber"

# Step 2) Crea la Branch
doInfo "[CREA LA BRANCH]"
$script_full_path/subtask/create-branch.sh $branchName
if [ $? -ne 0 ]; then
    doExit "Fallo crear la branch"
fi

# Step 3) Mueve el issue a In Progress
doInfo "[MOVE ISSUE TO IN PROGRESS]"
$script_full_path/subtask/move-issue.sh $issueNumber 'In Progress' 
if [ $? -ne 0 ]; then
    doExit "No se pudo mover el issue a inprogress, hagalo manualmente"
fi

# Step 4) Me Asigna el issue 
doInfo "[ASSIGN ISSUE TO ME]"
$script_full_path/subtask/assign-user-issue.sh $issueNumber 
if [ $? -ne 0 ]; then
    doExit "No se pudo pudo asignar el user ($userEmail) al issue. Por favor hagalo manualmente"
fi

# Step 5) PONER LA BRANCH EN EL ISSUE
current_branch=$(git branch --show-current)
doInfo "[ASSIGN BRANCH TO ISSUE]"
$script_full_path/subtask/assign-branch-issue.sh $issueNumber $current_branch 
if [ $? -ne 0 ]; then
    doExit "No se pudo asignar la branch $current_branch al issue $issueNumber. Hagalo manualmente"
fi

# Step 6) Crea la Scracth Org
doInfo "[CREA LA SCRATCH]"
$script_full_path/subtask/create-scratch.sh $branchName 
if [ $? -ne 0 ]; then
    doExit "Fallo crear la scratch"
fi

doInfo "[FIN] del script de comienzo del requerimiento $issueType"

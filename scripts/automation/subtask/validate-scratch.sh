#!/bin/bash
# Script se fija si hay cambios en la scracth que no fueron bajados a la branch

script_full_path=$(dirname "$0")
source "$script_full_path/library.sh"

#sf project retrieve start
hayCambios=$(sf project retrieve preview)

if [[ $hayCambios == *"No files will be deleted"* ]] && [[ $hayCambios == *"No files will be retrieved"* ]] && [[ $hayCambios == *"No conflicts found"* ]]; then
    doInfo "No hay cambios"
else
    doInfo "$hayCambios"
    doExit "Hay cambios en la Org que no estan impactados $hayCambios"
fi
#!/bin/bash
# Script Actualizar la documentacion

script_full_path=$(dirname "$0")
source "$script_full_path/library.sh"

yarn doc:create metadata --r


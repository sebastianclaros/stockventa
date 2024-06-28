## Subir datos inciales


````
sf data tree import --plan=data/plan.json
````

## Subir altas

````
sf data upsert bulk --sobject Material__c --file data/altas.csv --external-id Id
````

## Subir altas de importados

````
sf data upsert bulk --sobject Material__c --file data/altas-importados.csv --external-id Id
````

## Subir movimientos entre sucursales

````
sf data upsert bulk --sobject Material__c --file data/movimientos-sucursal.csv --external-id Serial__c
````
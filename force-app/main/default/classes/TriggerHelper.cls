public with sharing class TriggerHelper {
    final static String ERROR_FIELD_CANT_BE_MODIFIED = 'No es posible modificar el/los campo/s {0}';

    static public void validateFieldsUnchanged( Map<Id,SObject> newMap,  Map<Id,SObject> oldMap, String[] fieldNames ) {
        for( SObject record: newMap.values()){
            List<String> changedFields = new List<String>();
            for ( String fieldName :fieldNames ){
                Object newValue = record.get(fieldName);
                Object oldValue = oldMap.get(record.Id).get(fieldName);
                if ( oldValue != newValue ){
                    changedFields.add(fieldName);
                }
            }
            if (changedFields.size() > 0){
            	String fieldNameChanges = String.join(changedFields,',');
                record.addError( String.format(ERROR_FIELD_CANT_BE_MODIFIED, new string[] {fieldNameChanges} ) );
            }
        }
}

    static public void validateFieldUnchanged( Map<Id,SObject> newMap,  Map<Id,SObject> oldMap, String fieldName ) {
        validateFieldsUnchanged(newMap, oldMap, new String[]{fieldName});
    }

    static public List<SObject> getRecordChanges( Map<Id,SObject> newMap,  Map<Id,SObject> oldMap, String fieldName ) {
        List<SObject> changeRecords = new List<SObject>();
        for( SObject record: newMap.values()){
            Object newValue = record.get(fieldName);
            Object oldValue = oldMap.get(record.Id).get(fieldName);
            if ( oldValue != newValue ){
                changeRecords.add(record);
            }
        }
        return changeRecords;
    }

    static public Set<Object> getFieldsFromSObjects(List<SObject> records, String fieldName) {
        Set<Object> values = new Set<Object>();
        for( SObject record: records){
            Object fieldValue = record.get(fieldName);
            if ( fieldValue != null ){
                values.add(fieldValue);
            }
        }
        return values;
    }
        
    static public Set<Id> getIdsFromSObjects(List<SObject> records, String fieldName) {
        Set<Id> values = new Set<Id>();
        for( SObject record: records){
            Id fieldValue = (Id) record.get(fieldName);
            if ( fieldValue != null ){
                values.add(fieldValue);
            }
        }
        return values;
    }

    static public Map<String, Id> getExternalMap(String objectName, String externalField, Set<Object> values) {
        List<String> valueList = new  List<String> ();
        for (Object v : values) {
            valueList.add(v.toString());
        }
        return getExternalMap(objectName, externalField, valueList);
    }

    static public Map<String, Id> getExternalMap(String objectName, String externalField, List<String> values) {
        String query = String.format('SELECT Id, {0} FROM {1} WHERE {0} IN : values ', new string[]{externalField, objectName} ); 
        System.debug(query);
        List<SObject> records = Database.query(query);
        Map<String, Id> retMap = new Map<String, Id>(); 
        for (SObject r : records ) {
            retMap.put((String)r.get(externalField), r.Id);
        }
        return retMap;
    }
}
public with sharing class MaterialTriggerHelper {
    final static String ERROR_NMU_DOES_NOT_EXIST = 'El NMU {0} no existe';
    final static String ERROR_WERKS_DOES_NOT_EXIST = 'El werks {0} no existe';
    
    public static void completarProducto(List<Material__c> materiales) {
        Set<Object> nmu = TriggerHelper.getFieldsFromSObjects(materiales, 'NMU__c');
        Map<String, Id> nmuMap = TriggerHelper.getExternalMap('Product2', 'NMU__c', nmu);

        for ( Material__c material : materiales) {
            if ( nmuMap.containsKey(material.NMU__c) ) {
                material.Product__c = nmuMap.get(material.NMU__c);
            } else {
                material.addError(  ERROR_NMU_DOES_NOT_EXIST.format( new String[]{ material.NMU__c} ) );
            }
        }
    }        

    public static void completarBusinessSite(List<Material__c> materiales) {
        Set<Object> businessSites = TriggerHelper.getFieldsFromSObjects(materiales, 'Werks__c');
        Map<String, Id> businessSitesMap = TriggerHelper.getExternalMap('BusinessSite__c', 'Werks__c', businessSites);

        for ( Material__c material : materiales) {
            if ( businessSitesMap.containsKey(material.Werks__c)) {
                material.BusinessSite__c = businessSitesMap.get(material.Werks__c);
            } else {
                material.addError(  ERROR_WERKS_DOES_NOT_EXIST.format( new String[]{ material.Werks__c} ) );
            }
        }
    }        

}
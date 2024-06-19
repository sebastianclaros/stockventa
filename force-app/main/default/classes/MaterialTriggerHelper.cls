public with sharing class MaterialTriggerHelper {

    
    public static void completarProducto(List<Material__c> materiales) {
        Set<Object> nmu = TriggerHelper.getFieldsFromSObjects(materiales, 'NMU__c');
        Map<String, Id> nmuMap = TriggerHelper.getExternalMap('Product2', 'NMU__c', nmu);

        for ( Material__c material : materiales) {
            if ( nmuMap.containsKey(material.NMU__c) ) {
                material.Product__c = nmuMap.get(material.NMU__c);
            } else {
                material.addError( 'El NMU ' + material.NMU__c + ' no existe' );
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
                material.addError( 'El werks ' + material.Werks__c + ' no existe' );
            }
        }
    }        

}
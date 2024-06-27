
@IsTest
public with sharing class MaterialTriggerTest {

    @TestSetup
    static void createNMUyWerks() {
        TestDataFactory.makeProductos(true, 5);    
        TestDataFactory.makeBusinessSite(true, 5);    
    }

    @IsTest 
    static void testAltaDeMateriales() {
        
        List<Material__c> materiales = new List<Material__c>();
        
        Product2 p1= TestDataFactory.getProductos().values().get(0);
        Product2 p2= TestDataFactory.getProductos().values().get(1);

        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);
        BusinessSite__c b2= TestDataFactory.getBusinessSites().values().get(1);

        materiales.add( new Material__c( Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );
        materiales.add( new Material__c( Serial__c = '2', NMU__c =  p2.NMU__c, Werks__c = b2.Werks__c) );
        
        insert materiales;

        List<Inventory__c> inventarios = [SELECT Product__r.NMU__c, BusinessSite__r.Werks__c, Available__c, Total__c FROM Inventory__c];
        System.debug(inventarios);

    }

    static void testMoveMaterialesEntreSucursales() {

    }

    static void testCambiarNMU() {

    }

}
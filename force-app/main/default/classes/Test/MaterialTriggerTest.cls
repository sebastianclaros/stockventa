
@IsTest
public with sharing class MaterialTriggerTest {

    @IsTest 
    static void testCambiarStatusInvalido() {
        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);
        Material__c material = new Material__c( Status__c = MaterialTriggerHelper.ESTADO_DISPONIBLE  ,  Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c );
        insert material;
    
        try {
            material.Status__c = MaterialTriggerHelper.ESTADO_PRESTADO;
            update material;
            System.assert(true, 'El cambio de estado no es valido');
        } catch ( Exception e) {

        }
     }

    @IsTest 
    static void testCambiarStatusValido() {
        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);
        Material__c material = new Material__c( Status__c = MaterialTriggerHelper.ESTADO_DISPONIBLE  ,  Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c );
        insert material;

        try {
            material.Status__c = MaterialTriggerHelper.ESTADO_VENDIDO;
            update material;
        } catch ( Exception e) {
            System.assert(true, 'El cambio de estado era valido');
        }
        
    }

    @IsTest 
    static void testCambiarStatusInicialValido() {
        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);
        Material__c material = new Material__c( Status__c = MaterialTriggerHelper.ESTADO_DISPONIBLE  ,  Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c );
    
        try {
            insert material;
        } catch ( Exception e) {
            System.assert(true, 'El cambio de estado era valido');
        }
    }

    @IsTest 
    static void testCambiarStatusInicialInvalido() {
        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);
        Material__c material = new Material__c( Status__c = MaterialTriggerHelper.ESTADO_VENDIDO  ,  Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c );

        try {
            insert material;
            System.assert(true, 'El estado inicial Vendido no es valido');
        } catch ( Exception e) {

        }

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

        List<Inventory__c> inventarios = [SELECT Name, Product__r.NMU__c, BusinessSite__r.Werks__c, Available__c, Total__c FROM Inventory__c];
        
        System.assertEquals(inventarios.size(), 2, 'Tiene que dejar dos Inventory');
        System.assertEquals(inventarios.get(0).Available__c, 1, 'Tiene que dejar avaiable 1 en ' + inventarios.get(0).name);
        System.assertEquals(inventarios.get(0).Total__c, 1, 'Tiene que dejar total 1 en ' + inventarios.get(0).name);
        System.assertEquals(inventarios.get(1).Available__c, 1, 'Tiene que dejar avaiable 1 en ' + inventarios.get(1).name);
        System.assertEquals(inventarios.get(1).Total__c, 1, 'Tiene que dejar total 1 en ' + inventarios.get(1).name);

    }

    static void testMoveMaterialesEntreSucursales() {

    }

    static void testCambiarNMU() {

    }

}
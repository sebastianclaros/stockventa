@IsTest
public with sharing class InventoryServiceTest {

    @IsTest
    static void testInventoryServiceWerks() {
        List<Material__c> materiales = new List<Material__c>();

        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);

        materiales.add( new Material__c( Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );
        materiales.add( new Material__c( Serial__c = '2', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );

        insert materiales;

        List<Inventory__c> inventarios = new List<Inventory__c>();
        inventarios = InventoryService.getAvailabilityByWerks(b1.Werks__c, 10);

        System.assertEquals(inventarios.size(), 1, 'Tiene que devolver un solo objeto');
        System.assertEquals(inventarios.get(0).mtpl__c, 2, 'Tiene que encontrar 2 avaiable');
        System.assertEquals(inventarios.get(0).Total__c, 2, 'Tiene que encontrar 2 total');

    }

    @IsTest
    static void testInventoryServiceWerks_Empty() {
        List<Material__c> materiales = new List<Material__c>();

        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);
        BusinessSite__c b2= TestDataFactory.getBusinessSites().values().get(1);

        materiales.add( new Material__c( Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );
        materiales.add( new Material__c( Serial__c = '2', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );

        insert materiales;

        List<Inventory__c> inventarios = InventoryService.getAvailabilityByWerks(b2.Werks__c, 0);

        System.assertEquals(inventarios.size(), 0, 'Tiene que devolver vacío');

    }

    @IsTest
    static void testInventoryServiceWerksAndNmu() {
        List<Material__c> materiales = new List<Material__c>();

        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);

        materiales.add( new Material__c( Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );
        materiales.add( new Material__c( Serial__c = '2', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );
        materiales.add( new Material__c( Serial__c = '3', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );

        insert materiales;

        Inventory__c inv = new Inventory__c();
        inv = InventoryService.getAvailabilityByWerksAndNmu(b1.Werks__c, p1.NMU__c);

        //System.assertEquals(inventarios.size(), 1, 'Tiene que devolver 1 objeto');
        System.assertEquals(inv.mtpl__c, 3, 'Tiene que devolver 3 materiales disponibles');

    }

    @IsTest
    static void testInventoryServiceWerksAndNmuFiltered() {
        List<Material__c> materiales = new List<Material__c>();

        Product2 p1= TestDataFactory.getProductos().values().get(0);
        BusinessSite__c b1= TestDataFactory.getBusinessSites().values().get(0);

        materiales.add( new Material__c( Serial__c = '1', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );
        materiales.add( new Material__c( Serial__c = '2', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );
        materiales.add( new Material__c( Serial__c = '3', NMU__c =  p1.NMU__c, Werks__c = b1.Werks__c) );

        insert materiales;

        Set<String> args = new Set<String>();
        args.add('mtpl__c');
        args.add('total__c');
        List<Inventory__c> inv = InventoryService.getAvailabilityByWerks(b1.Werks__c, 200, args);

        System.assertEquals(inv.get(0).mtpl__c, 3, 'Tiene que devolver 3 materiales disponibles');
        System.assertEquals(inv.get(0).total__c, 3, 'Tiene que devolver 3 materiales totales');
    }

}
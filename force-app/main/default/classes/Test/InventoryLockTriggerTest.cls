@IsTest
public with sharing class InventoryLockTriggerTest {

//    intentar reservar por encima del disponible
//    intentar reservar por justo el disponible
//    intentar reservar por con reservas by serial
//    reservas en bulkP

    @IsTest 
    static void testLiberacionBulk() {
        Map<String,Material__c> materiales= TestDataFactory.getMateriales();
        Map<Id, Inventory__c> inventarios = new Map<Id, Inventory__c>([SELECT Id, LockedByQuantity__c,  mtpl__c, Available__c, Total__c FROM Inventory__c]);
        List<InventoryLock__c> reservas = new List<InventoryLock__c>(); 
        Inventory__c i1 = inventarios.values().get(0);
        Inventory__c i2 = inventarios.values().get(1);
        
        // Reserva el total el 1 y 2
        reservas.add( new InventoryLock__c(Inventory__c = i1.Id, quantity__c = i1.mtpl__c )  );
        reservas.add( new InventoryLock__c(Inventory__c = i2.Id, quantity__c = i1.mtpl__c )  );
        insert reservas;

        // Libera las reservas
        delete [select id from InventoryLock__c];

        AggregateResult[] results = [SELECT SUM(LockedByQuantity__c) locked, SUM(mtpl__c) mtpl, SUM(Total__c) total FROM Inventory__c];

        System.assertEquals((Integer)results[0].get('locked'), 0);
        System.assertEquals((Integer)results[0].get('mtpl'), results[0].get('total'));
    }

    @IsTest 
    static void testReservasBulk() {
        Map<String,Material__c> materiales= TestDataFactory.getMateriales();
        Map<Id, Inventory__c> inventarios = new Map<Id, Inventory__c>([SELECT Id, LockedByQuantity__c,  mtpl__c, Available__c, Total__c FROM Inventory__c]);
        List<InventoryLock__c> reservas = new List<InventoryLock__c>(); 
        Inventory__c i1 = inventarios.values().get(0);
        Inventory__c i2 = inventarios.values().get(1);
        
        // Reserva el total
        reservas.add( new InventoryLock__c(Inventory__c = i1.Id, quantity__c = i1.mtpl__c )  );
        // Reserva el por encima del total
        reservas.add( new InventoryLock__c(Inventory__c = i2.Id, quantity__c = i1.mtpl__c  + 1)  );
        // Reserva el total de uno previamente reservado
        reservas.add( new InventoryLock__c(Inventory__c = i1.Id, quantity__c = i1.mtpl__c )  );

        Database.SaveResult[] results = Database.insert(reservas, false); 

        System.assertEquals(results.get(0).isSuccess(), true);
        System.assertEquals(results.get(1).isSuccess(), false);
        System.assertEquals(results.get(2).isSuccess(), false);
        
    }




}
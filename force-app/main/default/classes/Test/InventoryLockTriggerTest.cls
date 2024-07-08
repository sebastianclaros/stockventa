@IsTest
public with sharing class InventoryLockTriggerTest {

//    intentar reservar por encima del disponible
//    intentar reservar por justo el disponible
//    intentar reservar por con reservas by serial
//    reservas en bulkP

@IsTest 
static void testReservasBulk() {
    Map<String,Material__c> materiales= TestDataFactory.getMateriales();

    try {
        // Intenta reservar el primero 

        // materiales.get(0).Nmu__c;
        // materiales.get(0).Werks__c;

    } catch ( Exception e) {

    }
 }




}
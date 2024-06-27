trigger InventoryTrigger on Inventory__c  (before insert, before update, before delete
/*,  after insert, after update, after delete,after undelete*/ ) {
    new InventoryTriggerHandler().run();  
}
trigger InventoryLockTrigger on InventoryLock__c  (after insert, before update, after delete,after undelete
/*before insert, after update, before delete*/ ) {
    new InventoryLockTriggerHandler().run();  
}
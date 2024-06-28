trigger MaterialTrigger on Material__c (before insert, before update, after insert, after update, after delete,after undelete
/*, before delete,   */ ) {    
    new MaterialTriggerHandler().run();
}
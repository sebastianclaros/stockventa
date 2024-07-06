public with sharing class InventoryLockTriggerHandler extends BaseTriggerHandler  {
    public override void afterInsert() {
        // Incrementa en las rollup de inventarios segun producto y punto de venta
        InventoryLockTriggerHelper.agregarReserva(Trigger.new );
    }

    public override void beforeUpdate() {
        // No permite que se modifiquen las cantidades
        TriggerHelper.validateFieldsUnchanged(Trigger.newMap, Trigger.oldMap, new String[]{'Quantity__c', 'ExternalId__c'} );
    }

    public override void afterDelete() {
        // Decrementa a las rollup de inventarios segun producto y punto de venta
        InventoryLockTriggerHelper.liberarReserva(Trigger.new);
    }

    public override void afterUndelete() {
        // Incrementa a las rollup de inventarios segun producto y punto de venta
        InventoryLockTriggerHelper.agregarReserva(Trigger.new);
    }

}
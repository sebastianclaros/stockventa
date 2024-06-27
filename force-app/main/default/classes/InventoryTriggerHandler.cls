public with sharing class InventoryTriggerHandler extends BaseTriggerHandler  {
    static final String ERROR_CRUD_SOLO_POR_TRIGGER = 'No esta permitido hacer DML en este objeto';
    public static Boolean flagInventoryTrigger = false;

    public override void beforeInsert() {
        if ( !flagInventoryTrigger ) {
            for( SObject inventory: Trigger.new ){
                inventory.addError( ERROR_CRUD_SOLO_POR_TRIGGER );
            }
        }    
    }

    public override void beforeUpdate() {
        if ( !flagInventoryTrigger ) {
            for( SObject inventory: Trigger.new ){
                inventory.addError( ERROR_CRUD_SOLO_POR_TRIGGER );
            }
        }    
    }

    public override void beforeDelete() {
        if ( !flagInventoryTrigger ) {
            for( SObject inventory: Trigger.new ){
                inventory.addError( ERROR_CRUD_SOLO_POR_TRIGGER );
            }
        }    
    }
}
public with sharing class InventoryLockTriggerHelper {
    final static String ERROR_FALTA_DISPONIBILIDAD = 'No se puede reservar la cantidad {0} por que el maximo disponible es {1}';
    final static String ERROR_DE_INTEGRIDAD = 'El registro de Inventory no corresponde con los bloqueos de cantidad';

    public static Map<Id, Inventory__c> buscarInventarios(List<InventoryLock__c> reservas) {
        Set<Id> inventarios = TriggerHelper.getIdsFromSObjects(reservas, 'Inventory__c');
        return new Map<Id, Inventory__c>([SELECT LockedByQuantity__c, mtpl__c FROM Inventory__c WHERE Id IN :inventarios]);
    }

    public static void agregarReserva(List<InventoryLock__c> reservas) {

        Map<Id, Inventory__c> inventarios = buscarInventarios(reservas);

        for ( InventoryLock__c reserva :reservas ) {
            Inventory__c inventario = inventarios.get( reserva.Inventory__c );

            Double disponibleVenta = inventario.mtpl__c - inventario.LockedByQuantity__c; // Igual que la formula Available
            if ( disponibleVenta  >=  reserva.quantity__c ) {
                inventario.LockedByQuantity__c  += reserva.quantity__c;
            } else {
                reserva.addError( String.format(ERROR_FALTA_DISPONIBILIDAD, new Double[]{reserva.quantity__c, disponibleVenta }) );
            }
        }

        InventoryTriggerHandler.flagInventoryTrigger = true;
        update inventarios.values();
        InventoryTriggerHandler.flagInventoryTrigger = false;
    }

    public static void liberarReserva (List<InventoryLock__c> reservas) {
        Map<Id, Inventory__c> inventarios = buscarInventarios(reservas);

        for ( InventoryLock__c reserva :reservas ) {
            Inventory__c inventario = inventarios.get( reserva.Inventory__c );

            if ( inventario.LockedByQuantity__c  >=  reserva.quantity__c ) {
                inventario.LockedByQuantity__c  -= reserva.quantity__c;
            } else {
                reserva.addError( ERROR_DE_INTEGRIDAD );
            }
        }

        InventoryTriggerHandler.flagInventoryTrigger = true;
        update inventarios.values();    
        InventoryTriggerHandler.flagInventoryTrigger = false;
    }

}
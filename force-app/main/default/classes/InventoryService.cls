public with sharing class InventoryService {
    private static String query = 'SELECT Id, Name, BusinessSite__c, Product__c,Total__c, mtpl__c, LockedByQuantity__c, mtre__c, mtpm__c FROM Inventory__c';

    public static List<Inventory__c> GetAvailabilityByWerks(String werks) {
        List<Inventory__c> listaInventario = new List<Inventory__c>();

        try {
            if (String.isNotBlank(werks)) {
                query += ' WHERE BusinessSite__r.Werks__c = :werks';
            }

            listaInventario = Database.query(query);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error en el servicio');
        }

        return listaInventario;
    }

    public static List<Inventory__c> GetAvailabilityByWerksAndNmu (String werks, String nmu) {
        List<Inventory__c> listaInventario = new List<Inventory__c>();

        try {
            if (String.isNotBlank(werks) && String.isNotBlank(nmu)) {
                query += ' WHERE BusinessSite__r.Werks__c = :werks AND Product__r.NMU__c = : nmu';

                listaInventario = Database.query(query);
            }
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'Error en el servicio');
        }

        return listaInventario;
    }

}
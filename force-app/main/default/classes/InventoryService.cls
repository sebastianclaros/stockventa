public with sharing class InventoryService {

    public static List<Inventory__c> GetAvailabilityByWerks(String werks) {
        // Si no envía LIMITE se asume Default = 200 y devuelve todos los campos

        List<Inventory__c> listaInventario = new List<Inventory__c>();
        String queryF = queryFormulate (werks, '', 0, new Set<String>());

        try {
            listaInventario = Database.query(queryF);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error en el servicio');
        }

        return listaInventario;
    }

    public static List<Inventory__c> GetAvailabilityByWerks(String werks, Integer limite) {

        List<Inventory__c> listaInventario = new List<Inventory__c>();
        String queryF = queryFormulate (werks, '', limite, new Set<String>());
        try {
            listaInventario = Database.query(queryF);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error en el servicio');
        }

        return listaInventario;
    }

    public static List<Inventory__c> GetAvailabilityByWerks(String werks, Integer limite, Set<String> filters) {
        List<Inventory__c> listaInventario = new List<Inventory__c>();
        String queryF = queryFormulate(werks, '', limite, filters);

        try {
            listaInventario = Database.query(queryF);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error en el servicio');
        }

        return listaInventario;
    }

    public static Inventory__c GetAvailabilityByWerksAndNmu (String werks, String nmu) {
        Inventory__c inventario = new Inventory__c();

        String queryF = queryFormulate (werks, nmu, 1, new Set<String>());

        try {
            inventario = Database.query(queryF);

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'Error en el servicio');
        }

        return inventario;
    }

    private static String queryFormulate (String werks, String nmu, Integer limite, Set<String> filters) {
        String baseQuery = 'SELECT Id, Name, BusinessSite__c, Product__c,Total__c, mtpl__c, LockedByQuantity__c, mtre__c, mtpm__c FROM Inventory__c WHERE BusinessSite__r.Werks__c =:werks ';
        String formQuery = '';

        if (nmu == '' && limite == 0 && filters.size() == 0){
            formQuery = baseQuery + 'LIMIT 200';
        } else if (nmu == '' && filters.size() == 0){
            formQuery = baseQuery + 'LIMIT ' + limite;
        } else if (nmu != ''){
            formQuery = baseQuery + 'AND Product__r.NMU__c =:nmu LIMIT ' + limite;
        } else if (filters.size() > 0) {
            String filtros = String.join(filters,',');

            formQuery = 'SELECT Id,' + filtros;
            formQuery += ' FROM Inventory__c WHERE BusinessSite__r.Werks__c =:werks LIMIT ' + limite;
        }
        return formQuery;
    }

}
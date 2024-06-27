public with sharing class MaterialTriggerHelper {
    final static String ERROR_NMU_DOES_NOT_EXIST = 'El NMU {0} no existe';
    final static String ERROR_WERKS_DOES_NOT_EXIST = 'El werks {0} no existe';
    final static Map<String, String> CAMPO_SEGUN_ESTADO = new Map<String, String>{
        'mtpl' => 'Available__c',
        'mtre' => 'LockedBySerial__c'
    };

    private static String getInventoryKey( Material__c material) {
        return material.Werks__c + '-' +material.NMU__c;
    }
    
    private static Map<String,Inventory__c> buscarInventarios(List<Material__c> materiales) {
        Map<String, Inventory__c> inventarios = new Map<String, Inventory__c>();
        Map<String, Material__c> inventoryNames = new Map<String, Material__c>();

        // Arma un mapa de materiales por la clave de inventario
        for ( Material__c material :materiales ) {
            inventoryNames.put( getInventoryKey(material), material);
        }

        // Agrega los inventarios que existen
        for ( Inventory__c inventario: [SELECT Id, LockedBySerial__c, Available__c, Total__c FROM Inventory__c WHERE name IN :inventoryNames.keySet()] ) {
            inventarios.put( inventario.Name , inventario);
        }

        // Crea Los nuevos inventarios
        Set<String> newInventarios = inventoryNames.keySet();
        newInventarios.removeAll(inventarios.keySet());
        if ( newInventarios.size() > 0 ) {
            for ( String inventoryName: newInventarios ) {
                Material__c material = inventoryNames.get(inventoryName);
                inventarios.put( inventoryName, new Inventory__c(Name = inventoryName, Product__c = material.Product__c, BusinessSite__c = material.BusinessSite__c,  Available__c = 0 ,  LockedBySerial__c = 0, Total__c = 0 ) );
            }
        }
        return inventarios;
    } 

    public static void agregarInventario(List<Material__c> materiales) {
        Map<String, Inventory__c> inventarios = buscarInventarios(materiales);

        for ( Material__c material :materiales ) {
            Inventory__c inventario = inventarios.get( getInventoryKey(material) );
            String campoSegunEstado = CAMPO_SEGUN_ESTADO.get(material.Status__c.toLowerCase());            
            inventario.put(campoSegunEstado, (Integer)inventario.get(campoSegunEstado) + 1);
            inventario.Total__c = inventario.Total__c +1; 
        }

        upsert inventarios.values();
    }
    public static void cambiarEstadoInventario (Map<Id,Material__c> materialesOld, List<Material__c> materialesNew) {
        List<Material__c> todosLosMateriales = materialesOld.values();
        todosLosMateriales.addAll(materialesNew);
        Map<String, Inventory__c> inventarios = buscarInventarios( todosLosMateriales);

        for ( Material__c materialNew :materialesNew ) {
            Inventory__c inventario = inventarios.get( getInventoryKey(materialNew) );
            Material__c materialOld = materialesOld.get( materialNew.Id);            
            String campoNew = CAMPO_SEGUN_ESTADO.get(materialNew.Status__c.toLowerCase());            
            String campoOld = CAMPO_SEGUN_ESTADO.get(materialOld.Status__c.toLowerCase());            
            
            inventario.put(campoNew, (Integer)inventario.get(campoNew) + 1);
            inventario.put(campoOld, (Integer)inventario.get(campoOld) - 1);
        }

        upsert inventarios.values();    
    
    }
    public static void moverDepositoInventario (Map<Id,Material__c> materialesOld, List<Material__c> materialesNew) {
        List<Material__c> todosLosMateriales = materialesOld.values();
        todosLosMateriales.addAll(materialesNew);
        Map<String, Inventory__c> inventarios = buscarInventarios( todosLosMateriales);

        for ( Material__c materialNew :materialesNew ) {
            Material__c materialOld = materialesOld.get( materialNew.Id);            
            Inventory__c inventarioNew = inventarios.get( getInventoryKey(materialNew) );
            Inventory__c inventarioOld = inventarios.get( getInventoryKey(materialOld) );
            
            String campoNew = CAMPO_SEGUN_ESTADO.get(materialNew.Status__c.toLowerCase());            
            String campoOld = CAMPO_SEGUN_ESTADO.get(materialOld.Status__c.toLowerCase());            
            
            inventarioNew.put(campoNew, (Integer)inventarioNew.get(campoNew) + 1);
            inventarioNew.Total__c = inventarioNew.Total__c + 1;
            inventarioOld.put(campoOld, (Integer)inventarioOld.get(campoOld) - 1);
            inventarioOld.Total__c =  inventarioOld.Total__c - 1;
        }

        upsert inventarios.values();    
    
    }

    public static void removerInventario (List<Material__c> materiales) {
        Map<String, Inventory__c> inventarios = buscarInventarios(materiales);

        for ( Material__c material :materiales ) {
            Inventory__c inventario = inventarios.get( getInventoryKey(material) );
            String campoSegunEstado = CAMPO_SEGUN_ESTADO.get(material.Status__c.toLowerCase());            
            inventario.put(campoSegunEstado, (Integer)inventario.get(campoSegunEstado) - 1);
            inventario.Total__c = inventario.Total__c - 1; 
        }

        upsert inventarios.values();    
    }    

    public static void completarProducto(List<Material__c> materiales) {
        Set<Object> nmu = TriggerHelper.getFieldsFromSObjects(materiales, 'NMU__c');
        Map<String, Id> nmuMap = TriggerHelper.getExternalMap('Product2', 'NMU__c', nmu);

        for ( Material__c material : materiales) {
            if ( nmuMap.containsKey(material.NMU__c) ) {
                material.Product__c = nmuMap.get(material.NMU__c);
            } else {
                material.addError(  String.format( ERROR_NMU_DOES_NOT_EXIST, new String[]{ material.NMU__c} ) );
            }
        }
    }        

    public static void completarBusinessSite(List<Material__c> materiales) {
        Set<Object> businessSites = TriggerHelper.getFieldsFromSObjects(materiales, 'Werks__c');
        Map<String, Id> businessSitesMap = TriggerHelper.getExternalMap('BusinessSite__c', 'Werks__c', businessSites);

        for ( Material__c material : materiales) {
            if ( businessSitesMap.containsKey(material.Werks__c)) {
                material.BusinessSite__c = businessSitesMap.get(material.Werks__c);
            } else {
                material.addError(  String.format( ERROR_WERKS_DOES_NOT_EXIST, new String[]{ material.Werks__c} ) );
            }
        }
    }        

}
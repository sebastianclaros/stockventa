public with sharing class MaterialTriggerHelper {
    
    final static String ERROR_CAMBIO_DE_ESTADO = 'El cambio de estado de {0} a {1} no es soportado';
    final static String ERROR_NMU_DOES_NOT_EXIST = 'El NMU {0} no existe';
    final static String ERROR_WERKS_DOES_NOT_EXIST = 'El werks {0} no existe';
    public final static String ESTADO_DISPONIBLE = 'MTPL';
    public final static String ESTADO_RESERVADO = 'MTRE';
    public final static String ESTADO_VENDIDO = 'MCLV';
    public final static String ESTADO_PRESTADO = 'MTPO';
    public final static String ESTADO_SINIESTRADO_TELECOM = 'MTSC';
    public final static String ESTADO_DISPONIBLE_PRESTAMO = 'MTPM';
    public final static String ESTADO_DEVOLUCION_GARANTIA = 'MTDG';
    public final static String SIN_ESTADO_PREVIO = '';
    // Estados del Asset cuando esta Siniestrado del lado del Cliente
    //public final static String ESTADO_HURTO = 'MCSH'; 
    //public final static String ESTADO_ROBO = 'MCSR'; 
    //public final static String ESTADO_EXTRAVIO = 'MTSE'; 
    //public final static String ESTADO_DESTRUCCION_TOTAL = 'MCDT'; 

    final static Map<String, String> CAMPO_SEGUN_ESTADO = new Map<String, String>{
        ESTADO_DISPONIBLE => 'mtpl__c',
        ESTADO_RESERVADO => 'mtre__c',
        ESTADO_DISPONIBLE_PRESTAMO => 'mtpm__c',
        ESTADO_PRESTADO => 'mtpo__c',
        ESTADO_SINIESTRADO_TELECOM => 'mtsc__c',
        ESTADO_VENDIDO => 'mclv__c',
        ESTADO_DEVOLUCION_GARANTIA => 'mtdg__c'
    };

    final static map<String, String> CAMBIOS_ESTADO_PROCESO = new Map<String, String>{
        SIN_ESTADO_PREVIO + ESTADO_DISPONIBLE => 'Alta bien de cambio',
        SIN_ESTADO_PREVIO + ESTADO_DISPONIBLE_PRESTAMO => 'Alta de muleto',
        ESTADO_DISPONIBLE + ESTADO_RESERVADO => 'Reserva', 
        ESTADO_RESERVADO + ESTADO_DISPONIBLE => 'Desreserva',
        ESTADO_DISPONIBLE + ESTADO_VENDIDO => 'Venta',
        ESTADO_RESERVADO + ESTADO_VENDIDO => 'Venta',        
        ESTADO_VENDIDO + ESTADO_DISPONIBLE => 'Anulacion Venta',
        ESTADO_DISPONIBLE_PRESTAMO + ESTADO_PRESTADO => 'Entrega Muleto',
        ESTADO_PRESTADO + ESTADO_DISPONIBLE_PRESTAMO => 'Devolucion Muleto',
        ESTADO_PRESTADO + ESTADO_VENDIDO => 'Vendido',
        ESTADO_PRESTADO + ESTADO_VENDIDO => 'Vendido',
        ESTADO_DISPONIBLE + ESTADO_SINIESTRADO_TELECOM => 'Siniestro',
        ESTADO_VENDIDO + ESTADO_DEVOLUCION_GARANTIA => 'Cambio en garantia'
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
        for ( Inventory__c inventario: [SELECT Name, Id, mtpl__c, mtre__c, mtpm__c, mtpo__c, mclv__c, mtsc__c, mtdg__c, LockedByQuantity__c, Total__c FROM Inventory__c WHERE name IN :inventoryNames.keySet()] ) {
            inventarios.put( inventario.Name , inventario);
        }

        // Crea Los nuevos inventarios
        Set<String> newInventarios = inventoryNames.keySet();
        newInventarios.removeAll(inventarios.keySet());
        if ( newInventarios.size() > 0 ) {
            for ( String inventoryName: newInventarios ) {
                Material__c material = inventoryNames.get(inventoryName);
                inventarios.put( inventoryName, new Inventory__c(Name = inventoryName, Product__c = material.Product__c, BusinessSite__c = material.BusinessSite__c,  mtpl__c= 0, mtre__c= 0, mtpm__c= 0, mtpo__c= 0, mclv__c= 0, mtsc__c = 0, mtdg__c = 0, LockedByQuantity__c = 0, Total__c = 0 ) );
            }
        }
        return inventarios;
    } 

    public static void agregarInventario(List<Material__c> materiales) {
        Map<String, Inventory__c> inventarios = buscarInventarios(materiales);

        for ( Material__c material :materiales ) {
            Inventory__c inventario = inventarios.get( getInventoryKey(material) );
            String campoSegunEstado = CAMPO_SEGUN_ESTADO.get(material.Status__c);            
            inventario.put(campoSegunEstado, (Decimal)inventario.get(campoSegunEstado) + 1);
            inventario.Total__c = inventario.Total__c +1; 
        }

        InventoryTriggerHandler.flagInventoryTrigger = true;
        upsert inventarios.values();
        InventoryTriggerHandler.flagInventoryTrigger = false;
    }
    public static void cambiarEstadoInventario (Map<Id,Material__c> materialesOld, List<Material__c> materialesNew) {
        List<Material__c> todosLosMateriales = materialesOld.values();
        todosLosMateriales.addAll(materialesNew);
        Map<String, Inventory__c> inventarios = buscarInventarios( todosLosMateriales);

        for ( Material__c materialNew :materialesNew ) {
            Inventory__c inventario = inventarios.get( getInventoryKey(materialNew) );
            Material__c materialOld = materialesOld.get( materialNew.Id);            
            String campoNew = CAMPO_SEGUN_ESTADO.get(materialNew.Status__c);            
            String campoOld = CAMPO_SEGUN_ESTADO.get(materialOld.Status__c);            
            
            inventario.put(campoNew, (Decimal)inventario.get(campoNew) + 1);
            inventario.put(campoOld, (Decimal)inventario.get(campoOld) - 1);
        }

        InventoryTriggerHandler.flagInventoryTrigger = true;
        upsert inventarios.values();    
        InventoryTriggerHandler.flagInventoryTrigger = false;
    
    }
    public static void moverDepositoInventario (Map<Id,Material__c> materialesOld, List<Material__c> materialesNew) {
        List<Material__c> todosLosMateriales = materialesOld.values();
        todosLosMateriales.addAll(materialesNew);
        Map<String, Inventory__c> inventarios = buscarInventarios( todosLosMateriales);

        for ( Material__c materialNew :materialesNew ) {
            Material__c materialOld = materialesOld.get( materialNew.Id);            
            Inventory__c inventarioNew = inventarios.get( getInventoryKey(materialNew) );
            Inventory__c inventarioOld = inventarios.get( getInventoryKey(materialOld) );
            
            String campoNew = CAMPO_SEGUN_ESTADO.get(materialNew.Status__c);            
            String campoOld = CAMPO_SEGUN_ESTADO.get(materialOld.Status__c);            
            
            inventarioNew.put(campoNew, (Decimal)inventarioNew.get(campoNew) + 1);
            inventarioNew.Total__c = inventarioNew.Total__c + 1;
            inventarioOld.put(campoOld, (Decimal)inventarioOld.get(campoOld) - 1);
            inventarioOld.Total__c =  inventarioOld.Total__c - 1;
        }

        InventoryTriggerHandler.flagInventoryTrigger = true;
        upsert inventarios.values();    
        InventoryTriggerHandler.flagInventoryTrigger = false;
    
    }

    public static void removerInventario (List<Material__c> materiales) {
        Map<String, Inventory__c> inventarios = buscarInventarios(materiales);

        for ( Material__c material :materiales ) {
            Inventory__c inventario = inventarios.get( getInventoryKey(material) );
            String campoSegunEstado = CAMPO_SEGUN_ESTADO.get(material.Status__c);            
            inventario.put(campoSegunEstado, (Decimal)inventario.get(campoSegunEstado) - 1);
            inventario.Total__c = inventario.Total__c - 1; 
        }

        InventoryTriggerHandler.flagInventoryTrigger = true;
        upsert inventarios.values();    
        InventoryTriggerHandler.flagInventoryTrigger = false;
    }    

    public static void validateStatusChanges( Map<Id, Material__c> oldMaterial, List<Material__c> newMaterial ){
        for( Material__c material: newMaterial){
            String newStatus = material.Status__c;
            String oldStatus = oldMaterial == null ? SIN_ESTADO_PREVIO : oldMaterial.get(material.Id).Status__c;

            if ( !CAMBIOS_ESTADO_PROCESO.containsKey(oldStatus + newStatus) ){
                material.addError( String.format( ERROR_CAMBIO_DE_ESTADO, new String[]{ oldStatus, newStatus}));
            }
        }    
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
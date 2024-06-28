// https://github.com/kevinohara80/sfdc-trigger-framework
public class MaterialTriggerHandler extends BaseTriggerHandler {

    public override void beforeInsert() {
        // Completa el lookup a product segun el NMU
        MaterialTriggerHelper.completarProducto(Trigger.new);
        // Completa el lookup a business Site segun el werks
        MaterialTriggerHelper.completarBusinessSite(Trigger.new);
    }    
    
    public override void beforeUpdate() {
        // No permite que se modifique el NMU
        TriggerHelper.validateFieldUnchanged(Trigger.newMap, Trigger.oldMap, 'NMU__c');

        List<SObject> businessSiteChanges = TriggerHelper.getRecordChanges(Trigger.newMap, Trigger.oldMap, 'Werks__c');
        if ( businessSiteChanges.size() >0 ) {
            MaterialTriggerHelper.completarBusinessSite(businessSiteChanges);       
        }

        // Validar cambios de Estado
    }    
    public override void beforeDelete() {
        // Validar que no se borren registros de Materiales
    }

    public override void afterInsert() {
        // Incrementa en las rollup de inventarios segun producto y punto de venta
        MaterialTriggerHelper.agregarInventario(Trigger.new);
    }

    public override void afterUpdate() {
        Map<Id, Material__c> cambioDepositoOld = new Map<Id, Material__c>();
        List<Material__c> cambioDepositoNew = new List<Material__c>();

        Map<Id, Material__c> cambioEstadoOld = new Map<Id, Material__c>();
        List<Material__c> cambioEstadoNew = new List<Material__c>();
        
        for( Material__c materialNew: (List<Material__c>)Trigger.new ){
            Material__c materialOld = (Material__c)Trigger.oldMap.get(materialNew.Id); 

            if ( materialOld.BusinessSite__c != materialNew.BusinessSite__c ){
                cambioDepositoNew.add(materialNew);
                cambioDepositoOld.put( materialNew.Id, materialOld);
            } else if ( materialOld.Status__c != materialNew.Status__c ) {
                cambioEstadoNew.add(materialNew);
                cambioEstadoOld.put( materialNew.Id, materialOld);
            }
        }
        
        // Si cambia la solamente la sucursal o (sucursal y el estado) entonces decrementa en old e incrementa en el new
        if ( cambioDepositoNew.size() > 0 ) {
            MaterialTriggerHelper.moverDepositoInventario( cambioDepositoOld, cambioDepositoNew );
        }
        // Si cambia SOLO el estado, incrementa y decrementa en el mismo registro segun estado
        if ( cambioEstadoNew.size() > 0 ) {
            MaterialTriggerHelper.cambiarEstadoInventario( cambioEstadoOld, cambioEstadoNew);
        }
    }

    public override void afterDelete() {
        // Decrementa a las rollup de inventarios segun producto y punto de venta
        MaterialTriggerHelper.removerInventario(Trigger.new);
    }

    public override void afterUndelete() {
        // Incrementa a las rollup de inventarios segun producto y punto de venta
        MaterialTriggerHelper.agregarInventario(Trigger.new);
    }
}
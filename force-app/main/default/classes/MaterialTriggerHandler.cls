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

        // Si cambia el werks actuliza el lookup a business Site
        List<SObject> businessSiteChanges = TriggerHelper.getRecordChanges(Trigger.newMap, Trigger.oldMap, 'BusinessSite__c');
        if ( businessSiteChanges.size() >0 ) {
            MaterialTriggerHelper.completarBusinessSite(businessSiteChanges);       
        }

        // Validar cambios de Estado
    }    

    public override void afterInsert() {

    }

    public override void afterUpdate() {

    }

    public override void afterDelete() {

    }

    public override void afterUndelete() {
        
    }
}
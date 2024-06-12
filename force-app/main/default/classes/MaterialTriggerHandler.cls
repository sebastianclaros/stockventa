// https://github.com/kevinohara80/sfdc-trigger-framework
public class MaterialTriggerHandler extends BaseTriggerHandler {

    public override void beforeInsert() {
        MaterialTriggerHelper.completarProducto(Trigger.new);
        MaterialTriggerHelper.completarBusinessSite(Trigger.new);
    }    

    public override void beforeUpdate() {
        List<SObject> productChanges = TriggerHelper.getRecordChanges(Trigger.newMap, Trigger.oldMap, 'NMU__c');        
        if ( productChanges.size() >0 ) {
            MaterialTriggerHelper.completarProducto(productChanges);
        }

        List<SObject> businessSiteChanges = TriggerHelper.getRecordChanges(Trigger.newMap, Trigger.oldMap, 'BusinessSite__c');
        if ( businessSiteChanges.size() >0 ) {
            MaterialTriggerHelper.completarBusinessSite(businessSiteChanges);
        }
    }    
}
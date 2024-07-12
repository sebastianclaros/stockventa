@IsTest
public class TestDataFactory {
  public static final Boolean DEFAULT_INSERT = true;
  public static final Integer DEFAULT_RECORDS = 3;

  static private Map<String, Product2> productos;
  static private Map<String, BusinessSite__c> businessSites;

  private static String getName(String prefix, Integer index) {
    if (!prefix.contains('{0}')){
        prefix = prefix + '-{0}';
    }
    return String.format(prefix, new List<Object>{ index });
  }
  
  public static void makeProductos(Boolean insertValues, Integer qty) {
    productos = new Map<String, Product2>();
    for (Integer index = 0; index < qty; index++) {
        Product2 p = new Product2(Name = getName('P', index), ProductCode = getName('PC', index), IsActive = true, Nmu__c = getName('NMU', index));
        productos.put( p.NMU__c, p);
    }
    if (insertValues) {
      insert productos.values();
    }
  }

  public static Map<String, Product2> getProductos() {
    if (productos == null) {
        makeProductos(DEFAULT_INSERT, DEFAULT_RECORDS);
    }
    return productos;
  }

  public static void makeBusinessSite(Boolean insertValues, Integer qty) {
    businessSites = new Map<String, BusinessSite__c>();
    for (Integer index = 0; index < qty; index++) {
        BusinessSite__c b = new BusinessSite__c(Name = getName('B', index), Werks__c = getName('W', index), AssociatedWarehouseId__c = getName('W', index));
        businessSites.put( b.Werks__c, b);
    }
    if (insertValues) {
      insert businessSites.values();
    }
  }

  public static Map<String, BusinessSite__c> getBusinessSites() {
    if (businessSites == null) {
        System.debug(businessSites);
        makeBusinessSite(DEFAULT_INSERT, DEFAULT_RECORDS);
        System.debug(businessSites);
    }
    return businessSites;
  }

}
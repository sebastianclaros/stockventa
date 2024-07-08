@IsTest
public class TestDataFactory {
  public static final Boolean DEFAULT_INSERT = true;
  public static final Integer DEFAULT_RECORDS = 3;

  static private Map<String, Product2> productos;
  static private Map<String, BusinessSite__c> businessSites;
  static private Map<String, Material__c> materiales;

  public static Map<String, BusinessSite__c> getBusinessSites() {
    if (businessSites == null) {
        System.debug(businessSites);
        makeBusinessSite(DEFAULT_INSERT, DEFAULT_RECORDS);
        System.debug(businessSites);
    }
    return businessSites;
  }
  private static String getName(String prefix, Integer index) {
    if (!prefix.contains('{0}')){
        prefix = prefix + '-{0}';
    }
    return String.format(prefix, new List<Object>{ index });
  }

  public static Map<String, Material__c> getMateriales() {
    if (materiales == null) {
      Map<String, Product2> productos = getProductos();
      Map<String, BusinessSite__c> businessSites = getBusinessSites();      
      String[] nmu = new List<String>(productos.keySet());
      String[] werks = new List<String>(businessSites.keySet());  
      makeMateriales(DEFAULT_INSERT, DEFAULT_RECORDS, nmu, werks);
    }
    return materiales;
  }

  public static void makeMateriales(Boolean insertValues, Integer qty, String[] nmu, String[] werks ) {
    materiales = new Map<String, Material__c>();

    for (Integer index = 0; index < qty; index++) {
      String serie = getName('P', index);
      Material__c m = new Material__c( Status__c = MaterialTriggerHelper.ESTADO_DISPONIBLE  ,  Serial__c = serie, NMU__c =  nmu.get(index), Werks__c = werks.get(index) );
      materiales.put( serie, m);
    }
    if (insertValues) {
      insert materiales.values();
    }
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


}
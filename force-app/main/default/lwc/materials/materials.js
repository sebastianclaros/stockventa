import { gql, graphql } from "lightning/uiGraphQLApi";
import { LightningElement, api, wire } from 'lwc';
import {getRecord} from "lightning/uiRecordApi"

const columns = [
    { label: 'Serial', fieldName: 'Serial__c' }
];

export default class BasicDatatable extends LightningElement {
    @api recordId;
    @api status;    
    @api title;
    data = [];
    columns = columns;
    productId;
    businessSiteId;

    @wire(getRecord, { recordId: '$recordId', fields: [ 'Material__c.Product__c', 'Material__c.BusinessSite__c'] })
    getRecord({ data, error }) {
        if ( data ) {
            this.productId = data.fields.Product__c.value;
            this.businessSiteId = data.fields.BusinessSite__c.value;
        }
        if ( error ) {
            console.error( error);        
        }
    }

    get materialVariables() {
        return { productId: this.productId, businessSiteId: this.businessSiteId, status: this.status }
    }

    get materialQuery() {
        if (!this.productId || !this.businessSiteId ) return undefined;

        return gql`query getMaterials( $productId: ID!, $businessSiteId: ID!, $status: Picklist! ) {
            uiapi {
                query {
                    Material__c(
                        where: { and: [ 
                            {Product__c: { eq: $productId } }, 
                            {BusinessSite__c: { eq: $businessSiteId } },
                            {Status__c: { eq: $status } }
                        ] }
                    ) {
                        edges {
                            node {
                                Id
                                Serial__c {
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }`;

    }
        
    @wire(graphql, {
        query: '$materialQuery',
        variables: '$materialVariables' 
        })
    getMaterials( {data, error}) {
        if ( error ) {
            console.error(error);
        }
        if ( data ) {
            this.data = data.uiapi.query.Material__c.edges.map((edge) => {
                return { Serial__c: edge.node.Serial__c.value } ;
            });
        }
    }
   
}

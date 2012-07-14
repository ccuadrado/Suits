/** 
 * Module that contains all of the code for the My Buys JavaScript
 * that will be used on many pages.  My Buys gives recommendations
 * for products to purchase, so we need to track what products users
 * are viewing.
 *
 * @module      Util-MyBuys
 * @author      Preet Jassi, Eric Tam
 * @copyright   (c) 2012 Indochino Apparel Inc. 
 */
(function() {
    
    
    var Utility = indo.Util.constructor,
        scripts = [
            {url: '//t.p.mybuys.com/js/mybuys3.js'},
            {url: '//t.p.mybuys.com/clients/INDOCHINO/js/setup.js'}
        ];
    
    /**
    * MyBuys Utility module
    * @module MyBuys
    */
    Utility.prototype.MyBuys = {
        
        /**
        * This init function first checks to see if the page calling it is
        * a MyBuys page (Home Page, Product Details, Checkout etc.). Every
        * MyBuys page will have an 'mybuys' parameter set in the
        * Context Data. If this parameter does not exist, this function
        * does nothing.
        *
        * @return {void}
        * @method init
        */
        init: function() {

            var data = indo.Util.getContextData('mybuys');
            
            if (typeof(data) !== "undefined" && data !== false) {             
                // Load the MyBuys JS script first. Once it has loaded, call
                // firstScriptLoaded to load the MyBuys Client script.
                indo.Util.loadScript(scripts[0].url, this.firstScriptLoaded);
            }   
            
        },
        
        /**
         * This is called after the MyBuys script has loaded. It then loads the
         * client script. Once that has loaded, call _init to call the other
         * MyBuys functions.
         *
         * @return {void}
         * @method firstScriptLoaded
         */
        firstScriptLoaded: function() {
            
            indo.Util.loadScript(scripts[1].url, indo.Util.MyBuys._init);
            
        },
        
        /**
         * This function is called after both MyBuys scripts have loaded. All
         * MyBuys pages MUST call mybuys.setPageType() first and mybuys.initPage()
         * last. Other functions are called in between depending on the page
         * type. The switch statement takes care of this.
         * 
         * @return {void}
         * @method _init
         */
        _init: function() {
            
            var data = indo.Util.getContextData('mybuys');
            mybuys.setPageType(data.page_type);

            switch(data.page_type) {
                case "HIGH_LEVEL_CATEGORY": 
                case "CATEGORY": 
                case "PRODUCT_DETAILS":
                    indo.Util.MyBuys.callSet();
                    break;
                case "ADD_TO_CART": 
                case "SHOPPING_CART":
                    indo.Util.MyBuys.callSet();
                    indo.Util.MyBuys.shoppingBagView();
                    break;
                case "ORDER_CONFIRMATION":
                    indo.Util.MyBuys.callSet();
                    indo.Util.MyBuys.orderView();
                    break;
            }
            
            mybuys.initPage();
                
        },
        
        /**
         * Calls all the mybuys.set() functions defined in the Context Data.
         * mbData holds an array of objects with two labels, 'type' and 'data'.
         * For each object, the call mybuys.set(type, data) is made.
         * 
         * @return {void}
         * @method callSet
         */
        callSet: function() {
            
            var mbData = indo.Util.getContextData('mybuys').set_data,
                data;
                
            for (data in mbData) {
                if (mbData.hasOwnProperty(data)) {
                    mybuys.set(data, mbData[data]);
                }
            }
            
        },
        
        /**
         * mbData holds an array of objects with three labels, 'product_id',
         * 'quantity', and 'subtotal' which correspond to each unique product
         * in the customer's SHOPPING BAG. For each object, the call
         * mybuys.addCartItemQtySubtotal(product_id, quantity, subtotal) is made.
         * 
         * @return {void}
         * @method shoppingBagView
         */
        shoppingBagView: function() {
            
            var mbData = indo.Util.getContextData('mybuys').cart_items,
                data;
                
            for (data in mbData) {
                if (mbData.hasOwnProperty(data)) {  
                    mybuys.addCartItemQtySubtotal(mbData[data]['product_id'], mbData[data]['quantity'], mbData[data]['subtotal']);
                }
            }
            
        },
        
        /**
         * mbData holds an array of objects with three labels, 'product_id',
         * 'quantity', and 'subtotal' which correspond to each unique product
         * in a customer's ORDER. For each object, the call
         * mybuys.addOrderItemQtySubtotal(product_id, quantity, subtotal) is made.
         * 
         * @return {void}
         * @method orderView
         */
        orderView: function() {
            
            var mbData = indo.Util.getContextData('mybuys').order_items,
                data;
                
            for (data in mbData) {
                if (mbData.hasOwnProperty(data)) {
                    mybuys.addOrderItemQtySubtotal(mbData[data]['product_id'], mbData[data]['quantity'], mbData[data]['subtotal']);
                }
            }
            
        } 
        
        
        
    };
    
    
}());
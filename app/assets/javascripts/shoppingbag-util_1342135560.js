/** 
 * Indochino shopping bag module that is used 
 * 
 * @module      ShoppingBagUtil
 * @author      Preet Jassi
 * @copyright   (c) 2011 Indochino Apparel Inc. 
 */
    
indo.Util.register('indo-shoppingbagutil', function(Y){

    /**
    * Shopping bag module
    * @module ShoppingBagUtil
    */
    var ShoppingBagUtil = (function(){
        
            /**
            * item count container
            * @property {Y.Node} itemCount
            */
        var itemCount;
        
        
        /* -------------------------------------------------------  */
        /*                                                          */
        /*                   Helper Methods                         */
        /*                                                          */
        /* -------------------------------------------------------- */

        /**
        * Updates the item count on the header
        * @return {void}
        * @method updateItemCount
        */
        function updateItemCount() {
            
            var icContextData = indo.Util.getContextData('item-count');
            
            if (icContextData) {
                
                icContextData -=1;
                if (itemCount) {
                    itemCount.setContent( icContextData );
                }
                indo.Util.setContextData('item-count', icContextData);
                
            } else {
                
                if (itemCount) {
                    itemCount.setContent( parseInt(itemCount.get('innerHTML'), 10) + 1 );    
                }
                    
            }
    		
        }            
    
    
        return {
    
            /* -------------------------------------------------------  */
            /*                                                          */
            /*                  Core Methods                            */
            /*                                                          */
            /* -------------------------------------------------------- */
    
            /**
            * Initializes DOM references
            * @return {void}
            * @method init
            */
            init: function() {
        
                itemCount = Y.one('.user-navigation .item_count');
        
            },
            
            /**
            * Didn't yo momma teach you to clean up after yoself?
            * @return {void}
            * @method destruct
            */
            destruct: function() {                    
                
                itemCount = null;
                
            },
            
            /**
            * Single click handler
            * @param {Y.Event} e
            * @return {void}
            * @method onviewevent
            */
            onviewevent: function(e) {
              
                var targ = e.target,
                    classes = targ.get('className').split(' '),
                    length = classes.length;

                //determine callback function dependant upon the classname of the target
                while (length--) {
                    
                    //no need for the eventMap here since there is only one className
                    if (classes[length] === 'shopping-bag-item-remove') {
                        this.removeShoppingItem(e);
                        e.preventDefault();
                        return false;
                    }
                    
                }
                                  
            },
    
            /* -------------------------------------------------------  */
            /*                                                          */
            /*                  Event Handlers                          */
            /*                                                          */
            /* -------------------------------------------------------- */
    
            /**
            * Removes an item from the shopping cart nav
            * @param {Y.Event}
            * @return {void}
            * @method removeShoppingItem
            */
            removeShoppingItem: function(e) {
        
                var targ = e.target,
                    item = targ.ancestor('.shopping-bag-item'),
                    item_key = item.get('dataset') ? item.get('dataset').itemKey : item.getAttribute("data-item-key");
            
                //interact with the other part using custom events
                Y.fire('shopping-bag:remove-product', {
                    item_key: item_key,
                    o: item
                });
        
            },
            
            
            /* -------------------------------------------------------  */
            /*                                                          */
            /*                  Custom Event Handlers                   */
            /*                                                          */
            /* -------------------------------------------------------- */
    
            /**
            * Removes a product from the shopping cart
            * @param {object} arguments object passed when someone fires the event
            * @return {void}
            * @method removeProduct
            */
            removeProduct: function( obj ) {
      
                var url = '/shoppingbag/remove_item',
                    data = 'item_key=' + obj.item_key;
                    
                indo.Util.makeRequest( url, this.handleRemoveProduct, data, this, obj);
        
            },
    
            /**
            * Adds a product to the waitlist
            * @param {object} arguments object passed when someone fires the event
            * @return {void}
            * @method addToWaitlist
            */
            addToWaitlist: function( obj ) {
        
                var url = '/customer/add-to-waitlist/' + obj.product_id;
        
                indo.Util.makeRequest( url, this.handleAddToWaitlist, '', this, obj);
        
            },
            
            
            /**
            * On success of removing an item from the shopping bag, hide it
            * @param {object} arguments object passed when someone fires the event
            * @return {void}
            * @method handleRemoveItem
            */
            handleRemoveItem: function( obj ) {
                
                //if we pass the item, then hide it, otherwise just update the count
                if (obj.args.o) {
                    
                    var item = obj.args.o;
                    item.hide(true, null, function(){
                        item.remove();
                        updateItemCount();
                    });
                    
                } else {
                    
                    updateItemCount();
                    
                }
        
            },
                    
            /* -------------------------------------------------------  */
            /*                                                          */
            /*               XHR Success Handlers                       */
            /*                                                          */
            /* -------------------------------------------------------- */
    
            
            /**
            * On success of adding an item to the shopping bag, fire custom
            * event to let subscribers know that the product has been added
            * @param {Number} request id
            * @param {XMLHttpRequest} XHR response object
            * @param {object} arguments passed
            * @return {void}
            * @method handleAddProduct
            */
            handleAddProduct: function(id, o, args) {
             
                Y.fire('shopping-bag:product-added', {
                    response: o,
                    args: args
                });
            
            },
            
            /**
            * On success of removing a a product, fire custom event
            * to let subscribers know
            * @param {Number} request id
            * @param {XMLHttpRequest} XHR response object
            * @param {object} arguments passed
            * @return {void}
            * @method handleRemoveItem
            */
            handleRemoveProduct: function(id, o, args) {
                
                Y.fire('shopping-bag:product-removed', {
                    response: o,
                    args: args
                });
                
            },
            
            /**
            * On success of adding an item to the waitlist, fire a custom event
            * to let the subscribers know that it successfully occured
            * @param {Number} request id
            * @param {XMLHttpRequest} XHR response object
            * @param {object} arguments passed
            * @return {void}
            * @method handleRemoveItem
            */
            handleAddToWaitlist: function(id, o, args) {
                
                Y.fire('shopping-bag:product-added-to-waitlist', {
                    response: o,
                    args: args
                });
                
            }  
     
        };
    
    }());
    
    //constructor - subscribe to events
    Y.on('util:init', ShoppingBagUtil.init, ShoppingBagUtil);
    Y.on('util:destruct', ShoppingBagUtil.destruct, ShoppingBagUtil);
    Y.on('util:onviewevent', ShoppingBagUtil.onviewevent, ShoppingBagUtil);
    
    //listen for custom events to add, remove, or add to waitlist
    Y.on('shopping-bag:remove-product', ShoppingBagUtil.removeProduct, ShoppingBagUtil);
    Y.on('shopping-bag:add-product-to-waitlist', ShoppingBagUtil.addToWaitlist, ShoppingBagUtil);
    
    //subscribe to one of the events that we generate ourselves to update the count
    Y.on('shopping-bag:product-removed', ShoppingBagUtil.handleRemoveItem, ShoppingBagUtil);  

}, '0.0.1');

/** 
 * The Indochino Utility Module that contains library independent
 * utility methods and variables.  The Utility module is extended
 * by using prototype to be used specifically for a library (i.e. YUI)
 * 
 * The library independent functionality includes contextData methods
 * as well as on demand loading methods and kissmetrics methods for tracking
 * 
 * @module      Util
 * @author      Preet Jassi
 * @copyright   (c) 2011 Indochino Apparel Inc. 
 */
(function(){
   
    
    /**
    * Define a utlity class so that we can use the prototype chain
    * to augment it - the default utility class will just contain methods that
    * are library independent, though we will migrate completely over to YUI soon.
    * @class Utilty
    */
    function Utility() {
        
            
        var self = this,

            //contains information passed from PHP to JS
            contextData = {},
            
            //js to be dynamically loaded
            scripts = [],
            
            //we have initialized the Utility module (onload has occured)
            initialized = false,
            
            //queue for unitialized state
            _kmqQueue = [];
            
        
        /**
        *
        *
        *
        */
        this.UA = {
            touchscreen: function() {
            
                if ('ontouchstart' in document.documentElement) {  
                    return true;
                }
                
                return false;
            }
        };
        
        
        /**
        * Stores the context data and initializes library independent
        * Utility module.  It will call the utility init as well to initiate
        * the library dependent initialization method;
        * @param {object} data - the context data that is dumped from the PHP Context singleton
        * @param {Function} callback - the callback function for the YUI use statement
        * @return {void}
        */
        this.init = function(data, callback) {
            
            //store the context data dump
            contextData = data;
          
            //init the social links in the footer
            this.initSocial();
          
            //dynamically load scripts onload
            this.initScripts();
            
            //initialize kissmetrics
            this.initKissMetrics();
           
            //initialize MyBuys, if util-mybuys.js included on the page
            if (this.MyBuys) {
                this.MyBuys.init();
            }
            
            //if our init has been exteded by a library plugin, call the
            //initialization as well.
            if (this.constructor.prototype.init) {
                this.constructor.prototype.init.call(this, data, callback);
            }

            initialized = true;
            
        };
        
        
        /* ----------------------------------------------------- */
        /*                                                       */
        /*               Context Data Methods                    */
        /*                                                       */
        /* ----------------------------------------------------- */

        /**
        * Gets context data
        * @param {string} the key to the data to be retrieved
        * @return {object} the data that is stored under the key
        * @method getContextData
        */
        this.getContextData = function(key) {
            return contextData.data[key] || false;
        };

        /**
        * set context data
        * @param {string} the key to store the value in
        * @param {object} the value to be stored in contextData
        * @return {void}
        * @method setContextData
        */
        this.setContextData = function(key, value) {
            contextData.data[key] = value;
        };

        /**
        * Gets context string (usually markup)
        * @param {string} the key to the string to be retrieved
        * @return {string} the string that is stored under the key
        * @method getContextString
        */
        this.getContextString = function(key) {
            return contextData.strings[key];
        };

        /**
        * set context string
        * @param {string} the key to store the value in
        * @param {string} the value to be stored in contextData
        * @return {void}
        * @method setContextString
        */
        this.setContextString = function(key, value) {
            contextData.strings[key] = value;
        };
        
        
        /* ----------------------------------------------------- */
        /*                                                       */
        /*                   DOM Methods                         */
        /*                                                       */
        /* ----------------------------------------------------- */
        
        
        /**
        * Preforms an HTML query on the specified query string.
        * If the prototype of Utility has a query method, then the prototype is used
        * if querySelectorAll is not present, otherwise querySelectorAll is used and jQuery
        * by default.  This function returns only one result
        * @param {string} css2 selector string
        * @param {HTMLElement} the containing element - *optional*
        * @return {HTMLElement}
        * @method one
        */
        this.one = function(string, parent) {

            var result;

            parent = parent || document;

            if (document.querySelectorAll) {
                result = parent.querySelectorAll(string);
            } else {
                if (this.constructor.prototype.one) {
                    result = this.constructor.prototype.one(string, parent);
                } else {
                    result = $(parent).find(string);
                }
            }
            
            if (result && result.length) {
                return result[0];
            }
            
            return result;
            
        };
                
        /**
        * Appends the content string into the container
        * @param {HTMLElement} container - the container to append the item to
        * @param {string} content - the content to append
        * @return {void}
        * @method append
        */
        this.append = function(container, content) {
            
            if (this.constructor.prototype.append) {
                this.constructor.prototype.append(container, content);
            } else {
                $(container).append(content);
            }
            
        };
        
        /**
        * Returns the height of the document
        * @return {Number} the height of the document
        * @method getDocHeight
        */
        this.getDocHeight = function() {
            
            if (this.constructor.prototype.getDocHeight) {
                return this.constructor.prototype.getDocHeight();
            } else {
                return $(document).height();
            }
            
        };
        
        /**
        * Add a class to an item
        * @param {String} the class name to add
        * @param {HTMLElement} the item to add the class to
        * @return {void}
        * @method addClass
        */
        this.addClass = function(cls, item) {
            
            var classes = item.className ? item.className.split(' ') : [],
                length = classes.length;
                
            //shouldn't be many classes, may not be the best way
            //but i think it is more reliable and quicker than string manipulation
            while(length--) {
                if (classes[length] === cls) {
                    return;
                }
            }
            
            classes.push(cls);
            item.className = classes.join(' ');
        };
        
        /**
        * Remove a class from an item
        * @param {String} the class name to remove
        * @param {HTMLElement} the item to remove the class name from
        * @return {void}
        * @method remove
        */
        this.removeClass = function(cls, item) {
            
            var classes = item.className ? item.className.split(' ') : [],
                length = classes.length;
                
            //shouldn't be many classes, may not be the best way
            //but i think it is more reliable and quicker than string manipulation
            while(length--) {
                if (classes[length] === cls) {
                    classes.splice(length, 1);
                    item.className = classes.join(' ');
                    return;
                }
            }
            
        };
        
        /**
        * Execute a callback on end of the transition
        * @param {HTMLElement} the element to listen to transition end on
        * @param {Function} the callback to execute on transition end
        * @return {void}
        * @method onTransitionEnd
        */
        this.onTransitionEnd = function(node, callback) {
            
            //remove the listener after the callback has executed
            var wCallback = function() { //webkit
                    callback();
                    node.removeEventListener('webkitTransitionEnd', wCallback, false);
                },
                fCallback = function() { //firefox
                    callback();
                    node.removeEventListener('transitionend', wCallback, true);
                },
                oCallback = function() { //opera
                    callback();
                    node.removeEventListener('oTransitionEnd', wCallback, true);
                }; //deal with IE 10 as well
            
            node.addEventListener('webkitTransitionEnd', wCallback, false);
            node.addEventListener('transitionend', fCallback, true);
            node.addEventListener('oTransitionEnd', callback, true);
            
            
        };
        
        /**
        * Close an inline alert dialog
        * @param {Y.Event} event
        * @return {void}
        * @method closeAlert
        */
        this.closeAlert = function(e) {

            if (this.constructor.prototype.closeAlert) {
                this.constructor.prototype.closeAlert(e);
            } else {
                            
                var targ = e.target || e.srcElement,
                    parentClass = targ.getAttribute('data-dismiss'),
                    parent;

                if (parentClass) {
                
                    parent = targ.parentNode;
                    while( !((' ' + parent.className + ' ').indexOf(' ' + parentClass + ' ') + 1) > 0 ) {
                        parent = parent.parentNode;
                    }
                
                    self.addClass('fade', parent);
                    self.onTransitionEnd(parent, function(){
                        self.removeClass('fade');
                        self.addClass('hide');
                    });

                }
            
            }

        };
        
        
        /* ----------------------------------------------------- */
        /*                                                       */
        /*                   Dialog Methods                      */
        /*                                                       */
        /* ----------------------------------------------------- */

        /**
        * Shows a dialog with the associated content
        * @param {string} string - content of the dialog to show
        * @param {boolean} modal - default is yes to make the dialog modal
        * @return {void}
        * @method showDialog
        */
        this.showDialog = function(string, modal) {

            if (self.constructor.prototype.showDialog) {
                self.constructor.prototype.showDialog(string, modal);
            } else {
                
                var modal = typeof(modal) !== "undefined" ? modal : true;

                if (!this.dialog) {
                    this.createDialog();
                }

                if (modal) {
                    this.mask();
                }

                this.one('.bd', this.dialog).innerHTML = string;
                this.dialog.className = 'modal fade in'; //reset the class names
                
            }
            
        };
        
        
        /**
        * hides a dialog with the associated content
        * @param {HTMLEvent} e - the event
        * @return {void}
        * @method hideDialog
        */
        this.hideDialog = function(e) {
            
            if (self.constructor.prototype.hideDialog) {
                self.constructor.prototype.hideDialog(e);
            } else {
                
                if (!self.constructor.prototype.closeAlert) {
                    self.closeAlert(e)
                }

                //clear the classname after it has faded out
                self.onTransitionEnd(self.dialog, function() {
                    self.dialog.className = 'modal hide';
                });

                self.unmask();
                
            }

        };


        /**
        * Creates a dialog from the context string
        * @return {void}
        * @method createDialog
        */
        this.createDialog = function() {

            if (self.constructor.prototype.createDialog) {
                self.constructor.prototype.createDialog();
            } else {
                
                this.append( this.one('body'), this.getContextString('dialog') );
                this.dialog = this.one('#dialog-container');

                //add the close event - need this to work cross browser/cross lib so don't use addEventListenr
                this.one('.hd .close', this.dialog).onclick = this.hideDialog;
                
            }
            
        };

        /**
        * Resizes the dialog to the width / height and centers it
        * @param {string} w - the width to resize to
        * @param {string} h - the heigh to resize to
        * @return {void}
        * @method resizeDialog
        */
        this.resizeDialog = function(w, h) {

            if (this.dialog) {

                if (!!w) {
                    this.dialog.style.width = w;
                }

                if (!!h) {
                    this.dialog.style.height = h;
                }

                //center it
                this.dialog.style.marginLeft = ( -1 * (this.dialog.offsetWidth/2) ) + 'px';
                this.dialog.style.marginTop = ( -1 * (this.dialog.offsetHeight/2) ) + 'px';

            }

        };
        
        /**
        * Adds a class name to the dialog
        * @param {string} Class Name to add
        * @return {void}
        * @method addDialogClass
        */
        this.addDialogClass = function(cls) {
            
            if (self.constructor.prototype.addDialogClass) {
                self.constructor.prototype.addDialogClass(cls);
            } else {
                this.addClass(cls, this.dialog);
            }
            
        };


        /* ----------------------------------------------------- */
        /*                                                       */
        /*               Common DOM Methods                      */
        /*                                                       */
        /* ----------------------------------------------------- */

        /**
        * Masks the screen with an overlay
        * @return {void}
        * @method mask
        */
        this.mask = function() {

            if (!this.screenMask) {
                this.createMask();
            }

            this.screenMask.style.width = '100%';
            this.screenMask.style.height = this.getDocHeight() + 'px';
            this.screenMask.style.display = 'block';  

        };

        /**
        * Closes the mask
        * @return {void}
        * @method unmask
        */
        this.unmask = function() {
            
            if (this.screenMask) {
                this.screenMask.style.display = 'none';
            }

        };

        /**
        * Creates the mask element
        * @param {Number} h
        * @param {Number} w
        * @return {void}
        * @method createMask
        */
        this.createMask = function() {

            this.append( this.one('body'), this.getContextString('mask') );
            this.screenMask = this.one('#screen-mask');
            this.screenMask.onclick = this.hideDialog;
        
        };        
        
        
        /* ----------------------------------------------------- */
        /*                                                       */
        /*               Dynamic Script Loading                  */
        /*                                                       */
        /* ----------------------------------------------------- */
        
        /**
        * Sets the scripts to be dynamically loaded and adds the onload handler
        * @return {void}
        * @method initScripts
        */
        this.initScripts = function() {
            
            //load the scripts from the context data
            for (var i=0, j=contextData['scripts'].length; i<j; i++) {
                this.addScriptToLoad({ url: contextData['scripts'][i]});
            }
            
            if (window.addEventListener) { 
                window.addEventListener("load", this.loadScripts, false); 
            } else if (window.attachEvent) { 
                window.attachEvent("onload", this.loadScripts); 
            }
            
        };
        
        /**
        * Public method to add a script to delay load, this needs to be executed before the
        * page has loaded
        * @param {object} object containing two properties, url and oncomplete, but oncomplete is optional
        * @return {void}
        * @method addScriptToLoad
        */
        this.addScriptToLoad = function(obj) {
          
            scripts.push( obj );
            
        };
        
        /**
        * Dynamically loads all of the scripts specified
        * @return {void}
        * @method loadScripts
        */
        this.loadScripts = function() {
                    
            for (var i=0, j=scripts.length; i<j; i++) {
                self.loadScript( scripts[i].url, scripts[i].oncomplete );
            }
            
        };
        
        /**
        * Loads a script dynamically
        * @param {string} url - the asset to load
        * @param {Boolean} before - if we should load the script before the other scripts or not 
        * @return {void}
        * @method loadScript
        */
        this.loadScript = function(url, fn) {
            
            var script = document.createElement('script'),
                scripts = document.getElementsByTagName('script'),
                first,
                head;
             
            script.type = 'text/javascript'; 
            script.async = true;
            
            // callback function is specified, execute the callback after 
            // the script has loaded
            if (!!fn) {
                
                if (script.readyState) { //IE
                    script.onreadystatechange = function() {
                        if (script.readyState === 'loaded' || script.readyState === 'complete') {
                            script.onreadystatechange = null;
                            fn();
                        }
                    }
                } else {
                    script.onload = function() {
                        fn();
                    }
                }
                
            }
            
            script.src = url;
            
            if (scripts.length) {
                first = scripts[0];
                first.parentNode.insertBefore(script, first);
            } else {
                head = document.getElementsByTagName('head')[0];
                head.appendChild(script);
            }
            
        };
        
        /* ----------------------------------------------------- */
        /*                                                       */
        /*               Social Event Helpers                    */
        /*                                                       */
        /* ----------------------------------------------------- */
        
        /**
        * Initializes the social footer links by delay loading the
        * JavaScript.
        * @return {void}
        * @method initSocial
        */
        this.initSocial = function() {
            
            if (document.getElementById('social-footer-con')) {
                this.addScriptToLoad({'url': '//connect.facebook.net/en_US/all.js#xfbml=1'});
                this.addScriptToLoad({'url': '//platform.twitter.com/widgets.js'});
                this.addScriptToLoad({'url': '//apis.google.com/js/plusone.js'});                
            }
            
        };
        
        /* ----------------------------------------------------- */
        /*                                                       */
        /*               Kiss Metrics Methods                    */
        /*                                                       */
        /* ----------------------------------------------------- */
        
        /**
        * Initialize Kiss Metrics variables
        * @return {void}
        * @method initKissMetrics
        */
        this.initKissMetrics = function() {
            
            if (this.getContextData('user_email')) {
                _kmq.push(['identify', this.getContextData('user_email')]);
            }
            
            //if we have queued up actions - add them now
            for (var i=0, j=_kmqQueue.length; i<j; i++) {
                _kmq.push( _kmqQueue[i] );
            }
            
        };
        
        /**
        * Record an event that has occured, currently we are using kiss metrics
        * but abstract the metric storing device from the frontend
        * @param {string} name - the event name to store
        * @param {Object} data - *optional* the data to store
        * @return {void}
        * @method record
        */
        this.record = function(name, data) {

            var queue = !initialized ? _kmqQueue : _kmq;
            if (typeof(data) !== "undefined") {
                queue.push(['record', name, data]);
            } else {
                queue.push(['record', name]);
            }
            
        };
        
        /********************************************************************/
        /*                                                                  */
        /*               KISS Metrics Saas Events                           */
        /*                                                                  */
        /********************************************************************/
        
        /**
        * Track the sale event using kissmetrics
        * @param {Number} amount - the amount of the purchase
        * @param {Object} data - the types of items that they have purchased
        * @return {void}
        * @method recordSale
        */
        this.recordSale = function(amount, data) {
            
            var queue = !initialized ? _kmqQueue : _kmq;            
            queue.push(['billed', amount, 'Purchase', data]);
            
        };
        
        /**
        * Record a user signup
        * @return {void}
        * @method recordSignup
        */
        this.recordSignup = function() {

            var queue = !initialized ? _kmqQueue : _kmq;            
            queue.push(['signedUp']);
            
        };
        
        
    }
    
    //define the indochino namespace
    if (typeof(indo) === "undefined") indo = {};
    
    //Util will be an instance of the Utility class
    indo.Util = new Utility();
       
}());

//need to declare kmq in the global scope
if (typeof(_kmq) === "undefined") _kmq = [];

/** 
 * We extend the library independent utility module here to add the 
 * YUI specific code.  This file extends the Utility class to initialize
 * and load all of the YUI modules as well as add all of the single event
 * handlers so that we can delegate based on them.  Additionally, some
 * Utility methods (dialogs) are provided here as well, though these methods
 * rely upon YUI.
 *
 * This file must be loaded directly after the Util.js file for pages that have YUI
 * and before the init call is executed.
 *
 * @module      Util-YUI
 * @author      Preet Jassi
 * @copyright   (c) 2012 Indochino Apparel Inc. 
 */
(function() {
    
    
    var Utility = indo.Util.constructor,
    
        /**
        * Number of milliseconds a fade takes (via class name)
        * @type {Number}
        * @property FADE_TIME
        */
        FADE_TIME = 150,
    
        /**
        * className to callback mapping for util events
        * @type {object}
        * @property eventMap
        */
        eventMap = {},

        /**
        * stores all of the event handles
        * @type {Array}
        * @property eventHandles
        */
        eventHandles = [],

        /**
        * Contains a hash of modules that are currently included on
        * The page that we need to include - may have to swap to an array.
        * By defualt it contains the YUI modules that the util requires to load 
        * @property {object} modules
        */
        modules = {
            'event': 1,
            'node': 1,
            'io': 1,
            'json': 1,
            'transition': 1
        },

        /**
        * Instance of YUI() that we are using
        * @property {object} Y
        */
        Y;


    /* -------------------------------------------------------  */
    /*                                                          */
    /*                   Helper Methods                         */
    /*                                                          */
    /* -------------------------------------------------------- */    

    /**
    * Callback for init after YUI has loaded properly, adds event handlers
    * and caches variables.
    * @param {object} lib - the YUI library instance
    * @return {void}
    * @method _init
    */
    function _init(lib) {

        //store YUI
        Y = lib;

        //add events that will bubble up
        Y.on('domready', Y.bind(function(){

            //store the event handles for easy removal later
            eventHandles[eventHandles.length] = Y.on('click', this.onviewevent, document, this);
            eventHandles[eventHandles.length] = Y.on('keydown', this.onkeyevent, document, this);
            eventHandles[eventHandles.length] = Y.on('resize', this.onresizeevent, window, this);
            eventHandles[eventHandles.length] = Y.all('form').on('submit', this.onsubmitevent, this);
            eventHandles[eventHandles.length] = Y.on('unload', this.destruct, window, this);
            eventHandles[eventHandles.length] = Y.all('.select-wrap select').on('change', this.onselectchange, this);

            //initialize the selected value for the selects
            initSelects();

            //let all the subscribing modules know that we have initialized
            Y.fire('util:init');            

        }, this));

    }
    
    /**
    * Changes the selected value for the select boxes 
    * @return {void}
    * @method initSelecs
    */
    function initSelects() {
        
        Y.all('.select-wrap').each(function(customSelect){
            
            var activeOption = Y.Lang.trim( customSelect.one('.active-option').get('innerHTML') ).toLowerCase(),
                select = customSelect.one('select'),
                options = select.all('option'),
                selectedIndex = select.get('selectedIndex');
            
            //if the text value is not the same as the select value, find the option that it
            //should correspond to and select it
            if ( Y.Lang.trim(options.item(selectedIndex).get('innerHTML')).toLowerCase() !== activeOption ) {
                options.each(function(opt){
                    if (Y.Lang.trim(opt.get('innerHTML')).toLowerCase() === activeOption) {
                        opt.set('selected', 'selected');
                    }
                });
            }
            
        });
        
    }
    
    
    /**
    * @return {void}
    * @method showInlineError
    */
    function showInlineError(child) {
        
        if (typeof(child) !== 'undefined') {
        
            var controlGroup = child.ancestor('.control-group');
            if (controlGroup && controlGroup.one('.help')) {
                controlGroup.addClass('error');
                return true;
            } 
        
        }
        
        return false;
        
    }
    
    /**
    * @return {void}
    * @method showAlertError
    */
    function showAlertError(child, msg) {
        
        
        if (typeof(child) !== 'undefined') {
        
            var parentForm = child.ancestor('.form-horizontal'),
                text = msg ? msg : '',
                errorCon;
        
            //return true if we have shown the alert error, false 
            //if there is no inline alert box
            if (parentForm && parentForm.one('.alert-error')) {
 
                //hide all previous alerts
                parentForm.all('.alert').addClass('hide');

                errorCon = parentForm.one('.alert-error');
                errorCon.one('p').setContent( msg );

                errorCon.removeClass('hide');
                errorCon.removeClass('fade');
                errorCon.removeClass('in');
                errorCon.addClass('transparent');

                setTimeout(function(){

                    errorCon.addClass('fade')
                    errorCon.addClass('in');
                    errorCon.removeClass('transparent');

                }, 100);

                return true;
        
            }
        
        }
        
        return false;
        
    }
    
    /**
    * @return {void}
    * @method showAlertSuccess
    */
    function showAlertSuccess(child, msg) {
        
        if (typeof(child) !== 'undefined') {
        
            var parentForm = child.ancestor('.form-horizontal'),
                successCon;
        
            if (parentForm && parentForm.one('.alert-success')) {
            
                //hide all previous alerts
                parentForm.all('.alert').addClass('hide');
            
                successCon = parentForm.one('.alert-success');
                successCon.replaceClass('hide', 'transparent');
            
                if (typeof(msg) !== "undefined") {
                    successCon.one('p').setContent(msg);
                }
            
                //fade the success container in - might not be the best
                //way to go about doing things ....
                setTimeout(function() {
                
                    successCon.addClass('fade')
                    successCon.addClass('in');
                    successCon.removeClass('transparent');
                
                }, 100);
            
                return true;
                                        
            }
            
        }
        
        return false;
    
    }
    

    /**
    * @type {Y.Node}
    * @property screenMask
    */

    /**
    * @type {Y.Node}
    * @property dialog
    */

    /* ----------------------------------------------------- */
    /*                                                       */
    /*              Core Sandbox Methods                     */
    /*                                                       */
    /* ----------------------------------------------------- */

    /**
    * Triggers the YUI use statement.
    * There should only be one YUI use statement.  Init should only
    * be called once at the end of the body with the contextData dumped.
    * Everytime we include some JS, we use the util register which keeps
    * track of the modules that we should use.
    * @param {object} data - the context data that is dumped from the PHP Context singleton
    * @param {Function} callback - the callback function for the YUI use statement
    * @return {void}
    * @method init
    */
    Utility.prototype.init = function(data, callback) {

        var self = this,
            args = [],
            module,
            yuiConfig = {};
        
        //convert the modules to a moduleList for YUI().use    
        for (module in modules) {
            if (modules.hasOwnProperty(module)) {
                args.push(module);
            }
        }

        //init the events
        this.initEvents();

        // we will overwrite the combo base in the case that we start
        // serving the YUI assets
        if (this.getContextData('comboBase')) {
            yuiConfig.combine = true;
            yuiConfig.comboBase = this.getContextData('comboBase'); 
        }

        //trigger the YUI use
        YUI(yuiConfig).use(args, function(Y){

            //use the YUI library right meow
            Y.bind(_init, self)(Y);

            if (typeof(callback) !== "undefined") {
                callback(Y);
            }

        });

    };

    /**
    * Sets the className to callback event mapping that is used
    * for utility methods for our single onclick handler
    * @return {void}
    * @method initEvents
    */
    Utility.prototype.initEvents = function() {

        eventMap = {
            'btn-toggle': this.toggleItem,
            'close': this.closeAlert
        };    

    };

    /**
    * Centralized registry for module addition to ease module initiation
    * @param {string} moduleName - the name of the module that we want to register
    * @param {Function} moduleCode - the moduleCode that uses YUI instance
    * @param {string} version *optional*
    * @param {Function} config *optional* - config that is passed to YUI
    * @return {void}
    * @method register
    */
    Utility.prototype.register = function(moduleName, moduleCode, version, config) {

        modules[moduleName] = 1;

        //make sure that we include the YUI libraries that are required
        //by the modules, add them to the list of modules so can be included
        if ( (typeof(config) !== "undefined") && config.required) {
            for (var i=0, j=config.required.length; i<j; i++) {
                modules[config.required[i]] = 1;
            }
        }

        YUI.add(moduleName, moduleCode, version, config);

    };

    /* ----------------------------------------------------- */
    /*                                                       */
    /*           Centralized Event Handlers                  */
    /*                                                       */
    /* ----------------------------------------------------- */


    /**
    * generic click handler that everything subscribes to
    * @param {Y.Event}
    * @return {void}
    * @method onviewevent
    */
    Utility.prototype.onviewevent = function(e) {

        //a little overkill but eventMap for the dialog
        var targ = e.target,
            classes = targ.get('className').split(' '),
            length = classes.length;

        //determine callback function dependant upon the classname of the target
        while (length--) {
            if (eventMap[classes[length]]) {
                eventMap[classes[length]].call(this, e);
                Y.fire('util:onviewevent', e);
                e.preventDefault();
                return false;
            }
        }
        
        Y.fire('util:onviewevent', e);

    };

    /**
    * generic keydown handler that everything subscribes to
    * @param {Y.Event}
    * @return {void}
    * @method onkeyevent
    */
    Utility.prototype.onkeyevent = function(e) {
        Y.fire('util:onkeyevent', e);
    };

    /**
    * generic resize handler that everything subscribes to
    * @param {Y.Event}
    * @return {void}
    * @method onresizeevent
    */
    Utility.prototype.onresizeevent = function(e) {
        Y.fire('util:onresizeevent', e);
    };        

    /**
    * catches all of the submit events, and has a default behaviour for
    * ajax request forms
    * @param {Y.Event}
    * @return {void}
    * @method onsubmitevent
    */
    Utility.prototype.onsubmitevent = function(e) {

        Y.fire('util:onsubmitevent', e);

        var targ = e.target,
            submitTrigger;

        //we also have a default behaviour - if it is an ajax form that is
        if (targ.hasClass('ajax_request_form') || (targ.getAttribute('data-submit') === 'ajax')) {

            //make sure that there are no errors:
            if (this.validate(targ)) {
                
                submitTrigger = targ.one('input[type=submit]') || targ.one('button[type=submit]');
                if (submitTrigger) {
                    submitTrigger.addClass('btn-loading');
                    submitTrigger.set('disabled', 'disabled');
                    if (submitTrigger.ancestor('.control-group')) {
                        submitTrigger.ancestor('.control-group').removeClass('error');
                    }
                }

                //kind of stupid you have to specify the action and method...
                Y.io(targ.getAttribute('action'), {
                    method: targ.getAttribute('method'),
                    form: {
                        id: targ
                    },
                    on: {
                        complete: this.handleSubmitEvent
                    },
                    context: this,
                    arguments: submitTrigger
                });

            }
            

            e.preventDefault();
            return false;

        }

    };
    
    /**
    * Method that updates the selected text field for the new styled form inputs
    * @param {Y.Event}
    * @return {void}
    * @method onselectchange
    */
    Utility.prototype.onselectchange = function(e) {
        
        var select = e.target,
            activeOption = select.previous('.active-option');
            
        activeOption.setContent( select.get('options').item( select.get('selectedIndex') ).get('innerHTML') );

    };

    /**
    * Cleans up all stored vars and such for the util
    * @return {void}
    * @method destruct
    */
    Utility.prototype.destruct = function() {

        //let other modules cleanup
        Y.fire('util:destruct');

        //detach events
        for (var i=0,j=eventHandles.length;i<j;i++) {
            eventHandles[i].detach();
            eventHandles[i] = null;
        }

        //cleanup stored vars
        indo.Util.modules = null;

    };
    
    /* ----------------------------------------------------- */
    /*                                                       */
    /*                 Generalized Utils                     */
    /*                                                       */
    /* ----------------------------------------------------- */
    
    
    /**
    * Utility used to toggle hidden / display on an element.
    * Any element with the class name btn-toggle will execute this
    * method.  The element (or its immediate parent) can then have a toggle
    * class and a target to assign that toggle class to.
    * @param {Y.Event} event
    * @return {void}
    * @method toggleItem
    */
    Utility.prototype.toggleItem = function(e) {
        
        var targ = e.target,
            targ = targ.getAttribute('data-toggle-class') ? targ : targ.get('parentNode'),
            toggleClass = targ.getAttribute('data-toggle-class'),
            toggleTarget = Y.one( targ.getAttribute('data-target') );
            
        targ.toggleClass('toggled');
        toggleTarget.toggleClass( toggleClass );
        
    };
    
    /**
    * Close an inline alert dialog
    * @param {Y.Event} event
    * @return {void}
    * @method closeAlert
    */
    Utility.prototype.closeAlert = function(e) {
        
        var targ = e.target,
            parent;
    
        if (targ.getAttribute('data-dismiss')) {
            
            parent = targ.ancestor('.' + targ.getAttribute('data-dismiss'));
            parent.removeClass('in');
            parent.addClass('fade');
            setTimeout(function(){
                parent.replaceClass('fade', 'hide');
            }, FADE_TIME);
            
        }
        
    };
    
    
    /**
    * Validates the form
    * @param {HTMLFormElement}
    * @return {Boolean} true if there are any errors, false otherwise
    * @method validate
    */
    Utility.prototype.validate = function(form) {
        
        var inputs = form.all('input[data-validate]'),
            selects = form.all('select[data-validate]'),
            textareas = form.all('textarea[data-validate]'),
            valid = true,
            _validate = function(item) {
                if (item.getAttribute('data-validate') === 'required') {
                    if (Y.Lang.trim(item.get('value') ) === '') {
                        valid = false;
                        item.ancestor('.control-group').addClass('error');
                    } else {
                        item.ancestor('.control-group').removeClass('error');
                    }
                }
            };

        inputs.each(_validate);
        selects.each(_validate);
        textareas.each(_validate);
        
        return valid;
        
    };
    
    /**
    * Scrolls to an element on the page
    * @param {HTMLElement}
    * @return {void}
    * @method scrollTo
    */
    Utility.prototype.scrollTo = function(elm, callback, scope) {
        
        var top = elm.getY(),
            myAnim = new Y.Anim({
                node: Y.UA.webkit ? 'body' : 'html',
                to: {
                    scrollTop: top
                },
                duration: 0.4
            });
            
        if (typeof(callback) !== "undefined") {
            myAnim.on('end', callback, scope);
        }
        
        myAnim.run();
        
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
    Utility.prototype.showDialog = function(string, modal) {

        var modal = typeof(modal) !== "undefined" ? modal : true;

        if (!this.dialog) {
            this.createDialog();
        }

        if (modal) {
            indo.Util.mask();
        }
        
        this.dialog.one('.bd').setContent(string);
        this.dialog.set('className', 'modal'); //reset the class names
        
        if (Y.UA.mobile) {
            
            var self = this,
                h = this.dialog.get('offsetHeight');
                
            this.dialog.setStyle('position', 'absolute');
            this.dialog.setStyle('top', window.pageYOffset + 'px');
            this.dialog.setStyle('marginTop', '0');
        
        }
        
        this.dialog.setStyle('opacity', '0');
        this.dialog.transition({
            opacity:1,
            duration: 0.2
        });
        
    };
    
    
    /**
    * hides a dialog with the associated content
    * @param {HTMLEvent} e - the event
    * @return {void}
    * @method hideDialog
    */
    Utility.prototype.hideDialog = function(e) {
        
        if (this.dialog) {
        
            //clear the classname after it has faded out
            var dialog = this.dialog;
        
            dialog.transition({
                opacity: 0,
                duration: 0.2
            }, function(){
                dialog.set('className', 'modal hide');
            });
        
            indo.Util.unmask();
            
            Y.fire('util:hide-dialog');
            
            if (typeof(e) !== 'undefined') {
                e.preventDefault();
            }
            
            return false;

        }

    };


    /**
    * Creates a dialog from the context string
    * @return {void}
    * @method createDialog
    */
    Utility.prototype.createDialog = function() {
        
        Y.one('body').append( indo.Util.getContextString('dialog') );

        this.dialog = Y.one('#dialog-container');
        
        //add the close event - need this to work cross browser/cross lib so don't use addEventListenr
        this.dialog.one('.hd .close').on('click', this.hideDialog, this);
        
    };
    
    /**
    * Creates a dialog from the context string
    * @return {void}
    * @method createDialog
    */
    Utility.prototype.addDialogClass = function(cls) {
        
        this.dialog.addClass(cls);
        
    };
    
    
    /* ----------------------------------------------------- */
    /*                                                       */
    /*                 DOM Method Wrappers                   */
    /*                                                       */
    /* ----------------------------------------------------- */
    
    /**
    * Preforms an HTML query on the specified query string.
    * This function returns only one result
    * @param {string} CSS2 selector string
    * @param {HTMLElement} the containing element - *optional*
    * @return {HTMLElement}
    * @method one
    */
    Utility.prototype.one = function(string, parent) {
        
        return Y.one( parent ).one( string )._node;
        
    };
    
    /**
    * Appends the content string into the container
    * @param {HTMLElement} container - the container to append the item to
    * @param {string} content - the content to append
    * @return {void}
    * @method append
    */
    Utility.prototype.append = function(container, content) {
        
        Y.one( container ).append( content );
        
    };
    
    /**
    * Returns the height of the document
    * @return {Number} the height of the document
    * @method getDocHeight
    */
    Utility.prototype.getDocHeight = function() {
        
        return Y.one(document.body).get('docHeight')
        
    };
    

    /* ----------------------------------------------------- */
    /*                                                       */
    /*                    AJAX Methods                       */
    /*                                                       */
    /* ----------------------------------------------------- */        


    /**
    * Makes an AJAX request
    * @param {string} url the url to make the AJAX request to
    * @param {string} data the post data
    * @param {Function} callback - the complete callback
    * @param {Object} scope the scope of the callback
    * @return {void}
    * @method makeRequest
    */
    Utility.prototype.makeRequest = function(url, callback, params, scope, args, method) {

        //the configuration object
        var oMethod = method || 'post',
            cfg = {
                method: oMethod,
                on: {
                    complete: callback
                },
                context: scope,
                arguments: args
            };

        //support both a query string and a form
        if ( typeof(params) === 'string') {
            cfg.data = params;
        } else {
            cfg.form = {
                id: params
            };
        }

        Y.io(url, cfg);

    };

    /* ----------------------------------------------------- */
    /*                                                       */
    /*               XHR Response Methods                    */
    /*                                                       */
    /* ----------------------------------------------------- */

    /**
    * handles the form submission event that occured
    * @param {Y.Event}
    * @return {void}
    * @method handleSubmitEvent
    */
    Utility.prototype.handleSubmitEvent = function(id, o, args) {

        if (o.status !== 200) {
            
            var simplifiedForm = args.ancestor('.form-simplified'),
                horizontalForm = args.ancestor('.form-horizontal');
            
            if (simplifiedForm) {
                showInlineError(args)
            } else if (horizontalForm) {
                showAlertError(args);
            } else {
                this.showDialog( this.getContextString('error') );
            }
            

        } else {

            if (Y.Lang.trim(o.responseText) !== "") {

                var data = Y.JSON.parse(o.responseText);

                switch(data.method) {

                    case 'dialog':
                        
                        //show the dialog if we cannot show the inline error
                        if (data.type === 'red') {
                            if (!showInlineError(args) && !showAlertError(args, data.dialog_text)) {
                                this.showDialog( '<p>' + data.dialog_text + '</p>' );
                                this.addDialogClass('error');
                            }
                        } else {
                            
                            if (!showAlertSuccess(args, data.dialog_text)) {    
                                this.showDialog( '<p>' + data.dialog_text + '</p>' );
                                this.addDialogClass('error');
                            }
                            
                        }
                        
                    
                    break;

                    case 'redirect':
                        window.location.href = data.uri;
                    break;

                    case 'refresh':
                        window.location.reload( true );
                    break;
                    
                    default:
                        //display the inline success message
                        showAlertSuccess(args);
                    break;

                }

            }

        }

        if (args) {

            args.removeClass('btn-loading');
            args.set('disabled', false);

            Y.fire('util:onsubmitcomplete', {
                response: o,
                target: args.ancestor('form')
            });

        } else {

            Y.fire('util:onsubmitcomplete', {
                response: o
            });

        }


    };

}());



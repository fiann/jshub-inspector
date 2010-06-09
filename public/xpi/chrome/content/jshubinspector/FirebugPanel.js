/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Christoph Dorn.
 *
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Christoph Dorn <christoph@christophdorn.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */



FBL.ns(function() { with (FBL) { 
  
var BaseModule = Firebug.ActivableModule ? Firebug.ActivableModule : Firebug.Module;
const panelName = "JsHubInspector";
const jshub_ConsoleService = Components.classes['@mozilla.org/consoleservice;1'].
  getService(Components.interfaces.nsIConsoleService);

/**
 * Localization helpers
 */
function $LN_STR(name)
{
  return document.getElementById("strings_jshubinspector").getString(name);
}

function $LN_STRF(name, args)
{
    return document.getElementById("strings_jshubinspector").getFormattedString(name, args);
}

/**
 * Log a message to the system log
 */
function JsHubLogger(component) {
  this.log = function(msg) {
    jshub_ConsoleService.logStringMessage("jshub ("+component+"): " + msg)
  };
}


/***
 * The Firebug module for the jsHub inspector
 */
Firebug.JsHubInspectorModel = extend(BaseModule, 
{
  /**
   * Logger for this class
   */
  logger: new JsHubLogger("Model"),
  
  /**
   * Called by Firebug when Firefox window is opened.
   *
   * @param {String} prefDomain Preference domain (e.g. extensions.firebug)
   * @param {Array} prefNames Default Firebug preference array.
   */
  initialize: function(prefDomain, prefNames) 
  {
    this.logger.log("initializing");
    this.events = [];
  },
  
  /**
   * Peforms clean up when Firebug is destroyed.
   * Called by the framework when Firebug is closed for an existing Firefox window.
   */
  shutdown: function()
  {
    if (Firebug.getPref('defaultPanelName') == panelName) {
      Firebug.setPref('defaultPanelName', 'console');
    }
  },
  /**
   * Render the buttons for this panel.
   */
  showPanel: function(browser, panel) 
  { 
      var isShowing = panel && panel.name == panelName; 
      var JsHubInspectorButtons = browser.chrome.$("fbJsHubInspectorButtons"); 
      collapse(JsHubInspectorButtons, ! isShowing); 
  }, 
  
  /**
   * Display the configuration for the tag on the page.
   */
  onConfigButton: function() 
  { 
    FirebugContext.getPanel(panelName).printLine('Clicked Config Button'); 
  }, 
  
  /**
   * Display the events from the page. 
   */
  onEventsButton: function() 
  { 
    this.logger.log('Clicked events button');
    var panel = FirebugContext.getPanel(panelName);
    panel.hideView('console'); 
    panel.showView('events');
    panel.renderEvents();    
  },
  
  onEventsAllButton: function () {},
  onEventsPageButton: function () {},
  onEventsProductButton: function () {},
  onEventsOutButton: function () {},
  
  /**
   * Called by the framework when a context is created for Firefox tab.
   * 
   *  @param {Firebug.TabContext} Context for the current Firefox tab.
   */
  initContext: function(context)
  {
    BaseModule.initContext.apply(this, arguments);
  },
  
  /**
   * Called by the panel to retrieve the events which are displayed with the 
   * currently active filters.
   */
  getEvents: function() {
    this.logger.log("getEvents() entered");
    var window = FirebugContext.window, jsHub = window.wrappedJSObject.jsHub;
    this.logger.log("jsHub [" + typeof jsHub + "] in window ");
    if (typeof jsHub !== "object") {
      return null;
    } else {
      // have to assume that malicious code could try to evaluate code in the 
      var unsafeEvents = jsHub.cachedEvents();
      if (! unsafeEvents instanceof Array) {
        return null;
      }
      var filteredEvents = [], unsafeEvent, safe;
      for (var i = 0; i < unsafeEvents.length; i++) {
        unsafeEvent = unsafeEvents[i];
        safe = {};
        safe.type = unsafeEvent.type;
        safe.timestamp = unsafeEvent.timestamp;
        safe.data = {};
        for (var field in unsafeEvent.data) {
          // TODO should be a deep clone 
          if (unsafeEvent.data.hasOwnProperty(field) 
            && (typeof unsafeEvent[field] == 'string' 
              || typeof unsafeEvent[field] == 'number')) {
            safe.data[field] = unsafeEvent.data[field];
          }
        }
        filteredEvents.push(safe);
      }
      return filteredEvents;
    }
  }
  
}); 

/*****************************************************************************/
// Panel Implementation

/**
 * @panel This class represents the Inspector panel that is displayed within
 * Firebug UI.
 */
var BasePanel = Firebug.ActivablePanel ? Firebug.ActivablePanel : Firebug.Panel;

function JsHubInspectorPanel() {
  this.logger = new JsHubLogger("Panel");
};

JsHubInspectorPanel.prototype = extend(BasePanel, 
{ 
    name: panelName, 
    title: $LN_STR("jshub.panel.title"),
    searchable: false, 
    editable: false,

    initialize: function() {
      Firebug.Panel.initialize.apply(this, arguments);
    },
    
    printLine: function(message) {
      var elt = this.document.createElement("p");
      elt.innerHTML = message;
      this.panelNode.appendChild(elt);
    },
    
    showView: function(name) {
      this.logger.log('Panel', "Showing " + name + " view");
      Templates.EventsTable.render({}, this.panelNode); 
    },
    
    hideView: function(name) {
      this.printLine("Hiding " + name + " view");
    },
    
    renderEvents: function() {
      var model = Firebug.JsHubInspectorModel;
      var events = model.getEvents();
      if (events === null) {
        this.printLine("jsHub is not installed");
      } else if (events.length == 0) {
        this.printLine("No events to show");
      } else {
        var evt, i, evtNode, field;
        for (i = 0; i < events.length; i++) {
          evt = events[i];
          evtNode = Templates.Event.eventNode.append(
            {eventName: evt.type},
            this.panelNode,
            null);
          for (field in evt.data) {
            Templates.Event.dataNode.append(
            { name: field, value: evt.data[field] },
              evtNode,
              null);
          }
        }
      }
    }
    
}); 

/*****************************************************************************/
/*
 * Templates for rendering visible elements
 */
var Templates = Firebug.JsHubInspectorModel.Templates = {};

Templates.Rep = domplate(Firebug.Rep, {});

Templates.EventsTable = domplate(Templates.Rep, {
  tableTag:
    TABLE({"class": "jshubEventsTable", cellpadding: 0, cellspacing: 0, hiddenCols: ""},
      TBODY(
        TR({"class": "jshubHeaderRow", onclick: "$onClickHeader"},
          TD({id: "colEventName", "class": "jshubHeaderCell alphaValue"},
            DIV({"class": "jshubHeaderCellBox", title: $LN_STR("jshub.header.eventname.tooltip")}, 
            $LN_STR("jshub.header.eventname"))
          ),
          TD({id: "colValue", "class": "jshubHeaderCell alphaValue"},
            DIV({"class": "jshubHeaderCellBox", title: $LN_STR("jshub.header.value.tooltip")}, 
            $LN_STR("jshub.header.value"))
          ),
          TD({id: "colTimestamp", "class": "jshubHeaderCell"},
            DIV({"class": "jshubHeaderCellBox", title: $LN_STR("jshub.header.timestamp.tooltip")}, 
            $LN_STR("jshub.header.timestamp"))
          )
        )
      )
    ),
    
    onClickHeader: function (event) {
      //do stuff
    },
    
    render: function (events, parentNode) {
      var table = this.tableTag.replace({}, parentNode, this);
    }
});

Templates.Event = domplate(Templates.Rep, {
  eventNode: DIV({class: 'event', onclick: "$onClickRoot"}, 
    SPAN("Event type: "),
    SPAN("$eventName"),
    UL()),
    
  onClickRoot: function(event) {
    alert("Clicky!");
  },
    
  dataNode: LI({class: 'eventData'},
    SPAN({class: 'eventDataName'}, "$name"),
    SPAN(': '),
    SPAN({class: 'eventDataValue'}, "$value"))
});


/*****************************************************************************/

// Later Firebug allows modules to be deactivated
if (Firebug.ActivableModule) {
  Firebug.registerActivableModule(Firebug.JsHubInspectorModel);  
}
else {
  Firebug.registerModule(Firebug.JsHubInspectorModel);  
}

Firebug.registerPanel(JsHubInspectorPanel); 

}});
/** 
 * jsHub JavaScript tag inspector
 */

/*global $ */

"use strict";

// execute on load 
(function () {
  var metadata = {
    appName : "Tag Inspector",
    version : "v2.0.dev"
  };
  
  debug.debug(metadata.appName + " " + metadata.version + " initializing");
  
  /**
   * A Panel is one of the accordion panels in the central area of the 
   * inspector.
   */
  var Panel = function (name) {
    this.name = name;
    this.id = name.toLowerCase().replace(/\W/g, "-");
    this.node = null;
    this.events = [];
  };
  
  /**
   * Render the panel, initially empty and inactive.
   */
  Panel.prototype.render = function () {
    debug.debug("Inspector: rendering panel " + this.id);
    var html = $("<div id='jshub-inspector-" + this.id + "'>"
      + "<h3 class='accordion-header'>"
      + "<a>" + this.name + "</a>"
      + "<span class='count'>" + this.events.length + "</span>"
      + "</h3>"
      + "<div class='accordion-content" + (this.events.length === 0 ? " empty" : "") + "'>"
      + "</div>"
      + "</div>");
    var accordion = $("#jshub-inspector-events #accordion");
    accordion.append(html);
    this.node = html;
    $.each(this.events, function (idx, evt) {
      this.renderEvent(evt);
    });
  };
  
  /**
   * Render an event in the panel
   */
  Panel.prototype.renderEvent = function (evt) {
    if (! evt.type || ! evt.data) {
      return;
    }
    if (this.node === null) {
      return;
    }
    var eventName = evt.type.substring(0, 1).toUpperCase() + evt.type.substring(1).replace('-', ' ');
    var html = "";
    if (this.events.length > 0) {
      html += "<hr class='event-separator' />";
    }
    html += "<p class='event-name'>" + eventName + "</p>";
    $('.accordion-content', this.node).append(html);
    $('.count', this.node).text(this.events.length);
  };
  
  /**
   * Record an event
   */
  Panel.prototype.addEvent = function (evt) {
    debug.log("Inspector: adding event " + evt.type + " to panel " + this.id);
    if (! evt.type || ! evt.data) {
      debug.warn("Inspector: invalid event, event.type or event.data is missing");
      return;
    }
    this.events.push(evt);
    this.renderEvent(evt);
  };
  
  /**
   * Constructor for the actual inspector embedded in the page.
   */
  var Inspector = function () {
    var self = this;
    self.state = "new";
    self.node = null;
    self.panels = {};
    
    /** 
     * Create the HTML for the Inspector, and append it to the <body> of the page
     */
    var renderWrapper = function () {
      // create inspector object
      var base = self.node = $("<div id='jshub-inspector' />");
      var components = {};

      // create header
      components.header = $("<div id='jshub-inspector-header'>" 
        + "<span class='title'>jsHub Tag Inspector</span>"
        + "<span class='container-close'>Close</span>"
        + "</div>");

      // create status panel
      components.status = $("<div class='success' id='jshub-inspector-status'>"
        + "<div class='text'>"
        + "<p class='self'>jsHub is</p>"
        + "<p class='message'>Installed &amp; active</p>"
        + "</div>");

      // create events panel
      components.events = $("<div id='jshub-inspector-events'>"
        + "<div id='accordion' />"
        + "</div>");

      // create footer panel
      components.footer = $("<div id='jshub-inspector-footer'>"
        + "<div class='logo'></div>"
        + "<div class='version'>" + metadata.appName + " " + metadata.version + "</div>"
        // + "<div class='resize-handle'></div>"
        + "</div>");

      base.append(components.header)
          .append(components.status)
          .append(components.events)
          .append(components.footer)
          .appendTo($('body'));
    };
    
    /**
     * Create the accordion panels
     */
    var renderPanels = function () {
      $.each(["Navigation events", "Ecommerce events", "Data sources"], function (idx, name) {
        var panel = new Panel(name);
        panel.render();
        self.panels[panel.id] = panel;
      });
    };
    
    /**
     * Initialize the visible behaviors for the buttons
     */
    var initBehaviors = function () {
      $("#jshub-inspector-header .container-close").click(self.hide);
      self.node.draggable({ 
        handle : "#jshub-inspector-header, #jshub-inspector-footer", 
        cancel : ".container-close", 
        opacity : 0.4,
        scroll : false
      });
      self.node.resizable({
        minHeight: 150,
        maxWidth: 650,
        minWidth: 200
      });
    };
    
    /**
     * Initialize this object, rendering the HTML and creating the behaviours on the buttons.
     * @return the Inspector instance, for chaining.
     */
    var initialize = function () {
      if (self.state === "new") {
        renderWrapper();
        renderPanels();
        initBehaviors();
      }
      return self;
    };
  
    /**
     * Make the inspector visible on the page.
     * @return the Inspector instance, for chaining.
     */
    this.show = function () {
      initialize();
      self.state = "visible";
      var node = self.node;
      node.css("display", "block");
      // make sure it's visible in the viewport
      var xpos = $(window).width() - $(window).scrollLeft() - node.width() - 10, 
        ypos = $(window).scrollTop() + 10;
      node.css('left', xpos).css('top', ypos);
      return self;
    };
    
    /**
     * Hide the inspector from the page.
     * @return the Inspector instance, for chaining.
     */
    this.hide = function () {
      initialize();
      self.state = "hidden";
      self.node.css("display", "none");
      return self;
    };
    
  }; // end Inspector constructor
  
  $(document).ready(function () {
    window.inspector = new Inspector();
    window.inspector.show();
  });

})();
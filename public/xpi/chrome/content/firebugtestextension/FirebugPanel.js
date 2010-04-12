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
Firebug.FirebugTestExtension = extend(Firebug.Module, 
{ 
    shutdown: function()
    {
      if(Firebug.getPref('defaultPanelName')=='FirebugTestExtension') {
        Firebug.setPref('defaultPanelName','console');
      }
    },
    showPanel: function(browser, panel) 
    { 
        var isFirebugTestExtension = panel && panel.name == "FirebugTestExtension"; 
        var FirebugTestExtensionButtons = browser.chrome.$("fbFirebugTestExtensionButtons"); 
        collapse(FirebugTestExtensionButtons, !isFirebugTestExtension); 
    }, 
    button1: function() 
    { 
      FirebugContext.getPanel("FirebugTestExtension").printLine('Clicked Button 1'); 
    }, 
    button2: function() 
    { 
      FirebugContext.getPanel("FirebugTestExtension").printLine('Clicked Button 2'); 
    } 
}); 


function FirebugTestExtensionPanel() {} 
FirebugTestExtensionPanel.prototype = extend(Firebug.Panel, 
{ 
    name: "FirebugTestExtension", 
    title: "Test Panel", 
    searchable: false, 
    editable: false,

    printLine: function(message) {
      var elt = this.document.createElement("p");
      elt.innerHTML = message;
      this.panelNode.appendChild(elt);
    }
}); 


Firebug.registerModule(Firebug.FirebugTestExtension); 
Firebug.registerPanel(FirebugTestExtensionPanel); 

}});
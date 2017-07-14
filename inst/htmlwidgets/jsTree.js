HTMLWidgets.widget({

  name: 'jsTree',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {

      mobileConsole.hide();
      
      mobileConsole.options({
    		showOnError: false,
    		proxyConsole: true,
    		isCollapsed: true,
    		catchErrors: true
    	});
      
        $elem = $('#' + el.id);
        
      // css definitions
        $elem.css('overflow', 'auto');
        $elem.css('width', '100%');
      
      // Wipe the existing old elements
        $elem.jstree('destroy');
        $('.navBar' + el.id).detach();
        $('.container' + el.id).detach();
      
      // initiate DOM elements
        var navBar       = document.createElement("nav");
        var container    = document.createElement("article");
        var mainDiv      = document.createElement("DIV");
        var btnsDiv      = document.createElement("DIV");
        var searchForm   = document.createElement("form");
        var searchInput  = document.createElement("input");
        var expandBtn    = document.createElement("BUTTON");
        var collapseBtn  = document.createElement("BUTTON");
        var getBtn       = document.createElement("BUTTON");
        var previewDiv   = document.createElement("DIV");
        var previewPre   = document.createElement("PRE");
        var titleP       = document.createElement('P');
        
        var expandText   = document.createTextNode("Expand");
        var collapseText = document.createTextNode("Collapse");
        var getText      = document.createTextNode("Preview File");
        var textP        = document.createTextNode('');

      
      // add attributes
        navBar.className      = 'navBar' + el.id;
        container.className   = 'container' + el.id;
        mainDiv.className     = 'jstree' + el.id;
        searchForm.className  = 's' + el.id;
        searchInput.setAttribute('type',"search");
        searchInput.className = 'q' + el.id;
        expandBtn.className   = 'expand' + el.id;
        collapseBtn.className = 'toCollapse' + el.id;
        getBtn.className      = 'get' + el.id;
        previewPre.id         = 'preview' + el.id;
      
      //attach elements to navbar
                  searchForm.appendChild(searchInput);
                  expandBtn.appendChild(expandText);
                  collapseBtn.appendChild(collapseText);
                  getBtn.appendChild(getText);
                  btnsDiv.appendChild(expandBtn);
                  btnsDiv.appendChild(collapseBtn);
        if(x.uri&&x.vcs!='svn') btnsDiv.appendChild(getBtn);
                  navBar.appendChild(searchForm);
                  navBar.appendChild(btnsDiv);
                  navBar.appendChild(mainDiv);
                  el.appendChild(navBar);
      
      //attach elements to preview container
                  titleP.appendChild(textP);
                  previewDiv.appendChild(titleP);
  
      //define the tree plugins
        var treePlugins=['search','checkbox'];
        if(x.uri&&x.vcs!='svn') treePlugins.push('contextmenu');
  
      //create the tree    
      var tree = $('.jstree' + el.id).jstree({
        'core' : {
          'data' : x.data
      },
      'contextmenu': {'items': customMenu},
      'plugins': treePlugins
      })
        .on("search.jstree", function(ev, data) { //http://jsfiddle.net/2kwkh2uL/2188/
          data.nodes.children("a").each(function (idx, node) {
          var h = node.innerHTML;        
          var orig = $('.jstree').jstree(true).get_node(node).text;
          var txt = orig.replace(new RegExp("(" + data.str + ")", "gi"), function(a,b){
            //debugger;
              return '<span style="color:green">' + b + '</span>';
          });
          node.innerHTML = h.replace(new RegExp(orig, 'gi'), txt);
      });
})
        .on("clear_search.jstree", function(ev, data) {
            $.each(data.nodes, function (idx, node) {
                var h = node.innerHTML;
                var orig = $('.jstree').jstree(true).get_node(node.id).text;
                h = h.replace(new RegExp('<span style="color:green">(.*)</span>', 'gi'),     function (a, b) {
                    return b; 
                });
                node.innerHTML = h;
            });
})
        .on("changed.jstree", function(ev, data) {
        
          //var i, j, nodes = [];
          //for(i = 0, j = data.selected.length; i < j; i++) {
          //    nodes.push(data.instance.get_node(data.selected[i]).text);
          //}
          var node=$('.jstree').jstree("get_selected", true);
          var nodes=node.map(function(n){return $('.jstree').jstree().get_path(n, '/')});
        
          if(typeof(Shiny) !== "undefined"){
              Shiny.onInputChange(el.id + "_update",{
                ".current_tree": JSON.stringify(nodes)
              });
          }
           
})
        .on("loaded.jstree", function(ev,data) {
          
          $('.jstree').jstree('select_node', x.openwith);
});

      //enable the search and attach to tree
        function search(){
          var str = $(".q" + el.id).val();
          $('.jstree').jstree(true).search(str);    
      }
       
        $(".q" + el.id).on('keyup.ns.search', search);
        $(".s").submit(function(e) {
          e.preventDefault();
          $('.jstree').jstree(true).search($(".q" + el.id).val());
        });
    
      //attach funtion of expand and collapse to buttons
        $('.expand' + el.id).bind("click", function() {
            $('.jstree').jstree("open_all");
    });
        $('.toCollapse' + el.id).bind("click", function() {
            $('.jstree').jstree("close_all");
        });
      
      //attach get function to preview button
        $(".get" + el.id).click(function() {
          var node=$('.jstree').jstree("get_selected", true);
          if(x.uri&&x.vcs!='svn'){
            
              var root_text=$('.jstree').jstree(true).get_node('ul > li:first').text;
              pathtofile=$('.jstree').jstree().get_path(node[0], '/').replace(root_text,'');
            
              var uri=x.uri+ pathtofile + '?raw=true';
              loadXMLDoc(uri);
              textP.nodeValue=uri;
              
              previewDiv.appendChild(previewPre);
              container.appendChild(previewDiv);
              el.appendChild(container);
              
            //debugger;
            //$('#preview' + el.id).markRegExp('Desc');
            }
            
          });
      
      //function to retrieve files from remote addresses
        function loadXMLDoc(uri) {
          var xmlhttp = new XMLHttpRequest();
          xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              document.getElementById("preview" + el.id).innerHTML =
              this.responseText;
            }
          };
          xmlhttp.open("GET", uri, true);
          xmlhttp.send();
        }

      //custommenu function (http://jsfiddle.net/dpzy8xjb/)
        function customMenu(node) {
          var tree = $('.jstree').jstree(true);
          var ID = $(node).attr('id');
          if (ID == "j1_1") {
              return items = {};
          }
          var $mynode = $('#' + ID);
          var renameLabel;
          var deleteLabel;
          var folder = false;
          if ($mynode.hasClass("jstree-closed") || $mynode.hasClass("jstree-open")) { 
            //If node is a folder
              folder = true;
          } else {
              previewFile = "Preview File";
          }
          var items = {
                  "preview": {
                    "label": previewFile,
                    "action": function(obj){
                      if(x.uri&&x.vcs!='svn'){
                              var root_text=$('.jstree').jstree(true).get_node('ul > li:first').text;
                              var pathtofile=tree.get_path($(node)[0], '/').replace(root_text,'');
                              
                              var uri=x.uri + pathtofile + '?raw=true';
                              loadXMLDoc(uri);
                              textP.nodeValue=uri;
                              
                              previewDiv.appendChild(previewPre);
                              container.appendChild(previewDiv);
                              el.appendChild(container);
                            }
                    }
                  }
          };
  
          return items;
    }

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
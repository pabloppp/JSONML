
window.addEventListener("load", function(){

	console.log("Hello!");

	var container = document.getElementById("container")
	var textarea = document.getElementById("json-textarea");
	var lessTextarea = document.getElementById("less-textarea");
	var title = document.getElementById("title");
	var result = document.getElementById("result");
	var errorContainer = document.getElementById("error");
	var lineLumbers = document.getElementById("lineLumbers");
	var lessLineLumbers = document.getElementById("lineLumbersLess");
	var realJson;
	var realLess;
	var realCss;

	var currentTab = "jsml";

	//options
	var fullscreenToggle = document.getElementById("fullscreenToggle");
	//var saveHTML = document.getElementById("saveHTML"); 

	//tabs
	var tabJsml = document.getElementById("tab-jsml");
	var tabLess = document.getElementById("tab-less");

	//contentBoxes
	var textZoneJsml = document.getElementById("textZone");
	var textZoneLess = document.getElementById("textZoneLess");

	//refresh stuff
	var refreshTa = function(ta){
		var event_kd = new CustomEvent("keydown", {});
    	var event_ku = new CustomEvent("keyup", {});
    	ta.dispatchEvent(event_kd);
    	ta.dispatchEvent(event_ku);	
	}

	textarea.addEventListener("keyup", function(event){
		var cursorLine = textarea.value.substr(0, textarea.selectionStart).split("\n").length;
		var unparsed = textarea.value;

		var lines = unparsed.split("\n");
		unparsed = "";
		var bigComment = false;
		for(var i in lines){
			var line = lines[i];
			var line_trimmed = line.trim();
			var commentStarts = line_trimmed.indexOf("//");
			if(commentStarts >= 0){
				line_trimmed = line_trimmed.substring(0, commentStarts);
			}

			if(line_trimmed.length > 0){
				if(line.indexOf(":") > 0){
					var key = line_trimmed.slice(0, line_trimmed.indexOf(":")).trim();
					var indent = line_trimmed.slice(0, line_trimmed.indexOf(key));
					if(key[0] != '\"') line_trimmed = indent+'"'+line_trimmed.slice(line_trimmed.indexOf(key));
					if(key[key.length-1] != '\"') line_trimmed = line_trimmed.slice(0, line_trimmed.indexOf(":"))+'"'+line_trimmed.slice(line_trimmed.indexOf(":"));
					lines[i] = line_trimmed;
				}
			}
			unparsed += line_trimmed;
		}

		/*var currentLine = lines[cursorLine-1];
        if(currentLine && currentLine[currentLine.length-1] == "{"){
        	textarea.value = textarea.value.substr(0, textarea.selectionStart) + "\n\t" + textarea.value.substr(textarea.selectionStart);
        }*/
		//textarea.value = lines.join("\n");

		//console.log(event);
		/*if(lastCharacter == ","){
			textarea.value += "\n";
		}*/
		try{
			realJson = JSON.parse("{"+unparsed+"}");
			errorContainer.innerHTML = "JSON seems OK!";
			errorContainer.classList.add("ok");
			jsonToHTML(realJson)

		}catch(error){
			errorContainer.innerHTML = "⚠ "+error;
			errorContainer.classList.remove("ok");
		}

		if(sessionStorage) sessionStorage.setItem("jsml", textarea.value);

	});

	textarea.addEventListener("keydown", function(event){
		var cursorLine = textarea.value.substr(0, textarea.selectionStart).split("\n").length;

		if(event.keyCode==9 || event.which==9){
            event.preventDefault();
            var s = this.selectionStart;
            this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
            this.selectionEnd = s+1; 
        }

        var lines = textarea.value.split("\n");

        var currentLine = lines[cursorLine-1];
        /*if(currentLine && currentLine[currentLine.length-1] == "{"){
        	textarea.value = textarea.value.substr(0, textarea.selectionStart) + "\n\t" + textarea.value.substr(textarea.selectionStart);
        }*/

        var lines = textarea.value.split("\n");

		lineLumbers.innerHTML = "";
		for(var i = 0; i <= lines.length; i++){
			lineLumbers.innerHTML += (i+1)+"<br>";	
		}
		textarea.style.height = ((2+lines.length)*20)+"px";
	});

	lessTextarea.addEventListener("keydown", function(event){
		if(event.keyCode==9 || event.which==9){
            event.preventDefault();
            var s = this.selectionStart;
            this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
            this.selectionEnd = s+1; 
        }

        var lines = lessTextarea.value.split("\n");

		lessLineLumbers.innerHTML = "";
		for(var i = 0; i <= lines.length; i++){
			lessLineLumbers.innerHTML += (i+1)+"<br>";	
		}
		lessTextarea.style.height = ((2+lines.length)*20)+"px";
	});

	lessTextarea.addEventListener("keyup", function(event){
		less.render("#result{"+lessTextarea.value+"}", function (e, css) {
			if(e){
				//console.log(e);
				errorContainer.innerHTML = "⚠ "+e.message;
				errorContainer.classList.remove("ok");
			}
		    else{
		    	realLess = lessTextarea.value;
		    	var webCss = css.css;
		    	var s = document.getElementById("less_style");
				s.innerHTML = webCss;
				errorContainer.innerHTML = "LESS seems OK!";
				errorContainer.classList.add("ok");
		    }
		});

		less.render(lessTextarea.value, function (e, css) {
			if(!e){
				realCss = css.css;
			}
		});

		if(sessionStorage) sessionStorage.setItem("less", lessTextarea.value);
	});

	title.addEventListener("keyup", function(event){
		document.title = title.value || "JsonML";
	});

	var jsonToHTML = function(json, parentNode){
		parentNode = parentNode || result; 
    	parentNode.innerHTML = "";
    	for(var key in json){
    		var value = json[key];

    		//SPECIAL KEYS
    		if(key == "style"){
    			if (typeof value === 'string' || value instanceof String){
    				parentNode.setAttribute("style", value);
    			}
    			else if(value){
    				for(var key in value){
    					parentNode.style[key] = value[key];	
    				}
    			}
    		}
    		else if(key == "content"){
    			parentNode.innerHTML = value;
    		}
    		else if(key == "class"){
    			if (typeof value === 'string' || value instanceof String){
    				parentNode.class = value;
    			}
    			else{
    				for(var i in value){
    					parentNode.classList.add(value[i]);	
    				}
    			}
    		}
    		else if(key == "src"){
    			parentNode.setAttribute("src", value);
    		}
    		else if(key == "href"){
    			parentNode.setAttribute("href", value);
    		}	
    		else if(key == "attr"){
    			if (typeof value === 'string' || value instanceof String){
    				parentNode.setAttribute(value, true);
    			}
    			else if(value){
    				for(var key in value){
    					parentNode.setAttribute(key, value[key]);
    				}
    			}
    		}	
    		else{

    			var classList = key.split(".");
    			key = classList[0];
    			classList.splice(0, 1);
    			var realKey = key.indexOf('#') != -1 ? key.slice(0, key.indexOf('#')) : key;
    			var objId = key.indexOf('#') != -1 ? key.slice(key.indexOf('#')+1) : null;
    			realKey = realKey.trim();
	    		var node = document.createElement(realKey);

	    		//name attributes
	    		if(objId){
	    			node.setAttribute("id", objId.trim());
	    		}
	    		for(var i in classList){
	    			node.classList.add(classList[i]);	
	    		}

	    		parentNode.appendChild(node);

	    		if (typeof value === 'string' || value instanceof String){
	    			node.innerHTML = value;
	    		}
	    		else if(value){
	    			jsonToHTML(value, node);
	    		}
	    	}
    		//node.innerHTML = value;
    		//console.log(key+" -> "+value);
    	};
	}

	var htmlExport = function(){
		var html = '<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<meta charset="UTF-8">\n\t\t<title>'+document.title+'</title>\n\t<link rel="stylesheet" type="text/css" href="'+document.title+'.css">\n\t</head>\n<body>\n';
		html += result.innerHTML;
		html += "\n</body>\n</html>";
	    var file = new Blob([html], {type: "html"});
	    saveAs( file, document.title+".html" );
	    file = new Blob([realCss || ""], {type: "css"});
	    saveAs( file, document.title+".css" );
	}

	var jsonExport = function(){
		if(!realJson) return;
	    var file = new Blob([JSON.stringify(realJson)], {type: "json"});
	    saveAs( file, document.title+".json" );
	}

	var saveWork = function(all){
		if(currentTab == "jsml" || all){
			if(!textarea.value) return;
		    var file = new Blob([textarea.value], {type: "jsml"});
		    saveAs( file, document.title+".jsml" );
		}
		if(currentTab == "less" || all){
			if(!lessTextarea.value) return;
			var file = new Blob([lessTextarea.value], {type: "less"});
		    saveAs( file, document.title+".less" );
		}
	}

	var loadSample = function(){
	    var xhr = new XMLHttpRequest;
	    xhr.open('GET',"sample.jsml");
	    xhr.onload = function(){
	    	textarea.value = this.response;
	    	refreshTa(textarea);
	    };
	    xhr.send()
	}

	var loadCustom = function(){
		var input = document.createElement('input');
        input.setAttribute("type", "file");
        input.click(); // opening dialog
        input.addEventListener("change", function(event){
        	var splt = input.files[0].name.split(".");
        	var extension = splt[splt.length-1];
        	var reader = new FileReader();
    		reader.readAsText(input.files[0], "UTF-8");
    		reader.onload = function (evt) {
    			if(currentTab == "jsml" && extension == "jsml"){
			        textarea.value = evt.target.result;
			        refreshTa(textarea);
			    }
			    else if(currentTab == "less" && extension == "less"){
			    	lessTextarea.value = evt.target.result;
			    	refreshTa(lessTextarea);	
			    }
			    else{
			    	errorContainer.innerHTML = "⚠ Wrong file extension";
					errorContainer.classList.remove("ok");	
			    }
		    }
        });
}


	fullscreenToggle.addEventListener("click", function(event){
		container.classList.toggle("full");
	});

	/*saveHTML.addEventListener("click", function(event){
		htmlExport();
	});*/
	
	document.getElementById("saveHTML2").addEventListener("click", function(event){
		htmlExport();
	});

	document.getElementById("loadSample").addEventListener("click", function(event){
		loadSample();
	});

	document.getElementById("saveJSON").addEventListener("click", function(event){
		jsonExport();
	});

	document.getElementById("saveJSML").addEventListener("click", function(event){
		saveWork();
	});

	document.getElementById("saveAll").addEventListener("click", function(event){
		saveWork(true);
	});

	document.getElementById("clearCurrent").addEventListener("click", function(event){
		if(currentTab == "jsml"){
	        textarea.value = "";
	        refreshTa(textarea);
	    }
	    else if(currentTab == "less"){
	    	lessTextarea.value = "";
	    	refreshTa(lessTextarea);	
	    }	
	});	
	document.getElementById("clearAll").addEventListener("click", function(event){
		textarea.value = "";
		lessTextarea.value = "";
		refreshTa(textarea);
		refreshTa(lessTextarea);	
	});	

	document.getElementById("loadJSML").addEventListener("click", function(event){
		loadCustom();
	});

	tabJsml.addEventListener("click", function(event){
		tabJsml.classList.add("active");	
		tabLess.classList.remove("active");	
		textZoneJsml.classList.remove("hidden");
		textZoneLess.classList.add("hidden");
		currentTab = "jsml";
    	refreshTa(textarea);
    	window.location.hash = '';
	});

	tabLess.addEventListener("click", function(event){
		tabJsml.classList.remove("active");	
		tabLess.classList.add("active");
		textZoneJsml.classList.add("hidden");
		textZoneLess.classList.remove("hidden");
		currentTab = "less"	
    	refreshTa(lessTextarea);
    	window.location.hash = '#less';
	});

	if(window.location.hash == "#less"){
		tabJsml.classList.remove("active");	
		tabLess.classList.add("active");
		textZoneJsml.classList.add("hidden");
		textZoneLess.classList.remove("hidden");
		currentTab = "less";
	}
	
	//LOAD FROM SESSIONSTORAGE
	if(sessionStorage){
		var sessionJsml = sessionStorage.getItem("jsml");
		var sessionLess = sessionStorage.getItem("less");
		if(sessionJsml){
			textarea.value = sessionJsml;	
			refreshTa(textarea);
		}
		if(sessionLess){
			lessTextarea.value = sessionLess;	
			refreshTa(lessTextarea);
		}
	}

});
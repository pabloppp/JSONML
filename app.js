
window.addEventListener("load", function(){

	console.log("Hello!");

	var container = document.getElementById("container")
	var textarea = document.getElementById("json-textarea");
	var title = document.getElementById("title");
	var result = document.getElementById("result");
	var errorContainer = document.getElementById("error");
	var lineLumbers = document.getElementById("lineLumbers");
	var realJson;

	//options
	var fullscreenToggle = document.getElementById("fullscreenToggle");
	var saveHTML = document.getElementById("saveHTML"); 

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
		var html = '<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<meta charset="UTF-8">\n\t\t<title>'+document.title+'</title>\n\t</head>\n<body>\n';
		html += result.innerHTML;
		html += "\n</body>\n</html>";
	    var file = new Blob([html], {type: "html"});
	    saveAs( file, document.title+".html" );
	}

	var jsonExport = function(){
		if(!realJson) return;
	    var file = new Blob([JSON.stringify(realJson)], {type: "json"});
	    saveAs( file, document.title+".json" );
	}

	var jsmlExport = function(){
		if(!textarea.value) return;
	    var file = new Blob([textarea.value], {type: "jsml"});
	    saveAs( file, document.title+".jsml" );
	}

	var loadSample = function(){
	    var xhr = new XMLHttpRequest;
	    xhr.open('GET',"sample.jsml");
	    xhr.onload = function(){
	    	textarea.value = this.response;
	    	var event_kd = new CustomEvent("keydown", {});
	    	var event_ku = new CustomEvent("keyup", {});
	    	textarea.dispatchEvent(event_kd);
	    	textarea.dispatchEvent(event_ku);
	    };
	    xhr.send()
	}

	var loadCustom = function(){
		var input = document.createElement('input');
        input.setAttribute("type", "file");
        input.click(); // opening dialog
        input.addEventListener("change", function(event){
        	var reader = new FileReader();
    		reader.readAsText(input.files[0], "UTF-8");
    		reader.onload = function (evt) {
		        textarea.value = evt.target.result;
		        var event_kd = new CustomEvent("keydown", {});
		    	var event_ku = new CustomEvent("keyup", {});
		    	textarea.dispatchEvent(event_kd);
		    	textarea.dispatchEvent(event_ku);
		    }
        });
	}


	fullscreenToggle.addEventListener("click", function(event){
		container.classList.toggle("full");
	});

	saveHTML.addEventListener("click", function(event){
		htmlExport();
	});
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
		jsmlExport();
	});

	document.getElementById("loadJSML").addEventListener("click", function(event){
		loadCustom();
	});
	

});
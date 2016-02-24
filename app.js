
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

	textarea.addEventListener("keyup", function(event){
		var cursorLine = textarea.value.substr(0, textarea.selectionStart).split("\n").length;
		var unparsed = textarea.value;

		var lines = unparsed.split("\n");
		unparsed = "";
		var bigComment = false;
		for(var i in lines){
			var line = lines[i];
			var line_trimmed = line.trim();
			var commentStarts = line.indexOf("//");
			if(commentStarts >= 0){
				line_trimmed = line_trimmed.substring(0, commentStarts);
			}

			if(line_trimmed.length > 0){
				if(line.indexOf(":") > 0){
					var key = line.slice(0, line.indexOf(":")).trim();
					var indent = line.slice(0, line.indexOf(key));
					if(key[0] != '\"') line = indent+'"'+line.slice(line.indexOf(key));
					if(key[key.length-1] != '\"') line = line.slice(0, line.indexOf(":"))+'"'+line.slice(line.indexOf(":"));
					lines[i] = line;
				}
			}
			unparsed += line;
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
    		else{
    			var realKey = key.indexOf('#') != -1 ? key.slice(0, key.indexOf('#')) : key;
    			realKey = realKey.trim();
	    		var node = document.createElement(realKey);
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

	fullscreenToggle.addEventListener("click", function(event){
		container.classList.toggle("full");
	});

});
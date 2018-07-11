var grobjects = grobjects || [];


var Skybox = undefined;


(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Skybox = function Skybox(name, position, size) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.shaderProgram = undefined;
        this.posBuffer = undefined;
        this.colorBuffer = undefined;
        this.normalBuffer = undefined;
        
        this.posLoc = -1;
        
        this.normalLoc = -1;
        this.projLoc = -1;
        this.viewLoc = -1;
        this.texLoc = -1;
        this.modelLoc = -1;
        this.texsampler = -1;
        this.texBuffer = undefined;
        this.texture = null;
        this.modelLoc = -1;
        this.timeLoc = -1;
    }
    Skybox.prototype.init = function(drawingState) {
        var vertexSource = document.getElementById("skybox-vs").text;
        var fragmentSource = document.getElementById("skybox-fs").text;
        
        var vertexPos = [  1, 1, 1,  -1, 1, 1,  -1,-1, 1, 1, 1, 1, -1,-1, 1 ,1,-1, 1,
           1, 1, 1,   1,-1, 1,   1,-1,-1,  1, 1, 1, 1,-1,-1,  1, 1,-1,
           1, 1, 1,   1, 1,-1,  -1, 1,-1,  1, 1, 1, -1, 1,-1,-1, 1, 1,
          -1, 1, 1,  -1, 1,-1,  -1,-1,-1, -1, 1, 1,  -1,-1,-1, -1,-1, 1,
          -1,-1,-1,   1,-1,-1,   1,-1, 1, -1,-1,-1,  1,-1, 1, -1,-1, 1,
           1,-1,-1,  -1,-1,-1,  -1, 1,-1, 1,-1,-1,  -1, 1,-1, 1, 1,-1 ];
        
         var textureCoords = [  0, 0,   1, 0,   1, 1,   0, 0,   1, 1, 0, 1,
           1, 0,   1, 1,   0, 1, 1, 0,  0, 1, 0, 0,
           0, 1,   0, 0,   1, 0,  0, 1,   1, 0, 1, 1,
           0, 0,   1, 0,   1, 1,   0, 0, 1, 1,  0, 1,
           1, 1,   0, 1,   0, 0,  1, 1,  0, 0,  1, 0,
           1, 1,   0, 1,   0, 0, 1, 1,  0, 0, 1, 0 ];
        
        
        
       
      
        this.vertexNormals = [];
        for (var i = 0; i < 48; i++ ){
            var j = i * 9;
            var firstvector = [vertexPos[j] - vertexPos[j+3],vertexPos[j+1]-vertexPos[j+4],vertexPos[j+2]-vertexPos[j+5]];
            var secondvector = [vertexPos[j] - vertexPos[j+6],vertexPos[j+1]-vertexPos[j+7],vertexPos[j+2]-vertexPos[j+8]];
            var crossproduct = cross(firstvector, secondvector);
            this.vertexNormals.push(crossproduct[0]);
            this.vertexNormals.push(crossproduct[1]);
            this.vertexNormals.push(crossproduct[2]);
            this.vertexNormals.push(crossproduct[0]);
            this.vertexNormals.push(crossproduct[1]);
            this.vertexNormals.push(crossproduct[2]);
            this.vertexNormals.push(crossproduct[0]);
            this.vertexNormals.push(crossproduct[1]);
            this.vertexNormals.push(crossproduct[2]);
        }
    
        
        
      
        var gl = drawingState.gl;

            // compile the vertex shader
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader,vertexSource);
            gl.compileShader(vertexShader);
              if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                      alert(gl.getShaderInfoLog(vertexShader));
                      return null;
                  }
            // now compile the fragment shader
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader,fragmentSource);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                  alert(gl.getShaderInfoLog(fragmentShader));
                  return null;
            }
            // OK, we have a pair of shaders, we need to put them together
            // into a "shader program" object
            // notice that I am assuming that I can use "this"
            this.shaderProgram = gl.createProgram();
            gl.attachShader(this.shaderProgram, vertexShader);
            gl.attachShader(this.shaderProgram, fragmentShader);
            gl.linkProgram(this.shaderProgram);
            if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialize shaders");
            }
            // get the locations for each of the shader's variables
            // attributes and uniforms
            // notice we don't do much with them yet
            
    
            this.projLoc = gl.getUniformLocation(this.shaderProgram,"proj");
            this.viewLoc = gl.getUniformLocation(this.shaderProgram,"view");
            this.normalLoc = gl.getAttribLocation(this.shaderProgram, "normal");
            this.posLoc = gl.getAttribLocation(this.shaderProgram, "pos");
            this.modelLoc = gl.getUniformLocation(this.shaderProgram, "model");
            this.timeLoc = gl.getUniformLocation(this.shaderProgram,"time");
            this.texsampler = gl.getUniformLocation(this.shaderProgram, "texSampler");
            this.texLoc = gl.getAttribLocation(this.shaderProgram, "vtexcoord");
            
            // now to make the buffers for the 4 triangles
            this.posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexNormals), gl.STATIC_DRAW);
            this.texBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        
        
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            /*gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);*/
            
            var image1 = new Image();
            var image2 = new Image();
            var image3 = new Image();
            var image4 = new Image();
            var image5 = new Image();
            var image6 = new Image();
            
            image1.crossOrigin = "anonymous";
            image1.src = LoadedImageFiles["sandcastle_ft.jpg"].src;
        
            image2.crossOrigin = "anonymous";
            image2.src = LoadedImageFiles["sandcastle_bk.jpg"].src;
    
            image3.crossOrigin = "anonymous";
            image3.src = LoadedImageFiles["sandcastle_up.jpg"].src;
        
            image4.crossOrigin = "anonymous";
            image4.src = LoadedImageFiles["sandcastle_dn.jpg"].src;
        
            image5.crossOrigin = "anonymous";
            image5.src = LoadedImageFiles["sandcastle_rt.jpg"].src;
        
            image6.crossOrigin = "anonymous";
            image6.src = LoadedImageFiles["sandcastle_lf.jpg"].src;
        
        
         /*image1.crossOrigin = "anonymous";
            image1.src = LoadedImageFiles["leaves texture.jpg"].src;
        
            image2.crossOrigin = "anonymous";
            image2.src = LoadedImageFiles["leaves texture.jpg"].src;
    
            image3.crossOrigin = "anonymous";
            image3.src = LoadedImageFiles["leaves texture.jpg"].src;
        
            image4.crossOrigin = "anonymous";
            image4.src = LoadedImageFiles["leaves texture.jpg"].src;
        
            image5.crossOrigin = "anonymous";
            image5.src = LoadedImageFiles["leaves texture.jpg"].src;
        
            image6.crossOrigin = "anonymous";
            image6.src = LoadedImageFiles["leaves texture.jpg"].src;
            */
            
            
        
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image4);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image5);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image6);
               // gl.generateMipmap(gl.TEXTURE_2D);
                //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
           
            
    };
    Skybox.prototype.draw = function(drawingState) {
            var gl = drawingState.gl;
            // choose the shader program we have compiled
            gl.useProgram(this.shaderProgram);
            // enable the attributes we had set up
            gl.enableVertexAttribArray(this.posLoc);
            
             gl.enableVertexAttribArray(this.normalLoc);
        
            gl.enableVertexAttribArray(this.texLoc);
            // set the uniforms
            
            
            var view = drawingState.view;
            var m4 = twgl.m4;
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexNormals), gl.STATIC_DRAW);
            view = twgl.m4.multiply(m4.translation(this.position), view);
            view = twgl.m4.multiply(m4.scaling([this.size, this.size, this.size]), view);
            
            gl.uniform1f(this.timeLoc, drawingState.timeOfDay);
            gl.uniformMatrix4fv(this.modelLoc, false, m4.multiply(m4.translation(this.position),m4.scaling([this.size, this.size, this.size])));
            gl.uniformMatrix4fv(this.viewLoc,false,view);
            gl.uniformMatrix4fv(this.projLoc,false,drawingState.proj);
            
        
            gl.uniform1i(this.texsampler, 0);
            // connect the attributes to the buffer
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
        
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.vertexAttribPointer(this.texLoc, 2, gl.FLOAT, false, 0, 0);
        
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        
        
    };
    Skybox.prototype.center = function(drawingState) {
        return this.position;
    }



})();

grobjects.push(new Skybox("Skybox", [0,0,0], 10));
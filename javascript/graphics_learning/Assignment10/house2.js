var grobjects = grobjects || [];


var House2 = undefined;

(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    House2 = function House(name, position, size, color1,color2) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color1 = color1 || [.7,.8,.9];
        this.color2 = color2 || [.7,.8,.9];
        this.shaderProgram = undefined;
        this.posBuffer = undefined;
        this.colorBuffer = undefined;
        this.normalBuffer = undefined;
        this.texBuffer = undefined;
        this.dirLoc = -1;
        this.posLoc = -1;
        this.colorLoc = -1;
        this.texLoc = -1;
        this.normalLoc = -1;
        this.projLoc = -1;
        this.viewLoc = -1;
        this.modelLoc = -1;
        this.texsampler1 = -1;
        this.texture = null;
        this.texture2 = null;
        this.texsampler2 = -1;
    }
    House2.prototype.init = function(drawingState) {
        var vertexSource = document.getElementById("house2-vs").text;
        var fragmentSource = document.getElementById("house2-fs").text;
        
        var vertexPos =[-.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,        -.5,-.5,-.5,  .5, .5,-.5, -.5, .5,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, .5, .5,        -.5,-.5, .5,  .5, .5, .5, -.5, .5, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
                    -.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5,     // x = 1 
                    0.7,0.5,0.7,0,1.2,0,0.7,0.5,-0.7,  0.7,0.5,0.7,0,1.2,0,-0.7,0.5,0.7,
                       -0.7,0.5,-0.7,0,1.2,0,0.7,0.5,-0.7,  -0.7,0.5,-0.7,0,1.2,0,-0.7,0.5,0.7,
                       0.7,0.5,0.7,-0.7,0.5,0.7,0.7,0.5,-0.7, -0.7,0.5,-0.7,-0.7,0.5,0.7,0.7,0.5,-0.7,];
        
       /* var vertexColors = [1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,            1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,
                           1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,            1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,
                          1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,            1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,
                           1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,            1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,
                          1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,            1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,
                          1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,            1,0.8,0.6,1,0.8,0.6,1,0.8,0.6,
                           1,0,0,1,0,0,1,0,0,          1,0,0,1,0,0,1,0,0,
                           1,0,0,1,0,0,1,0,0,          1,0,0,1,0,0,1,0,0,
                           1,0,0,1,0,0,1,0,0,          1,0,0,1,0,0,1,0,0];
        */
        var vertexColors = []
        for (var i =0 ; i < 36; i++){
            var r = this.color1[0];
            var g = this.color1[1];
            var b = this.color1[2];
            vertexColors.push(r);
            vertexColors.push(g);
            vertexColors.push(b);
        }
        for (var i = 0; i < 18; i++){
            var r = this.color2[0];
            var g = this.color2[1];
            var b = this.color2[2];
            vertexColors.push(r);
            vertexColors.push(g);
            vertexColors.push(b);
        }
        
        var vertexNormals = [ 0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                    0.98,0.98,0,0.98,0.98,0,0.98,0.98,0,      0,0.98,0.98,0,0.98,0.98,0,0.98,0.98,
                    0,0.98,-0.98,0,0.98,-0.98,0,0.98,-0.98,  -0.98,0.98,0,-0.98,0.98,0,-0.98,0.98,0,
                      0,-1.96,0,0,-1.96,0,0,-1.96,0,
                            0,-1.96,0,0,-1.96,0,0,-1.96,0];
        
        var textureCoords = [1,1, 1,0, 0,0,     1,1, 0,0, 0,1,
                            1,1, 1,0, 0,0,     1,1, 0,0, 0,1,
                            1,1, 1,0, 0,0,     1,1, 0,0, 0,1,
                            1,1, 1,0, 0,0,     1,1, 0,0, 0,1,
                            1,1, 1,0, 0,0,     1,1, 0,0, 0,1,
                            1,1, 1,0, 0,0,     1,1, 0,0, 0,1,
                            1,1, 1,0, 0,0,     1,1, 0,0, 0,1,
                           1,1, 1,0, 0,0,     1,1, 0,0, 0,1, 
                            1,1, 1,0, 0,0,     1,1, 0,0, 0,1];
        
        /* var textureCoords = [2,2, 2,-1, -1,-1,     2,2, -1,-1, -1,2,
                            2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2,
                           2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2,
                           2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2,
                            2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2,
                            2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2,
                            2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2,
                           2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2,
                            2,2, 2,-1, -1,-1,     2,2, -1,-1,  -1,2];
        
        */
       
        
      
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
            this.posLoc = gl.getAttribLocation(this.shaderProgram, "pos");
            this.colorLoc = gl.getAttribLocation(this.shaderProgram, "inColor");
            this.texLoc = gl.getAttribLocation(this.shaderProgram, "vtexcoord");
            this.projLoc = gl.getUniformLocation(this.shaderProgram,"proj");
            this.viewLoc = gl.getUniformLocation(this.shaderProgram,"view");
            this.normalLoc = gl.getAttribLocation(this.shaderProgram, "normal");
            this.dirLoc = gl.getUniformLocation(this.shaderProgram,"lightdir");
            this.modelLoc = gl.getUniformLocation(this.shaderProgram,"model");
            this.texsampler1 = gl.getUniformLocation(this.shaderProgram, "texSampler1");
            this.texsampler2 = gl.getUniformLocation(this.shaderProgram, "texSampler2");
        
            

            // now to make the buffers for the 4 triangles
            this.posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);
            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
            this.texBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
            
            
        
        
            this.texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            this.texture2 = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.texture2);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            
            var image = new Image();
            var image2 = new Image();
            
            
            image.crossOrigin = "anonymous";
            image.src = LoadedImageFiles["wood.jpeg"].src;
        
           
            image2.crossOrigin = "anonymous";
            image2.src = LoadedImageFiles["decal.png"].src;

        
            
            
            
        
            
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.texture2);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            
        

    };
    House2.prototype.draw = function(drawingState) {
        var gl = drawingState.gl;
            // choose the shader program we have compiled
            gl.useProgram(this.shaderProgram);
            // enable the attributes we had set up
            gl.enableVertexAttribArray(this.posLoc);
            gl.enableVertexAttribArray(this.colorLoc);
            gl.enableVertexAttribArray(this.normalLoc);
            gl.enableVertexAttribArray(this.texLoc);
            // set the uniforms
            var view = drawingState.view;
            var m4 = twgl.m4;
            view = twgl.m4.multiply(m4.translation(this.position), view);
            //view = m4.multiply(m4.scaling([this.size, this.size, this.size],view));
            gl.uniformMatrix4fv(this.modelLoc,false,m4.translation(this.position));
            gl.uniformMatrix4fv(this.viewLoc,false,view);
            gl.uniformMatrix4fv(this.projLoc,false,drawingState.proj);
            gl.uniform3f(this.dirLoc, drawingState.sunDirection[0],drawingState.sunDirection[1], drawingState.sunDirection[2]);
        
            // connect the attributes to the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(this.colorLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.vertexAttribPointer(this.texLoc, 2, gl.FLOAT, false, 0, 0);
        
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.texsampler1,0);
        
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.texture2);
            gl.uniform1i(this.texsampler2,1);
            gl.drawArrays(gl.TRIANGLES, 0, 54);
        
    };
    House2.prototype.center = function(drawingState) {
        return this.position;
    }



})();





grobjects.push(new House2("house4",[1.5,0.5,   -3.5],1,[0,0,0.6],[1,0,0]) );
grobjects.push(new House2("house4",[-1.5,0.5,   -3.5],1,[0,0,0.6],[1,0,0]) );
grobjects.push(new House2("house4",[-3,0.5,   3],1,[0,0,0.6],[1,0,0]) );

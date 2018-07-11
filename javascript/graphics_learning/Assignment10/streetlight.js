var grobjects = grobjects || [];

var globaltexture;
var Streetlight = undefined;

(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Streetlight = function Streetlight(name, position, size) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;

        this.shaderProgram = undefined;
        this.posBuffer = undefined;
        this.colorBuffer = undefined;
        this.normalBuffer = undefined;
        this.texBuffer = undefined;
        this.dirLoc = -1;
        this.posLoc = -1;
        this.colorLoc = -1;
        this.normalLoc = -1;
        this.projLoc = -1;
        this.viewLoc = -1;
        this.realtimeLoc = -1;
        this.texsampler = -1;
        this.texture = -1;
        this.framebuffer = -1;
    }
    Streetlight.prototype.init = function(drawingState) {
        var vertexSource = document.getElementById("streetlight-vs").text;
        var fragmentSource = document.getElementById("streetlight-fs").text;
        
        var vertexPos =[0.5,2.5,-0.5,-0.5,2.5,-0.5,0.5,2.5,0.5,                                                  -0.5,2.5,0.5,0.5,2.5,0.5,-0.5,2.5,-0.5,
                        0.5,2.0,-0.5,0.5,2.0,0.5,-0.5,2.0,-0.5,   -0.5,2.0,0.5,-0.5,2.0,-0.5,0.5,2.0,0.5,
                        0.5,2.0,0.5,0.5,2.0,-0.5,0.5,2.5,0.5,
                        0.5,2.5,-0.5, 0.5,2.5,0.5,0.5,2.0,-0.5,
                        -0.5,2.5,-0.5,-0.5,2.0,-0.5,-0.5,2.5,0.5,
                        -0.5,2.0,0.5,-0.5,2.5,0.5,-0.5,2.0,-0.5,
                        -0.5,2.5,0.5,-0.5,2.0,0.5,0.5,2.5,0.5,
                        0.5,2.0,0.5,0.5,2.5,0.5,-0.5,2.0,0.5,
                        -0.5,2.5,-0.5,0.5,2.5,-0.5,-0.5,2.0,-0.5,
                        0.5,2.0,-0.5,-0.5,2.0,-0.5,0.5,2.5,-0.5,
        
                        0.15,2.0,-0.15,-0.15,2.0,-0.15,0.15,2.0,0.15,                                       -0.15,2.0,0.15,0.15,2.0,0.15,-0.15,2.0,-0.15,
                        0.15,0,-0.15,0.15,0,0.15,-0.15,0,-0.15,   
                        -0.15,0,0.15,-0.15,0,-0.15,0.15,0,0.15,
                        0.15,0,0.15,0.15,0,-0.15,0.15,2.0,0.15,
                        0.15,2.0,-0.15, 0.15,2.0,0.15,0.15,0,-0.15,
                        -0.15,2.0,-0.15,-0.15,0,-0.15,-0.15,2.0,0.15,
                        -0.15,0,0.15,-0.15,2.0,0.15,-0.15,0,-0.15,
                        -0.15,2.0,0.15,-0.15,0,0.15,0.15,2.0,0.15,
                        0.15,0,0.15,0.15,2.0,0.15,-0.15,0,0.15,
                        -0.15,2.0,-0.15,0.15,2.0,-0.15,-0.15,0,-0.15,
                        0.15,0,-0.15,-0.15,0,-0.15,0.15,2.0,-0.15];
        
        
        
    
        var vertexColors = [0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                          0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                           0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                           0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                         0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                           0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                               0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                              0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                            0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                               0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                             0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                              0.9,0.8,0.0,0.9,0.8,0.0,0.9,0.8,0.0,
                           
                            0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0,
                           0,0,0,0,0,0,0,0,0];
        
        var textureCoords = [0,1,1,1,0,0,
                            1,0,0,0,1,1,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0,
                            0,0,0,0,0,0];
        
        
        
        
        
        var vertexNormals = [];
        for (var i = 0; i < 24; i++ ){
            var j = i * 9;
            var firstvector = [vertexPos[j] - vertexPos[j+3],vertexPos[j+1]-vertexPos[j+4],vertexPos[j+2]-vertexPos[j+5]];
            var secondvector = [vertexPos[j] - vertexPos[j+6],vertexPos[j+1]-vertexPos[j+7],vertexPos[j+2]-vertexPos[j+8]];
            var crossproduct = cross(firstvector, secondvector);
            vertexNormals.push(crossproduct[0]);
            vertexNormals.push(crossproduct[1]);
            vertexNormals.push(crossproduct[2]);
            vertexNormals.push(crossproduct[0]);
            vertexNormals.push(crossproduct[1]);
            vertexNormals.push(crossproduct[2]);
            vertexNormals.push(crossproduct[0]);
            vertexNormals.push(crossproduct[1]);
            vertexNormals.push(crossproduct[2]);
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
            this.posLoc = gl.getAttribLocation(this.shaderProgram, "pos");
            this.colorLoc = gl.getAttribLocation(this.shaderProgram, "inColor");
            this.projLoc = gl.getUniformLocation(this.shaderProgram,"proj");
            this.viewLoc = gl.getUniformLocation(this.shaderProgram,"view");
            this.normalLoc = gl.getAttribLocation(this.shaderProgram, "normal");
            this.dirLoc = gl.getUniformLocation(this.shaderProgram,"lightdir");
            this.realtimeLoc = gl.getUniformLocation(this.shaderProgram,"time");
            this.texsampler = gl.getUniformLocation(this.shaderProgram, "texSampler");
            this.texLoc = gl.getAttribLocation(this.shaderProgram, "vtexcoord");

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
            
            var image = new Image();
            image.crossOrigin = "anonymous";
            image.src = LoadedImageFiles["decal.png"].src;
            this.texture2 = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.texture2);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.activeTexture(gl.TEXTURE1);
        
                gl.bindTexture(gl.TEXTURE_2D, this.texture2);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
            
            this.framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER,null);  // restore default FB (onscreen rendering)
        

    };
    Streetlight.prototype.draw = function(drawingState) {
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
        
        
            var eye = [3,2.5,0];
            var target = [0,10,0];
            var up = [0,0,1];
        
           
        
            gl.uniformMatrix4fv(this.viewLoc,false,view);
            gl.uniformMatrix4fv(this.projLoc,false,drawingState.proj);
            gl.uniform3f(this.dirLoc, drawingState.sunDirection[0],drawingState.sunDirection[1], drawingState.sunDirection[2]);
            gl.uniform1f(this.realtimeLoc, 0.0001*drawingState.realtime);
            // connect the attributes to the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(this.colorLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
             gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.vertexAttribPointer(this.texLoc, 2, gl.FLOAT, false, 0, 0);
        
            
            gl.bindFramebuffer(gl.FRAMEBUFFER,this.null); //tochange
        
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
             gl.uniform1i(this.texsampler,0);
            
            gl.drawArrays(gl.TRIANGLES, 0, 72);
            
        
          /*  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.texsampler,0);
        
            globaltexture = this.texture;
        
            gl.drawArrays(gl.TRIANGLES, 0, 72);*/
    };
    Streetlight.prototype.center = function(drawingState) {
        return this.position;
    }



})();

grobjects.push(new Streetlight("streelight1", [3,0,0],1));

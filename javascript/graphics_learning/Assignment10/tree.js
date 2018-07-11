var grobjects = grobjects || [];
function cross(a,b){
        return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

var Tree = undefined;

(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var shaderProgram2 = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Tree = function Tree(name, position, size, wave) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        
        this.shaderProgram = undefined;
        this.posBuffer = undefined;
        this.colorBuffer = undefined;
        this.normalBuffer = undefined;
        this.posBuffer2 = undefined;
        this.colorBuffer2 = undefined;
        this.normalBuffer2 = undefined;
        this.dirLoc = -1;
        this.posLoc = -1;
        this.colorLoc = -1;
        this.normalLoc = -1;
        this.projLoc = -1;
        this.viewLoc = -1;
        this.timeLoc = -1;
        this.dirLoc2 = -1;
        this.posLoc2 = -1;
        this.colorLoc2 = -1;
        this.normalLoc2 = -1;
        this.projLoc2 = -1;
        this.viewLoc2 = -1;
        this.timeLoc2 = -1;
        this.wave = wave;
        this.texsampler = -1;
        this.texBuffer = undefined;
        this.texture = null;
        this.texLoc = -1;
        
    }
    Tree.prototype.init = function(drawingState) {
        var vertexSource = document.getElementById("tree-vs").text;
        var fragmentSource = document.getElementById("tree-fs").text;
        var vertexSource2 = document.getElementById("tree2-vs").text;
        var fragmentSource2 = document.getElementById("tree2-fs").text;
        
        var vertexPos =[0,2,0, 0.3,1.25,0.3,-0.3,1.25,0.3,    0,2,0, -0.3,1.25,0.3,-0.3,1.25,-0.3,
                       0,2,0, -0.3,1.25,-0.3,0.3,1.25,-0.3,   0,2,0, 0.3,1.25,-0.3,0.3,1.25,0.3,
                       0,1.25,0, 0.5,0.5,0.5,-0.5,0.5,0.5,    0,1.25,0, -0.5,0.5,0.5,-0.5,0.5,-0.5,
                       0,1.25,0, -0.5,0.5,-0.5,0.5,0.5,-0.5,   0,1.25,0, 0.5,0.5,-0.5,0.5,0.5,0.5];
        
    
        var vertexColors = [0,1,0,0,1,0,0,1,0,  0,1,0,0,1,0,0,1,0,
                           0,1,0,0,1,0,0,1,0,   0,1,0,0,1,0,0,1,0,
                           0,1,0,0,1,0,0,1,0,   0,1,0,0,1,0,0,1,0,
                           0,1,0,0,1,0,0,1,0,   0,1,0,0,1,0,0,1,0];
        
        var textureCoords = [0,0.5,0.5,0,0.5,0.5,   0,0.5,0.5,0,0.5,0.5,
                            0,0.5,0.5,0,0.5,0.5,    0,0.5,0.5,0,0.5,0.5,
                            0,0.5,0.5,0,0.5,0.5,    0,0.5,0.5,0,0.5,0.5,
                            0,0.5,0.5,0,0.5,0.5,    0,0.5,0.5,0,0.5,0.5];
        
        var vertexNormals = [];
    
        
        for (var i = 0; i < 8; i++ ){
            var j = i * 9;
            var firstvector = [vertexPos[j] - vertexPos[j+3],vertexPos[j+1]-vertexPos[j+4],vertexPos[j+2]-vertexPos[j+5]];
            var secondvector = [vertexPos[j] - vertexPos[j+6],vertexPos[j+1]-vertexPos[j+7],vertexPos[j+2]-vertexPos[j+8]];
            var crossproduct = cross(firstvector, secondvector);
            vertexNormals.push(-crossproduct[0]);
            vertexNormals.push(-crossproduct[1]);
            vertexNormals.push(-crossproduct[2]);
            vertexNormals.push(-crossproduct[0]);
            vertexNormals.push(-crossproduct[1]);
            vertexNormals.push(-crossproduct[2]);
            vertexNormals.push(-crossproduct[0]);
            vertexNormals.push(-crossproduct[1]);
            vertexNormals.push(-crossproduct[2]);
        }
        
        var vertexPos2 = [0.1,0.5,0.1, -0.1,0.5,0.1, 0.1,0.5,-0.1,  -0.1,0.5,-0.1,0.1,0.5,-0.1,-0.1,0.5,0.1,
                0.1,0,0.1, 0.1,0,-0.1, -0.1,0,0.1, -0.1,0,-0.1,-0.1,0,0.1,0.1,0,-0.1,
             0.1,0.5,0.1,0.1,0,0.1,-0.1,0.5,0.1,    -0.1,0.5,0.1,-0.1,0,0.1,-0.1,0.5,-0.1, 
            -0.1,0.5,-0.1,-0.1,0,-0.1,0.1,0.5,-0.1,     0.1,0.5,-0.1,0.1,0,-0.1,0.1,0.5,0.1,
            -0.1,0,0.1, -0.1,0.5,0.1, 0.1,0,0.1,    -0.1,0,-0.1, -0.1,0.5,-0.1, -0.1,0,0.1,
            0.1,0,-0.1, 0.1,0.5,-0.1, -0.1,0,-0.1,  0.1,0,0.1, 0.1,0.5,0.1, 0.1,0,-0.1];
        
        
        
        
        var vertexColors2 = [0.8,0.5,0,0.8,0.5,0,0.8,0.5,0, 0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,
                            0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,
                            0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,
                            0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,
                            0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,
                            0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0,0.8,0.5,0];
        
        var vertexNormals2 = [];
        
        for (var i = 0; i < 12; i++ ){
            var j = i * 9;
            var firstvector = [vertexPos2[j] - vertexPos2[j+3],vertexPos2[j+1]-vertexPos2[j+4],vertexPos2[j+2]-vertexPos2[j+5]];
            var secondvector = [vertexPos2[j] - vertexPos2[j+6],vertexPos2[j+1]-vertexPos2[j+7],vertexPos2[j+2]-vertexPos2[j+8]];
            var crossproduct = cross(firstvector, secondvector);
            vertexNormals2.push(-crossproduct[0]);
            vertexNormals2.push(-crossproduct[1]);
            vertexNormals2.push(-crossproduct[2]);
            vertexNormals2.push(-crossproduct[0]);
            vertexNormals2.push(-crossproduct[1]);
            vertexNormals2.push(-crossproduct[2]);
            vertexNormals2.push(-crossproduct[0]);
            vertexNormals2.push(-crossproduct[1]);
            vertexNormals2.push(-crossproduct[2]);
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
            this.timeLoc = gl.getUniformLocation(this.shaderProgram,"time");
             this.randomLoc = gl.getUniformLocation(this.shaderProgram,"random");
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
        
        
        
            this.texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            var image = new Image();
        
            
            //image.onload = LoadTexture;
            
            image.crossOrigin = "anonymous";
            image.src =LoadedImageFiles["leaves texture.jpg"].src;
            
            
        
                gl.activeTexture(gl.TEXTURE0);
        
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        
            // compile the vertex shader
            var vertexShader2 = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader2,vertexSource2);
            gl.compileShader(vertexShader2);
              if (!gl.getShaderParameter(vertexShader2, gl.COMPILE_STATUS)) {
                      alert(gl.getShaderInfoLog(vertexShader2));
                      return null;
                  }
            // now compile the fragment shader
            var fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader2,fragmentSource2);
            gl.compileShader(fragmentShader2);
            if (!gl.getShaderParameter(fragmentShader2, gl.COMPILE_STATUS)) {
                  alert(gl.getShaderInfoLog(fragmentShader2));
                  return null;
            }
            // OK, we have a pair of shaders, we need to put them together
            // into a "shader program" object
            // notice that I am assuming that I can use "this"
            this.shaderProgram2 = gl.createProgram();
            gl.attachShader(this.shaderProgram2, vertexShader2);
            gl.attachShader(this.shaderProgram2, fragmentShader2);
            gl.linkProgram(this.shaderProgram2);
            if (!gl.getProgramParameter(this.shaderProgram2, gl.LINK_STATUS)) {
                alert("Could not initialize shaders");
            }
            // get the locations for each of the shader's variables
            // attributes and uniforms
            // notice we don't do much with them yet
            this.posLoc2 = gl.getAttribLocation(this.shaderProgram2, "pos");
            this.colorLoc2 = gl.getAttribLocation(this.shaderProgram2, "inColor");
            this.projLoc2 = gl.getUniformLocation(this.shaderProgram2,"proj");
            this.viewLoc2 = gl.getUniformLocation(this.shaderProgram2,"view");
            this.normalLoc2 = gl.getAttribLocation(this.shaderProgram2, "normal");
            this.dirLoc2 = gl.getUniformLocation(this.shaderProgram2,"lightdir");
            this.timeLoc2 = gl.getUniformLocation(this.shaderProgram2,"time");
           
        
            this.posBuffer2 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer2);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos2), gl.STATIC_DRAW);
            this.colorBuffer2 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer2);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors2), gl.STATIC_DRAW);
            this.normalBuffer2 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer2);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals2), gl.STATIC_DRAW);
        

    };
    Tree.prototype.draw = function(drawingState) {
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
            // 
            
        
        
        
            //
            view = twgl.m4.multiply(m4.translation(this.position), view);
            gl.uniformMatrix4fv(this.viewLoc,false,view);
            gl.uniformMatrix4fv(this.projLoc,false,drawingState.proj);
            gl.uniform3f(this.dirLoc, drawingState.sunDirection[0],drawingState.sunDirection[1], drawingState.sunDirection[2]);
            gl.uniform1f(this.timeLoc, 0.001*drawingState.realtime);
            gl.uniform1f(this.randomLoc, this.wave );
            // connect the attributes to the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(this.colorLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
        
             gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
            gl.activeTexture(gl.TEXTURE0);
           gl.vertexAttribPointer(this.texLoc, 2, gl.FLOAT, false, 0, 0);
         gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.drawArrays(gl.TRIANGLES, 0, 24);
        
        
            gl.useProgram(this.shaderProgram2);
            gl.enableVertexAttribArray(this.posLoc2);
            gl.enableVertexAttribArray(this.colorLoc2);
             gl.enableVertexAttribArray(this.normalLoc2);
            gl.uniformMatrix4fv(this.viewLoc2,false,view);
            gl.uniformMatrix4fv(this.projLoc2,false,drawingState.proj);
            gl.uniform3f(this.dirLoc2, drawingState.sunDirection[0],drawingState.sunDirection[1], drawingState.sunDirection[2]);
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer2);
            gl.vertexAttribPointer(this.colorLoc2, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer2);
            gl.vertexAttribPointer(this.posLoc2, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer2);
            gl.vertexAttribPointer(this.normalLoc2, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        
        
        
        
        
        
        
    };
    Tree.prototype.center = function(drawingState) {
        return this.position;
    }



})();

grobjects.push(new Tree('tree1', [1.7,0,2], 1, 0.09));
grobjects.push(new Tree('tree2', [-1,0,2], 1, 0.015));
grobjects.push(new Tree('tree3', [-2,0,-1.2], 1, 0.033));
grobjects.push(new Tree('tree4', [3,0,-3.2], 1, 0.05));
var grobjects = grobjects || [];


var Human = undefined;



(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Human = function Human(name, position, size) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.shaderProgram = undefined;
        this.posBuffer = undefined;
        this.colorBuffer = undefined;
        this.normalBuffer = undefined;
        this.dirLoc = -1;
        this.posLoc = -1;
        this.colorLoc = -1;
        this.normalLoc = -1;
        this.projLoc = -1;
        this.viewLoc = -1;
        this.texLoc = -1;
        this.rotateMatLoc = -1;
        this.wait = getRandomInt(250,750);
        this.orientation = 0;
        this.state = 0;
        this.texsampler = -1;
        this.texBuffer = undefined;
        this.texture = null;
        this.modelLoc = -1;
    }
    Human.prototype.init = function(drawingState) {
        var vertexSource = document.getElementById("human-vs").text;
        var fragmentSource = document.getElementById("human-fs").text;
        
        var vertexPos = [0.25,1.5,-0.25,-0.25,1.5,-0.25,0.25,1.5,0.25,                    -0.25,1.5,0.25,0.25,1.5,0.25,-0.25,1.5,-0.25,
                        0.25,1.0,-0.25,0.25,1.0,0.25,-0.25,1.0,-0.25,   -0.25,1.0,0.25,-0.25,1.0,-0.25,0.25,1.0,0.25,
                        0.25,1.0,0.25,0.25,1.0,-0.25,0.25,1.5,0.25,
                        0.25,1.5,-0.25, 0.25,1.5,0.25,0.25,1.0,-0.25,
                        -0.25,1.5,-0.25,-0.25,1.0,-0.25,-0.25,1.5,0.25,
                        -0.25,1.0,0.25,-0.25,1.5,0.25,-0.25,1.0,-0.25,
                        -0.25,1.5,0.25,-0.25,1.0,0.25,0.25,1.5,0.25,
                        0.25,1.0,0.25,0.25,1.5,0.25,-0.25,1.0,0.25,
                        -0.25,1.5,-0.25,0.25,1.5,-0.25,-0.25,1.0,-0.25,
                        0.25,1.0,-0.25,-0.25,1.0,-0.25,0.25,1.5,-0.25,
                        
                        0.25,0.9,-0.25,-0.25,0.9,-0.25,0.25,0.9,0.25,                    -0.25,0.9,0.25,0.25,0.9,0.25,-0.25,0.9,-0.25,
                        0.25,0,-0.25,0.25,0,0.25,-0.25,0,-0.25,   -0.25,0,0.25,-0.25,0,-0.25,0.25,0,0.25,
                        0.25,0,0.25,0.25,0,-0.25,0.25,0.9,0.25,
                        0.25,0.9,-0.25, 0.25,0.9,0.25,0.25,0,-0.25,
                        -0.25,0.9,-0.25,-0.25,0,-0.25,-0.25,0.9,0.25,
                        -0.25,0,0.25,-0.25,0.9,0.25,-0.25,0,-0.25,
                        -0.25,0.9,0.25,-0.25,0,0.25,0.25,0.9,0.25,
                        0.25,0,0.25,0.25,0.9,0.25,-0.25,0,0.25,
                        -0.25,0.9,-0.25,0.25,0.9,-0.25,-0.25,0,-0.25,
                        0.25,0,-0.25,-0.25,0,-0.25,0.25,0.9,-0.25,
                        
                        0.5,0.8,-0.25,0.3,0.8,-0.25,0.5,0.8,0.25,                    0.3,0.8,0.25,0.5,0.8,0.25,0.3,0.8,-0.25,
                        0.5,0.6,-0.25,0.5,0.6,0.25,0.3,0.6,-0.25,   0.3,0.6,0.25,0.3,0.6,-0.25,0.5,0.8,0.25,
                        0.5,0.6,0.25,0.5,0.6,-0.25,0.5,0.8,0.25,
                        0.5,0.8,-0.25, 0.5,0.8,0.25,0.5,0.6,-0.25,
                        0.3,0.8,-0.25,0.3,0.6,-0.25,0.3,0.8,0.25,
                        0.3,0.6,0.25,0.3,0.8,0.25,0.3,0.6,-0.25,
                       0.3,0.8,0.25,0.3,0.6,0.25,0.5,0.8,0.25,
                        0.5,0.6,0.25,0.5,0.8,0.25,0.3,0.6,0.25,
                        0.3,0.8,-0.25,0.5,0.8,-0.25,0.3,0.6,-0.25,
                       0.5,0.6,-0.25,0.3,0.6,-0.25,0.5,0.8,-0.25,
                        
                        -0.3,0.8,-0.25,-0.5,0.8,-0.25,-0.3,0.8,0.25,                    -0.5,0.8,0.25,-0.3,0.8,0.25,-0.5,0.8,-0.25,
                        -0.3,0.6,-0.25,-0.3,0.6,0.25,-0.5,0.6,-0.25,   -0.5,0.6,0.25,-0.5,0.6,-0.25,-0.3,0.8,0.25,
                        -0.3,0.6,0.25,-0.3,0.6,-0.25,-0.3,0.8,0.25,
                        -0.3,0.8,-0.25, -0.3,0.8,0.25,-0.3,0.6,-0.25,
                        -0.5,0.8,-0.25,-0.5,0.6,-0.25,-0.5,0.8,0.25,
                        -0.5,0.6,0.25,-0.5,0.8,0.25,-0.5,0.6,-0.25,
                       -0.5,0.8,0.25,-0.5,0.6,0.25,-0.3,0.8,0.25,
                        -0.3,0.6,0.25,-0.3,0.8,0.25,-0.5,0.6,0.25,
                        -0.5,0.8,-0.25,-0.3,0.8,-0.25,-0.5,0.6,-0.25,
                       -0.3,0.6,-0.25,-0.5,0.6,-0.25,-0.3,0.8,-0.25];
        
         var textureCoords = [0,0,0,0,0,0,
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
                         0.67,1,1,1,0.67,0,
                         1,0,0.67,0,1,1,
                         0,0,0,1,0.33,0,
                         0.33,1,0.33,0,0,1,
                        
                        0.33,0,0.33,1,0.67,0,
                         0.67,1,0.67,0,0.33,1,
                         
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
                        0,0,0,0,0,0,
                        0,0,0,0,0,0,
                        0,0,0,0,0,0,
                        0,0,0,0,0,0,
                        0,0,0,0,0,0];

        
        
        
       
      
        this.vertexNormals = [];
        /* for (var i = 0; i < LoadedOBJFiles["minion.obj"].normals.length; i++){
            vertexNormals.push(LoadedOBJFiles["minion.obj"].normals[i][0]);
            vertexNormals.push(LoadedOBJFiles["minion.obj"].normals[i][1]);
            vertexNormals.push(LoadedOBJFiles["minion.obj"].normals[i][2]);
        }*/
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
            this.posLoc = gl.getAttribLocation(this.shaderProgram, "pos");
            this.colorLoc = gl.getAttribLocation(this.shaderProgram, "inColor");
            this.projLoc = gl.getUniformLocation(this.shaderProgram,"proj");
            this.viewLoc = gl.getUniformLocation(this.shaderProgram,"view");
            this.normalLoc = gl.getAttribLocation(this.shaderProgram, "normal");
            this.dirLoc = gl.getUniformLocation(this.shaderProgram,"lightdir");
            this.rotateMatLoc = gl.getUniformLocation(this.shaderProgram, "rotation");
            this.texsampler = gl.getUniformLocation(this.shaderProgram, "texSampler");
            this.texLoc = gl.getAttribLocation(this.shaderProgram, "vtexcoord");
            this.modelLoc = gl.getUniformLocation(this.shaderProgram, "model");

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
        gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            var image = new Image();
        
            
            //image.onload = LoadTexture;
            image.crossOrigin = "anonymous";
            image.src = LoadedImageFiles["human texture.png"].src;
            
            
        
                gl.activeTexture(gl.TEXTURE0);
        
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        
            
    };
    Human.prototype.draw = function(drawingState) {
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
            advance(this, drawingState);
            
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexNormals), gl.STATIC_DRAW);
            view = twgl.m4.multiply(m4.translation(this.position), view);
            view = twgl.m4.multiply(m4.scaling([this.size, this.size, this.size]), view);
            view = twgl.m4.multiply(m4.rotationY(this.orientation), view);
            gl.uniformMatrix4fv(this.rotateMatLoc,false,m4.rotationY(this.orientation));
            gl.uniformMatrix4fv(this.modelLoc,false,m4.translation(this.position));
            gl.uniformMatrix4fv(this.viewLoc,false,view);
            gl.uniformMatrix4fv(this.projLoc,false,drawingState.proj);
            gl.uniform3f(this.dirLoc, drawingState.sunDirection[0],drawingState.sunDirection[1], drawingState.sunDirection[2]);
        
        gl.uniform1i(this.texsampler, 0);
            // connect the attributes to the buffer
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
        
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
           gl.vertexAttribPointer(this.texLoc, 2, gl.FLOAT, false, 0, 0);
        
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.drawArrays(gl.TRIANGLES, 0, 144);
        
        
    };
    Human.prototype.center = function(drawingState) {
        return this.position;
    }
    
    var flyingSpeed = 3/1000;
    var turningSpeed = 2/1000;
    
    function advance(human, drawingState){
        if (!human.lastTime) {
            human.lastTime = drawingState.realtime;
            return;
        }
        var delta = drawingState.realtime - human.lastTime;
        human.lastTime = drawingState.realtime;
        
        switch (human.state) {
            case 0: // on the ground, waiting for take off
                if (human.wait > 0) { 
                    human.wait -= delta; 
                }   else {  // take off!
                    human.state = 1;
                    human.wait = 0;
                    
                    var random1 = 0.2*getRandomInt(-5,5);
                    var random2 = 0.2*getRandomInt(-5,5);
                    
                    var random3 = getRandomInt(1,4);
                    
                    if (random3 === 1){
                       
                    } else if (random3 == 2){
                        
                    } else if (random3 == 3){
                        
                    } else if (random3 == 4){
                        
                    }
                   
                    var dest = [human.position[0]+random1, human.position[0], human.position[0]+random2];
                    
                    
                                
                    while (dest[0] >= 5 || dest[2] >= 5 || dest[0] <= -5 || dest[2] <=-5 || dest[0] < 1.8 && dest[0] >-1.8 && dest[2]<0.9 && dest[2] > -0.9){
                        random1 = 0.3*getRandomInt(-5,5);
                        random2 = 0.3*getRandomInt(-5,5);
                        dest = [human.position[0]+random1, human.position[0], human.position[0]+random2];
                    }
                    
                    // the direction to get there...
                    human.dx = dest[0] - human.position[0];
                    human.dz = dest[2] - human.position[2];
                    human.dst = Math.sqrt(human.dx*human.dx + human.dz*human.dz);
                    
                    human.vx = human.dx / human.dst;
                    human.vz = human.dz / human.dst;
                    
                    human.dir = Math.atan2(human.dx,human.dz);
                    human.state = 1;
                }
                    

                break;
        
            case 1: 
                var dtheta = human.dir - human.orientation;
              
                if (Math.abs(dtheta) < .01) {
                    human.state = 2;
                    human.orientation = human.dir;
                }
                var dtheta = human.dir - human.orientation;
               
                
                var rotAmt = turningSpeed * delta;
                if (dtheta > 0) {
                    human.orientation = Math.min(human.dir,human.orientation+rotAmt);
                } else {
                    human.orientation = Math.max(human.dir,human.orientation-rotAmt);
                }
                break;
        
        
            case 2: 
                if (human.dst > .01) {
                    var go = delta * flyingSpeed;
                    
                    go = Math.min(human.dst,go);
                    human.position[0] += human.vx * go;
                    human.position[2] += human.vz * go;
                    human.dst -= go;
                } else { 
                    
                    human.state = 0;
                    human.wait = getRandomInt(500,1000);
                }
                break;
                           }
    
        
    }



})();

grobjects.push(new Human("human1", [-3,0,2],0.5));
grobjects.push(new Human("human2", [3,0,-4],0.5));

grobjects.push(new Human("human2", [1,0,2],0.5));
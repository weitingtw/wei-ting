var grobjects = grobjects || [];


var Cow = undefined;

(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cow = function Cow(name, position, size) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color1 = [.7,.8,.9];
        this.color2 = [.7,.8,.9];
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
        this.texsampler = -1;
        this.texture = null;
    }
    Cow.prototype.init = function(drawingState) {
        var vertexSource = document.getElementById("cow-vs").text;
        var fragmentSource = document.getElementById("cow-fs").text;
        
        var vertexPos =[];
       
       
        for (var i = 0; i < LoadedOBJFiles["Wolf.obj"].groups['wolf' ].faces.length; i++){
            var vertice1 = LoadedOBJFiles["Wolf.obj"].groups['wolf'].faces[i][0][0];
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice1][0]);
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice1][1]);
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice1][2]);
            var vertice2 = LoadedOBJFiles["Wolf.obj"].groups['wolf' ].faces[i][1][0];
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice2][0]);
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice2][1]);
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice2][2]);
            var vertice3 = LoadedOBJFiles["Wolf.obj"].groups['wolf' ].faces[i][2][0];
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice3][0]);
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice3][1]);
            vertexPos.push(LoadedOBJFiles["Wolf.obj"].vertices[vertice3][2]);
        }
        
       
        
        
        
        var vertexNormals = [];
        
        /*
       for (var i = 0; i < LoadedOBJFiles["Cow.obj"].groups['Cow' ].faces.length; i++){
            var vertice1 = LoadedOBJFiles["Cow.obj"].groups['Cow'].faces[i][0][1];
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice1][0]);
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice1][1]);
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice1][2]);
            var vertice2 = LoadedOBJFiles["Cow.obj"].groups['Cow' ].faces[i][1][1];
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice2][0]);
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice2][1]);
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice2][2]);
            var vertice3 = LoadedOBJFiles["Cow.obj"].groups['Cow' ].faces[i][2][1];
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice3][0]);
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice3][1]);
            vertexNormals.push(LoadedOBJFiles["Cow.obj"].normals[vertice3][2]);
        }*/
        
        for (var i = 0; i < 48; i++ ){
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
            this.projLoc = gl.getUniformLocation(this.shaderProgram,"proj");
            this.viewLoc = gl.getUniformLocation(this.shaderProgram,"view");
            this.normalLoc = gl.getAttribLocation(this.shaderProgram, "normal");
            this.dirLoc = gl.getUniformLocation(this.shaderProgram,"lightdir");
            
        
            

            // now to make the buffers for the 4 triangles
            this.posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);
            
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
            
            
            
        
        
    };
    Cow.prototype.draw = function(drawingState) {
        var gl = drawingState.gl;
            // choose the shader program we have compiled
            gl.useProgram(this.shaderProgram);
            // enable the attributes we had set up
            gl.enableVertexAttribArray(this.posLoc);
            gl.enableVertexAttribArray(this.normalLoc);
           
            // set the uniforms
            var view = drawingState.view;
            var m4 = twgl.m4;
        
       
            view = twgl.m4.multiply(m4.translation(this.position), view);
            view = twgl.m4.multiply(m4.scaling(this.size,this.size,this.size), view);
            
            gl.uniformMatrix4fv(this.viewLoc,false,view);
            gl.uniformMatrix4fv(this.projLoc,false,drawingState.proj);
            gl.uniform3f(this.dirLoc, drawingState.sunDirection[0],drawingState.sunDirection[1], drawingState.sunDirection[2]);
        
            // connect the attributes to the buffer
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
            gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
        
            gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    Cow.prototype.center = function(drawingState) {
        return this.position;
    }



})();


grobjects.push(new Cow("cow1",[0,2,2],3));


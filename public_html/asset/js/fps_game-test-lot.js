/**
 * @author bhouston / http://exocortex.com
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.Box3 = function ( min, max ) {

	this.min = ( min !== undefined ) ? min : new THREE.Vector3( Infinity, Infinity, Infinity );
	this.max = ( max !== undefined ) ? max : new THREE.Vector3( - Infinity, - Infinity, - Infinity );

};

THREE.Box3.prototype = {

	constructor: THREE.Box3,

	set: function ( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	},

	setFromPoints: function ( points ) {

		this.makeEmpty();

		for ( var i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] )

		}

		return this;

	},

	setFromCenterAndSize: function () {

		var v1 = new THREE.Vector3();

		return function ( center, size ) {

			var halfSize = v1.copy( size ).multiplyScalar( 0.5 );

			this.min.copy( center ).sub( halfSize );
			this.max.copy( center ).add( halfSize );

			return this;

		};

	}(),

	setFromObject: function () {

		// Computes the world-axis-aligned bounding box of an object (including its children),
		// accounting for both the object's, and childrens', world transforms

		var v1 = new THREE.Vector3();

		return function ( object ) {

			var scope = this;

			object.updateMatrixWorld( true );

			this.makeEmpty();

			object.traverse( function ( node ) {

				var geometry = node.geometry;

				if ( geometry !== undefined ) {

					if ( geometry instanceof THREE.Geometry ) {

						var vertices = geometry.vertices;

						for ( var i = 0, il = vertices.length; i < il; i ++ ) {

							v1.copy( vertices[ i ] );

							v1.applyMatrix4( node.matrixWorld );

							scope.expandByPoint( v1 );

						}

					} else if ( geometry instanceof THREE.BufferGeometry && geometry.attributes[ 'position' ] !== undefined ) {

						var positions = geometry.attributes[ 'position' ].array;

						for ( var i = 0, il = positions.length; i < il; i += 3 ) {

							v1.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

							v1.applyMatrix4( node.matrixWorld );

							scope.expandByPoint( v1 );

						}

					}

				}

			} );

			return this;

		};

	}(),

	copy: function ( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	},

	makeEmpty: function () {

		this.min.x = this.min.y = this.min.z = Infinity;
		this.max.x = this.max.y = this.max.z = - Infinity;

		return this;

	},

	empty: function () {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );

	},

	center: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	},

	size: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.subVectors( this.max, this.min );

	},

	expandByPoint: function ( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	},

	expandByVector: function ( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	},

	expandByScalar: function ( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	},

	containsPoint: function ( point ) {

		if ( point.x < this.min.x || point.x > this.max.x ||
		     point.y < this.min.y || point.y > this.max.y ||
		     point.z < this.min.z || point.z > this.max.z ) {

			return false;

		}

		return true;

	},

	containsBox: function ( box ) {

		if ( ( this.min.x <= box.min.x ) && ( box.max.x <= this.max.x ) &&
			 ( this.min.y <= box.min.y ) && ( box.max.y <= this.max.y ) &&
			 ( this.min.z <= box.min.z ) && ( box.max.z <= this.max.z ) ) {

			return true;

		}

		return false;

	},

	getParameter: function ( point, optionalTarget ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		var result = optionalTarget || new THREE.Vector3();

		return result.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
		);

	},

	isIntersectionBox: function ( box ) {

		// using 6 splitting planes to rule out intersections.

		if ( box.max.x < this.min.x || box.min.x > this.max.x ||
		     box.max.y < this.min.y || box.min.y > this.max.y ||
		     box.max.z < this.min.z || box.min.z > this.max.z ) {

			return false;

		}

		return true;

	},

	clampPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.copy( point ).clamp( this.min, this.max );

	},

	distanceToPoint: function () {

		var v1 = new THREE.Vector3();

		return function ( point ) {

			var clampedPoint = v1.copy( point ).clamp( this.min, this.max );
			return clampedPoint.sub( point ).length();

		};

	}(),

	getBoundingSphere: function () {

		var v1 = new THREE.Vector3();

		return function ( optionalTarget ) {

			var result = optionalTarget || new THREE.Sphere();

			result.center = this.center();
			result.radius = this.size( v1 ).length() * 0.5;

			return result;

		};

	}(),

	intersect: function ( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		return this;

	},

	union: function ( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	},

	applyMatrix4: function () {

		var points = [
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3()
		];

		return function ( matrix ) {

			// NOTE: I am using a binary pattern to specify all 2^3 combinations below
			points[ 0 ].set( this.min.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 000
			points[ 1 ].set( this.min.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 001
			points[ 2 ].set( this.min.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 010
			points[ 3 ].set( this.min.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 011
			points[ 4 ].set( this.max.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 100
			points[ 5 ].set( this.max.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 101
			points[ 6 ].set( this.max.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 110
			points[ 7 ].set( this.max.x, this.max.y, this.max.z ).applyMatrix4( matrix );  // 111

			this.makeEmpty();
			this.setFromPoints( points );

			return this;

		};

	}(),

	translate: function ( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	},

	equals: function ( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	},

	clone: function () {

		return new THREE.Box3().copy( this );

	}

};


/**
 * @author hughes
 */

THREE.CircleGeometry = function ( radius, segments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );

	this.type = 'CircleGeometry';

	this.parameters = {
		radius: radius,
		segments: segments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	radius = radius || 50;
	segments = segments !== undefined ? Math.max( 3, segments ) : 8;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	var i, uvs = [],
	center = new THREE.Vector3(), centerUV = new THREE.Vector2( 0.5, 0.5 );

	this.vertices.push(center);
	uvs.push( centerUV );

	for ( i = 0; i <= segments; i ++ ) {

		var vertex = new THREE.Vector3();
		var segment = thetaStart + i / segments * thetaLength;

		vertex.x = radius * Math.cos( segment );
		vertex.y = radius * Math.sin( segment );

		this.vertices.push( vertex );
		uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, ( vertex.y / radius + 1 ) / 2 ) );

	}

	var n = new THREE.Vector3( 0, 0, 1 );

	for ( i = 1; i <= segments; i ++ ) {

		this.faces.push( new THREE.Face3( i, i + 1, 0, [ n.clone(), n.clone(), n.clone() ] ) );
		this.faceVertexUvs[ 0 ].push( [ uvs[ i ].clone(), uvs[ i + 1 ].clone(), centerUV.clone() ] );

	}

	this.computeFaceNormals();

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.CircleGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.CircleGeometry.prototype.constructor = THREE.CircleGeometry;

/**
 * @author bhouston / http://exocortex.com
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Sphere = function ( center, radius ) {

	this.center = ( center !== undefined ) ? center : new THREE.Vector3();
	this.radius = ( radius !== undefined ) ? radius : 0;

};

THREE.Sphere.prototype = {

	constructor: THREE.Sphere,

	set: function ( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;
	},

	setFromPoints: function () {

		var box = new THREE.Box3();

		return function ( points, optionalCenter ) {

			var center = this.center;

			if ( optionalCenter !== undefined ) {

				center.copy( optionalCenter );

			} else {

				box.setFromPoints( points ).center( center );

			}

			var maxRadiusSq = 0;

			for ( var i = 0, il = points.length; i < il; i ++ ) {

				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );

			}

			this.radius = Math.sqrt( maxRadiusSq );

			return this;

		};

	}(),

	copy: function ( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	},

	empty: function () {

		return ( this.radius <= 0 );

	},

	containsPoint: function ( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	},

	distanceToPoint: function ( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	},

	intersectsSphere: function ( sphere ) {

		var radiusSum = this.radius + sphere.radius;

		return sphere.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

	},

	clampPoint: function ( point, optionalTarget ) {

		var deltaLengthSq = this.center.distanceToSquared( point );

		var result = optionalTarget || new THREE.Vector3();
		result.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			result.sub( this.center ).normalize();
			result.multiplyScalar( this.radius ).add( this.center );

		}

		return result;

	},

	getBoundingBox: function ( optionalTarget ) {

		var box = optionalTarget || new THREE.Box3();

		box.set( this.center, this.center );
		box.expandByScalar( this.radius );

		return box;

	},

	applyMatrix4: function ( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	},

	translate: function ( offset ) {

		this.center.add( offset );

		return this;

	},

	equals: function ( sphere ) {

		return sphere.center.equals( this.center ) && ( sphere.radius === this.radius );

	},

	clone: function () {

		return new THREE.Sphere().copy( this );

	}

};


(function()
{
	var sw,sh,
		scene,
		camera,fov,aspect,near,far,
		renderer,
		light,
		stats;

	var uiScene, uiCamera;
	function init()
	{
		/* WINDOW SIZE */
		sw = WindowSize.width();
		sh = WindowSize.height();

		/* SCENE SETTING*/
		scene 		= new THREE.Scene();
		// scene.fog 	= new THREE.Fog(0xffffff,100,8000);

		/* RENDERER SETTING */
		renderer = new THREE.WebGLRenderer({antialias : true});
		renderer.setSize(sw,sh);

		document.body.appendChild(renderer.domElement);


		/* CAMERA SETTING */
		fov 	= 45;
		aspect 	= sw/sh;
		near	= 0.1;
		far		= 10000;
		camera 	= new THREE.PerspectiveCamera(fov,aspect,near,far);
		camera.position = camPositions[0];
		scene.add(camera);

		//temp init
		// camera.position.x = 100;
		// camera.position.z = 1300;


		/* LIGHT SETTING */
		light = new THREE.DirectionalLight( 0xffffff, 1.5 );
		light.position.set( 200, 1000, 500 );
		light.shadowMapWidth = 1024;
		light.shadowMapHeight = 1024;
		light.shadowMapDarkness = 0.95;
		scene.add(light);

		/* STATS */
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top 		= '0px';
		stats.domElement.style.zIndex 	= 100;
		document.body.appendChild( stats.domElement );


		/* CROSSHAIR SECEN */
		renderer.autoClear = false;
		uiScene 	= new THREE.Scene();
		uiCamera 	= new THREE.PerspectiveCamera(fov,aspect,near,far);
		uiCamera.position.set(0,0,100);
		uiScene.add(uiCamera);

		/* CONTENT LOAD */
		contentLoad();
	}

// ------------------------------------------------------------------------------------------------------------------------------------
// RENDERING
// ------------------------------------------------------------------------------------------------------------------------------------

	function rendering()
	{
		delta = clock.getDelta();
		animation();

		renderer.setDepthTest(true);
		renderer.clear();
		renderer.render(scene, camera);
		renderer.setDepthTest(false);
		renderer.render(uiScene, uiCamera);

		stats.update();
		requestAnimationFrame(rendering);
	}


	var camPositions	= [ new THREE.Vector3(0,2000,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0) ],
		camLooks		= [ new THREE.Vector3(0,1000,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0) ],
		camLook			= camLooks[0];
		camID 			= 1,
		baseV			= new THREE.Vector3(0,0,0);
	var delta_bullet = 1, delta_bird = 1;
	var cnt = 0,rapid = 0 ;
	function animation()
	{

		if(gameMode == "index"){
			camera.lookAt(camLook);

			// camera.position.x += (chr.camera.position.x+100 - camera.position.x) * .1;
			// camera.position.y += (chr.camera.position.y-50 - camera.position.y) * .1;
			camera.position.z += (chr.camera.position.z - 1000 - camera.position.z) * .1;

		}else if(gameMode == "gameReady"){

			camera.position.x += (chr.camera.position.x+100 - camera.position.x) * .1;
			camera.position.y += (chr.camera.position.y-50 - camera.position.y) * .1;
			camera.position.z += (chr.camera.position.z - camera.position.z) * .1;
			//camera.rotation.z = chr.camera.rotation.z//clone();
			camera.lookAt(baseV);
			cnt++;
			if(cnt > 70){
				gameMode 	= "playing";
			}
		}else if(gameMode =="playing"){
			camera.position = chr.camera.position.clone();
			camera.rotation = chr.camera.rotation.clone();
		}else if(gameMode =="gameEnd"){
			camera.rotation.x += 0.0001;
			camera.rotation.y += 0.001;
			camera.rotation.z += 0.0001;// chr.camera.rotation.clone();
		}

		controler.update(delta);
		chr.update(delta);
		chr.controls = controler.controls;

		if(itemActive && itemInfo[0].active){
			rapid++;
			if(rapid % 4 == 0)shoot();
		}else if(rapid > 0){
			rapid = 0;
		}

		//bird Control
		var i = 0;
		for(var i = 0; i< birds.length; i++){
			var s = birds[i];
			if(s.scope.controls.death){
				s.scope.update(delta);
			}else{
				s.scope.update(delta * delta_bird);
			}

		}

		//bullet
		var i = 0;
		// console.log(bulletN)
		for (i; i < bullets.length; i++){
			var b = bullets[i];
			var b_p = b.root.position;
			b.update(delta * delta_bullet);

			var b_removeDis = b_p.distanceTo(b.pos);
			var hit = false;
			// bird hit check

			var j = 0;
			for(j; j< birds.length; j++){
				var s 	= birds[j];

				//bird death
				if(s.scope.controls.gone == true){
					killCheck(s.scope.boss);
					s.scope.remove();
					birds.splice(j,1);
					birdMake(false);
					return;
				}

				//bird check
				var s_p = s.bird.root.position;
				var dis = b_p.distanceTo(s_p);
				if(dis < s.scope.hitRad && s.scope.controls.death == false){

					hit = true;
					rate++;
					if(s.scope.boss){
						s.scope.life -= 4;
					}else{
						s.scope.life -= b.power;
					}

					if(s.scope.life <= 0){
						s.scope.animation("death");
					}else{
						s.scope.animation("hit");
						var color 	= s.scope.mesh.material.color,
							percent = s.scope.life / 100;
							s.scope.speed += 50+5*killCnt;
							s.scope.mesh.material.color.setRGB(1 - percent * .5,color.g * percent *.3, color.b * percent *.3);
					}
					bullets.splice(i,1);
					b.remove();
					return;
				}
			}

			if(b_removeDis > 6000 && hit == false){
				bullets.splice(i,1);
				b.remove();
				return;
			}
		}


		videoObj.update();
	}

// ------------------------------------------------------------------------------------------------------------------------------------
// EVENT HANDLER
// ------------------------------------------------------------------------------------------------------------------------------------
	// skybox
	var sbMaterials = [],
		sbPath	 	= "asset/img/texture/NiagaraFalls3/",
		sbFNames 	= ["posx", "negx", "posy", "negy", "posz", "negz"];

	var bullet_geo;

	//UI
	var title, startBtn, timeLine;
	var loadCnt = 0, loadedCnt = 0;

	//CONTENTS LOAD
	function contentLoad(){

		// skybox IMG LOADED
		for(var i=0; i<6; i++){
			sbMaterials[i] = loadTexture( sbPath + sbFNames[i] + '.jpg' );
			loadCnt++;
		}

		// bullet Loaded
		var loader = new THREE.JSONLoader();
		loader.load("asset/models/bullet.js", function(geometry){
			bullet_geo = geometry;
			loadedUpdate();
		});
		loadCnt++;
	}

	function loadedUpdate(){
		loadedCnt++;

		//content Loaded
		if(loadCnt == loadedCnt){
			setup();
			addEvent();
			requestAnimationFrame(rendering);

			// UI
			$("#startBtn").find("img").attr("src","asset/img/start_btn_over.png");
			// $("#startBtn").css("cursor" , "pointer").click(gameStart);

		}
	}


	var clock,delta,mouse = {x:0, y:0},
		worldWidth,worldHeight,worldDepth,
		worldScale,
		skyBox,
		chr,tower,
		birdNum,birds = [],
		controler,
		crossHair,
		projector;

	var videoObj;

	function setup()
	{
		clock = new THREE.Clock();

		// object

		worldWidth	= 2048;
		worldHeight = 2048;
		worldDepth 	= 2048;
		birdNum		= 10;
		worldScale	= 3;

		skyBox		= new SkyBox(sbMaterials,worldWidth,worldHeight,worldDepth,worldScale);
		chr 		= new Boxman(baseV);


		//鳥の生成
		// for(var i=0; i< birdNum; i++)
		// {
		// 	birdMake();
		// }

		chr.load();
		chr.cameraOn();

		// controler
		controler						= new FPC_Controler(chr.camera, renderer.domElement);
		controler.freeze				= true;
		controler.controls				= chr.controls;
		controler.movementSpeed 		= 200;
		controler.lookSpeed 			=　.1;
		controler.lookVertical			= true;
		controler.constrainVertical 	= true;
		controler.verticalMin			= (30 * Math.PI) / 180;
		controler.verticalMax 			= (100 * Math.PI) / 180;

		// CrossHair
		// crossHair	= new CrossHair();

		// Project
		projector = new THREE.Projector();
		scene.add(chr.root);



		//video object sample
		videoObj = new VideoObj(baseV);
	}

	function addEvent()
	{
		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);
		document.addEventListener( 'mousemove', onMouseMove, false );
		renderer.domElement.addEventListener("mousedown", onMouseDown, false);
		renderer.domElement.addEventListener("mouseup", onMouseUp, false);
	}

	// ------------------------------------------------------------------
	// EVENT HANDLER
	// ------------------------------------------------------------------

	function onKeyDown(e){
		// e.preventDefault();
		switch(e.keyCode){
			case 32: /*space*/ break;
			case 49: /*1*/ itemUse(0); break;
			case 50: /*2*/ itemUse(1);break;
			case 51: /*3*/ itemUse(2);break;
			case 52: /*4*/ break;
			case 53: /*5*/ break;

			case 54: /*6*/ delta_bullet = 1;break;
			case 55: /*7*/ delta_bullet = .001;break;
			case 56: /*8*/ break;
			case 57: /*9*/ break;
		};
	}

	function onKeyUp(e){
		switch(e.keyCode){
			case 32: /*space*/break;
			case 49: /*1*/ break;
			case 50: /*2*/ break;
			case 51: /*3*/ break;
			case 52: /*4*/ break;
			case 53: /*5*/ break;
		};
	}

	function onMouseMove(e){
		// e.preventDefault();
		mouse.x = (e.clientX / sw) * 2 - 1;
		mouse.y = -(e.clientY / sh) * 2 + 1;
	}


	function onMouseDown(e){
		switch ( e.button ) {
			case 0: chr.controls.attack = true;
					//shoot();
					break;
		}
	}

	function onMouseUp(e){
		switch ( e.button ) {
			case 0: chr.controls.attack = false;
					break;
		}
	}


// ------------------------------------------------------------------------------------------------------------------------------------
// FUNCTION
// ------------------------------------------------------------------------------------------------------------------------------------
	var gameMode = "index",
		// time
		gameTime 	= 90,
		nowTime	 	= 0,
		//kill status count
		killCnt  	= 0,
		bulletShell = 0,
		rate		= 0,
		//flag
		bossNum	 	= 0,
		itemInfo = [
					{ name : "autofire", used : false, active:false, delay : 10 },
					{ name : "shotgun",  used : false, active:false, delay : 10 },
					{ name : "slow", 	 used : false, active:false, delay : 10 }
					],
		itemActive = false;


	function gameStart(){
		$("#title").css("display","none");
		$("#startBtn").css("display","none");
		$("#ui").css("height","60px");
		controler.freeze = false;
		gameMode ="gameReady";


		// if(timer)clearInterval(timer);
		// if(itemTimer)clearTimeout(itemTimer);

		nowTime 	= gameTime;
		killCnt 	= 0;
		bulletShell = 0;
		rate		= 0;
		bossNum 	= 0;
		itemActive 	= false;

		// console.log(nowTime);

		for(var i=0; i<3; i++){
			itemInfo[i].used = false;
			itemInfo[i].active = false;
			$("#item" + (i+1)).stop().css("opacity",1);
			$("#item" + (i+1)).css("color","rgb(255,255,255)");

			switch(i){
				case 0:  $("#item" + (i+1)).find("img").attr("src","asset/img/item_autofire.png"); break;
				case 1:  $("#item" + (i+1)).find("img").attr("src","asset/img/item_shotgun.png"); break;
				case 2:  $("#item" + (i+1)).find("img").attr("src","asset/img/item_slow.png"); break;
			}

		}

		$("#killCnt").text("X " + killCnt);
		timeChange();
		timerStart();

		for(var j = 0; j< birds.length; j++){
			var s 	= birds[j];
			s.scope.life 	= 100;
			s.scope.speed 	= 300;
			s.scope.mesh.material.color.setRGB(1,1,1);
			if(s.scope.boss == true){
				s.scope.animation("gone");
				birds.splice(j,1);
				s.scope.remove();
			}
		}
	}

	function gameEnd(){
		console.log("gameEnd")
		gameMode = "gameEnd";

		clearInterval(timer);
		clearTimeout(itemTimer);

		timer 		= null;
		itemTimer 	= null;

		controler.freeze = true;
		$("#title").css("display","block");
		$("#ui").css("height","700px");
		$("#results").css("height","400px");
		$("#restart").css("height","300px").click(function(){gameStart()});

		gameRangking();

		for(var i=0; i<3; i++){
			itemReset(itemInfo[i]);
		}

	}

	function gameRangking(){
		$("#re_kill").text(killCnt);
		$("#re_bullet").text(bulletShell);
		$("#re_rate").text(rate);

		var score = parseInt((rate / bulletShell)*1000) * killCnt;
		$("#re_score").text(score);

		var ranking = "";


		if(score >= 3000)ranking = 'AAA';
		if(score < 3000 && score >= 2000)ranking = "AA";
		if(score < 2000 && score >= 1500)ranking = 'A';
		if(score < 1500 && score >= 1000)ranking = 'B';
		if(score < 1000 && score >= 500)ranking = 'C';
		if(score < 500 && score >= 100)ranking = 'D';
		if(score < 100)ranking = 'E';


		var margin = 93;

		if(ranking.length == 1) margin += 20;
		if(ranking.length == 2) margin += 10;
		if(ranking.length == 3) margin += 0;

		$("#re_class").text(ranking).css("left",margin+"px");

	}

	function killCheck(boss){
		if(boss){
			killCnt += 5;
		}else{
			killCnt++;
		}
		$("#killCnt").text("X " + killCnt);
	}

	function itemUse(id){
		var item 	= itemInfo[id];
		if(item == undefined || item.used == true || itemActive == true || gameMode != "playing")return;

		item.used 	= true;
		item.active = true;
		itemActive 	= true;

		switch(id){
			case 0:  $("#item" + (id+1)).find("img").attr("src","asset/img/item_autofire_on.png"); break;
			case 1:  $("#item" + (id+1)).find("img").attr("src","asset/img/item_shotgun_on.png"); break;
			case 2:  $("#item" + (id+1)).find("img").attr("src","asset/img/item_slow_on.png"); break;
		}
		$("#item" + (id+1)).css("color","rgb(255,0,0)");
		$("#item" + (id+1)).animate({opacity : 0},item.delay*1000);
		switch(item.name){
			case "slow" : delta_bird = .1; break;
		}

		console.log("itemUse");

		itemTimer = setTimeout( itemReset , item.delay*1000 ,item);
	}

	function itemReset(item){
		item.active = false;
		itemActive 	= false;
		// console.log("itemReset");
		switch(item.name){
			case "slow" : delta_bird = 1; break;
		}
	}

	// TIMER
	var timer;
	var itemTimer;
	function timerStart(){
		if(!timer)timer = setInterval(timerHandler,"10");
	}

	function timerHandler(){
		if(nowTime > 0)nowTime　-=　0.01;
		if(nowTime < 0){
			gameEnd();
			nowTime = 0;
		}

		timeChange();
	}

	function timerStop(){

	}

	function timeChange(){
		var t     = nowTime.toFixed(2) + "";
		var sec	  = t.substring(0,t.lastIndexOf("."));
		var point = t.substring(t.lastIndexOf(".")+1,t.length);
		var color = "rgb(255,0,0)"

		// console.log(sec+" / "+point);

		if(sec < 10){
			color = "rgb(255,0,0)";
			if(bossNum == 0){
				birdMake(true);
				bossNum++;
			}
		}else{
			color = "rgb(255,255,255)";
		}
		if(sec >= 10 && sec < 100)sec = "0"+sec;
		if(sec < 10)sec = "00"+sec;


		if(sec == 0 && point == 00){
			color = "rgb(255,255,255)";
			// gameEnd();
		}

		$("#time_sec").text(sec).css("color",color);
		$("#time_point").text("."+point).css("color",color);


		// $("#sec").text(s);
	}



	//---------------------------------------------------------------------------------------------

	function shoot(){
		if(itemInfo[1].active == true){
			for(var i= 0; i < 4; i++){
				bullet = new Bullet(chr.camera);
				bullets.push(bullet);
			}
		}else{
			bullet = new Bullet(chr.camera);
			bullets.push(bullet);
		}
	}

	function birdMake(bossBool){
		var bird = new Bird(new THREE.Vector3(Math.random()*100,Math.random()*300+50,Math.random()*100), 300,bossBool);
		bird.load();
	}


	/*
	var INTERSECTED;
	function hitCheck(){
		var vector = new THREE.Vector3(0, 0, 0);
		projector.unprojectVector(vector, camera);
		var ray = new THREE.Ray( camera.position, vector.subSelf(camera.position).normalize());
		var intersects = ray.intersectObjects( sbirds );

		var obj;
		if(intersects.length > 0){
			INTERSECTED = intersects[0].object;
			obj = intersects[0].object;
		}else{
			INTERSECTED = null;
		}
		return obj;
	}
	*/


	function loadTexture( path ) {
		var texture = new THREE.Texture();
		var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: true } );

		var image = new Image();
		image.onload = function () {
			texture.needsUpdate = true;
			material.map.image = this;
			loadedUpdate();
		};
		image.src = path;

		return material;
	}

	function imgLoad( path ){
		var texture = THREE.ImageUtils.loadTexture( path, "", function(){
			texture.needsUpdate = true;
			texture = this;
			loadedUpdate();
		});

		return texture;
	}


// ------------------------------------------------------------------------------------------------------------------------------------
// CLASS
// ------------------------------------------------------------------------------------------------------------------------------------

	/*
	 *  SKYBOX
	 */
	function SkyBox(materials,width,height,depth,expand){
		this.width 	= width;
		this.height = height;
		this.depth  = depth;
		this.expand = expand != null? expand : 1;

		mesh = new THREE.Mesh( new THREE.CubeGeometry( width * this.expand, height * this.expand, depth * this.expand , 7, 7, 7, materials ), new THREE.MeshFaceMaterial() );
		mesh.scale.x = - 1;
		scene.add( mesh );
	}

	SkyBox.prototype.constructor = SkyBox;

	/*
	 *  BIRD
	 */
	function Bird(pos,speed,boss)
	{
		this.id			= 0;
		this.life 		= 100;
		this.hitRad		= boss? 350 : 65;
		this.boss		= boss? true : false;

		this.rotationY 	= Math.random()*360;
		this.radianY 	= this.rotationY * Math.PI / 180;

		this.speed =　speed//100 + Math.random() * 100;

		this.x = pos.x// + worldWidth;
		this.y = pos.y;
		this.z = pos.z// + worldHeight;

		this.bird 					= new ShiftBird();
		this.bird.animationFPS 		= 30;
		this.bird.scale 			= boss?200 : 20;

		this.baseCharacter			= new ShiftBird();
		this.baseCharacter.root.position 	= pos;


		this.config = {

	      baseUrl	: "asset/models/bird/",
	      body		: "body.js",
	      skins		: ["skin.png"],

	      animations: {
	        fly		: "fly",
	        hit		: "hit",
	        death	: "death",
	        gone	: "gone"
	      },
	    }

		this.controls = {
			fly		: true,
			hit 	: false,
			death	: false,
			gone	: false
		}
		this.interval = 0;
		this.bird.controls = this.controls;
	}

	Bird.prototype.load = function(){
		var scope = this;
		this.baseCharacter.loadParts( scope.config );
		this.baseCharacter.onLoadComplete = function(){
			scope.bird.shareParts(scope.baseCharacter);

			scope.bird.setSkin( 0 );

			scope.bird.root.position.x = scope.x;
			scope.bird.root.position.y = scope.y;
			scope.bird.root.position.z = scope.z;
			// scope.bird.setWireframe(true);
			scope.bird.bodyOrientation += (scope.radianY);

			scope.mesh 			= scope.bird.meshBody;
			scope.mesh.bird		= scope.bird;
			scope.mesh.scope 	= scope;
			scope.id 			= birds.length;

			birds.push(scope.mesh);

			scene.add(scope.bird.root);
		}
	};

	Bird.prototype.update = function(delta){
		this.bird.update(delta);
		this.bird.root.position.x += Math.sin(this.radianY) * this.speed * delta;
		this.bird.root.position.z += Math.cos(this.radianY) * this.speed * delta;

		if(this.bird.root.position.x > worldWidth * (worldScale-1))this.bird.root.position.x = -worldWidth;
		if(this.bird.root.position.x < -worldWidth * (worldScale-1))this.bird.root.position.x = worldWidth;

		if(this.bird.root.position.z > worldDepth * (worldScale-1))this.bird.root.position.z = -worldDepth;
		if(this.bird.root.position.z < -worldDepth * (worldScale-1))this.bird.root.position.z = worldDepth;

		// console.log(delta)
	}

	Bird.prototype.remove = function(){
		scene.remove(this.bird.root);
	}

	Bird.prototype.animation = function(type){
		if(this.controls[type] === undefined)return;
		this.controls[type] = true;
		var scope 	= this;
		var oldType = type;
		switch(type){
			case "fly" 		: break;
			case "hit" 		: this.interval = 130; break;
			case "death" 	: this.interval = 710; break;
			case "gone" 	: this.interval = 0; break;
		}

		setTimeout(function(){
						scope.controls[oldType] = false;
						if(oldType == "death"){
							scope.controls.gone = true;
						}
					}
		,(this.interval));
	}

	Bird.prototype.constructor = Bird;


	/*
	 *  BULLET
	 */
	var bullet, bullets = [];
	function Bullet(cam)
	{
		bulletShell++;
		this.cam = cam;
		this.pos = cam.position.clone();


		this.speed = 8000//speed;
		this.power = 20;

		this.geometry 	= new THREE.SphereGeometry(10, 10, 10);
	    this.material 	= new THREE.MeshLambertMaterial({color:0x7C6C59});
		this.bullet	  	= new THREE.Mesh(bullet_geo, this.material);
		this.bullet.rotation = cam.rotation.clone();


		this.vector		= new THREE.Vector3(mouse.x,mouse.y,.5);
		if(itemInfo[1].active) {
			this.vector.x += Math.random()* .1 - .05;
			this.vector.y += Math.random()* .1 - .05;
			// this.vector.z += ran;
		}
		projector.unprojectVector(this.vector, this.cam);
		this.ray		= new THREE.Ray(this.pos, this.vector.subSelf(this.pos).normalize());

		this.root = new THREE.Object3D();
		this.root.add(this.bullet);
		this.root.position = this.cam.position.clone();
	    scene.add(this.root);
	}

	Bullet.prototype.update = function(delta){
		this.root.translateX(delta * this.speed * this.ray.direction.x);
		this.root.translateY(delta * this.speed * this.ray.direction.y);
		this.root.translateZ(delta * this.speed * this.ray.direction.z);
	}

	Bullet.prototype.remove = function(){
		//this.root.remove(this.bullet);
		scene.remove(this.root);
		this.bullet = this.root = this.cam = this.pos = this.speed = this.geometry = this.material = this.vector = this.ray = undefined;
	}

	Bullet.prototype.constructor = Bullet;

	/*
	 *  Boxman
	 */
	function Boxman(position)
	{
		var scope = this;
		this.pos = position.clone();

		this.config = {
	      baseUrl	: "asset/models/boxman/",
	      body		: "body.js",
	      weapons: [],
	      skins		: ["skin.png"],
	      animations: {
	        idle	: "idle",
	    	move	: "move",
	   		attack	: "attack"
	      },
	      walkSpeed: 350,
	  	  crouchSpeed: 175
	    }

	    this.controls = {
	      moveForward	: false,
	      moveBackward	: false,
	      moveLeft		: false,
	      moveRight		: false,
	      attack		: false
	    };

		this.boxman 				= new THREE.MD2CharacterComplex();
		this.boxman.animationFPS 	= 30;
		this.boxman.scale 			= 5;

		this.baseCharacter			= new THREE.MD2CharacterComplex();
		this.baseCharacter.root.position = this.pos;

	    this.boxman.controls = this.controls;
	}

	Boxman.prototype.load = function()
	{
		var scope = this;
		this.baseCharacter.loadParts(this.config);
	    this.baseCharacter.onLoadComplete = function() {
	      scope.boxman.shareParts(scope.baseCharacter);
	      scope.boxman.enableShadows(true);
	      scope.boxman.setWeapon(0);
	      scope.boxman.setSkin(0);
	      scope.boxman.animationFPS = 30;

	      scene.add(scope.boxman.root);
	    }
	}

	Boxman.prototype.update = function(){
		this.boxman.update(delta);
		if(this.camera){
			if(this.camera.position.y < 50 || this.camera.position.y > 50) this.camera.position.y = 50;

			if(this.camera.position.x > worldWidth)this.camera.position.x = worldWidth;
			if(this.camera.position.x < -worldWidth)this.camera.position.x = -worldWidth;

			if(this.camera.position.z > worldDepth)this.camera.position.z = worldDepth;
			if(this.camera.position.z < -worldDepth)this.camera.position.z = -worldDepth;

			this.boxman.root.position = this.camera.position.clone();
			this.boxman.root.rotation = this.camera.rotation.clone();
			this.boxman.root.position.y -= 130;
			// this.boxman.root.position.z -= 200;
		}
	}
	Boxman.prototype.cameraOn = function(){
		if(!this.camera){
			this.camera 			= new THREE.PerspectiveCamera(45,sw/sh,.1,10000);
			this.camera.position 	= this.boxman.root.position.clone();
			scene.add(this.camera);
		}
	}
	Boxman.prototype.cameraOff = function(){
		if(this.camera){
			this.root.remove(this.camera);
			this.camera = null;
		}
	}

	Boxman.prototype.constructor = Boxman;


	/*
	 * VIDEO VideoObj
	 */
	//  <video poster="https://15192.wpc.azureedge.net/8015192/dist04/clip/d5d4112f12244ea8a0cbff4d36b7e68e/th_w320_0001_m.jpg" preload="auto" class="video" autoplay="" controls="">
	// 	<source src="https://15192.wpc.azureedge.net/8015192/dist04/clip/d5d4112f12244ea8a0cbff4d36b7e68e/clip.mp4">
	// 	<source src="https://15192.wpc.azureedge.net/8015192/dist04/clip/d5d4112f12244ea8a0cbff4d36b7e68e/clip.webm">
	// </video>

	 var video;
	 var videoImage;
	 var videoImageContext;
	 var videoTexture;
	 function VideoObj(position)
	 {
	 	this.pos = position.clone();

	 	//video要素とそれをキャプチャするcanvas要素を生成
		video = document.createElement('video');
		video.src = "/asset/movie/clip.mp4";
		video.load();
		video.play();

		// <video poster="https://15192.wpc.azureedge.net/8015192/dist04/clip/d5d4112f12244ea8a0cbff4d36b7e68e/th_w320_0001_m.jpg" preload="auto" class="video" autoplay="" controls="">
		// 	<source src="https://15192.wpc.azureedge.net/8015192/dist04/clip/d5d4112f12244ea8a0cbff4d36b7e68e/clip.mp4">
		// 	<source src="https://15192.wpc.azureedge.net/8015192/dist04/clip/d5d4112f12244ea8a0cbff4d36b7e68e/clip.webm">
		// </video>

		videoImage = document.createElement('canvas');
		videoImage.width = 720;
		videoImage.height = 1280;

		videoImageContext = videoImage.getContext('2d');
		videoImageContext.fillStyle = '#000000';
		videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

		//生成したcanvasをtextureとしてTHREE.Textureオブジェクトを生成
		videoTexture = new THREE.Texture(videoImage);
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;

		//生成したvideo textureをmapに指定し、overdrawをtureにしてマテリアルを生成
		var movieMaterial = new THREE.MeshBasicMaterial({map: videoTexture, overdraw: true});
		// var movieGeometry = new THREE.CubeGeometry(360, 640, 0); // 立方体作成
		var movieGeometry = new THREE.PlaneGeometry(360	, 640, 5, 5);

		var movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);
		// movieScreen.rotation.y = THREE.Math.degToRad(90);


		scene.add(movieScreen);

	 }

	 VideoObj.prototype.update = function(){
		//loop updateの中で実行
		if (video.readyState === video.HAVE_ENOUGH_DATA) {

			// 描画した動画のフレームのピクセルデータを取得
			var ctx = videoImage.getContext('2d');
			// キャンバスの幅と高さをvideoと同じに設定
		    ctx.width  = 720;
		    ctx.height = 1280;
		    ctx.drawImage(video, 0, 0);
		     // 描画した動画のフレームのピクセルデータを取得
		    var pxdata = ctx.getImageData(0, 0, ctx.width, ctx.height);

		    // 白抜きする対象のピクセル数を保持する変数
		    var totalpx = 0;

		    // 現在のフレームのすべてのピクセル（縦*横）分ループで回す
		    for(var i = 0; i < videoImage.width * videoImage.height; i++){
		        // RGBを数値で取得（1番目:red、2番目:green, 3番目:blue, 4番目:透明度）
		        var r = pxdata.data[i * 4 + 0];
		        var g = pxdata.data[i * 4 + 1];
		        var b = pxdata.data[i * 4 + 2];

		        // 白っぽいデータのところを透明にする
		        if (g > 150 && r > 150 && b > 150){
		            pxdata.data[i * 4 + 3] = 0;
		            totalpx += 1
		        }
		    }

		    // キャンバスに再描画
		    ctx.putImageData(pxdata, 0, 0);

		    // videoImageContext.drawImage(video, 0, 0);
		    // videoImageContext.drawImage(video, 0, 0);

			// videoImageContext.putImageData(pxdata, 0, 0);



		    if (videoTexture) {
		        videoTexture.needsUpdate = true;
		    }
		}
	 }

	/*
	 * CROSSHAIR
	 */
	function CrossHair()
	{
		this.crossHairID 		= 0;
		this.crossHairMaps 		= ["asset/img/crosshair1.png","asset/img/crosshair2.png"];
		this.crossHairMap 		= THREE.ImageUtils.loadTexture( this.crossHairMaps[this.crossHairID]);

		this.crossHair 						= new THREE.Sprite({ useScreenCoordinates: true});
		this.crossHair.alignment 			= THREE.SpriteAlignment.center;
		this.crossHair.useScreenCoordinates = false;
		this.crossHair.position.z = -1000;

		// console.log(uiScene);
		this.crossHair.map = this.crossHairMap;
		uiScene.add(this.crossHair);
	}

	CrossHair.prototype.move = function(x,y){
		this.crossHair.position.set(x,y,-1000);
		/*
		var v1 = new THREE.Vector3(x,y,0);
		var v2 = new THREE.Vector3(x,y,-1000);

		var vector = new THREE.Vector3(0, 0, 0);
		projector.unprojectVector(vector, camera);
		var ray = new THREE.Ray( uiCamera.position, vector.subSelf(camera.position).normalize());

		var ray = new THREE.Ray(v1, v2.normalize());
		this.crossHair.potsition = ray.direction;
		console.log(v1,ray.direction)
		*/
	}

	CrossHair.prototype.change = function(id){
		if(this.crossHairID == id || this.crossHairID > this.crossHairID.length - 1) return;
		this.crossHairID 	= id;
		this.crossHairMap 	= THREE.ImageUtils.loadTexture( this.crossHairMaps[this.crossHairID]);
		this.crossHair.map = this.crossHairMap;

	}
	CrossHair.prototype.constructor = CrossHair;

	window.addEventListener("load",init)
}).call(this);


if (typeof(THREE.Math.degToRad) === "undefined") {
  THREE.Math.degToRad = function() {
    return this * Math.PI / 180;
  }
}
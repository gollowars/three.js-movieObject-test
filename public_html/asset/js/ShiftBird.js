/**
 * @author alteredq / http://alteredqualia.com/
 * modify by shiftbrain 
 */

(function(){
	ShiftBird = function () {
		var scope = this;
	
		this.scale = 1;
	
		// animation parameters
	
		this.animationFPS = 6;
		this.transitionFrames = 60;
	
		// rig
	
		this.root = new THREE.Object3D();
	
		this.meshBody = null;
		this.meshWeapon = null;
	
		this.controls = null;
	
		// skins
	
		this.skinsBody = [];
		// this.skinsWeapon = [];

	
		// this.weapons = [];
	
		this.currentSkin = undefined;
	
		//
	
		this.onLoadComplete = function () { console.log("onLoadComplete"); };
	
		// internals
	
		this.meshes = [];
		this.animations = {};
	
		this.loadCounter = 0;
	
		// internal movement control variables
	
		this.bodyOrientation = Math.PI / 2;

		// internal animation parameters
	
		// API
	
		this.enableShadows = function ( enable ) {
	
			for ( var i = 0; i < this.meshes.length; i ++ ) {
	
				this.meshes[ i ].castShadow = enable;
				this.meshes[ i ].receiveShadow = enable;
	
			}
	
		};
	
		this.setVisible = function ( enable ) {
	
			for ( var i = 0; i < this.meshes.length; i ++ ) {
	
				this.meshes[ i ].visible = enable;
				this.meshes[ i ].visible = enable;
	
			}
	
		};
	
	
		this.shareParts = function ( original ) {
	
			this.animations = original.animations;
			this.walkSpeed = original.walkSpeed;
			this.crouchSpeed = original.crouchSpeed;
	
			this.skinsBody = original.skinsBody;
	
			// BODY
	
			var mesh = createPart( original.meshBody.geometry, this.skinsBody[ 0 ] );
			mesh.scale.set( this.scale, this.scale, this.scale );
	
			this.root.position.y = original.root.position.y;
			this.root.add( mesh );
	
			this.meshBody = mesh;
			this.meshes.push( mesh );
	
		};
	
		this.loadParts = function ( config ) {
	
			this.animations 	= config.animations;
			this.loadCounter 	= config.skins.length + 1;
	
			// SKINS
			this.skinsBody = loadTextures( config.baseUrl + "skins/", config.skins );
	
			// BODY
			var loader = new THREE.JSONLoader();
	
			loader.load( config.baseUrl + config.body, function( geo ) {
	
				geo.computeBoundingBox();
				scope.root.position.y = - scope.scale * geo.boundingBox.min.y;
	
				var mesh = createPart( geo, scope.skinsBody[ 0 ] );
				mesh.scale.set( scope.scale, scope.scale, scope.scale );
	
				scope.root.add( mesh );
	
				scope.meshBody = mesh;
				scope.meshes.push( mesh );
	
				checkLoadingComplete();
	
			} );
		};
	
		this.setPlaybackRate = function ( rate ) {
	
			if ( this.meshBody ) this.meshBody.duration = this.meshBody.baseDuration / rate;
	
		};
	
		this.setWireframe = function ( wireframeEnabled ) {
	
			if ( wireframeEnabled ) {
	
				if ( this.meshBody ) this.meshBody.material = this.meshBody.materialWireframe;
	
			} else {
	
				if ( this.meshBody ) this.meshBody.material = this.meshBody.materialTexture;
	
			}
	
		};
	
		this.setSkin = function( index ) {
	
			if ( this.meshBody && this.meshBody.material.wireframe === false ) {
	
				this.meshBody.material.map = this.skinsBody[ index ];
				this.currentSkin = index;
	
			}
	
		};
	
	
		this.setAnimation = function ( animationName ) {
	
			if ( animationName === this.activeAnimation || !animationName ) return;
	
			if ( this.meshBody ) {
	
				this.meshBody.setAnimationWeight( animationName, 0 );
				this.meshBody.playAnimation( animationName );
	
				this.oldAnimation = this.activeAnimation;
				this.activeAnimation = animationName;
	
				this.blendCounter = this.transitionFrames;
	
			}
		};
	
		this.update = function ( delta ) {
			if ( this.controls ) this.updateMovementModel( delta );
	
			if ( this.animations ) {
	
				this.updateBehaviors( delta );
				this.updateAnimations( delta );
	
			}
	
		};
	
		this.updateAnimations = function ( delta ) {
	
			var mix = 1;
			// console.log(this.transitionFrames);
			if ( this.blendCounter > 0 ) {
	
				//mix = ( this.transitionFrames - this.blendCounter ) / this.transitionFrames;
				//this.blendCounter -= 1;
	
			}
	
			if ( this.meshBody ) {
	
				this.meshBody.update( delta );
	
				this.meshBody.setAnimationWeight( this.activeAnimation, mix );
				this.meshBody.setAnimationWeight( this.oldAnimation,  1 - mix );
	
			}
	
		};
	
		var hitDelay = 0;
		this.updateBehaviors = function ( delta ) {
	
			var controls 	= this.controls;
			var animations 	= this.animations;
			var idleAnimation;
	
			// crouch vs stand
			if ( controls.fly ) {
				idleAnimation = animations[ "fly" ];
			}
			
			if ( controls.hit ) {
				idleAnimation = animations[ "hit" ];
			}
			
			if ( controls.death ) {
				idleAnimation = animations[ "death" ];
			}
			
			if ( controls.gone ) {
				idleAnimation = animations[ "gone" ];
			}
			
			this.setAnimation( idleAnimation );
			
			/*
			*/
		};
	
		this.updateMovementModel = function ( delta ) {
	
			var controls = this.controls;
	
			// speed based on controls
	
			if ( controls.crouch ) 	this.maxSpeed = this.crouchSpeed;
			else  					this.maxSpeed = this.walkSpeed;
	
			this.maxReverseSpeed = -this.maxSpeed;
	
			var dir = 1;
	
			if ( controls.moveLeft ) {
	
			}
	
			if ( controls.moveRight ) {
	
			}
	
			// speed decay
	
			if ( ! ( controls.moveForward || controls.moveBackward ) ) {
	
				if ( this.speed > 0 ) {
	
				} else {
	
				}
	
			}
	
			// displacement
	
			var forwardDelta = this.speed * delta;
	
			// steering
	
			this.root.rotation.y = this.bodyOrientation;
	
		};
	
		// internal helpers
	
		function loadTextures( baseUrl, textureUrls ) {
	
			var mapping = new THREE.UVMapping();
			var textures = [];
	
			for ( var i = 0; i < textureUrls.length; i ++ ) {
	
				textures[ i ] = THREE.ImageUtils.loadTexture( baseUrl + textureUrls[ i ], mapping, checkLoadingComplete );
				textures[ i ].name = textureUrls[ i ];
	
			}
	
			return textures;
	
		};
	
		function createPart( geometry, skinMap ) {
	
			geometry.computeMorphNormals();
	
			var whiteMap = THREE.ImageUtils.generateDataTexture( 1, 1, new THREE.Color( 0xffffff ) );
			var materialWireframe = new THREE.MeshPhongMaterial( { color: 0xffaa00, specular: 0x111111, shininess: 50, wireframe: true, shading: THREE.SmoothShading, map: whiteMap, morphTargets: true, morphNormals: true, perPixel: true, metal: true } );
	
			var materialTexture = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 50, wireframe: false, shading: THREE.SmoothShading, map: skinMap, morphTargets: true, morphNormals: true, perPixel: true, metal: true } );
			materialTexture.wrapAround = true;
			//
	
			var mesh = new THREE.MorphBlendMesh( geometry, materialTexture );
			mesh.rotation.y = 0;
	
			//
	
			mesh.materialTexture = materialTexture;
			mesh.materialWireframe = materialWireframe;
	
			//
	
			mesh.autoCreateAnimations( scope.animationFPS );
	
			return mesh;
	
		};
	
		function checkLoadingComplete() {
	
			scope.loadCounter -= 1;
			if ( scope.loadCounter === 0 ) 	scope.onLoadComplete();
	
		};
	
		function exponentialEaseOut( k ) { return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1; }
	};
}).call(this);

(function() {
	FPC_Controler = function(object, domElement) {
		this.object = object;
		this.target = new THREE.Vector3(0, 0, 0);

		this.domElement = (domElement !== undefined ) ? domElement : document;

		this.movementSpeed = 1.0;
		this.lookSpeed = 0.005;

		this.noFly = false;
		this.lookVertical 	= true;
		this.autoForward 	= false;
		this.invertVertical = false;

		this.activeLook = true;

		this.heightSpeed = false;
		this.heightCoef = 1.0;
		this.heightMin = 0.0;

		this.constrainVertical = false;
		this.verticalMin = 0;
		this.verticalMax = Math.PI;

		this.autoSpeedFactor = 0.0;

		this.mouseX = 0;
		this.mouseY = 0;

		this.lat = 0;
		this.lon = 0;
		this.phi = 0;
		this.theta = 0;

		this.controls = {
	      moveForward: false,
	      moveBackward: false,
	      moveLeft: false,
	      moveRight: false
	    };
	    
		// this.moveForward = false;
		// this.moveBackward = false;
		// this.moveLeft = false;
		// this.moveRight = false;
		this.freeze = false;

		this.mouseDragOn = false;

		if(this.domElement === document) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;
			this.domElement.setAttribute('tabindex', -1);

		}


		/*
		this.onMouseDown = function(event) {
			
			if(this.domElement !== document) {
				this.domElement.focus();
			}

			event.preventDefault();
			event.stopPropagation();

			if(this.activeLook) {

				switch ( event.button ) {

					case 0:
						// this.moveForward = true;
						break;
					case 2:
						// this.moveBackward = true;
						break;

				}

			}

			this.mouseDragOn = true;

		};

		this.onMouseUp = function(event) {

			event.preventDefault();
			event.stopPropagation();

			if(this.activeLook) {

				switch ( event.button ) {

					case 0:
						this.moveForward = false;
						break;
					case 2:
						this.moveBackward = false;
						break;

				}

			}

			this.mouseDragOn = false;

		};
		*/

		this.onMouseMove = function(event) {
			if(this.domElement === document) {
				this.mouseX = event.pageX - this.viewHalfX;
				this.mouseY = event.pageY - this.viewHalfY;

			} else {

				this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
				this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
				this.mouseY *= this.invertVertical?-1:1;

			}
		};
		
		// this.onMouseMove.call(this);

		this.onKeyDown = function(event) {

			switch( event.keyCode ) {

				case 38:/*up*/
				case 40:/*down*/
				case 37:/*left*/
				case 39:/*right*/
				case 32: /*space*/ this.controls.attack 	= true; break;
				
				case 87:/*W*/	this.controls.moveForward 	= true;	break;
				case 65:/*A*/	this.controls.moveLeft 		= true;	break;
				case 83:/*S*/	this.controls.moveBackward 	= true;	break;
				case 68:/*D*/	this.controls.moveRight 	= true;	break;
				case 82:/*R*/	this.moveUp 				= true;	break;
				case 70:/*F*/	this.moveDown 				= true;	break;

				case 82:/*R*/	this.moveUp					= true;break;
				case 70:/*F*/	this.moveDown 				= true;break;
				// case 81:/*Q*/	this.freeze 				= !this.freeze;break;

			}
		};

		this.onKeyUp = function(event) {
			//console.log(event.keyCode);
			switch( event.keyCode ) {

				case 38:/*up*/
				case 40:/*down*/
				case 37:/*left*/
				case 39:/*right*/
				
				case 32: /*space*/ this.controls.attack 	= false;break;
				
				case 87:/*W*/	this.controls.moveForward 	= false;break;
				case 65:/*A*/	this.controls.moveLeft 		= false;break;
				case 83:/*S*/	this.controls.moveBackward 	= false;break;
				case 68:/*D*/	this.controls.moveRight 	= false;break;
				case 82:/*R*/	this.moveUp 				= false;break;
				case 70:/*F*/	this.moveDown 				= false;break;

			}

		};

		this.update = function(delta) {
			var actualMoveSpeed = 0;

			if(this.freeze) {

				return;

			} else {

				if(this.heightSpeed) {

					var y = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax);
					var heightDelta = y - this.heightMin;

					this.autoSpeedFactor = delta * (heightDelta * this.heightCoef );

				} else {

					this.autoSpeedFactor = 0.0;

				}
				actualMoveSpeed = delta * this.movementSpeed;

				if(this.controls.moveForward || (this.controls.autoForward && !this.controls.moveBackward ))
					this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor ));
				if(this.controls.moveBackward)
					this.object.translateZ(actualMoveSpeed);

				if(this.controls.moveLeft)
					this.object.translateX(-actualMoveSpeed);
				if(this.controls.moveRight)
					this.object.translateX(actualMoveSpeed);

				if(this.moveUp)
					this.object.translateY(actualMoveSpeed);
				if(this.moveDown)
					this.object.translateY(-actualMoveSpeed);

				var actualLookSpeed = delta * this.lookSpeed;
				// var actualLookSpeed = .005//delta * this.lookSpeed;
				
				if(!this.activeLook) {
					actualLookSpeed = 0;
				}

				this.lon += this.mouseX * actualLookSpeed;
				if(this.lookVertical)
					this.lat -= this.mouseY * actualLookSpeed;
				

				this.lat = Math.max(-85, Math.min(85, this.lat));
				this.phi = (90 - this.lat ) * Math.PI / 180;
				this.theta = this.lon * Math.PI / 180;

				var targetPosition = this.target, position = this.object.position;

				targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
				targetPosition.y = position.y + 100 * Math.cos(this.phi);
				targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

			}

			var verticalLookRatio = 1;

			if(this.constrainVertical) {
				verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin );

			}

			this.lon += this.mouseX * actualLookSpeed;
			if(this.lookVertical)
				this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

			this.lat = Math.max(-85, Math.min(85, this.lat));
			this.phi = (90 - this.lat ) * Math.PI / 180;

			this.theta = this.lon * Math.PI / 180;

			if(this.constrainVertical) {

				this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);

			}

			var targetPosition = this.target, position = this.object.position;

			targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
			targetPosition.y = position.y + 100 * Math.cos(this.phi);
			targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

			this.object.lookAt(targetPosition);

		};

		this.domElement.addEventListener('contextmenu', function(event) {
			event.preventDefault();
		}, false);

			this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );


		this.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);
		// this.domElement.addEventListener('mousedown', bind(this, this.onMouseDown), false);
		// this.domElement.addEventListener('mouseup', bind(this, this.onMouseUp), false);
		this.domElement.addEventListener('keydown', bind(this, this.onKeyDown), false);
		this.domElement.addEventListener('keyup', bind(this, this.onKeyUp), false);

		function bind(scope, fn) {

			return function() {

				fn.apply(scope, arguments);

			};
		};

	};
	
	FPC_Controler.prototype.onMouseDown = function(event){
	}
	
	FPC_Controler.prototype.onMouseUp = function(event){
	}
	FPC_Controler.prototype.onMouseMove = function(event){
	}
	
	FPC_Controler.prototype.constructor = FPC_Controler;
}).apply(this)





















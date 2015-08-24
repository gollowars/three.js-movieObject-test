(function()
{
	var scene;
	var renderer;
	var camera,fov,aspect,near,far;
	var light;
	var mesh;

	var ground;

	window.addEventListener('load',function(){
		init();
		render();
		addEvent();
	});

	function init(){
		/*SCENE SETTING*/
		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2( 0xAA9966, 0.015 );

		/*RENDERER SETTING*/
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		/*CAMERA SETTING*/
		fov = 55;
		aspect = window.innerWidth / window.innerHeight;
		near = 0.1;
		far = 10000;

		camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
		camera.position.z = 10;
		camera.position.y = 10;
		camera.rotation.x = -0.5;

		/*Light SETTING*/
		var directionalLight = new THREE.DirectionalLight( 0xffffff );
		  directionalLight.position.set( 10, 10, 10 );
		  scene.add( directionalLight );

		/*create object*/
		// 物体の用意
		var geometry = new THREE.BoxGeometry(2, 2, 2);
		var material = new THREE.MeshLambertMaterial( { color: 0x00ff88 } )
		mesh = new THREE.Mesh( geometry, material );
		scene.add(mesh);


		/*地面の生成*/
		var texture = THREE.ImageUtils.loadTexture('/asset/img/negy.jpg');

		var groundGeo = new THREE.PlaneGeometry(150, 150, 10, 10);
		ground = new THREE.Mesh(
			groundGeo,
			new THREE.MeshLambertMaterial( {
				map: texture,
				wireframe: true //ワイヤーフレーム有効
				 } )
		);
		ground.rotation.x = 90 * Math.PI / 180;
		ground.position.y = -75;
		ground.position.z = -75;
		scene.add( ground );


	}

	function render() {
		update();

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	function update(){

	}

	function addEvent()
	{
		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);
		document.addEventListener("keyleft", onKeyLeft, false);
		document.addEventListener("keyright", onKeyRight, false);
	}

	function onKeyDown(e){
		mesh.position.z -= 1;
	}

	function onKeyUp(e){
		// mesh.position.x -= 1;

	}

	function onKeyLeft(e){
	}

	function onKeyRight(e){
	}


}).call(this);
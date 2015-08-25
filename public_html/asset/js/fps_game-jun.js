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
		renderer = new THREE.WebGLRenderer({antialias : true});
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



		/* CONTENT LOAD */
		contentLoad();

	}
/*---------------------
Render
---------------------*/

	function render() {
		update();
		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	function update(){
		videoObj1.update();
	}

/*---------------------
Event
---------------------*/
	// skybox
	var sbMaterials = [],
		sbPath	 	= "asset/img/texture/NiagaraFalls3/",
		sbFNames 	= ["posx", "negx", "posy", "negy", "posz", "negz"];

	function contentLoad(){
		// skybox IMG LOADED
		for(var i=0; i<6; i++){
			sbMaterials[i] = THREE.ImageUtils.loadTexture( sbPath + sbFNames[i] + '.jpg' );
		}

		setup();
		addEvent();
		render();
	}

	var clock,delta,mouse = {x:0, y:0},
		worldWidth,worldHeight,worldDepth,
		worldScale,
		ground,
		skyBox;

		//movie
	var videoObj1;
	function setup(){
		//clock
		clock = new THREE.Clock();

		// object
		worldWidth	= 2048;
		worldHeight = 2048;
		worldDepth 	= 2048;
		worldScale	= 3;

		//sky box
		skyBox		= new SkyBox(sbMaterials,worldWidth,worldHeight,worldDepth,worldScale);

		//六角形オブジェクト
		videoObj1 = new VideoObj({
			x:0,
			y:0,
			z:-20
		},"/asset/movie/clip3.mp4");


		//地面
		ground = new Ground();
	}

	function addEvent()
	{
		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);
		document.addEventListener("keyleft", onKeyLeft, false);
		document.addEventListener("keyright", onKeyRight, false);
	}

	function onKeyDown(e){
	}

	function onKeyUp(e){
		// mesh.position.x -= 1;

	}

	function onKeyLeft(e){
	}

	function onKeyRight(e){
	}

/*---------------------
CLASS
---------------------*/
	/*videoobj*/
	function VideoObj(position,src)
	 {
		//video要素とそれをキャプチャするcanvas要素を生成
		this.video = document.createElement('video');
		this.video.src = src;
		this.video.load();
		this.video.play();

		var videoImage = document.createElement('canvas');
		videoImage.width = 720;
		videoImage.height = 1280;

		this.videoImageContext = videoImage.getContext('2d');
		this.videoImageContext.fillStyle = '#000000';
		this.videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

		//生成したcanvasをtextureとしてTHREE.Textureオブジェクトを生成
		this.videoTexture = new THREE.Texture(videoImage);

		this.videoTexture.minFilter = THREE.LinearFilter;
		this.videoTexture.magFilter = THREE.LinearFilter;


		//生成したvideo textureをmapに指定し、overdrawをtureにしてマテリアルを生成
		var movieMaterial = new THREE.MeshBasicMaterial({map: this.videoTexture, overdraw: true, side:THREE.DoubleSide});
		var movieGeometry = new THREE.CircleGeometry( 2, 6 );
		this.movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);

		this.movieScreen.position.x = position.x;
		this.movieScreen.position.y = position.y;
		this.movieScreen.position.z = position.z;

		scene.add(this.movieScreen);

	 }

	 VideoObj.prototype.update = function(){
	 	//loop updateの中で実行
		if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
		    this.videoImageContext.drawImage(this.video, 0, 0);
		    if (this.videoTexture) {
		        this.videoTexture.needsUpdate = true;
		    }
		}

	 }

	/*SKYBOX*/
	function SkyBox(materials,width,height,depth,expand){
		this.width 	= width;
		this.height = height;
		this.depth  = depth;
		this.expand = expand != null? expand : 1;


		//箱型オブジェクトの宣言
		var geometry = new THREE.BoxGeometry(20, 20, 20);
//材質を配列で指定する(箱型なので6面分)
		//オブジェクトの生成
		mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
		mesh.position.z = -10;
		//シーンへの追加
		scene.add(mesh);
	}

	SkyBox.prototype.constructor = SkyBox;

	/*Ground*/
	function Ground(){
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

/*---------------------
FUNCTION
---------------------*/
	function loadTextures( baseUrl, textureUrls ) {
		var mapping = new THREE.UVMapping();
		var textures = [];
		for ( var i = 0; i < textureUrls.length; i ++ ) {
			textures[ i ] = THREE.ImageUtils.loadTexture( baseUrl + textureUrls[ i ], mapping, checkLoadingComplete );
			textures[ i ].name = textureUrls[ i ];
		}
		return textures;
	};


}).call(this);
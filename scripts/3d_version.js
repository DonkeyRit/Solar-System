/**
 * Определяем глобальные переменные
 * ctx - контекст для рисования на холсте
 * renderer - объект, который будет отрисовывать изображение на холсте
 * scena - объект, на котором будут располагаться объекты солнечной системы
 * camera - камера
 * controls - объект, позволяющий изменять ракурс просмотра 
 * pointLight - объект освещения, который будет испускаться из одной точки солнца
 * ambientLight - объект освещения, который будет освещать все объекты сцены одинаково
 * sun - солнце
 * planets - массив, который будет содержать планеты
 * asteroids - массив астероидов
 */
var ctx, renderer, scene, 
    camera, controls, pointLight, 
    ambientLight, sun, earth,
    planets = [], meteor, RocketFromEarth = null,
    endPointForMeteor = {
      x: null,
      y: null,
      z: null,
    };

  class AntMethod{
    
      constructor(){
          
          var calculateStartSolutions = function(){ //Возможные решения
              var temp = [];
              for(var i = 0; i < 90; i++){
                  temp[i] = 90 + i;
              }
              return temp;
          },
              calculatePheromone = function(){ //Количество феромонов
              var temp = [];
              for(var i = 0; i < 90; i++){
                  temp[i] = 1;
              }
              return temp;
          },
              calculateAttractive = function(){ //Привлекательность ребра
              var temp = [];
              
              for(var i = 0; i < 90; i++){
                  temp[i] = Math.pow(-90 + i,2)/100;
              }
              return temp;
          };
          
          this.solutions = calculateStartSolutions();
          this.pheromone = calculatePheromone();
          this.attractive = calculateAttractive();
          this.antPaths = [];
          
          this.a = 0.5; //Вероятность выбора ребра из-за количества феромона
          this.b = 0.5; //Вероятность выбора ребра из-за его привлекательности
          this.p = 0.2; //Коэффициент испарения
      }
      
      
      /**
        * Метод, который высчитывает угол, который будет результирующим после столкновения
        */
      ACO_MetaHeuristic(){
          
          var angel = 90, i = 0;
          
          while(i < 10){
              var results = this.daemonActions(3);
              this.pheromoneUpdate(results);
              i++;
          }
          
          for(var j = 0; j < this.pheromone.length; j++){
              
              var tempOuter = this.pheromone[i];
              
              for(var k = 0; k < this.pheromone.length; k++){
                  
                  var tempInner = this.pheromone[k];
                  
                  if(tempInner > tempOuter){
                       angel = this.solutions[k];  
                  }
                  
              }
          }
          
          return angel;
      }
      
      /**
        * Муравьи проходят по возможным путям
        */
      daemonActions(count){
          
          var results = [],
              w = 0;
          
          for(var i = 0; i < count; i++){
          
              var possibles = [], 
                  q = 0;
  
              for(var j = 0; j < this.solutions.length; j++){
                var up = Math.pow(this.pheromone[j],this.a) * Math.pow(this.attractive[j],this.b),
                    bottom = 0;
  
                for(var k = 0; k < this.solutions.length; k++){
                  bottom += Math.pow(this.pheromone[k],this.a) * Math.pow(this.attractive[k],this.b);
                }
  
                possibles[q] = up/bottom;
                q++;
              }
  
              results[w] = Math.floor(Math.random() * possibles.length);
              w++;
          
        }
        return results;
      }
      
      /**
        * Происходит обновление феромонов у путей
        */
      pheromoneUpdate(paths){
          for(var i = 0; i < paths.length; i++){
              this.pheromone[paths[i]] = (1 - this.p) * this.pheromone[paths[i]] + 1/this.attractive[paths[i]];
          }
      }
  }

class Logger{
      /**
        * Метод, который производит запись события в журнал
        * @param textMessage - текст события
        * @param name - имя события, которое может быть трех видов:
        *               notification - событие, которое не приводит к опасным ситуациям
        *               danger - событие, которое может привести к опасной ситуации
        *               critical - событие, при котором неизбежно столкновение
        */
      static log(textMessage, name){
      
          var node = document.getElementById('message');
          var clonedStructure = node.cloneNode(true);
          
          var img = clonedStructure.getElementsByClassName("image").item(0);
          var content = clonedStructure.getElementsByClassName("content").item(0);
          
          img.setAttribute("src","assets/icons/" + name + ".png");
          content.innerHTML = textMessage;
          
          clonedStructure.setAttribute("style", "display:block");
          
          var parent = document.getElementById("messages");
          parent.append(clonedStructure);
      }
  }


/**
   * Конструктор для создания планеты
   * @param {Имя планеты} name 
   * @param {Размер планеты} size 
   * @param {Цвет планеты} color 
   * @param {Радиус орбиты} orbitRadius
   * @param {Скорость вращения планеты} rotSpeed
   * @param {Скорость вращения орбиты} orbitSpeed
   * @param {Орбита} orbit
   * planet - 3d представление планеты
   */
function Planet(name, size, color, orbitRadius, rotSpeed, orbitSpeed, orbit){
  this.name = name;
  this.size = size;
  this.color = color;

  this.planet = new THREE.Object3D();
  this.geometry = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size, true),
    new THREE.MeshLambertMaterial({
      color: this.color,
      name: this.name,
      shading: THREE.FlatShading
    })
  ); 
  this.planet.add(this.geometry);

  this.planet.orbitRadius = orbitRadius;
  this.planet.rotSpeed = rotSpeed;
  this.planet.rotSpeed *= Math.random() < .10 ? -1 : 1;
  this.planet.rot = Math.random();
  this.planet.orbitSpeed = orbitSpeed;
  this.planet.orbit = orbit;
  this.planet.position.set(this.planet.orbitRadius, 0, 0);

  this.orbit = new THREE.Line(
    new THREE.CircleGeometry(this.planet.orbitRadius, 90),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: .2,
      side: THREE.BackSide
    })
  );
  this.orbit.geometry.vertices.shift();
  this.orbit.rotation.x = THREE.Math.degToRad(90);
  
  this.move = function(){
	  this.planet.rot += this.planet.rotSpeed;
	  this.planet.rotation.set(0, this.planet.rot, 0);
	  this.planet.orbit += this.planet.orbitSpeed;
	  this.planet.position.set(Math.cos(this.planet.orbit) * this.planet.orbitRadius, 0, Math.sin(this.planet.orbit) * this.planet.orbitRadius);
  };
}

/**
  * Конструктор для создания астероида
  */ 
function Asteroid(){
	this.name = "#" + Math.round(Math.random() * (1000000 - 10000) + 10000);
	this.color = 0xff00ff;
	this.size = Math.round(Math.random() * (9 - 5) + 5);
  this.speed = 1;
  this.touchedByRocket = false;
	
	this.x = (Math.random() < 0.5)? 100 + (Math.random() * 100) : -100 - (Math.random() * 100);
	this.y = 100 + (Math.random() * 100);
	this.z = (Math.random() < 0.5)? 100 + (Math.random() * 100) : -100 - (Math.random() * 100);
	
	this.asteroid = new THREE.Object3D();
	this.mesh = new THREE.Mesh(
		new THREE.IcosahedronGeometry(this.size, true),
		new THREE.MeshLambertMaterial({
      color: this.color,
      name: this.name,
			shading: THREE.FlatShading
		})
	); 
	this.asteroid.add(this.mesh);
	this.asteroid.position.set(this.x, this.y, this.z);
  
	/**
	  * @param endX - координата по x, к которой происходит движение
	  * @param endY - координата по y, к которой происходит движение
	  * @param endZ - координата по z, к которой происходит движение
	  */
	this.move = function(endX, endY, endZ){
		
    var newX = this.x + this.speed,
        t = (newX - this.x)/(endX - this.x),
        newY = this.y + (endY - this.y) * t,
        newZ = this.z + (endZ - this.z) * t;

    this.asteroid.position.set(newX, newY, newZ);
    
    this.x = newX;
    this.y = newY;
    this.z = newZ;
  }

  this.isIntersection = function(planet, delta){
    var innerPlanet = planet.planet;

    if(this.x > innerPlanet.position.x - planet.size - delta && this.x < innerPlanet.position.x + planet.size + delta){
      if(this.y > innerPlanet.position.y - planet.size - delta && this.y < innerPlanet.position.y + planet.size + delta){
        if(this.z > innerPlanet.position.z - planet.size - delta && this.z < innerPlanet.position.z + planet.size + delta){
          Logger.log("Hit", "danger");
          return true;
        }        
      }
    }

    return false;
  }
}

function Rocket(planet){
  this.x = planet.planet.position.x;
  this.y = planet.planet.position.y;
  this.z = planet.planet.position.z;

  this.speed = 22;

  this.object = new THREE.Mesh(
		new THREE.IcosahedronGeometry(3, true),
		new THREE.MeshLambertMaterial({
      color: 0xff00ff,
			shading: THREE.FlatShading
		})
  ); 
  this.object.position.set(this.x, this.y, this.z);


  this.move = function(endX, endY, endZ){

    var newX = this.x + ((endX - this.x) / this.speed),
        newY = this.y + ((endY - this.y) / this.speed),
        newZ = this.z + ((endZ - this.z) / this.speed);

    this.object.position.set(newX, newY, newZ);
    
    this.x = newX;
    this.y = newY;
    this.z = newZ;
  }

  this.isIntersection = function(meteor){

    if(this.x > meteor.asteroid.position.x - meteor.size && this.x < meteor.asteroid.position.x + meteor.size){
      if(this.y > meteor.asteroid.position.y - meteor.size && this.y < meteor.asteroid.position.y + meteor.size){
        if(this.z > meteor.asteroid.position.z - meteor.size && this.z < meteor.asteroid.position.z + meteor.size){
          Logger.log("Hit", "critical");
          return true;
        }        
      }
    }

    return false;
  }
}

/**
 * Конструктор для создания солнца
 */
function Sun(){
  this.mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(7, 1),
    new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
     })
   );
   this.mesh.castShadow = false;
   this.glows = [];
   
   this.move = function(t){
	   this.mesh.rotation.set(0, t, 0);
	   this.glows.forEach(function(glow){
		   glow.scale.set(
				Math.max(glow.origScale.x - .2, Math.min(glow.origScale.x + .2, glow.scale.x + (Math.random() > .5 ? 0.005 : -0.005))),
				Math.max(glow.origScale.y - .2, Math.min(glow.origScale.y + .2, glow.scale.y + (Math.random() > .5 ? 0.005 : -0.005))),
				Math.max(glow.origScale.z - .2, Math.min(glow.origScale.z + .2, glow.scale.z + (Math.random() > .5 ? 0.005 : -0.005)))
      );
      glow.rotation.set(0, t, 0);
    });
   };
}

setUp();

/**
 * Метод, который задает базовый вид сцены.
 * Здесь происходит инициализация необходимых переменных,
 * а также запуск функции отрисовки приложения.
 */
function setUp(){
	t = 0;
	Logger.log("Старт симуляции","notification");
	
	init();
	animate();
}

 /**
  * Метод, инициализирует базовые необходимые объекты
  * Сцену, камеру, контекст, отрисовыватель, 
  * элементы управления, планеты, солнце и астероиды.
  */
 function init(){
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(
    20, //Вертикальный обзор камеры
    16 / 9, //Соотношение сторон камеры
    0.1, //Коэффициент усечения вблизи плоскости
    10000 //Коэффициент усечения при дальнем плане
  );
  camera.position.set(700, 235, 0);

  ctx = document.body.appendChild(document.createElement('canvas')).getContext('2d');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.position = ctx.canvas.style.position = 'fixed';
  ctx.canvas.style.background = 'black';

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 1;

  pointLight = new THREE.PointLight(0x559999, 2, 0, 0);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);
  
  ambientLight = new THREE.AmbientLight(0x090909);
  scene.add(ambientLight);

  createStartSet();

  earth = getEarth();
  
  setEndPointForMeteor(earth.planet.position.x, earth.planet.position.y, earth.planet.position.z);
 }

 /**
  * Метод, который создает стартовый набор планет
  */
 function createStartSet(){
    var planet = [
      [name = "Меркурий", color = 0x2D4671, size = 4.7, orbitRadius = 85.27, rotSpeed = 0.0953, orbitSpeed = 0.005, orbit = 1.6652],
      [name = "Венера",  color = 0xAA8239, size = 6.1, orbitRadius = 157.89, rotSpeed = 0.0147, orbitSpeed = 0.0038, orbit = 3.4416],
      [name = "Земля", color = 0x993333,size = 7.5, orbitRadius = 232.799, rotSpeed = 0.00702, orbitSpeed = 0.0026, orbit = 5.6762],
      [name = "Марс", color = 0x599532, size = 8.9, orbitRadius = 322.627, rotSpeed = 0.0062, orbitSpeed = 0.0014, orbit = 5.2855],
      [name = "Юпитер", color = 0x333333, size = 10.3, orbitRadius = 405.09, rotSpeed = 0.0065, orbitSpeed = 0.0002, orbit = 2.8962]
    ];

    planet.forEach(function(element) {

      var tempPlanet = new Planet(
        element[0], element[2], 
        element[1], element[3],
        element[4], element[5],
        element[6]
      );

      planets.push(tempPlanet);
      scene.add(tempPlanet.planet);
      scene.add(tempPlanet.orbit);
    });
    createSun();
  
    meteor = new Asteroid();

    scene.add(meteor.asteroid);
 }

 /**
  * Метод, который создает солнце
  */
 function createSun(){
   sun = new Sun();
   scene.add(sun.mesh);
   
   for (var i = 1, scaleX = 1.1, scaleY = 1.1, scaleZ = 1.1; i < 5; i++) {
     var starGlow = new THREE.Mesh(
       new THREE.IcosahedronGeometry(7, 1),
       new THREE.MeshBasicMaterial({
         color: 0xFF6339,
         transparent: true,
         opacity: 0.5
        })
      );
      starGlow.castShadow = false;

      scaleX += 0.4 + 0.23203411183753198;
      scaleY += 0.4 + 0.01941375397898959;
      scaleZ += 0.4 + 0.34698050499234767;

      starGlow.scale.set(scaleX, scaleY, scaleZ);
      starGlow.origScale = {
        x: scaleX,
        y: scaleY,
        z: scaleZ
      };
      sun.glows.push(starGlow);
      scene.add(starGlow);
  }    
 }

 /**
  * Метод устанавливает endPoint для метеорита
  */
 function setEndPointForMeteor(x, y, z){
  endPointForMeteor.x = x;
  endPointForMeteor.y = y;
  endPointForMeteor.z = z;
 }
 
 /**
  * Метод возвращает объект планеты Земля
  */
function getEarth() {
  var _earth = planets.find(function(planet){
    return planet.name === 'Земля';
  });
  return _earth;
}

/**
  * Метод, изменяет размер холста
  */ 
function resize() {
  var ratio = 16 / 9,
    preHeight = window.innerWidth / ratio;

  if (preHeight <= window.innerHeight) {
    renderer.setSize(window.innerWidth, preHeight);
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = preHeight;
  } else {
    var newWidth = Math.floor(window.innerWidth - (preHeight - window.innerHeight) * ratio);
    newWidth -= newWidth % 2 !== 0 ? 1 : 0;
    renderer.setSize(newWidth, newWidth / ratio);
    ctx.canvas.width = newWidth;
    ctx.canvas.height = newWidth / ratio;
  }

  renderer.domElement.style.width = '';
  renderer.domElement.style.height = '';
  renderer.domElement.style.left = ctx.canvas.style.left = (window.innerWidth - renderer.domElement.width) / 2 + 'px';
  renderer.domElement.style.top = ctx.canvas.style.top = (window.innerHeight - renderer.domElement.height) / 2 + 'px';
}

window.addEventListener('resize', resize);
resize();

/**
  * Функция, которая производит отрисовку состояния сцены на холсте
  */
function animate() {
  
  var meteorIsGone;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = '#202020';
	
  planets.forEach(function(planet){
    planet.move();
  });

	t += 0.01;
  sun.move(t);
  if(meteor !== null){
    meteorIsGone = (Math.abs(meteor.asteroid.position.x) > 500 || Math.abs(meteor.asteroid.position.y) > 500 || Math.abs(meteor.asteroid.position.z) > 500);
    if(meteor.touchedByRocket) {
      meteor.move(endPointForMeteor.x, endPointForMeteor.y, endPointForMeteor.z);
    } else {
      meteor.move(earth.planet.position.x, earth.planet.position.y, earth.planet.position.z);
    }
    if(meteor.isIntersection(earth, 100) && !RocketFromEarth && !meteor.touchedByRocket) {
      RocketFromEarth = new Rocket(earth);
      scene.add(RocketFromEarth.object);
    }

    if(meteorIsGone) {
      removeFromScene(meteor.asteroid.uuid);
      meteor = new Asteroid();
      scene.add(meteor.asteroid);
    }
  }
    
  if(RocketFromEarth){
    RocketFromEarth.move(meteor.asteroid.position.x, meteor.asteroid.position.y, meteor.asteroid.position.z);
    if(RocketFromEarth.isIntersection(meteor)){
      removeFromScene(RocketFromEarth.object.uuid);
      RocketFromEarth = null;
      meteor.touchedByRocket = true;
      setEndPointForMeteor(-earth.planet.position.x, -earth.planet.position.y, earth.planet.position.z);
    }
  }
	
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function removeFromScene(uuidOfObjectTodelete){
  var children = scene.children, i;
  for(i = 0; i < children.length; i++){
    if (children[i].uuid === uuidOfObjectTodelete)
    {
        scene.remove(children[i]);    
    }
};   
}
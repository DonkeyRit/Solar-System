var width, height; //Ширина и высота холста
var centerX, centerY; //Центр холста
var canvas; //Объект DOM 
var context; //Холст

var manager; //Глобальная переменная менеджера

var TypeEnum = Object.freeze({"Meteorite" : 1, "Planet" : 2}); //Перечисление длля типов космических объектов

class Point{
    /**
      * Конструктор для создания абстракции над объектом точка на координатной плоскости
      * @param x - координата по Ox
      * @param y - координата по Oy
      */
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    
    /**
      * Статический метод, который из двух точек, делает одну
      * @param p1 - 1 точка
      * @param p2 - 2 точка
      */
    static minus(p1, p2){
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }
}
class AstronomicalObject{
    /**
      * Конструктор для абстракного представления космического объекта
      * @param x - стартовая координата относительно Ox
      * @param y - стартовая координата относительно Oy
      * @param type - тип космического объекта, один из описанных в перечислении TypeEnum
      * @parama src - путь к файлу изображения космического объекта
      */
    constructor(x,y,type,src){	
        this.x = x;
        this.y = y;
        this.type = type;
        
        ///
        this.square = new Square(this.x, this.y, src);
        ///
    }
}
class Meteorite extends AstronomicalObject{
    
    /**
      * Конструктор для объекта метеорит
      * @param - none
      */
    constructor(){
        super(0,0, TypeEnum.Meteorite, "assets/meteors/1.png");
        
        this.side = 0; //Сторона откуда начнется движение метеорита
        this.directionX = 0; // Координата по оси Ox, куда направляется метеорит
        this.directionY = 0; // Координата по оси Оу, куда направляется метеорит
        
        this.sizeImages = [30,45,60]; //Размер изображений метеоритов
        this.size = Math.round(Math.random() * (3 - 1) + 1); //Размер метеорита
        
        this.getStartPosition();
        this.getDirection();
        
        this.square = new Square(this.x, this.y, "assets/meteors/" + this.size + ".png");
        this.name = "#" + Math.round(Math.random() * (1000000 - 10000) + 10000);  

        this.k = this.getK(this.x, this.y, this.directionX, this.directionY);
        this.b = this.getB(this.x, this.y, this.k);
        this.speed = Math.abs(this.directionX - this.x)/100;
    }
    
    //Метод, отрисовывающий метеорит
    draw(){
        
        this.drawPath();
        
        let meteorit = new Image();
        
        let tempX = this.x;
        let tempY = this.y;
        
        meteorit.src = "assets/meteors/" + this.size + ".png";
        meteorit.addEventListener("load",function(){
            context.drawImage(meteorit, tempX, tempY);
        },false);
    }
    
    //Метод, совершающий передвижение объекта
    move(){
        
        this.square.changeDirection(this.x, this.y);
        
        this.x += (this.x < this.directionX)? this.speed: this.speed * (-1);
        this.y = this.k * this.x + this.b;        
    }
    
    //Метод обновляет положение объекта
    update(){
        this.draw();
        this.move();
    }
    
    //Метод, отрисовывающий траекторию полета метеорита
    drawPath(){
        context.strokeStyle = 'rgb(255,0,0)';
        context.setLineDash([5, 5]);
        context.beginPath();
        
        let temp = this.sizeImages[this.size - 1]/2;
        
        context.moveTo(this.x + temp, this.y + temp);
        context.lineTo(this.directionX, this.directionY);
        context.stroke();
        context.closePath();
    }
    
    //Метод, в котором описана логика при столкновении с метеоритом
    crash(meteor, angel){
        Logger.log("Метеорит " + this.name + " столкнулся с метеоритом " + meteor.name,"notification");
        
        var inclineThis = Math.abs(180 - Math.abs(angel) + meteor.size * 10);
        var inclineMeteor = Math.abs(180 + Math.abs(angel) + this.size * 10);
        
        this.x += (Math.max(this.x,meteor.x) == this.x)? 5:-5;
        this.y += (Math.max(this.y,meteor.y) == this.y)? 5:-5;
        
        meteor.x += (Math.max(this.x,meteor.x) == meteor.x)? 5:-5;
        meteor.y += (Math.max(this.x,meteor.x) == meteor.y)? 5:-5;
        
        
        var thisRotate = this.rotate(this.x, this.y,this.directionX, this.directionY, inclineThis);
        
        this.directionX = thisRotate[0];
        this.directionY = thisRotate[1];
        
        var meteorRotate = this.rotate(meteor.x, meteor.y, meteor.directionX, meteor.directionY, inclineMeteor);
        
        meteor.directionX = meteorRotate[0];
        meteor.directionY = meteorRotate[1];
        
        
        this.k = this.getK(this.x, this.y, this.directionX, this.directionY);
        this.b = this.getB(this.x, this.y, this.k);
        var tempSpeed = Math.abs(this.directionX - this.x)/100;
        this.speed = (tempSpeed == 0)? 0.5: tempSpeed;
        
        meteor.k = meteor.getK(meteor.x, meteor.y, meteor.directionX, meteor.directionY);
        meteor.b = meteor.getB(meteor.x, meteor.y, meteor.k);
        meteor.speed = Math.abs(this.directionX - this.x)/100;
        tempSpeed = Math.abs(meteor.directionX - meteor.x)/100;
        meteor.speed = (tempSpeed == 0)? 0.5: tempSpeed;
        
    }
    
    /*Helpers Method*/
    
    //Метод, вычисляет сторону откуда начнет движение метеорит, а также координаты.
    getStartPosition(){
        this.side = Math.round(Math.random() * (4 - 1) + 1);

        switch(this.side){
            case 1: 
                this.x = 0;
                this.y = Math.round(Math.random() * ((height - 100) - 100) + 100);
                break;
            case 2:
                this.x = Math.round(Math.random() * ((width - 100) - 100) + 100);
                this.y = 0;
                break;
            case 3:
                this.x = Math.round(Math.random() * ((width - 100) - 100) + 100);
                this.y = height - 100;
                break;
            case 4:
                this.x = width - 100;
                this.y = Math.round(Math.random() * ((height - 100) - 100) + 100);
                break;
        }
    }
    
    //Метод, вычисляет координаты, куда будет двигаться метеорит
    getDirection(){
        
        switch(this.side){
            case 1: 
                this.directionX = Math.round(Math.random() * ((height - 50) - 50) + 1);
                this.directionY = width + 2000;
                break;
            case 2:
                this.directionX = Math.round(Math.random() * ((width - 50) - 50) + 1);
                this.directionY = height + 2000;
                break;
            case 3:
                this.directionX = -2000;
                this.directionY = Math.round(Math.random() * ((height - 50) - 50) + 1);
                break;
            case 4:
                this.directionX = Math.round(Math.random() * ((width - 50) - 50) + 1);
                this.directionY = -2000;
                break; 
        }
        
    }
    
    //Возвращает булевое значение, отражающее видимость объекта на холсте
    isVisible(){
        return (this.x > (width + 100) || this.y > (height + 100) || this.x < (0 - 100) || this.y < (0 - 100))? false : true
    }
    
    //Возвращает наклон прямой
    getK(x, y, x1, y1){
        return (y1 - y)/(x1 - x);
    }
    
    //Возвращает коэффициент смещения относительно Оу
    getB(x,y,k){
        return y - k * x;
    }
    
    /**
      * Рассчитывает координаты после вращения
      * @param cx - координата центра по Ox
      * @param cy - координата центра по Oy
      * @param x - координата точки, которую нужно повернуть по Ox
      * @param y - координата точки, которую нужно повернуть по Oy
      * @param angle - угол поворота точки
      */
    rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
          cos = Math.cos(radians),
          sin = Math.sin(radians),
          nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
          ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        
        return [nx, ny];
    }
       
    /*Helpers Method*/
    
}
class Planet extends AstronomicalObject{
    
    /**
      * Конструктор для объекта планета
      * @param x - стартовая координата относительно Ox
      * @param y - стартовая координата относительно Oy
      * @param radius - радиус орбиты планеты
      * @param name - имя планеты
      * @param src - путь к изображению планеты
      */
    constructor(x,y,radius,name,src){
        super(x,y,TypeEnum.Planet,src);
        this.name = name;
        this.src = src;
        this.angel = 0;
        this.radius = radius;
    }
    
    //Метод, отрисовывающий орбиту планеты
    drawOrbit(){
        context.strokeStyle = 'rgba(0, 153, 255, 0.4)';
        context.beginPath();
        context.arc(width/2, height/2, this.radius, 0, Math.PI * 2, false);
        context.stroke();
    }
    
    //Метод, отрисовывающий планету
    draw(){
        this.drawOrbit();
        let planet = new Image();
        
        let tempX = this.x;
        let tempY = this.y;
        
        planet.src = this.src;
        planet.addEventListener("load",function(){
            context.drawImage(planet, tempX, tempY);
        },false);
    }
    
    //Метод, совершающий передвижение объекта
    move(){
        
        var tempX = Math.cos(this.angel) * this.radius;
        var tempY = Math.sin(this.angel) * this.radius;
        
        this.x = centerX + tempX;
        this.y = centerY + tempY;
        this.angel += 0.05;
        
        this.square.changeDirection(this.x, this.y);
    }
    
    //Метод обновляет положение объекта
    update(){
        this.draw();
        this.move();
    }
    
    //Метод, в котором описана логика при столкновении с метеоритом
    crash(meteor, index){
        if(this.name == "Солнце"){
            Logger.log("Метеорит " + meteor.name + " столкнулся с Солнцем", "critical");   
        }else{
            Logger.log("Метеорит " + meteor.name + " столкнулся с планетой " + this.name, "critical");
        }
        manager.booms[manager.booms.length] = new Boom(meteor.x, meteor.y);
        manager.meteors[index] = new Meteorite();
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
class Manager{
    
    /**
      * Конструктор, который создает объект менеджера
      * @param planets - массив планет
      * @param n - количество метеоритов
      */
    constructor(planets, n){
        this.planets = planets;
        this.meteors = [];
        this.generateMeteors(n);
        this.booms = []; //Взрывы от столкновений
        this.rockets = []; //След от ракет сбивающих метеориты
    }
    
    //Метод, который генерирует стартовый набор метеоритов
    generateMeteors(n){
        for(var i = 0; i < n; i++){
            this.meteors[i] = new Meteorite();
        }

    }
    
    //Метод, отрисовывающий контент на холсте
    drawContent(){
        for(var i = 0; i < this.planets.length; i++){
            this.planets[i].update();
        }
        for(var i = 0; i < this.meteors.length; i++){
            this.meteors[i].update();
            if(!this.meteors[i].isVisible()){
                //Logger.log("Метеорит покинул зону наблюдения", "notification");
                this.meteors[i] = new Meteorite();
            }
        }
        for(var i = 0; i < this.booms.length; i++){
            this.booms[i].drawBoom();
            if(this.booms[i].count == 0){
               this.booms.splice(i,1);
            }
        }
        for(var i = 0; i < this.rockets.length; i++){
            this.rockets[i].drawRocket();
            if(this.rockets[i].count == 0){
               this.rockets.splice(i,1);
            }
        }
    }
    
    //Метод, проверяет наличие столкновений на холсте
    checkCollision(){
        for(var i = 0; i < this.meteors.length; i++){
            for(var j = 0; j < this.planets.length; j++){
                var isIntersection = this.planets[j].square.isIntersection(this.meteors[i]);
                if(isIntersection){
                    this.planets[j].crash(this.meteors[i], i);
                    //this.meteors[i] = new Meteorite();
                }
            }
            for(var j = 0; j < this.meteors.length; j++){
                if(this.meteors[i] === this.meteors[j]){
                   continue;
                }else{
                    var isIntersection = this.meteors[i].square.isIntersection(this.meteors[j]);
                    if(isIntersection){
                        var angel = this.meteors[i].square.getAngle(this.meteors[j]);
                        this.meteors[i].crash(this.meteors[j], angel);
                    }
                }
            }
        }
    }
}
class Square{
    
    /**
      * Конструктор для создания объекта, который инкапсулирует
      * внутри себя поверхность занимаемую космическим объектом
      * @param x - координата верхнего левого угла по Ox
      * @param y - координата верхнего левого угла по Oy
      * @param src - путь до изображения космического объекта
      */ 
    constructor(x,y, src){
        this.x = x;
        this.y = y;
        
        this.image = new Image();
        this.image.src = src;
        
        this.width = this.image.width;
        this.height = this.image.height;
        
        this.rightX = this.x + this.width;
        this.rightY = this.y + this.height;
    }
    
    //Метод, проверяет перескается ли данный объект с переданным
    isIntersection(object){
        
        var square = object.square;
        
        var xIntersection = Math.max(Math.min(this.rightX, square.rightX) - Math.max(this.x, square.x), 0);
        var yIntersection = Math.max(Math.min(this.rightY, square.rightY) - Math.max(this.y, square.y), 0);

        return (xIntersection * yIntersection == 0)? false:true;
    }
    
    //Метод, возвращает значение угла между двумя пересекающимися объектами
    getAngle(object){
        var square = object.square;
        
        var temp = (this.y - square.y)/(this.x - square.x);
        
        return Math.abs(Math.atan(temp)) * (180 / Math.PI);
    }
    
    //Изменяет координаты поверхности
    changeDirection(x,y){
        this.x = x;
        this.y = y;
        this.rightX = x + this.width;
        this.rightY = y + this.height;
        
    }
}
class Boom{
    
    /**
      * Конструктор для создания объекта взрыва, отрисовывает взрыв
      * в месте столкновение планеты и метеорита
      * @param x - координата отрисовки взрыва по Ox
      * @param y - координата отрисовки взрыва по Oy
      */
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.src = "assets/icons/boom.png";
        this.count = 5;
    }
    
    drawBoom(){
        let boom = new Image();
        
        let tempX = this.x;
        let tempY = this.y;
        
        boom.src = this.src;
        boom.addEventListener("load",function(){
            context.drawImage(boom, tempX, tempY);
        },false);
        this.count -= 1;
    }
}
class Rocket{
    
    /**
      * Данный конструктор, позволяет отрисовать след от ракеты, запущенной
      * для предотвращения столкновения с землей.
      * @param x - координата окончания траектории по Ox
      * @param y - координата окончания траектории по Oy
      */
    constructor(x,y, x1,y1){
        this.x = x;
        this.y = y;
        this.x1 = x1;
        this.y1 = y1;
        this.count = 5;
    }
    
    drawRocket(){
        
        context.strokeStyle = 'rgb(25,255,25)';
        context.setLineDash([5, 5]);
        context.beginPath();
        
        let planetSize = 60/2,
            boomSize = 32/2;

        context.moveTo(this.x + planetSize, this.y + planetSize);
        context.lineTo(this.x1 + boomSize, this.y1 + boomSize);
        context.stroke();
        context.closePath();
  
        let rocketPath = new Image();
        
        let tempX = this.x1;
        let tempY = this.y1;
        
        rocketPath.src = "assets/icons/boom.png";
        rocketPath.addEventListener("load",function(){
            context.drawImage(rocketPath, tempX, tempY);
        },false);
        this.count -= 1;
    }
}
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
    
    
    
    static resolve(planet, meteor){
        
        var resultAngel = new AntMethod().ACO_MetaHeuristic();
        console.log(resultAngel);
        
        meteor.x += -1 * (planet.x - meteor.x);
        meteor.y += -1 * (planet.y - meteor.y);
        
        var meteorRotate = meteor.rotate(meteor.x, meteor.y, meteor.directionX, meteor.directionY, resultAngel);
        
        meteor.directionX = meteorRotate[0];
        meteor.directionY = meteorRotate[1];
        
        meteor.k = meteor.getK(meteor.x, meteor.y, meteor.directionX, meteor.directionY);
        meteor.b = meteor.getB(meteor.x, meteor.y, meteor.k);
        meteor.speed = Math.abs(this.directionX - this.x)/100;
        var tempSpeed = Math.abs(meteor.directionX - meteor.x)/100;
        meteor.speed = (tempSpeed == 0)? 0.5: tempSpeed;
    }
}

/**
  * Метод, который запускается при запуске приложения
  * Здесь происходит инициализация холста, вычисление центра,
  * запуск функции отрисовки приложения.
  */
window.onload = function(){

	canvas = document.getElementById('canvas');
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	width = canvas.width;
	height = canvas.height;
    
    centerX = width/2 - 50;
    centerY = height/2 - 51;
	
	context = canvas.getContext('2d');
    
    initObjects();
    Logger.log("Старт симуляции","notification");
    
	window.setInterval(main, 200);
}

/**
  * Функция, отрисовывающая начальное состояние холста
  */
function initObjects(){
    
    var Earth = new Planet(centerX + width/4 - 60, centerY, centerX - width/4 - 10, "Земля", "assets/planets/Earth.png");
    
    Earth.critical_zoneX = 0;
    Earth.critical_zoneY = 0;
    Earth.critical_zoneR = 0;
    
    //Добавим новое свойство объекту, для отрисовки критической секции
    Earth.drawCritical_zone = function(){ 
        
        this.critical_zoneX = this.x + this.square.width/2;
        this.critical_zoneY = this.y + this.square.height/2;
        this.critical_zoneR = 100;
        
        context.strokeStyle = 'rgba(120, 100, 50)';
        context.beginPath();
        context.arc(this.critical_zoneX, this.critical_zoneY, this.critical_zoneR, 0, Math.PI * 2, false);
        context.stroke();
    };  
    //Добавим новое свойство объекту, для отрисовки планеты вместе с критической секцией
    Earth.drawPlanet = function(){ 
        this.drawOrbit();
        this.draw();
        this.drawCritical_zone();
    }
    //Переопределим свойсво движения планеты, чтобы при отрисовке появлялась критическая секция
    Earth.update = function(){ 
        this.drawPlanet();
        this.move();
    };
    //Добавим новое свойство объекту, для проверки попадания метеорита в критическую секцию земли 
    Earth.square.possibleCollision = intersect;
    //Переопределим метод, реализующий пересечение земли с метеоритом
    Earth.square.isIntersection = function(object){ 
        var square = object.square;
        
        var start = new Point(square.x,square.y),
            end = new Point(square.rightX,square.rightY),
            circle = new Point(Earth.critical_zoneX,Earth.critical_zoneY),
            r = Earth.critical_zoneR;
        
        var result = this.possibleCollision(start, end, circle, r);
        if(result){
            Logger.log("Опасность. Возможно столкновение метеорита с землей.","danger");
            return Earth.miscalculation(object);
        }
        
        return false;
    };
    //Добавим новое свойство объекту, для проверки наличия угрозы реального попадания метеорита в землю
    Earth.miscalculation = function(object){
        
        var planet = Object.create(Earth),
            meteor = Object.create(object),
            start = new Point(meteor.square.x,meteor.square.y),
            end = new Point(meteor.square.rightX,meteor.square.rightY),
            circle = new Point(planet.critical_zoneX,planet.critical_zoneY),
            r = planet.critical_zoneR;
        
        
        while(planet.square.possibleCollision(start, end, circle, r)){
            
            var xIntersection = Math.max(Math.min(planet.square.rightX, meteor.square.rightX) - Math.max(planet.square.x, meteor.square.x), 0);
            var yIntersection = Math.max(Math.min(planet.square.rightY, meteor.square.rightY) - Math.max(planet.square.y, meteor.square.y), 0);
                
            if(xIntersection * yIntersection != 0){
                return true;
            }
            
            planet.move();
            meteor.move();
            
            start = new Point(meteor.square.x,meteor.square.y),
            end = new Point(meteor.square.rightX,meteor.square.rightY),
            circle = new Point(planet.critical_zoneX,planet.critical_zoneY),
            r = planet.critical_zoneR;
        }

        return false;
    }
    //Переопределим метод, столкновения планеты и метеорита
    Earth.crash = function(object, index){
        Logger.log("Столкновение планеты " + this.name + " с метеоритом " + object.name + " неизбежно. Поэтому для смещения метеорита будет запущена ракета.","critical");
        manager.rockets[manager.rockets.length] = new Rocket(this.x, this.y, object.x, object.y);
        AntMethod.resolve(this, object);
    };
    
    
    var planets = [];
    planets[0] = Earth;
    planets[1] = new Planet(centerX, centerY, 0, "Солнце","assets/planets/Sun.png");
    
    manager = new Manager(planets,3);
    
}

/**
  * Функция, определяющая пересекает ли прямоугольник окружность
  * @param lineStart - объект Point, отвечающий за левую верхнюю вершину прямоугольника
  * @param lineEnd - объект Point, отвечающий за нижнюю правую вершину прямоугольника
  * @param circleCenter - объект Point, отвечающий за координаты центра окружности
  * @param radius - радиус окружности
  */
function intersect(lineStart,lineEnd, circleCenter, radius){
  lineStart = Point.minus(lineStart,circleCenter);
  lineEnd = Point.minus(lineEnd,circleCenter);
  
  delta = Point.minus(lineEnd,lineStart);

  var a = delta.x * delta.x + delta.y * delta.y,
      b = 2*(lineStart.x * delta.x + lineStart.y * delta.y),
      c = lineStart.x*lineStart.x + lineStart.y*lineStart.y - radius*radius;
  

  if (-b < 0) return c < 0;
  if (-b < 2*a) return 4*a*c - b*b < 0;
  return a + b + c < 0;

}
/**
  * Главная функция отрисовки.
  */
function main(){
    context.clearRect(0, 0, width, height);
    manager.drawContent();
    manager.checkCollision();
}









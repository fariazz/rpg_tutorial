//set main namespace
goog.provide('rpg_tutorial');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.fill.LinearGradient');
goog.require('goog.math');
goog.require('lime.GlossyButton');

// entrypoint
rpg_tutorial.start = function(){
    
    var director = new lime.Director(document.body,352,256);
    director.makeMobileWebAppCapable();
    director.setDisplayFPS(false);
    
    var mapScene = new lime.Scene();
    var mapLayer = new lime.Layer().setPosition(0,0).setRenderer(lime.Renderer.CANVAS).setAnchorPoint(0,0);
    
    var gameMap = new lime.Sprite().setSize(352,256).setFill('map.png').setPosition(0,0).setAnchorPoint(0,0);
    
    var hero = new lime.Sprite().setSize(40,36).setFill('hero.png').setPosition(100,100);
    
    hero.life = 20;
    hero.money = 100;
    hero.attack = 5;
    
    var monster = new lime.Sprite().setSize(40,36).setFill('monster.png').setPosition(200,200);
    
    monster.life = 15;
    monster.money = 10;
    monster.attack = 1;
    
    var fightScene = new lime.Scene().setRenderer();    
    var fightLayer = new lime.Layer().setPosition(0,0).setRenderer(lime.Renderer.CANVAS).setAnchorPoint(0,0);
    
    var sky_gradient = new lime.fill.LinearGradient().setDirection(0,0,1,1)
        .addColorStop(0,'#B2DFEE').addColorStop(1, '#0000CD');
    
    var sky = new lime.Sprite().setSize(352,128).setPosition(0,0).setAnchorPoint(0,0).setFill(sky_gradient);
    
    var grass = new lime.Sprite().setSize(352,128).setPosition(0,128).setAnchorPoint(0,0).setFill('rgb(0,125,0)');
    
    fightLayer.appendChild(sky);
    fightLayer.appendChild(grass);
    
    //show the images of the monster and hero
    var fighterOne = new lime.Sprite().setSize(hero.getSize()).setFill(hero.getFill()).setPosition(50,210);
    var fighterTwo = new lime.Sprite().setSize(monster.getSize()).setFill(monster.getFill()).setPosition(280,210);
    
    //labels with characters stats
    var labelFighterOneLife = new lime.Label().setText('Life:'+hero.life).setPosition(50,150);
    var labelFighterOneAttack = new lime.Label().setText('Attack:'+hero.attack).setPosition(50,170);
    
    var labelFighterTwoLife = new lime.Label().setText('Life:'+monster.life).setPosition(280,150);
    var labelFighterTwoAttack = new lime.Label().setText('Attack:'+monster.attack).setPosition(280,170);
    
    //some options
    var attackButton = new lime.GlossyButton().setSize(70,20).setPosition(40,10)
        .setText('Attack').setColor('#B0171F'); 
    
    var runButton = new lime.GlossyButton().setSize(70,20).setPosition(120,10)
        .setText('Run').setColor('#00CD00'); 
        
    fightLayer.appendChild(fighterOne);
    fightLayer.appendChild(fighterTwo);
    
    fightLayer.appendChild(labelFighterOneLife);
    fightLayer.appendChild(labelFighterOneAttack);
    fightLayer.appendChild(labelFighterTwoLife);
    fightLayer.appendChild(labelFighterTwoAttack);
    
    fightLayer.appendChild(attackButton);
    fightLayer.appendChild(runButton);
    
    fightScene.appendChild(fightLayer);
    
    //run away, coward
    goog.events.listen(runButton, ['mousedown','touchstart'], function(e) {
        //go back to the map
        director.replaceScene(mapScene);
        mapLayer.setDirty(255)
        
        //move the hero away from the monster, or the fight scene will be triggered again!
        //this is just a quick, non-elegant way of doing this
        currentPos = hero.getPosition();
        hero.setPosition(currentPos.x-60, currentPos.y-60);
        
        hero.inFightScene = false;
        
    });
    
    //fighting algorithm
    goog.events.listen(attackButton, ['mousedown','touchstart'], function(e) {
        
        //generate random number
        var randomStuff = Math.random();
        
        //the player hits!
        if(randomStuff < 0.5) {
            monster.life -= hero.attack;
            
            //is he dead yet?
            if(monster.life <= 0) {
                console.log('monster dead');
                //get the monster money
                hero.money += monster.money;
                
                //go back to the map
                director.replaceScene(mapScene);
                mapLayer.setDirty(255);
                hero.inFightScene = false;
                
                //delete the monster object
                monster.setHidden(true);
                delete monster;
            }
        }
        else {
            hero.life -= monster.attack;
            
            //have you been killed?
            if(hero.life <= 0) {
                var labelGameOver = new lime.Label().setText('GAME OVER!!!').setPosition(160,100);
                fightLayer.appendChild(labelGameOver);
            }
        }
                
        //update stats
        labelFighterOneLife.setText('Life:'+hero.life);
        labelFighterTwoLife.setText('Life:'+monster.life);
    });
    
    hero.inFightScene = false;
    
    lime.scheduleManager.schedule(function(dt) {
        if(!this.inFightScene) {            
            if(monster.life >0 && goog.math.Box.intersects(this.getBoundingBox(),monster.getBoundingBox())) {
                director.replaceScene(fightScene);
                fightLayer.setDirty(255)
                hero.inFightScene = true;
            }
        }
    }, hero);
        
    goog.events.listen(gameMap, ['mousedown','touchstart'], function(e) {
        var movement = new lime.animation.MoveTo(e.position.x,e.position.y).setDuration(1);
        hero.runAction(movement);
    });
    
    mapLayer.appendChild(gameMap);
    mapLayer.appendChild(hero);
    mapLayer.appendChild(monster);
    mapScene.appendChild(mapLayer);
    
    director.replaceScene(mapScene);
}

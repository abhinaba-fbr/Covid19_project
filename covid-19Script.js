//utilities
//1.
function randomNumber(min,max){
    return Math.random()*(max-min)+min;
}

//2.
function randomColor(){
    return `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
}

//3.
function distance(x1,y1,x2,y2){
    xdist=x1-x2;
    ydist=y1-y2;
    return Math.sqrt(xdist*xdist+ydist*ydist);
}

//4.
function radian(theta){
    return (Math.PI/180)*theta;
}

//5.
function baisedCoinToss(f){
    border=f*100;
    if((Math.random()*100)<border)
        return 1;
    else
        return 0;
}

//6.
window.addEventListener('mousemove',function(el){
    mouse.x=el.clientX;
    mouse.y=el.clientY;
})


//setting up the canvas
let canvas=document.querySelector('canvas');
canvas.width=innerWidth;
canvas.height=innerHeight-100;
canvas.style.background='rgb(50,50,50)';

//important variables
let c=canvas.getContext('2d');
let pauseBtn=document.querySelector('#pause');
let resumeBtn=document.querySelector("#resume");
let stopBtn=document.querySelector("#stop");
let lockStage1=document.querySelector("#stage1");
let lockStage2=document.querySelector("#stage2");
let lockStage3=document.querySelector("#stage3");
let lockRemove=document.querySelector("#removeLockdown");
let days=document.querySelector("#days");
let totalCases=document.querySelector("#total-cases");
let activeCases=document.querySelector("#total-active");
let deaths=document.querySelector("#total-deaths");
let recovered=document.querySelector("#total-recovered");
let mouse={
    x: canvas.width,
    y: canvas.height
};
let requestId=0;
let pause=0;
let resume=1;
let stop=0;
let populationSize=2000;                                                 //changable
let minAge=15,maxAge=80;                                                 //changable
let personSize=1;                                                        //changable
let range=1;                                                             //changable
let leftBoundary=canvas.width/4,rightBoundary=canvas.width*3/4;          //changable
let horizontalUnitLand=(rightBoundary-leftBoundary)/3;
let verticalUnitLand=(canvas.height)/3;
covid={
    infectiveDistance: personSize*2+range,                               
    R0: 0.2,                                                             //changable (!implemented)
    incubationPeriod: 14,                                                //changable
    infectedRate: [0,0.3,0.5,0.7,0.9],                                   //changable
    deathRate: 0.02,                                                     //changable
    recovaryRate: 0.2,                                                   //changable
    infectedForeignRate: 0.8,                                            //changable
    infectedLocalRate: 0.01,                                             //changable
    severity: [4,3,2,1],
    totalCount: 0,
    infectedCount: 0,
    deathCount: 0,
    recoveryCount: 0,
    surveyDaysCount: function(population){
        this.totalCount=0;
        this.infectedCount=0;
        this.deathCount=0;
        this.recoveryCount=0;
        for(let i=0;i<populationSize;i++){
            if(population[i].x>leftBoundary && population[i].x<rightBoundary){
                if(population[i].positive==1 || population[i].dead==1 || population[i].recovered==1)
                    this.totalCount++;
                if(population[i].dead==1)
                    this.deathCount++;
                else if(population[i].positive==1)
                    this.infectedCount++;
                else if(population[i].recovered==1)
                    this.recoveryCount++;
            }       
        }
    }
};
let unit=255/(covid.infectedRate.length)
lockdown={
    stage1: 0,
    stage2: 0,
    stage3: 0
};
time={
    dayLength: 24,                                                        //changable
    hours: 0,
    day: 0                                                                //changable (initial day)
};

//program utilities
function init(){
    document.querySelector("#population").innerHTML="Total population - "+populationSize;
    document.querySelector("#age").textContent="MinAge - "+minAge+", MaxAge - "+maxAge;
    document.querySelector("#period").textContent="Incubation Period - "+covid.incubationPeriod;
}

function forwardTime(){
    if(time.hours==time.dayLength){
        updateChart();
        time.hours=0;
        time.day++;
    }
    else
        time.hours++;
}

boundaries={
    stage1Left: [0,rightBoundary,leftBoundary],
    stage1Right: [leftBoundary,canvas.width,rightBoundary],
    stage2Left: [0,rightBoundary,leftBoundary+horizontalUnitLand,leftBoundary,rightBoundary-horizontalUnitLand],
    stage2Right: [leftBoundary,canvas.width,rightBoundary-horizontalUnitLand,leftBoundary+horizontalUnitLand,rightBoundary],
    stage3Left: [0,rightBoundary,leftBoundary+horizontalUnitLand,leftBoundary+horizontalUnitLand,leftBoundary+horizontalUnitLand,leftBoundary,rightBoundary-horizontalUnitLand,leftBoundary,rightBoundary-horizontalUnitLand,leftBoundary,rightBoundary-horizontalUnitLand],
    stage3Right: [leftBoundary,canvas.width,rightBoundary-horizontalUnitLand,rightBoundary-horizontalUnitLand,rightBoundary-horizontalUnitLand,leftBoundary+horizontalUnitLand,rightBoundary,leftBoundary+horizontalUnitLand,rightBoundary,leftBoundary+horizontalUnitLand,rightBoundary],
    stage3Top: [0,0,verticalUnitLand,0,2*verticalUnitLand,verticalUnitLand,verticalUnitLand,0,0,2*verticalUnitLand,2*verticalUnitLand],
    stage3Bottom: [canvas.height,canvas.height,2*verticalUnitLand,verticalUnitLand,canvas.height,2*verticalUnitLand,2*verticalUnitLand,verticalUnitLand,verticalUnitLand,canvas.height,canvas.height],
    drawBoundaries: function(){
        if(lockdown.stage1==1){
            c.beginPath();
            c.strokeStyle='rgba(200,200,200,1)';
            c.moveTo(leftBoundary,0);
            c.lineTo(leftBoundary,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.moveTo(rightBoundary,0);
            c.lineTo(rightBoundary,canvas.height);
            c.stroke();
            c.closePath();
        }   
        else if(lockdown.stage2==1){
            c.beginPath();
            c.strokeStyle='rgba(200,200,200,1)';
            c.moveTo(leftBoundary,0);
            c.lineTo(leftBoundary,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.moveTo(rightBoundary,0);
            c.lineTo(rightBoundary,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.strokeStyle='rgba(200,200,200,0.5)';
            c.moveTo(leftBoundary+horizontalUnitLand,0);
            c.lineTo(leftBoundary+horizontalUnitLand,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.moveTo(rightBoundary-horizontalUnitLand,0);
            c.lineTo(rightBoundary-horizontalUnitLand,canvas.height);
            c.stroke();
            c.closePath();
        } 
        else if(lockdown.stage3==1){
            c.beginPath();
            c.strokeStyle='rgba(200,200,200,1)';
            c.moveTo(leftBoundary,0);
            c.lineTo(leftBoundary,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.moveTo(rightBoundary,0);
            c.lineTo(rightBoundary,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.strokeStyle='rgba(200,200,200,0.5)';
            c.moveTo(leftBoundary+horizontalUnitLand,0);
            c.lineTo(leftBoundary+horizontalUnitLand,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.moveTo(rightBoundary-horizontalUnitLand,0);
            c.lineTo(rightBoundary-horizontalUnitLand,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.moveTo(leftBoundary,verticalUnitLand);
            c.lineTo(rightBoundary,verticalUnitLand);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.moveTo(leftBoundary,2*verticalUnitLand);
            c.lineTo(rightBoundary,2*verticalUnitLand);
            c.stroke();
            c.closePath();
        }
        else{
            c.beginPath();
            c.strokeStyle='rgb(200,200,200,0.3)';
            c.moveTo(leftBoundary,0);
            c.lineTo(leftBoundary,canvas.height);
            c.stroke();
            c.closePath();
            c.beginPath();
            c.strokeStyle='rgb(200,200,200,0.3)';
            c.moveTo(rightBoundary,0);
            c.lineTo(rightBoundary,canvas.height);
            c.stroke();
            c.closePath();
        }
    }
}

function nativeLand(x,y){
    if(lockdown.stage1==1){
        let noOfRegions=boundaries.stage1Left.length;
        for(let i=0;i<noOfRegions;i++){
            if(x>=boundaries.stage1Left[i] && x<=boundaries.stage1Right[i])
                return [0,boundaries.stage1Right[i],canvas.height,boundaries.stage1Left[i]];
        }
    }
    else if(lockdown.stage2==1){
        let noOfRegions=boundaries.stage2Left.length;
        for(let i=0;i<noOfRegions;i++){
            if(x>=boundaries.stage2Left[i] && x<=boundaries.stage2Right[i])
                return [0,boundaries.stage2Right[i],canvas.height,boundaries.stage2Left[i]];
        }
    }
    else if(lockdown.stage3==1){
        let noOfRegions=boundaries.stage3Top.length;
        for(let i=0;i<noOfRegions;i++){
            if(x>=boundaries.stage3Left[i] && x<=boundaries.stage3Right[i] && y>=boundaries.stage3Top[i] && y<=boundaries.stage3Bottom[i])
                return [boundaries.stage3Top[i],boundaries.stage3Right[i],boundaries.stage3Bottom[i],boundaries.stage3Left[i]];
        }
    }
    else{
        return [0,canvas.width,canvas.height,0];
    }
}

pauseBtn.addEventListener('click',function(el){
    pause=1;
    resume=0;
    stop=0;
});
resumeBtn.addEventListener('click',function(el){
    pause=0;
    resume=1;
    stop=0;
});
stopBtn.addEventListener('click',function(el){
    pause=0;
    resume=0;
    stop=1;
});

lockStage1.addEventListener('click',function(el){
    lockdown.stage1=1;
    lockdown.stage2=0;
    lockdown.stage3=0;
});
lockStage2.addEventListener('click',function(el){
    lockdown.stage1=0;
    lockdown.stage2=1;
    lockdown.stage3=0;
});
lockStage3.addEventListener('click',function(el){
    lockdown.stage1=0;
    lockdown.stage2=0;
    lockdown.stage3=1;
});
lockRemove.addEventListener('click',function(el){
    lockdown.stage1=0;
    lockdown.stage2=0;
    lockdown.stage3=0;
});

class Person{
    constructor(x,y,r,age,immunity,pv,de,re,days,color){
        this.x=x;
        this.y=y;
        this.r=r;
        this.age=age;
        this.immunity=immunity;
        this.positive=pv;
        this.dead=de;
        this.recovered=re;
        this.daysInfected=days;
        this.state=color;
    }
    checkup(){
        if(this.dead==1){
            this.draw();
            return;
        }
        else if(this.positive==1){
            if(time.hours==time.dayLength)
                this.daysInfected++;
            let j=Math.min(covid.infectedRate.length,Math.floor((this.daysInfected/covid.incubationPeriod)*covid.infectedRate.length));
            this.state=`rgb(${unit*j},${255-unit*j},0)`;
            let iR=covid.infectedRate[Math.min(j,covid.infectedRate.length-1)];
            this.infect(iR);
            let severity=covid.severity[Math.floor(((this.age-1)/maxAge)*covid.severity.length)];
            if(this.daysInfected>covid.incubationPeriod+Math.floor((1-this.immunity)*(this.age+severity*minAge))){
                if(baisedCoinToss(covid.recovaryRate)==1){
                    this.recovered=1;
                    this.positive=0;
                    this.state="rgb(0,255,0)";
                    this.move();
                    this.draw();
                    return;
                }
            }
            if(this.daysInfected>covid.incubationPeriod+Math.floor(this.immunity*(maxAge+severity*minAge-this.age))){
                if(baisedCoinToss(covid.deathRate)){
                    this.dead=1;
                    this.state="rgb(255,255,255)";
                    this.draw();
                    return;
                }
            }
        }
        this.move();
        this.draw();
    }
    infect(iR){
        for(let i=0;i<populationSize;i++){
            if(population[i]==this || population[i].dead==1 || population[i].positive==1)
                continue;
            else{
                if(distance(this.x,this.y,population[i].x,population[i].y)<=covid.infectiveDistance){
                    if(baisedCoinToss(iR)==1){
                        population[i].positive=1;
                        population[i].recovered=0;
                    }
                }
            }
        }
        return;
    }
    move(){
        this.x+=Math.round(Math.random()*2-1);
        this.y+=Math.round(Math.random()*2-1);
        let boundary=nativeLand(this.x,this.y);
        if(this.x>boundary[1]-(personSize+range))
            this.x+=-(personSize+range);
        if(this.x<boundary[3]+personSize+range)
            this.x+=(personSize+range);
        if(this.y>boundary[2]-(personSize+range))
            this.y+=-(personSize+range);
        if(this.y<boundary[0]+(personSize+range))
            this.y+=(personSize+range);
    }
    draw(){
        c.beginPath();
        c.fillStyle=this.state;
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false);
        c.fill();
        c.closePath();
    }
}

//Creating the particles/objects
let population=[];
for(let i=0;i<populationSize;i++){
    let x=randomNumber(personSize+1,canvas.width-(personSize+range));
    let y=randomNumber(personSize+1,canvas.height-(personSize+range));
    let r=personSize;
    let age=Math.floor(randomNumber(minAge,maxAge));
    let immunity=randomNumber(0.2,1);
    if(x>leftBoundary && x<rightBoundary){
        if(baisedCoinToss(covid.infectedLocalRate)==1){
            let days=Math.floor(randomNumber(0,time.day));
            let j=Math.min(covid.infectedRate.length,Math.floor((days/covid.incubationPeriod)*covid.infectedRate.length));
            let color=`rgb(${unit*j},${255-unit*j},0)`;
            population.push(new Person(x,y,r,age,immunity,1,0,0,days,color));
        }
        else{
            let days=0;
            let color="rgb(0,255,0)";
            population.push(new Person(x,y,r,age,immunity,0,0,0,days,color));
        }
    }
    else{
        if(baisedCoinToss(covid.infectedForeignRate)==1){
            let days=Math.floor(randomNumber(0,time.day));
            let j=Math.min(covid.infectedRate.length,Math.floor((days/covid.incubationPeriod)*covid.infectedRate.length));
            let color=`rgb(${unit*j},${255-unit*j},0)`;
            population.push(new Person(x,y,r,age,immunity,1,0,0,days,color));
        }
        else{
            let days=0;
            let color="rgb(0,255,0)";
            population.push(new Person(x,y,r,age,immunity,0,0,0,days,color));
        }
    }
}

console.log(population);

init();
//Animate Function
function animate(){
    if(stop==1){
        window.cancelAnimationFrame(requestId);
        verdict();
        return;
    }
    else if(pause==1){
        requestId=window.requestAnimationFrame(animate);
        return;
    }
    else if(resume==1){
        requestId=window.requestAnimationFrame(animate);
        c.clearRect(0,0,canvas.width,canvas.height);
        boundaries.drawBoundaries();
        for(let i=0;i<populationSize;i++)
           population[i].checkup();
        covid.surveyDaysCount(population);
        days.innerHTML="Days - "+time.day;
        totalCases.innerHTML="Total Cases - "+covid.totalCount;
        activeCases.innerHTML="Total Active - "+covid.infectedCount;
        deaths.innerHTML="Total Deaths - "+covid.deathCount;
        recovered.innerHTML="Total Recovered - "+covid.recoveryCount;
        forwardTime();
    }
}
animate();

//final Verdict
function verdict(){
    let motherLandPopulation=((rightBoundary-leftBoundary)/canvas.width)*populationSize;
    totalCasesPercent=(covid.totalCount/motherLandPopulation)*100;
    deathPercent=(covid.deathCount/motherLandPopulation)*100;
    recoveryPercent=(covid.recoveryCount/motherLandPopulation)*100;
    let title=document.querySelector(".verdict-container h2");
    title.innerHTML="Verdict";
    let verdictCases=document.querySelector(".verdict-container .p1");
    let verdictDeath=document.querySelector(".verdict-container .p2");
    let verdictRecovery=document.querySelector(".verdict-container .p3");
    verdictCases.innerHTML="Total Infected percent in the population - "+totalCasesPercent+" %";
    verdictDeath.innerHTML="Total Deaths perccent in the population - "+deathPercent+" %";
    verdictRecovery.innerHTML="Total Recovered percent in th population - "+recoveryPercent+" %";
}

//Charts plotting (updateChart() called in forwardTime())
let dpsinf=[{
    x: 0,
    y: 0
}] 
let dpsdead=[{
    x: 0,
    y: 0
}]

let chart=new CanvasJS.Chart("chart-container", {
    title: {
        text: "Covid-19 Simulation Graph"
    },
    axisY: {
        includeZero: false 
    },
    axisX: {
        title: "Days Passed"
    },
    data: [{
            type: "line",
            lineColor: "red",
            markerColor: "red",
            name: "Total Cases",
            showInLegend: true,
            dataPoints: dpsinf
        },
        {
            type: "line",
            lineColor: "black",
            markerColor: "black",
            name: "Total Deaths",
            showInLegend: true,
            dataPoints: dpsdead
    }]
});

function updateChart(){
    let xval=time.day;
    let yval=covid.totalCount;
    dpsinf.push({
        x: xval,
        y: yval
    });
    yval=covid.deathCount;
    dpsdead.push({
        x: xval,
        y: yval
    });
    chart.render();
}


(function(root){
const finite=(n,min,max)=>{n=Number(n);if(!Number.isFinite(n)||n<min||n>max)throw Error('Verifique os valores introduzidos.');return n};
function cost(d){
 const area=finite(d.area,50,1000),rate=finite(d.rate,500,6000),rooms=finite(d.rooms,1,8),baths=finite(d.baths,1,8),floors=finite(d.floors,1,3);
 const base=area*rate,levels=base*(floors-1)*.04,wet=Math.max(0,baths-2)*4500,partitions=Math.max(0,rooms-3)*1800;
 const ground=finite(d.ground,0,.15)*base,garage=finite(d.garage,0,300)*700,basement=finite(d.basement,0,300)*950,external=finite(d.external,0,200000);
 const works=base+levels+wet+partitions+ground+garage+basement+external,tax=finite(d.vat,0,30)/100,reserve=finite(d.reserve,0,30)/100,vat=works*tax,contingency=(works+vat)*reserve,total=works+vat+contingency;
 return {base,levels,wet,partitions,ground,garage,basement,external,works,vat,contingency,total,low:total*.85,high:total*1.15,area,rate};
}
function time(d){
 const area=finite(d.area,50,1000),floors=finite(d.floors,1,3),ground=finite(d.ground,0,2),finish=finite(d.finish,0,2),basement=finite(d.basement,0,1);
 const build=Math.max(8,12+(area-150)/75*1.2+(floors-1)*.7+ground+finish*.8+basement*1.5),low=Math.max(6,Math.floor(build*.85)),high=Math.ceil(build*1.2);
 const prep=finite(d.prep,0,36),permit=finite(d.permit,0,60);
 return {build,low,high,prep,permit,totalLow:prep+permit+low,totalHigh:prep+permit+high,phases:[.14,.25,.23,.28,.10].map(n=>n*build)};
}
function land(d){
 const plot=finite(d.plot,50,100000),index=finite(d.index,0,5),coverage=finite(d.coverage,0,100)/100,floors=finite(d.floors,1,10),desired=finite(d.desired,0,5000);
 const byIndex=plot*index,footprint=plot*coverage,byFloors=footprint*floors,capacity=Math.min(byIndex,byFloors),required=desired/floors,remaining=Math.max(0,plot-footprint);
 return {plot,byIndex,footprint,byFloors,capacity,required,remaining,desired,fits:desired<=capacity,free:Math.max(0,capacity-desired)};
}
const api={cost,time,land};if(typeof module!=='undefined')module.exports=api;root.SimulatorModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);

const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../public/simulator-model.js');
const base = {area:180,rate:1800,rooms:3,baths:2,floors:2,ground:0,garage:0,basement:0,external:0,vat:23,reserve:10};

test('orçamento agrega trabalhos, IVA e reserva sem dupla contagem', () => {
  const r = model.cost(base);
  assert.equal(r.base,324000);
  assert.equal(r.levels,12960);
  assert.ok(Math.abs(r.total-455906.88)<0.001);
  assert.ok(Math.abs(r.total-r.works-r.vat-r.contingency)<0.001);
  assert.equal(model.cost({...base,vat:0,reserve:0}).total,r.works);
});

test('mais área e opções adicionais aumentam o orçamento', () => {
  const total = model.cost(base).total;
  for (const extra of [{area:200},{baths:3},{rooms:4},{garage:25},{basement:30},{ground:0.08}]) {
    assert.ok(model.cost({...base,...extra}).total>total);
  }
});

test('valores inválidos não produzem estimativas', () => {
  for (const area of [0,-20,1001,NaN,Infinity]) {
    assert.throws(()=>model.cost({...base,area}));
  }
});

test('prazo distingue preparação, aprovação e execução', () => {
  const r = model.time({area:180,floors:2,ground:0,finish:1,basement:0,prep:3,permit:6});
  assert.equal(r.totalLow,r.low+9);
  assert.equal(r.totalHigh,r.high+9);
  assert.ok(Math.abs(r.phases.reduce((a,b)=>a+b,0)-r.build)<0.00001);
});

test('terreno utiliza o menor limite, por índice ou implantação e pisos', () => {
  const d = {plot:800,index:0.4,coverage:25,floors:2,desired:180};
  const r = model.land(d);
  assert.equal(r.byIndex,320);
  assert.equal(r.footprint,200);
  assert.equal(r.capacity,320);
  assert.equal(r.fits,true);
  assert.equal(model.land({...d,index:0.8,coverage:20,desired:400}).fits,false);
  assert.equal(model.land({...d,index:0}).capacity,0);
});

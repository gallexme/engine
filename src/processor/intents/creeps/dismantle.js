var _ = require('lodash'),
    utils =  require('../../../utils'),
    driver = utils.getDriver(),
    C = driver.constants;

module.exports = function(object, intent, roomObjects, roomTerrain, bulk, bulkUsers, roomController, stats, gameTime, roomInfo) {

    if(object.type != 'creep') {
        return;
    }
    if(object.spawning) {
        return;
    }

    var target = roomObjects[intent.id];
    if(!target || !C.CONSTRUCTION_COST[target.type]) {
        return;
    }
    if(Math.abs(target.x - object.x) > 1 || Math.abs(target.y - object.y) > 1) {
        return;
    }
    if(roomController && roomController.user != object.user && roomController.safeMode > gameTime) {
        return;
    }
    var rampart = _.find(roomObjects, {type: 'rampart', x: target.x, y: target.y});
    if(rampart) {
        target = rampart;
    }


    var power = utils.calcBodyEffectiveness(object.body, C.WORK, 'dismantle', C.DISMANTLE_POWER),
    effect = Math.min(power, target.hits),
    energyGain = Math.floor(effect * C.DISMANTLE_COST);

    if(effect) {

        object.energy += energyGain;
        bulk.update(object, {energy: object.energy});

        if (object.energy > object.energyCapacity) {
            require('./drop')(object, {amount: object.energy - object.energyCapacity, resourceType: 'energy'}, roomObjects, roomTerrain, bulk);
        }

        require('../_damage')(object, target, effect, 'melee', roomObjects, roomTerrain, bulk, roomController, stats, gameTime, roomInfo);
    }
};
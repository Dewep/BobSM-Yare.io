if (!memory.stars) {
  memory.stars = {
    star_a1c,
    star_p89,
    star_zxq
  }
  memory.working = {}

  initHarvesterMemory()
}

if (!memory.previousEnergy) {
  memory.previousEnergy = {}
}



memory.keepEnergyOnSpawn = tick < 200 ? 0 : tick < 400 ? 4 : 8

memory.ownBase = base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.ownStar = base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.enemyBase = !(base.position[0] < 2000) ? 'star_zxq' : 'star_a1c'
memory.enemyStar = !(base.position[0] < 2000) ? 'star_zxq' : 'star_a1c'

memory.incomingMerge = {}
memory.isMerging = {}

memory.aliveOwn = my_spirits.filter(spirit => spirit.hp)
memory.aliveEnemies = Object.keys(spirits).filter(name => !name.includes('ArGJolan')).map(name => spirits[name]).filter(spirit => spirit.hp)
memory.canWork = memory.aliveOwn.filter(spirit => (spirit.size + (memory.incomingMerge[spirit.id] || 0) >= 2) && !Object.keys(memory.harvester).some(star => memory.harvester[star].workers.includes(spirit.id)))

memory.ownEnergy = memory.aliveOwn.reduce((acc, curr) => { acc += +curr.energy; return acc }, 0)
memory.enemyEnergy = memory.aliveEnemies.reduce((acc, curr) => { acc += +curr.energy; return acc }, 0)

memory.totalEnemyCapacity = memory.aliveEnemies.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)
memory.totalOwnCapacity = memory.aliveOwn.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)


askForHelp()
if (shouldAttack()) {
  attack()
} else {
  cleanupDeaths()
  mergeNoobs()
  
  allocateHarvesters()
  assignUnemployed()
  harvesterWork()
}

attackInRange()
// calculateAggroScores()
storeEnemyPositions()
helpInRange()

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * LIB
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

// SECTION: system
function initHarvesterMemory () {
  memory.harvester = {}

  Object.keys(memory.stars).forEach(starName => {
    const star = memory.stars[starName]
    const distance = getDistance(star.position, base.position)
    const groups = new Array(Math.floor(distance / 200)).fill([])

    memory.harvester[starName] = {
      workers: [],
      groups
    }
  })
}

function cleanupDeaths () {
  Object.keys(memory.harvester).forEach(star => {
    memory.harvester[star].workers = memory.harvester[star].workers.filter(spirit => spirits[spirit].hp)
    for (let i = 0; i < memory.harvester[star].groups.length; i++) {
      memory.harvester[star].groups[i] = memory.harvester[star].groups[i].filter(spirit => spirits[spirit].hp)
    }
  })
}


// SECTION: Movements
function moveTo (spirit, pos) {
  const distance = getDistance(spirit.position, pos)
  if (distance > 1) {
    spirit.move(pos)
  }
}

function energizeMove (spirit, pos) {
  const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
  if (distance >= 200) {
    spirit.move(pos)
  }
}

// SECTION: Harvesting & supply chain
function allocateHarvesters () {
  const harvesters = memory.canWork.map(spirit => spirit.id)

  for (const spirit of harvesters) {
    if (tick > 200) {
      memory.harvester.star_p89.workers.push(spirit)
      continue
    }
    if ((outpost.control && outpost.control !== 'ArGJolan') || tick < 120 || memory.harvester[memory.ownStar].workers.length < 4 ||
        memory.harvester[memory.ownStar].workers.length < memory.harvester.star_p89.workers.length ||
        memory.harvester[memory.ownStar].workers.length % 4 !== 0) {
      memory.harvester[memory.ownStar].workers.push(spirit)
    } else if (memory.harvester.star_p89.workers.length % 4 !== 0 || memory.harvester.star_p89.workers.length < 20) {
      memory.harvester.star_p89.workers.push(spirit)
    } else {
      memory.harvester[memory.enemyStar].workers.push(spirit)
    }
  }
}

function getStepPosition (starPosition, step, totalSteps) {
  return [
    starPosition[0] - step * (starPosition[0] - base.position[0]) / (totalSteps + 1),
    starPosition[1] - step * (starPosition[1] - base.position[1]) / (totalSteps + 1),
  ]
}

function harvesterColonyWork (star, supplyGroups) {
  const harvesters = supplyGroups[0]

  // SECTION: Handle harvesters
  for (let harvesterId = 0; harvesterId < harvesters.length; harvesterId++) {
    const spiritName = harvesters[harvesterId]
    const spirit = spirits[spiritName]

    if ((!spirit.mark && (spirit.energy > spirit.energy_capacity / 5))) {
      const position = getStepPosition(star.position, supplyGroups.length, supplyGroups.length)

      moveTo(spirit, position)
      spirit.energize(base)
    } else if (!spirit.mark || spirit.energy < spirit.energy_capacity * 0.8) {
      spirit.set_mark("h")
    }


    if (spirit.mark === "h" && spirit.energy === spirit.energy_capacity) {
      spirit.set_mark("c")
    }

    if (spirit.mark === "h") {
      const position = getStepPosition(star.position, 1, supplyGroups.length)

      moveTo(spirit, position)
      if (star.id === 'star_p89' || star.energy > tick * 2.5 || star.energy >= 0.95 * star.energy_capacity || memory.underattack || star.id === memory.enemyStar) {
        spirit.energize(spirit)
      } else {
        spirit.shout('💍')
        spirit.set_mark("c")
      }
    }
    if (spirit.mark === "c" && spirit.energy >= spirit.energy_capacity * 0.8) {
      const targetNode = findTargetNode(supplyGroups, 1, Math.floor(harvesterId / 2))
      energizeMove(spirit, targetNode.position)
      spirit.energize(targetNode)
    }

  }

  // SECTION: Handle supply nodes
  for (let groupId = 1; groupId < supplyGroups.length; groupId++) {
    for (let nodeIndex = 0; nodeIndex < supplyGroups[groupId].length; nodeIndex++) {
      const spiritName = supplyGroups[groupId][nodeIndex]
      const node = spirits[spiritName]

      const targetNode = findTargetNode(supplyGroups, groupId + 1, nodeIndex)

      if (node.energy > node.energy_capacity * 0.6) {
        energizeMove(node, targetNode.position)
        node.energize(targetNode)
      } else {
        const position = getStepPosition(star.position, groupId + 1, supplyGroups.length)
        moveTo(node, position)
      }
    }
  }
}

function findTargetNode (supplyGroups, groupId, nodeIndex) {
  if (groupId < supplyGroups.length) {
    return spirits[supplyGroups[groupId][nodeIndex]] || findTargetNode(supplyGroups, groupId + 1, nodeIndex)
  } else {
    return base
  }
}

function harvesterWork () {
  Object.keys(memory.harvester).forEach(starName => {
    harvesterColonyWork(memory.stars[starName], memory.harvester[starName].groups)
  })
}

function assignGroup (starName, spiritName, group) {
  if (memory.working[spiritName]) {
    console.log('CANWORK', JSON.stringify(memory.canWork.map(spirit => spirit.id)))
    console.log('WORKING', JSON.stringify(memory.working))
    throw new Error('SHOULD NOT HAPPEN')
  }
  memory.working[spiritName] = `${starName}/${group}`

  memory.harvester[starName].groups[group].push(spiritName)
}

function assignUnemployed () {
  Object.keys(memory.harvester).forEach(starName => {
    const { workers, groups } = memory.harvester[starName]

    const unemployed = workers.filter(name => !memory.working[name])

    for (const spiritName of unemployed) {
      if (starName === memory.ownStar) {
          // Deploy from star to base
        if (groups[0].length < 2 || groups[0].length < groups[1].length * 2 || Math.min(groups.map(group => group.length)) * 2 === groups[0].length) {
          assignGroup(starName, spiritName, 0)
        } else {
          const assignedGroup = groups.findIndex(group => group.length === Math.min(...groups.map(group => group.length)))
          assignGroup(starName, spiritName, assignedGroup)
        }
      } else {
        // Deploy from base to star
        const groupsReversed = [...groups].reverse()
        if (groups[0].length < groups[1].length * 2) {
          spirits[spiritName].shout(`A0 ${groups[0].length} ${groups[1].length * 2 - 2}`)
          assignGroup(starName, spiritName, 0)
        } else {
          const assignedGroup = groups.length - 1 - groupsReversed.findIndex(group => group.length === Math.min(...groupsReversed.map(group => group.length)))
          spirits[spiritName].shout(`A${assignedGroup} ${groups[0].length} ${groups[1].length * 2 - 2}`)
          assignGroup(starName, spiritName, assignedGroup)
        }
      }
    }
  })
}

// SECTION: merge methods
function mergeNoobs () {
  for (let i = 0; i < memory.aliveOwn.length; i++) {
    const spirit = memory.aliveOwn[i]
    // spirit.shout(`${spirit.size + (memory.incomingMerge[spirit.id] || 0)} - ${memory.working[spirit.id]}`)
    const firstSmall = memory.aliveOwn.findIndex(spirit =>
      (spirit.size + (memory.incomingMerge[spirit.id] || 0)) < Math.max(Math.cbrt(tick) / 1.5, 2)
      && !memory.isMerging[spirit.id]
    )

    if (spirit.size !== 1) {
      continue
    }
    if (spirit.energy > memory.keepEnergyOnSpawn) {
      spirit.energize(base)
    }
    if (memory.aliveOwn[firstSmall] && memory.aliveOwn[firstSmall].id !== spirit.id) {
      memory.incomingMerge[memory.aliveOwn[firstSmall].id] = (memory.incomingMerge[memory.aliveOwn[firstSmall].id] || 0) + 1
      memory.isMerging[spirit.id] = true
      spirit.move(memory.aliveOwn[firstSmall].position)
      spirit.merge(memory.aliveOwn[firstSmall])
    }
  }
}

// SECTION: Defense section
function askForHelp () {
  memory.needsHelp = {}
  for (let i = 0; i < memory.aliveOwn.length; i++) {
    const spirit = memory.aliveOwn[i]

    if (memory.previousEnergy[spirit.id] && memory.previousEnergy[spirit.id] - spirit.size > spirit.energy) {
      memory.needsHelp[spirit.id] = spirit.energy_capacity - spirit.energy
    }

    memory.previousEnergy[spirit.id] = spirit.energy
  }
}

function helpInRange() {
  for (let round = 0; round < 4; round++) {
    const needsHelp = Object.keys(memory.needsHelp)
    for (const helper of memory.aliveOwn.filter(spirit => undefined === memory.needsHelp[spirit.id])) {
      for (const helpedId of needsHelp) {
        const helped = spirits[helpedId]
  
        if (getDistance(helper.position, helped.position) < 200 && memory.needsHelp[helpedId] > 0) {
          helper.energize(helped)
          memory.needsHelp[helpedId] -= helper.size
          memory.needsHelp[helper.id] = helper.energy_capacity - (helper.energy - helper.size)
          helper.shout(`${round} 💪🏻 ${helpedId}`)
          break
        }
      }
    }
  }
}

function getDistance (pos1, pos2) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2))
}

function calculateAggroScores () {
  if (!memory.previousPositions) return
  memory.aggro = {}

  for (let i = 0; i < memory.aliveOwn.length; i++) {
    const spirit = memory.aliveOwn[i]

    memory.aggro[spirit.id] = 0
    for (let e = 0; e < memory.aliveEnemies.length; e++) {
      const enemy = memory.aliveEnemies[e]

      const previousPosition = memory.previousPositions[enemy.id] || enemy.position
      const currentPosition = enemy.position

      const previousDistance = getDistance(spirit.position, previousPosition)
      const currentDistance = getDistance(spirit.position, currentPosition)
      const closerBy = Math.max(0, previousDistance - currentDistance)

      memory.aggro[spirit.id] += (closerBy / Math.pow(previousDistance, 2)) * enemy.size
    }

    spirit.shout(`😱 ${Math.floor(100000 * memory.aggro[spirit.id])}`)
  }
}

function storeEnemyPositions () {
  memory.previousPositions = {}

  for (const enemy of memory.aliveEnemies) {
    memory.previousPositions[enemy.id] = enemy.position
  }
}

// SECTION: Attack section
function attack() {
  if (!memory.hasSplit) {
    for (let i = 0; i < memory.aliveOwn.filter(spirit => spirit.size !== 1).length; i++) {
      const spirit = memory.aliveOwn.filter(spirit => spirit.size !== 1)[i]
  
      spirit.divide()
    }
    memory.hasSplit = true
    delete memory.mergeWith
    return
  }

  // if (!memory.mergeWith) {
  //   memory.mergeWith = {}
  //   for (let i = 0; i < memory.aliveOwn.length; i++) {
  //     const spirit = memory.aliveOwn[i]

  //     if (i % 5 !== 0) {
  //       memory.mergeWith[spirit.id] = memory.aliveOwn[i - i % 5].id
  //     }
  //   }
  // } else if (someLeftToMerge()) {
  //   for (let i = 0; i < memory.aliveOwn.length; i++) {
  //     const spirit = memory.aliveOwn[i]

  //     function smartMove (pos) {
  //       const distance = getDistance(spirit.position, pos)
  //       if (distance > 150) {
  //         spirit.move(pos)
  //       }
  //     }
  //     if (memory.mergeWith[spirit.id]) {
  //       spirit.move(spirits[memory.mergeWith[spirit.id]].position)
  //       spirit.merge(spirits[memory.mergeWith[spirit.id]])
  //       spirit.shout(`M ${spirit.id}`)
  //     } else {
  //       smartMove(star_p89.position)
  //       spirit.energize(spirit)
  //     }
  //   }
  // } else
  if (!memory.isAttacking && !hasFullEnergy()) {
    for (let i = 0; i < memory.aliveOwn.length; i++) {
      const spirit = memory.aliveOwn[i]
      spirit.move(memory.stars.star_p89.position)
      spirit.energize(spirit)
    }
  } else {
    memory.isAttacking = true
  }

  if (memory.isAttacking) {
    for (let i = 0; i < memory.aliveOwn.length; i++) {
      const spirit = memory.aliveOwn[i]
      spirit.move(enemy_base.position)
    }
  }
}

function shouldAttack () {
  const totalEnemyCapacity = memory.aliveEnemies.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)
  const totalOwnCapacity = memory.aliveOwn.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)

  return totalOwnCapacity - totalEnemyCapacity > 500 || memory.hasSplit
}

function someLeftToMerge() {
  return memory.aliveOwn.some(spirit => memory.mergeWith[spirit.id])
}

function hasFullEnergy() {
  return !memory.aliveOwn.some(spirit => spirit.energy !== spirit.energy_capacity)
}

function getEnemiesInRange(spirit) {
  const inSight = spirit.sight.enemies.map(name => spirits[name])

  return inSight.filter(enemy => {
    
    const distance = getDistance(spirit.position, enemy.position)

    return distance <= 200
  })
}

function attackInRange() {
  for (const spirit of memory.aliveOwn) {
    // spirit.shout(`${spirit.size + (memory.incomingMerge[spirit.id] || 0)}`)
    let hasAttacked = false
    const enemiesInRange = getEnemiesInRange(spirit)

    for (const enemy of enemiesInRange) {
      if (enemy.energy >= 0 && spirit.energy) {
        spirit.energize(enemy)
        enemy.energy -= spirit.energy
        hasAttacked = true
        memory.needsHelp[spirit.id] = spirit.energy_capacity - (spirit.energy - spirit.size)
        spirit.shout(`⚡️ needs ${memory.needsHelp[spirit.id]}`)
        break
      }
    }

    if (!hasAttacked && memory.isAttacking) {
      spirit.energize(enemy_base)
      memory.needsHelp[spirit.id] = spirit.energy_capacity - (spirit.energy - spirit.size)
    }
  }
}

// console.log(tick, Math.max(Math.cbrt(tick) / 1.5, 2))
if (memory.harvester[memory.ownStar].workers.length < 4 || tick < 100 ||
  memory.harvester[memory.ownStar].workers.length < memory.harvester.star_p89.workers.length ||
  memory.harvester[memory.ownStar].workers.length % 4 !== 0) {
    // console.log('ALLOCATING TO', memory.ownStar, memory.harvester[memory.ownStar].workers.length)
} else if (memory.harvester.star_p89.workers.length % 4 !== 0 || memory.harvester.star_p89.workers.length < 12) {
  // console.log('ALLOCATING TO star_p89', memory.harvester.star_p89.workers.length)
} else {
  // console.log('ALLOCATING TO', memory.enemyStar, memory.harvester[memory.enemyStar].workers.length)
}
// console.log(`Energy: ${memory.ownEnergy}v${memory.enemyEnergy}`)
// console.log(`Strength: ${memory.totalOwnCapacity}v${memory.totalEnemyCapacity}`)

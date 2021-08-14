// Your code goes here
// Activate it by pressing the button below or with SHIFT+ENTER

memory.target = {
  star_a1c,
  star_p89,
  star_zxq
}

memory.ownBase = base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.ownStar = base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.enemyBase = !base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.enemyStar = !base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.attacked = []

memory.aliveCount = Object.keys(spirits).map(index => spirits[index]).filter(spirit => spirit.hp).length
memory.alive = my_spirits.filter(spirit => spirit.hp)
memory.canWork = memory.alive.filter(spirit => spirit.size >= 2)
memory.friendsCount = my_spirits.filter(spirit => spirit.hp).length

memory.selfEnergy = memory.alive.reduce((acc, curr) => { acc += +curr.energy; return acc }, 0)
memory.enemyEnergy = Object.keys(spirits).reduce((acc, curr) => { if (!curr.includes('ArGJolan')) { acc += +spirits[curr].energy } return acc }, 0)

memory.aliveEnemies = Object.keys(spirits).filter(name => !name.includes('ArGJolan')).map(name => spirits[name]).filter(spirit => spirit.hp)

memory.totalEnemyCapacity = memory.aliveEnemies.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)
memory.totalOwnCapacity = memory.alive.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)

if (!memory.workers) {
  memory.workers = {
    harvester: {},
    chainOne: {},
    chainTwo: {}
  }
  memory.jobs = {}
}

function assignJob (spirit, job) {
  memory.workers[job][spirit.id] = spirit
  memory.jobs[spirit.id] = job
}

function giveJob (spirit) {
  const harvesters = Object.keys(memory.workers.harvester)
  const chainOnes = Object.keys(memory.workers.chainOne)
  const chainTwos = Object.keys(memory.workers.chainTwo)
  if (harvesters.length < 2 || harvesters.length < chainOnes.length * 2) {
    assignJob(spirit, 'harvester')
  } else if (chainOnes.length < harvesters.length / 2 || chainOnes.length < chainTwos.length) {
    assignJob(spirit, 'chainOne')
  } else if (chainTwos.length < chainOnes.length) {
    assignJob(spirit, 'chainTwo')
  } else {
    assignJob(spirit, 'harvester')
  }
}

function makeHarvest() {
  const harvesters = Object.keys(memory.workers.harvester)
  const chainOnes = Object.keys(memory.workers.chainOne)

  for (let i = 0; i < harvesters.map(id => spirits[id]).length; i++) {
    const spirit = harvesters.map(id => spirits[id])[i]

    function moveTo (pos) {
      const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
      if (distance > 5) {
        spirit.move(pos)
      }
    }

    function energizeMove (pos) {
      const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
      if (distance >= 200) {
        spirit.move(pos)
      }
    }

    if (!spirit.mark && spirit.energy > spirit.energy_capacity / 10) {
      const ownStar = memory.target[memory.ownStar]
      const harvestPosition = [
        ownStar.position[0] - 3 * (ownStar.position[0] - base.position[0]) / 4,
        ownStar.position[1] - 3 * (ownStar.position[1] - base.position[1]) / 4,
      ]

      moveTo(harvestPosition)
      spirit.energize(base)
    } else if (!spirit.mark || spirit.energy === 0) {
      spirit.set_mark("harvest")
    }

    if (spirit.mark === "harvest" && spirit.energy === spirit.energy_capacity) {
      spirit.set_mark("charge")
    }

    if (spirit.mark === "harvest") {
      const ownStar = memory.target[memory.ownStar]
      const harvestPosition = [
        ownStar.position[0] - (ownStar.position[0] - base.position[0]) / 4,
        ownStar.position[1] - (ownStar.position[1] - base.position[1]) / 4,
      ]

      moveTo(harvestPosition)
      if (tick < 400 || ownStar.energy >= 0.99 * ownStar.energy_capacity || memory.underattack) {
        spirit.energize(spirit)
      }
    }
    if (spirit.mark === "charge") {
      const dumpOn = chainOnes[Math.floor(i / 2)]
      if (dumpOn) {
        energizeMove(spirits[dumpOn].position)
        spirit.energize(spirits[dumpOn])
      } else {
        energizeMove(base.position)
        spirit.energize(base)
      }
    }
  }
}

function makeChainOne () {
  const chainOnes = Object.keys(memory.workers.chainOne)
  const chainTwos = Object.keys(memory.workers.chainTwo)

  for (let i = 0; i < chainOnes.map(id => spirits[id]).length; i++) {
    const spirit = chainOnes.map(id => spirits[id])[i]

    function moveTo (pos) {
      const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
      if (distance > 5) {
        spirit.move(pos)
      }
    }

    const ownStar = memory.target[memory.ownStar]

    if (chainTwos[i]) {
      const harvestPosition = [
        base.position[0] + 2 * (ownStar.position[0] - base.position[0]) / 4,
        base.position[1] + 2 * (ownStar.position[1] - base.position[1]) / 4,
      ]
  
      moveTo(harvestPosition)
      spirit.energize(spirits[chainTwos[i]])
    } else {
      const harvestPosition = [
        base.position[0] + (ownStar.position[0] - base.position[0]) / 4,
        base.position[1] + (ownStar.position[1] - base.position[1]) / 4,
      ]
      moveTo(harvestPosition)
      spirit.energize(base)
    }
  }
}

function makeChainTwo () {
  const chainTwos = Object.keys(memory.workers.chainTwo)

  for (let i = 0; i < chainTwos.map(id => spirits[id]).length; i++) {
    const spirit = chainTwos.map(id => spirits[id])[i]

    function moveTo (pos) {
      const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
      if (distance > 5) {
        spirit.move(pos)
      }
    }
    const ownStar = memory.target[memory.ownStar]

    const harvestPosition = [
      base.position[0] + (ownStar.position[0] - base.position[0]) / 4,
      base.position[1] + (ownStar.position[1] - base.position[1]) / 4,
    ]

    moveTo(harvestPosition)
    spirit.energize(base)
  }
}

function work () {
  makeHarvest()
  makeChainOne()
  makeChainTwo()
}

function updateWorkers () {
  const allWorkers = []

  Object.keys(memory.workers).forEach(job => {
    Object.keys(memory.workers[job]).forEach(workerId => {
      const worker = memory.workers[job][workerId]
      if (memory.alive.some(spirit => spirit.id === worker.id)) {
        allWorkers.push(worker.id)
      } else {
        delete memory.workers[job][workerId]
      }
    })
  })

  for (const spirit of memory.canWork) {
    if (!allWorkers.includes(spirit.id)) {
      giveJob(spirit)
    }
  }
}

mergeNoobs()
updateWorkers()
work()

function mergeNoobs () {
  for (let i = 0; i < memory.alive.length; i++) {
    const spirit = memory.alive[i]
    const firstSmall = memory.alive.findIndex(spirit => spirit.size < 5)

    if (spirit.size !== 1) {
      continue
    }
    if (spirit.energy) {
      spirit.energize(base)
    }
    if (memory.alive[firstSmall].id !== spirit.id) {
      spirit.move(memory.alive[firstSmall].position)
      spirit.merge(memory.alive[firstSmall])
    }
  }
}

function shouldAttack () {
  const totalEnemyCapacity = memory.aliveEnemies.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)
  const totalOwnCapacity = memory.alive.reduce((acc, curr) => { acc += +curr.energy_capacity; return acc }, 0)

  console.log(JSON.stringify({
    totalEnemyCapacity,
    totalOwnCapacity,
    isAttacking: memory.isAttacking,
    // merge: memory.mergeWith,
    hasSplit: memory.hasSplit
  }, null, 2))
  return totalOwnCapacity - totalEnemyCapacity > 200 || memory.hasSplit
}

function someLeftToMerge() {
  return memory.alive.some(spirit => memory.mergeWith[spirit.id])
}

function hasFullEnergy() {
  return !memory.alive.some(spirit => spirit.energy !== spirit.energy_capacity)
}

function getEnemiesInRange(spirit) {
  const inSight = spirit.sight.enemies.map(name => spirits[name])

  return inSight.filter(enemy => {
    const distance = Math.sqrt(Math.pow(spirit.position[0] - enemy.position[0], 2) + Math.pow(spirit.position[1] - enemy.position[1], 2))

    return distance <= 200
  })
}

function attackInRange() {
  for (const spirit of memory.alive) {
    // spirit.shout(memory.jobs[spirit.id] + '/' + spirit.mark)
    let hasAttacked = false
    const enemiesInRange = getEnemiesInRange(spirit)

    for (const enemy of enemiesInRange) {
      if (!memory.attacked.includes(enemy.id)) {
        spirit.energize(enemy)
        memory.attacked.push(enemy.id)
        hasAttacked = true
        spirit.shout(`ATTAC ${enemy.id}`)
        break
      }
    }

    if (!hasAttacked && memory.isAttacking) {
      spirit.energize(enemy_base)
    }
  }
}

attackInRange()

console.log(tick)
console.log(`Units: ${memory.friendsCount}v${memory.aliveCount - memory.friendsCount}`)
console.log(`Energy: ${memory.selfEnergy}v${memory.enemyEnergy}`)
console.log(`Strength: ${memory.totalOwnCapacity}v${memory.totalOwnCapacity}`)

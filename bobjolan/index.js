// Your code goes here
// Activate it by pressing the button below or with SHIFT+ENTER

memory.target = {
  star_a1c,
  star_p89,
  star_zxq
}

memory.ownBase = base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.enemyBase = !base.position[0] < 2000 ? 'star_zxq' : 'star_a1c'
memory.attacked = []

memory.aliveCount = Object.keys(spirits).map(index => spirits[index]).filter(spirit => spirit.hp).length
memory.alive = my_spirits.filter(spirit => spirit.hp)
memory.friendsCount = my_spirits.filter(spirit => spirit.hp).length

memory.selfEnergy = memory.alive.reduce((acc, curr) => { acc += +curr.energy; return acc }, 0)
memory.enemyEnergy = Object.keys(spirits).reduce((acc, curr) => { if (!curr.includes('ArGJolan')) { acc += +spirits[curr].energy } return acc }, 0)

memory.aliveEnemies = Object.keys(spirits).filter(name => !name.includes('ArGJolan')).map(name => spirits[name]).filter(spirit => spirit.hp)

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

    return distance < 200
  })
}

function attackInRange() {
  for (const spirit of memory.alive) {
    spirit.shout(spirit.mark)
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

function attack() {
  if (!memory.hasSplit) {
    for (let i = 0; i < memory.alive.filter(spirit => spirit.size !== 1).length; i++) {
      const spirit = memory.alive.filter(spirit => spirit.size !== 1)[i]
  
      spirit.divide()
    }
    memory.hasSplit = true
    delete memory.mergeWith
    return
  }

  if (!memory.mergeWith) {
    memory.mergeWith = {}
    for (let i = 0; i < memory.alive.length; i++) {
      const spirit = memory.alive[i]

      if (i % 5 !== 0) {
        memory.mergeWith[spirit.id] = memory.alive[i - i % 5].id
      }
    }
  } else if (someLeftToMerge()) {
    for (let i = 0; i < memory.alive.length; i++) {
      const spirit = memory.alive[i]

      function smartMove (pos) {
        const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
        if (distance > 150) {
          spirit.move(pos)
        }
      }
      if (memory.mergeWith[spirit.id]) {
        spirit.move(spirits[memory.mergeWith[spirit.id]].position)
        spirit.merge(spirits[memory.mergeWith[spirit.id]])
        spirit.shout(`M ${spirit.id}`)
      } else {
        smartMove(star_p89.position)
        spirit.energize(spirit)
      }
    }
  } else if (!memory.isAttacking && !hasFullEnergy()) {
    for (let i = 0; i < memory.alive.length; i++) {
      const spirit = memory.alive[i]
      spirit.move(memory.target.star_p89.position)
      spirit.energize(spirit)
    }
  } else {
    memory.isAttacking = true
  }

  if (memory.isAttacking) {
    for (let i = 0; i < memory.alive.length; i++) {
      const spirit = memory.alive[i]
      spirit.move(enemy_base.position)
    }
  }
}

function earlyGame() {
  mergeNoobs()
  for (let i = 0; i < memory.alive.length; i++) {
    const spirit = memory.alive[i]

    if (spirit.size === 1 && i !== memory.alive.findIndex(spirit => spirit.size < 5)) {
      continue
    }

    function smartMove (pos) {
      const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
      if (distance > 200) {
        spirit.move(pos)
      }
    }

    if (memory.alive.length >= 50) {
      spirit.set_mark("merging")
      memory.mergeWith = memory.mergeWith || {}
      if (i % 3 !== 0) {
        memory.mergeWith[spirit.id] = memory.alive[i - i % 3].id
      }
    }
    if (spirit.mark == "merging" && memory.alive.length < 25) {
      delete memory.mergeWith
      spirit.set_mark("harvesting")
    }
    if (spirit.mark == "merging" && memory.alive.length > 25) {
    } else if (spirit.energy == spirit.energy_capacity){
      spirit.set_mark("charging") 
    } else if (spirit.energy == 0){
      spirit.set_mark("harvesting")
    }


    if (spirit.mark == "merging") {
      if (memory.mergeWith[spirit.id]) {
        spirit.move(spirits[memory.mergeWith[spirit.id]].position)
        spirit.merge(spirits[memory.mergeWith[spirit.id]])
        spirit.shout(`M ${spirit.id}`)
      }
    } else if (spirit.mark == "charging"){
      if ((tick > 500 && outpost.energy < 620 && i % 2 === 1) || (tick > 90 && outpost.energy < 40 && i % 2 === 1)) {
        smartMove(outpost.position)
        if (outpost.energy < outpost.energy_capacity) {
          spirit.energize(outpost)
        }
      } else if (memory.friendsCount < 50) {
        smartMove(base.position)
        if (base.energy < base.energy_capacity) {
          spirit.energize(base)
        }
      }
    } else {
      const shouldMoveTo = (
        i % 2 === 0 || tick < 90 ? memory.ownBase :
        i % 2 === 1 ? 'star_p89' : memory.ownBase
      )
      smartMove(memory.target[shouldMoveTo].position)
      closestStar = spirit.sight.structures.find(name => name.includes('star'))

      if (closestStar && (memory.target[closestStar].energy > 950 || tick < 500)) {
        spirit.energize(spirit)
      }
    }
  }
}

if (shouldAttack()) {
  attack()
} else {
  earlyGame()
}

attackInRange()

console.log(tick)
console.log(`Units: ${memory.friendsCount}v${memory.aliveCount}`)
console.log(`Energy: ${memory.selfEnergy}v${memory.enemyEnergy}`)

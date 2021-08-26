import Society from './society.js'
import MainHarvesterCompany from './mainHarvesterCompany.js'
import OutpostHarvesterCompany from './outpostHarvesterCompany.js'
import EnemyStarAttackerCompany from './EnemyStarAttackerCompany.js'

const society = new Society()

society.addCompany(new MainHarvesterCompany({ size: 5 }))
society.addCompany(new OutpostHarvesterCompany({ size: 0, outpostMaxEnergy: 50 }))
society.addCompany(new EnemyStarAttackerCompany({ size: 0 }))

society.run([
    MainHarvesterCompany.name,
    EnemyStarAttackerCompany.name,
    OutpostHarvesterCompany.name,
])

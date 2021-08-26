import { basicDefense } from './defense.js'

export default class Society {
    constructor() {
        memory.__society__ = memory.__society__ || []
        this.companies = {}
    }

    addCompany(company) {
        this.companies[company.name] = company
    }

    deleteCompanies(currentCompanyIds) {
        const companyIds = memory.__society__.filter(id => !currentCompanyIds.includes(id))
        for (let companyId of companyIds) {
            this.companies[companyId].delete()
        }
    }

    createNewCompanies(currentCompanyIds) {
        const ids = currentCompanyIds.filter(id => !memory.__society__.includes(id))
        for (let id of ids) {
            this.companies[id].create()
        }
    }

    recruitSpirits(currentCompanyIds) {
        const idleSpirits = my_spirits.filter(spirit => ['', 'idle'].includes(spirit.mark))
        for (let id of currentCompanyIds) {
            const company = this.companies[id]
            company.recruit(idleSpirits)
        }
    }

    work(currentCompanyIds) {
        for (let id of currentCompanyIds) {
            const company = this.companies[id]
            company.work()
        }

    }

    run(currentCompanyIds) {
        this.deleteCompanies(currentCompanyIds)
        this.createNewCompanies(currentCompanyIds)
        this.recruitSpirits(currentCompanyIds)
        this.work(currentCompanyIds)

        // Jobless
        const idleSpirits = my_spirits.filter(spirit => ['', 'idle'].includes(spirit.mark))
        for (let spirit of idleSpirits) {
            spirit.move(base.position)
            spirit.shout('idle')

            basicDefense(spirit)
        }

        // Stats
        const aliveSpirits = my_spirits.filter(spirit => spirit.hp)
        console.log(JSON.stringify({
            tick,
            alive: aliveSpirits.length,
            idle: idleSpirits.length,
            worker: aliveSpirits.length - idleSpirits.length,
        }))
        console.log(JSON.stringify(currentCompanyIds))

        memory.__society__ = currentCompanyIds
    }
}

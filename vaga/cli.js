const esbuild = require('esbuild')
const sync = require('yare-sync')
const watch = require('node-watch')
const fs = require('fs')
const path = require('path')

const esbuildConfig = {
  entryPoints: ['./src/index.js'],
  bundle: true,
  minify: false,
  outfile: "./dist/bundle.js",
  treeShaking: true,
  target: "es2015",
}

async function build(account) {
    esbuild.buildSync(esbuildConfig)
    console.log('bundled...')

    const games = await sync.getGames(username);
    if (games.length === 0) {
        console.log('no retrieved game...')
        return
    }

    console.log('retrieved games: ' + games.map(game => game.id).join(', ') + '...')
    const code = fs.readFileSync(esbuildConfig.outfile, 'utf-8');
    const done = await sync.sendCode(code, games, account)
    if (done) {
        console.log('code sent...');
    }
}

const username = '...'
const password = '...'

async function main() {
    const account = await sync.login(username, password);
    if (!account) {
        return console.error("login failed.");
    }

    await build(account)
    watch(
        path.dirname(esbuildConfig.entryPoints[0]),
        { recrusive: true },
        (_, file) => {
            console.log('file change detected: ' + file)
            build(account).then(
                () => console.log('Done.'),
                (e) => console.error(e),
            )
        },
    )
}

main()

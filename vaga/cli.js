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

const username = '...'
const password = '...'

async function build() {
    esbuild.buildSync(esbuildConfig)
    console.log('bundled...')

    const account = await sync.login(username, password);
    if (!account) {
        return console.error("login failed.");
    }

    const games = await sync.getGames(username);
    console.log('retrieved games: ' + games.map(game => game.id).join(', ') + '...')

    const code = fs.readFileSync(esbuildConfig.outfile, 'utf-8');
    const done = await sync.sendCode(code, games, account)
    if (done) {
        console.log('code sent...');
    }
}

async function main() {
    const action = 
    await build()
    watch(
        path.dirname(esbuildConfig.entryPoints[0]),
        { recrusive: true },
        (_, file) => {
            console.log('node-watch: change detected: ' + file)
            build().then(
                () => console.log('Done.'),
                (e) => console.error(e),
            )
        },
    )
}

main()

import { program } from '@commander-js/extra-typings'
import { deploy } from './deployMultisig'
import { sendTransaction } from './sendTransaction'
import { readConfig, readTransaction } from './utils/config'

program
  .name('sequence-multsig')
  .description(
    'CLI tool for interacting with a Sequence multi signature wallet',
  )
  .version('1.0.0')

program
  .command('deploy')
  .requiredOption('-c, --config <config>', 'path to config file')
  .action(async (_, options) => {
    const config = await readConfig(options.opts().config)
    await deploy(config)
  })

program
  .command('send')
  .requiredOption('-c, --config <config>', 'path to config file')
  .requiredOption('-t, --transaction <transaction>', 'path to transaction file')
  .action(async (_, options) => {
    const config = await readConfig(options.opts().config)
    const transaction = await readTransaction(options.opts().transaction)
    await sendTransaction(config, transaction)
  })

program.parseAsync(process.argv).catch(err => {
  console.error(err)
  process.exit(1)
})

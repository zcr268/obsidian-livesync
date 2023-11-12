import {ExecutorQueue} from './src/Utils/ExecutorQueue'
// process.on('uncaughtException', (err: any, origin: any) => {
//   console.error('uncaughtException err', err, 'origin', origin)
// })


async function main() {
  console.log(123)
  console.log(ExecutorQueue)
  const task = new ExecutorQueue()
}

main().catch(console.log)
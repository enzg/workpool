const { parentPort, workerData } = require('worker_threads')

parentPort.on('message', async task => {
  await delay(2000)
  console.log('开始执行任务:', task)
  parentPort.postMessage({ taskId: task.taskId })
})
async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
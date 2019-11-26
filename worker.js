const { parentPort, workerData } = require('worker_threads')

parentPort.on('message', task => {
  setTimeout(() => {
    console.log('working on task:', task)
    parentPort.postMessage({ taskId: task.taskId })
  }, 2000)
})
const WorkerPool = require('./pool')


const pool = new WorkerPool()
const delay = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
const run = async () => {
  for (let i = 0; i < 100; i++) {
    pool.addTask({
      taskId: i,
      resolve: 'pending',
      reject: null,
      data: {
        name: `task_${i}`,
        taskId: i,
        timestamp: Date.now()
      }
    })
    await delay(1000)
  }

}
console.time('run')
run()
console.timeEnd('run')
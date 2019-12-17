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
  for (let i = 0; i < 8; i = i + 2) {
    pool.addTask([
      {
        taskId: i,
        data: {
          name: `task_i${i}`,
          taskId: i,
          timestamp: Date.now()
        }
      },
      {
        taskId: i + 1,
        data: {
          name: `task_i${i + 1}`,
          taskId: i + 1,
          timestamp: Date.now()
        }
      }
    ])
    await delay(40)
  }
  for (let j = 0; j < 20; j++) {
    pool.addTask({ taskId: j, data: { name: `task_j${j}`, taskId: j, timestamp: Date.now() } })

  }

}
console.time('run')
run()
console.timeEnd('run')
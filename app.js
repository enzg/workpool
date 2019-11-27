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
  for (let i = 0, j = 0; i < 100; i = i + 2, j = i + 3) {
    // pool.addTask([
    //   {
    //     taskId: i,
    //     resolve: 'pending',
    //     reject: null,
    //     data: {
    //       name: `task_${i}`,
    //       taskId: i,
    //       timestamp: Date.now()
    //     }
    //   },
    //   {
    //     taskId: i + 1,
    //     resolve: 'pending',
    //     reject: null,
    //     data: {
    //       name: `task_${i + 1}`,
    //       taskId: i + 1,
    //       timestamp: Date.now()
    //     }
    //   }
    // ])
    await delay(40)
    pool.addTask(
      {
        taskId: j,
        resolve: 'pending',
        reject: null,
        data: {
          name: `task_${j}`,
          taskId: j,
          timestamp: Date.now()
        }
      }

    )
  }

}
console.time('run')
run()
console.timeEnd('run')
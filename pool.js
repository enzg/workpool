const WorkerMock = require('./workerMock')
const cpuNum = require('os').cpus().length
process.on('uncaughtException', (err, origin) => {
  console.log('uncaughtError:', err, origin)
})
process.on('unhandledRejection', (reason, promise) => {
  console.log(reason)
})
class WorkerPool {
  constructor() {
    this.maxWorkers = cpuNum * 20
    this.minWorkers = cpuNum * 2
    this.maxTaskQueueSize = 360
    // 工作线程队列
    this.workers = []
    // 任务队列
    this.tasks = []
    console.log('最小线程数：', this.minWorkers)
    this._spawnWorkers()
  }
  // 添加任务到队列中
  addTask(task) {
    if (this.tasks.length >= this.maxTaskQueueSize) {
      throw new Error('任务队列满了.')
    }
    this.tasks.push(task)
    this._nextTask()
  }
  //终止所有任务。
  terminate() {
    for (let task of this.tasks) {
      task.promise.reject(new Error('线程池关闭了'))
    }
    this.tasks.length = 0
    for (let worker of this.workers) {
      worker.terminate()
    }

  }
  // 从任务队列中取任务。 然后找从工作线程队列中找一个空闲的线程。把任务分配给它
  // task = {taskId,resolve,reject,data}
  // 当任务被创建时 resolve == ‘pending’ reject == null 
  // 当任务被分配给 worker时 resolve == fn reject == fn
  // taskId 会被用来跟踪任务。 其中一种场景是：
  // 一个计算任务被分解为n个task。最终必须等待n个task全部完成才能结束
  _dispatchTask(worker, task) {
    console.log('dipatch task')
    return worker.exec(task)
      .then(ret => {
        console.log('worker 执行完了:', ret, Date.now())
        return ret
      })
      .catch(err => {
        console.error('dispatch error:',err)
        if (worker.terminated) {
          this._removeWorker(worker)
          this._spawnWorkers()
        }
      })
      .finally(
        () => {
          worker.idle = true
          this._nextTask.bind(this)()
        }
      )

    // return promise
  }
  _nextTask() {
    if (this.tasks.length > 0) {
      console.log('tasks count:', this.tasks.length)
      const worker = this._getWorker()
      if (worker) {
        const task = this.tasks.shift()
        // 如果该任务还未被执行.
        // 如果是一组协同任务， 则task会是一个数组。 
        // 此时，就相应的创建一个数组用来接收对应的task数组项。
        if (Array.isArray(task)) {
          const groupPromises = []
          for (let part of task) {
            if (part.resolve === 'pending') {
              // 组装全部的子任务
              groupPromises.push(this._dispatchTask(worker, part))
            }
          }
          Promise.all(groupPromises)
            .then(function (values) {
              console.log(values)
              return values
            })
          // .catch(err => {
          //   if (worker.terminated) {
          //     this._removeWorker(worker)
          //     this._spawnWorkers()
          //   }
          // })
        } else {
          if (task.resolve === 'pending') {
            // 干活
            this._dispatchTask(worker, task)
          } else {
            this._nextTask()
          }

        }
      } else {
        // console.error('no workers')
      }
    }

  }
  // 从池子里获取空闲的worker
  _getWorker() {
    for (let worker of this.workers) {
      if (!worker.busy()) {
        console.log('found worker')
        return worker
      }
    }
    if (this.workers.length < this.maxWorkers) {
      let freshWorker = this._createWorker()
      this.workers.push(freshWorker)
      return freshWorker
    }
    return null
  }
  // 终止某个线程并移除出队列
  _removeWorker(worker) {
    worker.terminate()
    let index = this.workers.indexOf(worker)
    if (index !== -1) {
      this.workers.splice(index, 1)
    }
  }
  // 保证线程池中始终有大于等于minWorks的线程
  _spawnWorkers() {
    for (let i = this.workers.length; i < this.minWorkers; i++) {
      this.workers.push(this._createWorker())
    }
  }
  _createWorker() {
    return new WorkerMock('./worker.js', {})
  }

}


module.exports = WorkerPool
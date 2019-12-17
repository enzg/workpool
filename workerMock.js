const { Worker } = require('worker_threads')
class WorkerMock {
  constructor(path, workerData) {
    this.worker = new Worker(path, { workerData })
    this.resolve = null
    this.reject = console.error
    this.terminated = false
    this.idle = true
    this.worker.on('message', msg => {
      this.resolve(msg)
    })
    this.worker.on('error', err => {
      this.reject(err)
    })
    this.worker.on('exit', err => {
      this.reject(err)
    })
  }
  busy() {
    return !this.idle
  }
  terminate() {
    this.worker.terminate()
    if (this.resolve && this.reject) {
      this.reject(new Error('线程终止'))
    }
    this.resolve = this.reject = null
    this.terminated = true
  }
  postMessage(task,resolve,reject) {
    this.resolve = resolve
    this.reject = reject
    this.worker.postMessage(task.data)
  }
  exec(task) {
    this.idle = false
    return new Promise((resolve, reject) => {
      this.postMessage(task,resolve,reject)
    })
  }
}

module.exports = WorkerMock
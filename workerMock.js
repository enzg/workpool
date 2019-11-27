const { Worker } = require('worker_threads')
class WorkerMock {
  constructor(path, workerData) {
    this.worker = new Worker(path, { workerData })
    this.resolve = null
    this.reject = console.error
    this.terminated = false
    this.worker.on('message', msg => {
      console.log('work done:', msg, Date.now())
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
    return !this.resolve
  }
  terminate() {
    this.worker.terminate()
    if (this.resolve && this.reject) {
      this.reject(new Error('线程终止'))
    }
    this.resolve = this.reject = null
    this.terminated = true
  }
  postMessage(task) {
    this.resolve = task.resolve
    this.reject = task.reject
    this.worker.postMessage(task.data)
  }
  exec(task) {
    return new Promise((resolve, reject) => {
      task.resolve = resolve
      task.reject = reject
      this.postMessage(task)
    })
  }
}

module.exports = WorkerMock
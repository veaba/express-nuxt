module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = './server/server.js'
    config.resolve.modules = ['./server']
    return config
  }
}

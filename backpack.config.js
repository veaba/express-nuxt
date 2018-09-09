module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = './server/import.js'
    config.resolve.modules = ['./server']
    return config
  }
}

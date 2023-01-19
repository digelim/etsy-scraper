if(process.argv.length < 3){
    console.log('target file path is required.')
    process.exit(1)
}

var target = process.argv[2]
console.log('file: ' + target)

var fs = require('fs')
fs.readFile(target, function (err, data) {
  if (err) throw err

  var jsonArray = JSON.parse(data),
      i = 1
  while(jsonArray.length !== 0){
    var fileName = target + '.' + i
    fs.writeFileSync(fileName, JSON.stringify(jsonArray.splice(0, 50)))
    console.log(fileName)
    i++
  }
})

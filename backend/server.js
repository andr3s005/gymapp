console.log('Iniciando servidor...')
const path = require('path')
const app = require(path.join(__dirname, 'src', 'app'))
console.log('App cargada correctamente')

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('El servidor esta corriendo en http://localhost:' + PORT);
    console.log(`Red local: http://192.168.1.4:${PORT}`)
})
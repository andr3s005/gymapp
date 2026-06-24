const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('El servidor esta corriendo en http://localhost:' + PORT);
})

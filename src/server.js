import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars';
import viewsRouter from './routes/viewsRouters.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('handlebars', engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado a Atlas'))
    .catch(err => console.error(`Error de MongoDB: ${err.message}`));

app.use('/', viewsRouter);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

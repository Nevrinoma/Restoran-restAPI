const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); 
const app = express();
const port = 8090;

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./docs/swagger.json');

//http://localhost:8090/docs/

app.use('/docs', swaggerUi.serve , swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Restoran-front-end')));

app.get('/api/menu', (req, res) => {
    fs.readFile('Data/Restoran.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Viga faili lugemisel');
            return;
        }
        const jsonData = JSON.parse(data);
        res.json(jsonData.menu);
    });
});

app.delete('/api/menu/:id', (req, res) => {
    const dishId = req.params.id;
    fs.readFile('Data/Restoran.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Viga faili lugemisel');
            return;
        }
        const jsonData = JSON.parse(data);
        jsonData.menu.dish = jsonData.menu.dish.filter(dish => dish["@attributes"].id !== dishId);
        fs.writeFile('Data/Restoran.json', JSON.stringify(jsonData), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Viga faili kirjutamisel');
                return;
            }
            res.json({ message: 'Toit on kustutatud' });
        });
    });
});


app.post('/api/menu', (req, res) => {
    const newDishData = req.body;
    
    fs.readFile('Data/Restoran.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Viga faili lugemisel');
            return;
        }
        
        const jsonData = JSON.parse(data);
        const newDish = {
            "@attributes": {
                "id": String(jsonData.menu.dish.length + 101), 
                "type": newDishData.type
            },
            "name": newDishData.name,
            "price": newDishData.price,
            "allergyTags": newDishData.allergens
        };
        
        jsonData.menu.dish.push(newDish);
        
        fs.writeFile('Data/Restoran.json', JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                res.status(500).send('Viga faili kirjutamisel');
                return;
            }
            res.status(201).json(newDish);
        });
    });
});


app.put('/api/menu/:id', (req, res) => {
    const dishId = req.params.id;
    const updatedDish = req.body;

    fs.readFile('Data/Restoran.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Viga faili lugemisel');
            return;
        }

        const jsonData = JSON.parse(data);
        const dishIndex = jsonData.menu.dish.findIndex(dish => dish["@attributes"].id === dishId);

        if (dishIndex !== -1) {
            jsonData.menu.dish[dishIndex] = updatedDish;
            fs.writeFile('Data/Restoran.json', JSON.stringify(jsonData), 'utf8', (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Viga faili kirjutamisel');
                    return;
                }
                res.json({ message: 'Toit on uuendatud' });
            });
        } else {
            res.status(404).send('Toit ei leitud');
        }
    });
});

app.listen(port, () => {
    console.log(`API töötab: http://localhost:${port}`);
});

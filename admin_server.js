const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

// Swagger документация
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description: 'API для управления задачами',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
    },
    apis: ['openapi.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Получить список товаров
app.get('/products', (req, res) => {
    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }
        const jsonData = JSON.parse(data);
        res.json(jsonData.products);
    });
});

// Получить список категорий
app.get('/categories', (req, res) => {
    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }
        const jsonData = JSON.parse(data);
        res.json(jsonData.categories);
    });
});

// Создать новый товар
app.post('/products', (req, res) => {
    const { name, price, description, categories } = req.body;

    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }

        const jsonData = JSON.parse(data);

        // Проверка, что все категории существуют
        const invalidCategories = categories.filter(
            catId => !jsonData.categories.some(cat => cat.id === catId)
        );
        if (invalidCategories.length > 0) {
            return res.status(404).json({ message: `Категории не найдены: ${invalidCategories.join(', ')}` });
        }

        const newProduct = {
            id: jsonData.products.length + 1,
            name,
            price,
            description,
            categories,
        };

        jsonData.products.push(newProduct);

        fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка записи файла' });
            }
            res.status(201).json(newProduct);
        });
    });
});

// Создать новую категорию
app.post('/categories', (req, res) => {
    const { name } = req.body;

    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }

        const jsonData = JSON.parse(data);
        const newCategory = {
            id: jsonData.categories.length + 1,
            name,
        };

        jsonData.categories.push(newCategory);

        fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка записи файла' });
            }
            res.status(201).json(newCategory);
        });
    });
});

// Обновить товар по ID
app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, price, description, categories } = req.body;

    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }

        const jsonData = JSON.parse(data);
        const product = jsonData.products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Проверка, что все категории существуют
        const invalidCategories = categories.filter(
            catId => !jsonData.categories.some(cat => cat.id === catId)
        );
        if (invalidCategories.length > 0) {
            return res.status(404).json({ message: `Категории не найдены: ${invalidCategories.join(', ')}` });
        }

        product.name = name !== undefined ? name : product.name;
        product.price = price !== undefined ? price : product.price;
        product.description = description !== undefined ? description : product.description;
        product.categories = categories !== undefined ? categories : product.categories;

        fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка записи файла' });
            }
            res.json(product);
        });
    });
});

// Обновить категорию по ID
app.put('/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const { name } = req.body;

    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }

        const jsonData = JSON.parse(data);
        const category = jsonData.categories.find(c => c.id === categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Категория не найдена' });
        }

        category.name = name !== undefined ? name : category.name;

        fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка записи файла' });
            }
            res.json(category);
        });
    });
});

// Удалить товар по ID
app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }

        const jsonData = JSON.parse(data);
        jsonData.products = jsonData.products.filter(p => p.id !== productId);

        fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка записи файла' });
            }
            res.status(204).send();
        });
    });
});

// Удалить категорию по ID
app.delete('/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);

    fs.readFile('./data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения файла' });
        }

        const jsonData = JSON.parse(data);

        // Удаляем категорию из списка категорий
        jsonData.categories = jsonData.categories.filter(c => c.id !== categoryId);

        // Удаляем категорию из всех товаров
        jsonData.products = jsonData.products.map(p => ({
            ...p,
            categories: p.categories.filter(catId => catId !== categoryId),
        }));

        fs.writeFile('./data.json', JSON.stringify(jsonData), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка записи файла' });
            }
            res.status(204).send();
        });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
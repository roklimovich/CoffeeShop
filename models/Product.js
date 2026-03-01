const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "products.json");

module.exports = class Product {
    constructor(name, price, description, imageUrl) {
        this.id = Date.now().toString();
        this.name = name;
        this.price = parseFloat(price);
        this.description = description;
        this.imageUrl = imageUrl;
    }

    save() {
        let data = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            if (fileContent.trim()) {
                data = JSON.parse(fileContent);
            }
        }

        data.push(this);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    static fetchAll() {
        if (!fs.existsSync(filePath)) return [];
        const fileContent = fs.readFileSync(filePath, "utf-8");
        if (!fileContent.trim()) return [];
        return JSON.parse(fileContent);
    }

    static findById(id) {
        const data = this.fetchAll();
        return data.find(p => p.id === id);
    }

    static updateById(id, updatedData) {
        const data = JSON.parse(fs.readFileSync(filePath));
        const productIndex = data.findIndex(p => p.id === id);
        if (productIndex === -1) return null;

        data[productIndex] = {
            ...data[productIndex],
            ...updatedData
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return data[productIndex];
    }
};

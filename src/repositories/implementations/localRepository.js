// repositories/implementations/LocalRepository.js
const fs = require("fs");
const path = require("path");
const IRepository = require("../base/IRepository");

class LocalRepository extends IRepository {
  constructor(fileName, config = {}) {
    super();
    this.fileName = fileName; // 'products' o 'carts'
    this.dataDir = config.dataDir || "./data";
    this.url = path.join(this.dataDir, `${fileName}.json`);
    this.data = [];
    this.requiredFields = config.requiredFields || []; // Campos requeridos para validación

    // Asegurar que el directorio existe
    this.#ensureDataDirectory();
  }

  // Método privado para asegurar que el directorio data existe
  #ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // Método privado para leer datos del archivo
  #readData() {
    try {
      if (!fs.existsSync(this.url)) {
        // Si el archivo no existe, crear uno vacío
        this.#writeData([]);
        return [];
      }
      const jsonData = fs.readFileSync(this.url, "utf-8");
      this.data = JSON.parse(jsonData);
      return this.data;
    } catch (err) {
      console.error(`Error reading file ${this.url}:`, err.message);
      this.data = [];
      return [];
    }
  }

  // Método privado para escribir datos en el archivo
  #writeData(data = this.data) {
    try {
      fs.writeFileSync(this.url, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error(`Error writing file ${this.url}:`, err.message);
      throw new Error("Error al escribir en archivo");
    }
  }

  // Método privado para validar campos requeridos
  #validateRequiredFields(data) {
    if (this.requiredFields.length === 0) {
      return { valid: true, missingFields: [] };
    }

    const dataKeys = Object.keys(data);
    const missingFields = [];

    this.requiredFields.forEach((field) => {
      if (!dataKeys.includes(field)) {
        missingFields.push(field);
      }
    });

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }

  // Método privado para generar ID único
  #generateId() {
    const data = this.#readData();
    if (data.length === 0) return 1;

    // Buscar el ID más alto y sumar 1
    const maxId = Math.max(
      ...data.map((item) => {
        // Manejar tanto IDs numéricos como strings
        const id =
          typeof item.id === "string"
            ? parseInt(item.id.replace(/\D/g, "")) || 0
            : item.id;
        return id;
      })
    );

    return maxId + 1;
  }

  // Método privado para hacer match de filtros
  #matchFilter(item, filter) {
    if (Object.keys(filter).length === 0) return true;

    return Object.entries(filter).every(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        // Operadores especiales (ej: { $gt: 10 }, { $in: [1,2,3] })
        return Object.entries(value).every(([operator, operatorValue]) => {
          switch (operator) {
            case "$eq":
              return item[key] === operatorValue;
            case "$ne":
              return item[key] !== operatorValue;
            case "$gt":
              return item[key] > operatorValue;
            case "$gte":
              return item[key] >= operatorValue;
            case "$lt":
              return item[key] < operatorValue;
            case "$lte":
              return item[key] <= operatorValue;
            case "$in":
              return operatorValue.includes(item[key]);
            default:
              return item[key] === value;
          }
        });
      }
      return item[key] === value;
    });
  }

  // Implementación de métodos de IRepository

  async findAll() {
    const data = this.#readData();
    return data;
  }

  async findById(id) {
    const data = this.#readData();
    return (
      data.find((item) => {
        // Manejar comparación flexible de IDs (string o number)
        return item.id == id;
      }) || null
    );
  }

  async findByFilter(filter) {
    const data = this.#readData();
    return data.find((item) => this.#matchFilter(item, filter)) || null;
  }

  async findManyByFilter(filter) {
    const data = this.#readData();
    return data.filter((item) => this.#matchFilter(item, filter)) || [];
  }

  async findPaginate(query = {}, limit = 10, page = 1, sort = {}) {
    const data = this.#readData();
    if (data.length > limit) {
      const startIndex = (parseInt(page) - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        docs: paginatedData,
        totalDocs: data.length,
        limit: limit,
        totalPages: Math.ceil(data.length / limit),
        page: parseInt(page),
        pagingCounter: startIndex + 1,
        hasPrevPage: startIndex > 0,
        hasNextPage: endIndex < data.length,
        prevPage: startIndex > 0 ? page - 1 : null,
        nextPage: endIndex < data.length ? parseInt(page) + 1 : null,
      };
    } else {
            return {
            docs: data,
            totalDocs: data.length,
            limit: data.length,
            totalPages: 1,
            page: 1,
            pagingCounter: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
            };
    }
  }

  async create(newData) {
    // Validar campos requeridos
    const validation = this.#validateRequiredFields(newData);
    if (!validation.valid) {
      throw new Error(
        `Error en los campos requeridos: ${validation.missingFields.join(", ")}`
      );
    }

    const data = this.#readData();

    // Generar ID si no existe
    if (!newData.id) {
      newData.id = this.#generateId();
    }

     //code validate
    if(this.data.some(item => item.code === newData.code)){
      throw new Error(`El code '${newData.code}' ya existe. Debe ser unico.`);
    }

    // Verificar que el ID no exista (solo si se proporcionó)
    const exists = data.find((item) => item.id == newData.id);
    if (exists) {
      throw new Error(`Ya existe un registro con id: ${newData.id}`);
    }


    // Agregar nuevo registro
    data.push(newData);
    this.#writeData(data);

    return newData;
  }

  async update(id, updateData) {
    const data = this.#readData();
    const index = data.findIndex((item) => item.id == id);

    if (index === -1) {
      return null;
    }

    // Actualizar manteniendo el ID original
    data[index] = {
      ...data[index],
      ...updateData,
      id: data[index].id, // Asegurar que el ID no cambie
    };

    this.#writeData(data);
    return data[index];
  }

  async updateMany(filter, updateData) {
    const data = this.#readData();
    let updatedCount = 0;

    const updatedData = data.map((item) => {
      if (this.#matchFilter(item, filter)) {
        updatedCount++;
        return { ...item, ...updateData, id: item.id };
      }
      return item;
    });

    this.#writeData(updatedData);
    return { modifiedCount: updatedCount };
  }

  async delete(id) {
    const data = this.#readData();
    const index = data.findIndex((item) => item.id == id);

    if (index === -1) {
      return null;
    }

    const deleted = data[index];
    data.splice(index, 1);
    this.#writeData(data);

    return deleted;
  }

  async deleteMany(filter) {
    const data = this.#readData();
    const toDelete = data.filter((item) => this.#matchFilter(item, filter));
    const remaining = data.filter((item) => !this.#matchFilter(item, filter));

    this.#writeData(remaining);
    return { deletedCount: toDelete.length };
  }

  async count(filter = {}) {
    const data = this.#readData();
    return data.filter((item) => this.#matchFilter(item, filter)).length;
  }

  async exists(filter) {
    const count = await this.count(filter);
    return count > 0;
  }

  // Métodos adicionales útiles para archivos locales

  async clear() {
    this.#writeData([]);
    return { deletedCount: this.data.length };
  }

  async backup(backupName) {
    const backupPath = path.join(
      this.dataDir,
      `${this.fileName}_backup_${backupName || Date.now()}.json`
    );
    fs.copyFileSync(this.url, backupPath);
    return backupPath;
  }
}

module.exports = LocalRepository;

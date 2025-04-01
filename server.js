require('dotenv').config(); // Cargar variables de entorno desde .env

const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors'); 
const app = express();

// Configuración de PostgreSQL con compatibilidad para local y Render
const client = new Client({
  user: process.env.DB_USER || 'postgres',         
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_garden_db', 
  password: process.env.DB_PASS || '123',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

client.connect()
  .then(() => console.log("📡 Conectado a PostgreSQL"))
  .catch(err => console.error("❌ Error de conexión:", err));

app.use(express.json());
app.use(cors()); 

app.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = $1';
    const emailResult = await client.query(checkEmailQuery, [email]);

    if (emailResult.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = 'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(insertUserQuery, [nombre, email, hashedPassword]);

    res.status(201).json({ message: 'Usuario registrado con éxito', user: result.rows[0] });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

const register = async () => {
    try {
      console.log("Datos a enviar:", {
        nombre: name.value,
        email: email.value,
        password: password.value
      });
  
      const response = await axios.post('http://localhost:3000/registro', {
        nombre: name.value,
        email: email.value,
        password: password.value,
      });
  
      alert(response.data.message);
  
      router.push('/login');
    } catch (error) {
      console.error("Error detallado:", error); 
      alert(error.response?.data?.message || 'Error al registrar');
    }
  };

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const findUserQuery = 'SELECT * FROM usuarios WHERE email = $1';
    const userResult = await client.query(findUserQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso', user });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// Configuración del puerto con compatibilidad para Render y local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
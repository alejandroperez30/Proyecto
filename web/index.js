// Dependencias //

const http = require('http'); // Para gestión de archivos web //
const express = require('express'); // Generar la aplicación //
const app = express();
const sqlite3 = require('sqlite3').verbose(); // Para el manejo de la base de datos e información detallada en errores //
const path = require('path'); // Para gestionar enlaces y recursos en general //


app.use(express.static(__dirname+'/'))

// Config del server //

app.set("view engine", "ejs"); // Motor de plantilla con ejs //
app.set("views", path.join(__dirname, "")); // Para gestión de rutas //
app.use(express.urlencoded({extended:false})); // Recuperacion de  valores en un request //
app.listen(4000); // Puerto para el proyecto //
console.log("Conexión establecida en el puerto 4000"); // Mensaje de verificación de conexión exitosa //

// Base de Datos //

const db_name = path.resolve(__dirname,"database", "bdatos.db");
const db = new sqlite3.Database(db_name, err =>{
if (err) {
   return console.error(err.message);
}
else {
console.log("Conexion exitosa con la Base de Datos");
}
});

// Tablas //

const sql_create = "CREATE TABLE IF NOT EXISTS Categorias(ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Categoria TEXT NOT NULL)"

db.run(sql_create, err =>{
if (err) {
return console.error(err.message);
}
else{
console.log("Tabla Categorias creada exitosamente");
}
});

const sql_create2 = "CREATE TABLE IF NOT EXISTS Productos(ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Producto TEXT NOT NULL,Codigo TEXT NOT NULL,Categoria_ID INTEGER,Existencia_Actual INTEGER NOT NULL,Precio REAL NOT NULL,FOREIGN KEY (Categoria_ID) REFERENCES Categorias(id))";

db.run(sql_create2, err =>{
    if (err) {
    return console.error(err.message);
    }
    else{
    console.log("Tabla Productos creada exitosamente");
    }
    });
    
// Enrutamientos //

app.get('/', (req,res) =>{
   res.render('index.ejs')
   });
   
app.get('/categorias', (req,res) =>{
      res.render('categorias.ejs')
      });

app.get('/catalogo', (req,res) =>{
      res.render('catalogo.ejs')
      });

app.get('/productos', (req,res) =>{
      const sql="SELECT * FROM Productos ORDER BY Producto";
db.all(sql, [], (err, rows)=>{
if (err) {
return console.error(err.message);
}
else{
res.render("Productos.ejs",{modelo:rows});
}
})
});

// Registrar nuevo producto //

app.get('/registrar', (req,res) =>{
      res.render('registrar.ejs',{modelo: {}})
      });

app.post('/registrar', (req,res) =>{
      const sql="INSERT INTO Productos(ID, Producto, Codigo, Existencia_Actual, Precio) VALUES (?,?,?,?,?)";
     const nuevo_producto=[req.body.ID, req.body.Producto, req.body.Codigo, req.body.Existencia_Actual, req.body.Precio];
     // const nuevo_producto =["New Balance 550", "#P1", 100, 1500 ];
      db.run(sql, nuevo_producto, err=>{
      if (err){
            return console.error(err.message);
      }
      else{
      res.redirect("/productos");
      }
})
});

// Editar productos por ID //

app.get("/editar/:id",(req,res)=>{
      const id=req.params.id;
      const sql="SELECT * FROM Productos WHERE ID=?"
      db.get(sql,id,(err, rows)=>{
      res.render("editar.ejs",{modelo: rows})
      })
})
      
app.post("/editar/:id",(req, res)=>{
const id=req.params.id;
const info_producto=[req.body.Producto, req.body.Codigo, req.body.Existencia_Actual, req.body.Precio, id];
const sql="UPDATE Productos SET Producto=?, Codigo=?, Existencia_Actual=?, Precio=? WHERE (ID=?)";

db.run(sql, info_producto, err =>{
      if (err){
      return console.error(err.message)
      }
      else{
res.redirect("/productos");
      }
      });
      })
            
// Eliminar por ID //

app.get("/eliminar/:id",(req,res)=>{
      const id=req.params.id;
      const sql="SELECT * FROM Productos WHERE ID=?"
      db.get(sql,id,(err, rows)=>{
      res.render("eliminar.ejs",{modelo: rows})
      })
})

app.post("/eliminar/:id",(req, res)=>{
      const id=req.params.id;
      const sql="DELETE FROM Productos WHERE ID=?";
      
      db.run(sql, id, err =>{
            if (err){
            return console.error(err.message)
            }
            else{
      res.redirect("/productos");
            }
      });
})

// Metodo final //

app.get('/*', (req,res) =>{
      res.render('noencontrado.ejs')
      });

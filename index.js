"use strict"
const fs = require("fs"); //Lee todo el contenido de un archivo.
const pathN = require("path");
const marked = require('marked'); //Libreria para obtener links, text, file
const https = require('https');
const FileHound = require('filehound');


let path = process.argv[2];
//convierte en ruta absoluta la ruta ingresada (path.resolve)
path = pathN.resolve(path);
//normaliza la ruta si hay errores de semantica
path = pathN.normalize(path);



//Función para encontrar archivos .md dentro un directorio -> FileHound
const findFiles = (path =>{
  return new Promise((resolve,reject) => {
    FileHound.create()
    .paths(path)
    .ext('md')
    .find()
    .then(files => {
      if(files.length != 0){
      resolve(files)}
      reject(new Error("No se encontraron archivos .md dentro de " + path))
    })
    .catch(err => {
      reject(new Error("Esta ruta no existe, inténtalo con otra"))
    })
  })
})



//Leyendo archivo.md -> Funcion tipo promesa para leer archivo Markdown
const fileRead = () => {
  const data = new Promise((resolve, reject) => {

    //Obtengo de forma sincrona el archivo markdown con un metodo de node
    fs.readFile(path, 'utf-8', (err, result) => {
      if (err) {
        reject(`${err}`)
      }
      resolve(result);
    })
  })
  return data;
}


//Funcion para Obtener array de objet -> usando renderer para obtener links
const getLinks = () => {
  const res = new Promise((resolve, reject) => {
    fileRead()
      .then(data => {

        let links = [];
        let renderer = new marked.Renderer();

        renderer.link = function (href, title, text) {

          links.push({
            href: href,
            text: text,
            file: path
          })
        };

        marked(data, { renderer: renderer });
        if (links.length === 0) {
          reject(new Error("Este archivo no contiene links"))
        }
        resolve(links);

      }).catch(err => reject(err.messsage))
  })
  return res;
}


//Funcion que crea un array de links
const Links = () => {

  const statistics = new Promise((resolve, reject) => {
    getLinks()
      .then(res => {
        let arraylinks = res.map(item => {
          return { href: item.href }
        })
        resolve(arraylinks)
      })
  })
  return statistics
}

Links().then(statistics => console.log(statistics))




//Función que comprueba si path es archivo.md o directorio
const fileOrDirectory = (path) => {
  //comprueba si es archivo .md
  if(isMd(path)){
    return getLinks()
  }
  //si es directorio
  else {
      return new Promise((resolve, reject) => { 
        findFiles(path)
        .then(files => {
          findInDirectory(files)
          .then(links => {
            resolve(links)
          })
        }).catch(err =>{
          reject(new Error(err.message))
        })
      })
    }
  }
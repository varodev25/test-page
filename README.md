# demo-public-page

Esta es una página de pruebas de contenedores y CICD.

## Instrucciones
### Docker
```bash
# build the image
docker build -t demo-public-page:v1.0.0 .
# run the image
docker run -p 3000:3000 --name demo-page demo-public-page:v1.0.0
```


# Variables de entorno

El servidor soporta las siguientes variables de entorno para su configuración:

| Variable   | Descripción                                            | Valor por defecto         |
| :--------- | :----------------------------------------------------- | :------------------------ |
| `BG_COLOR` | Color de fondo personalizado de la página              | `#030712c3`               |
| `VERSION`  | Versión de la aplicación expuesta en la API y el modal | Versión de `package.json` |
| `PORT`     | Puerto en el que escucha el servidor Bun               | `3000`                    |


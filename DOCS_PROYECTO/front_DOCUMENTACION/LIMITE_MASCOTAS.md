# Límite visual de mascotas

El formulario de registro permite crear hasta cinco mascotas por usuario. Si la API responde con `MASCOTAS_LIMITE_ALCANZADO`, `FormularioMascota` reemplaza el formulario por un estado visual de `EmptyState`.

El estado usa `vacio-mascotas.webp`, una ilustración existente del proyecto, y muestra el mensaje `Ya tienes 5 mascotas registradas`, una explicación, recomendaciones y el enlace `Ver mis mascotas` hacia `/mascotas`.

La regla se aplica primero en backend para proteger el dato; el frontend solo representa el resultado de negocio y no se utiliza como único mecanismo de seguridad.

# Notas del council sobre VeraShield (2026-11-02)

Resumen de un ejercicio de cinco perspectivas (Contrarian, Primeros Principios, Expansionista, Outsider, Ejecutor) sobre el estado actual de VeraShield. Es una opinion de trabajo, no un dictamen. No se verificaron las reglas del Conrad Challenge, la encuesta de mas de 500 menores ni las 10 cartas institucionales: se toman como las describio la persona responsable.

## Estado de partida
Herramienta web sin cuentas ni almacenamiento, en es/en/hi, para Mexico, India y EE. UU. Flujo "ayuda primero" (respirar, contarlo, frenar la difusion, adulto, cuidarse). El analisis con Sightengine es opcional. Carta y PDF para la escuela (solo Mexico), pagina para adultos, datos con estado verificado, parcial o pendiente. Sin revision de abogadas ni de psicologia infantil.

## 1. Posibilidades en un concurso como el Conrad Challenge
No hay un porcentaje honesto. A favor: necesidad demostrada (encuesta con mas de 500 menores), apoyo institucional (10 cartas), problema serio, postura honesta sobre limites. En contra: no hay evidencia de impacto medido, falta validacion experta, y suelen valorarse sostenibilidad o modelo de negocio. Por verificar: edad y composicion del equipo, categorias, fechas y criterios actuales.

## 2. Un nivel mas profundo y reconocido
Posicionarlo como catalogo abierto y verificable de rutas de retiro y ayuda por pais (fuente, fecha y estado), con revision de abogadas y alianza con una o dos organizaciones. Un piloto documentado con retiros reales pesa mas que mas funciones. El valor esta en la ruta verificada, no en el detector.

## 3. El cambio pequeno con mayor impacto
Pasar el resultado del detector de porcentaje a rangos (bajo, medio, alto). Protege de la falsa tranquilidad, reduce la utilidad del detector para quien quiera evadirlo y es mas honesto. HECHO en esta iteracion, junto con un limite de peticiones.
Alternativa a revisar: boton de WhatsApp precargado "Mandar a un adulto" (no se comprobo si ya existe).

## 4. Que sigue sin verificarse
- Precision del detector con casos reales de adolescentes (no hay prueba propia).
- Que SIGHTENGINE_API_USER y SIGHTENGINE_API_SECRET esten en Vercel.
- Tension entre capturas de pantalla (recomendadas en manuales) y CPF 202 Bis (almacenar material de menores).
- LGAMVLV: protege a mujeres y ninas.
- Leyes de Jalisco y Oaxaca; Policia Cibernetica 088; plazo de retiro en India (24 h o 2 h); POCSO en detalle; penas del TAKE IT DOWN Act.
- Que cada plataforma siga usando el mismo formulario.
- Hindi y textos de psicologia sin revision experta.
- Que la carta a la escuela produzca respuesta (sin evidencia).
- ODI, sin contactar.

## 5. Defensa ante mal uso
- Evasion del detector: rangos en lugar de porcentajes (hecho); limite de peticiones por conexion (hecho, best-effort); verificacion anti-bots (pendiente).
- Costo abusivo de la API: limite diario y alerta de gasto en el proveedor (pendiente).
- Subir imagenes de menores a un servicio externo: la guardia de contenido ya bloquea; falta un aviso de que subir material sexual de menores puede ser delito.
- Carta usada contra otra persona: ya prohibe nombrar agresores; falta una linea visible de que no es una acusacion y que debe revisarla un adulto.
- Vigilancia por un agresor cercano: Salir rapido existe; falta nota sobre historial y dispositivos compartidos.
- Falsas denuncias: el texto debe decir que decide la autoridad.

## 6. Las cinco cosas que no estamos viendo
1. Etica de la encuesta con menores: consentimiento de madres, padres o tutores, anonimato y que se puede publicar.
2. Cero medicion de resultados: no se sabe cuantas personas completan pasos o logran retirar contenido. Hace falta una forma de medir sin comprometer la privacidad (pilotos observados y encuesta posterior).
3. Quien mantiene el catalogo: sin responsable, los datos caducan y los enlaces mueren.
4. Que el agresor sea otro menor del mismo salon: cambia el marco legal (justicia para adolescentes) y la ruta escolar. Falta una via escolar y restaurativa.
5. No hay una persona humana en ningun punto del flujo. Una alianza que garantice atencion humana o una linea destacada en el primer paso.

## Recomendacion del presidente del council
1. Validar antes de crecer: revision legal por pais, hindi revisado, claves de Sightengine confirmadas.
2. Rangos y limites anti-abuso (hechos).
3. Piloto observado con 10 adolescentes midiendo si completan el flujo.
4. Para el concurso: historia de una adolescente (anonimizada), metodologia de la encuesta con consentimiento y quien mantendra el catalogo.

Desacuerdo principal: el Expansionista quiere crecer hacia un catalogo abierto internacional; el Contrarian y el Ejecutor piden validar primero. Crecer sobre datos sin validar multiplica errores.

## Cambios hechos a raiz de estas notas
- El servidor ya no devuelve el puntaje numerico, la probabilidad ni el generador: solo nivel (bajo, medio, alto) y si parece cambio de rostro. La pantalla y el PDF muestran el nivel, nunca un numero.
- Limite de peticiones en /api/detect y /api/detect-video: 8 analisis por 10 minutos por conexion (se cambia con DETECT_RATE_MAX y DETECT_RATE_WINDOW_MS). Es best-effort: el contador vive en la memoria de cada instancia, que no se comparte entre instancias de Vercel. Para un limite firme hace falta un almacen compartido o la proteccion del proveedor. La direccion se guarda solo como huella con sal aleatoria y se olvida en minutos. La pagina de privacidad lo dice.

// ------------------------------
// 🟦 Plantilla Oficio 5.1 y 5.2
// ------------------------------
export function oficio51y52(datos) {
  return `
En respuesta a la petición recibida a través del Sistema de Administración y Seguimiento de Correspondencia (Hermes) identificada con el folio ${datos.folio}, en relación a la ocupación temporal de la plaza ${datos.plaza}, misma que deriva del ${datos.motivo} del C. ${datos.titularPlaza} quien ocupaba la plaza con categoría ${datos.categoriaOrigen}, al respecto, con fundamento en los artículos 210 y 211 del Estatuto General de la Universidad Veracruzana, para no interferir en el desarrollo de las actividades sustantivas y el cumplimiento de resultados de la Dependencia, se autoriza la ocupación temporal de la plaza como suplente con categoría de ${datos.categoriaAutorizada} al C. ${datos.candidato} a partir del 15 de octubre y hasta el 31 de diciembre de 2025; lo anterior, en tanto se efectúa el proceso, conforme a lo indicado en los numerales 1.4, 5.1 y 5.2 de los “Lineamientos para la ocupación de plazas vacantes del personal administrativo de Confianza” para ocupar la plaza de manera definitiva. No omito mencionar que no se reconocerán compromisos contraídos previos a la presente autorización ni los que excedan el periodo reconocido formalmente.

Se adjunta cédula de resultados.

Por lo anterior, atentamente se solicita, realizar el movimiento de alta en el Subsistema de Recursos Humanos, tal como se establece en la Guía para la captura de movimientos de alta de personal en SsRH.

Sin más por el momento, aprovecho la ocasión para enviarle saludos cordiales.
  `.trim();
}

// ------------------------------
// 🟩 Plantilla Oficio 4.1 y 4.2
// ------------------------------
export function oficio41y42(datos) {
  return `
En atención al oficio XXXX recibido a través del Sistema de Administración y Seguimiento de Correspondencia (Hermes) identificado con folio número ${datos.folio}, en relación a la ocupación temporal de la plaza ${datos.plaza}, misma que deriva de ${datos.motivo} del C. ${datos.titularPlaza} quien ocupaba la plaza con categoría ${datos.categoriaOrigen}; al respecto, con fundamento en los artículos 210 y 211 del Estatuto General de la Universidad Veracruzana, para no interferir en el desarrollo de las actividades sustantivas y el cumplimiento de resultados de la Dependencia a su digno cargo, se autoriza la continuidad de la ocupación temporal de la plaza como interino por persona en la categoría ${datos.categoriaAutorizada} al C. ${datos.candidato} a partir del 01 de julio y hasta el 31 de diciembre de 2025; lo anterior, en tanto se efectúa el proceso de convocatoria, conforme a lo indicado en los numerales 1.4, 4.1 y 4.2 de los “Lineamientos para la ocupación de plazas vacantes del personal administrativo de Confianza” para ocupar la plaza de manera temporal. No omito mencionar que no se reconocerán compromisos contraídos previos a la presente autorización ni los que excedan el periodo.

Por lo anterior, se solicita atentamente, realizar el movimiento de alta en el Subsistema de Recursos Humanos, tal como se establece en la Guía para la captura de movimientos de alta de personal en SsRH.

Sin más por el momento, aprovecho la ocasión para enviarle saludos cordiales.
  `.trim();
}

export function oficio43Licencia(datos) {
  return `
En respuesta a su petición recibida a través del Sistema de Administración y Seguimiento de Correspondencia (Hermes) identificada con folio número${datos.folio} , en relación a la ocupación de la plaza ${datos.plaza} con una categoría de ${datos.categoriaOrigen}, misma que deriva ${datos.motivo} deL C. ${datos.titularPlaza} ; al respecto, en cumplimiento a los artículos 210 y 211 del Estatuto General de la Universidad Veracruzana y al numeral 4.3 de los “Lineamientos para la ocupación de plazas vacantes del personal administrativo de Confianza”; y con la finalidad de no afectar las actividades sustantivas de la Dependencia, se autoriza la continuidad de la ocupación temporal de la plaza como interino por persona con categoría ${datos.categoriaAutorizada} al C. ${datos.candidato} a partir del 01 de noviembre y hasta el 31 de diciembre de 2025.

Por lo anterior, atentamente se solicita, realizar el movimiento de alta en el Subsistema de Recursos Humanos, tal como se establece en la Guia para la captura de movimientos de alta de personal en SsRH    

Sin más por el momento, aprovecho la ocasión para enviarle saludos cordiales.
    `.trim();
}

export function oficio43Medica(datos) {
  return `
En respuesta a su solicitud recibida a través del Sistema de Administración y Seguimiento de Correspondencia (Hermes) con folio ${datos.folio} , referente a la ocupación de la plaza ${datos.plaza} , derivada de la incapacidad médica de la C. ${datos.titularPlaza} quien ocupaba la plaza con una categoría de ${datos.categoriaOrigen} ; al respecto en cumplimiento a los artículos 210 y 211 del Estatuto General de la Universidad Veracruzana, le informo que a partir de un análisis de la descripción de puesto y perfil relacionado a la ocupación del puesto, se identificó que el perfil de la  C. ${datos.candidato}  no es recomendable para su contratación, motivo por el cual, se solicita respetuosamente pueda proponer a una persona o personas candidatas que cumplan con los requisitos de contratación.

En caso de no contar con aspirantes se le podrá proporcionar de la Bolsa de Talento de esta Dirección General de Recursos Humanos algunos aspirantes que cumplan con el perfil profesional correspondiente para cubrir la necesidad institucional.
Sin más por el momento, aprovecho la ocasión para enviarle saludos cordiales.
    `.trim();
}

export function oficioCita(datos) {
  return `
En atención al Hermes  ${datos.folio} , relacionada con la ocupación de la plaza ${datos.plaza} , al respecto le informo que se realizará la evaluación correspondiente al C. ${datos.candidato} en la Oficina de Evaluación de Personal, ubicada en el último piso de la USBI región Xalapa, por lo que deberá notificarle al candidato propuesto que se presente en la hora y día indicado.
  
  
Sin más por el momento, aprovecho la ocasión para enviarle saludos cordiales.

    `.trim();
}

export function copiaCarbon() {
  return `
C.c.p. Mtra. Lizbeth Margarita Viveros Cancino. Secretaria de Administración y Finanzas. Para su conocimiento.
C.c.p. Mtra. Liliana Ruíz Mendoza. Directora de Personal. Mismo fin.
C.c.p. Lic. María Guadalupe Vázquez Castillo. Jefa del Departamento de Evaluación y Desarrollo de Personal. Mismo fin.
C.c.p. Mtro. Hugo Armenta Cuevas. Jefe de Departamento de Control de Personal Administrativo. Mismo fin.
C.c.p. Mtro. Álvaro Vallejo Carmona. Jefe de la Oficina de Evaluación de Personal y Proyectos de Recursos Humanos. Mismo fin.
C.c.p. Lic. Martha Dolores Herrera Hernández. Secretaria General del AFECUV. Mismo fin
C.c.p. Archivo.
  `.trim();
}

import type { Dict } from "./en";

export const es: Dict = {
  meta: {
    title: "Cessna 150 – Guía Interactiva",
    description:
      "Una guía interactiva del Cessna 150 — velocidades, flaps, combustible, compensador y procedimientos, en instrumentos que podés tocar.",
  },
  hero: {
    overline: "UNA GUÍA INTERACTIVA",
    subtitle: "LENTO, SIMPLE, QUERIDO",
    subtitleSecond: "CONTINENTAL O-200-A",
    description:
      "Dos asientos, un ala alta, cien caballos sin apuro. Ese es todo el avión. Pide muy poco y te da lugar para aprender todo, y por eso casi ninguno se olvida del suyo.",
    cta: "EXPLORAR AVIÓN",
    procedures: "PROCEDIMIENTOS",
    specsTitle: "ESPECIFICACIONES DEL AVIÓN",
    specs: {
      model: "MODELO",
      seats: "ASIENTOS",
      production: "PRODUCCIÓN",
      engine: "MOTOR",
      hp: "HP",
      mtow: "MTOW",
    },
  },
  heritage: {
    section: "LEGADO",
    heading: "El clásico entrenador biplaza",
    p1Pre: "El ",
    p1Aircraft: "Cessna 150",
    p1Post:
      " es uno de los entrenadores más volados de la historia. Honesto, noble y barato de operar, le enseñó a volar a generaciones de pilotos, y todavía se lo ve en aeroclubes y escuelas de todo el mundo.",
    p2:
      "Los datos salen del Owner's Manual de Cessna de 1969 para el Modelo 150J, cuyo Type Certificate de la FAA es",
    p3:
      "Se fabricó entre 1958 y 1977 y después lo reemplazó el Cessna 152, con unas 24.000 unidades en todas sus variantes. Pocos entrenadores se hicieron en esa cantidad.",
    facts: {
      firstFlight: "PRIMER VUELO",
      production: "PRODUCCIÓN",
      units: "UNIDADES",
      refPoh: "POH DE REFERENCIA",
    },
  },
  overview: {
    title: "Generalidades del Avión",
    intro:
      "El Cessna 150 en números, tal como los publicó el Owner's Manual de 1969 del modelo ‘J’. Motor, pesos, velocidades y los límites con los que realmente volás.",
    specs: {
      engine: { label: "Motor", value: "Continental O-200-A", detail: "4 cil. refrigerado por aire · 100 HP @ 2.750 RPM" },
      propeller: { label: "Hélice", value: "Paso Fijo", detail: "McCauley 1A101 · 69 in de diámetro" },
      fuel: { label: "Combustible", value: "26 gal US", detail: "22,5 utilizables · 80/87 mín. (100LL OK)" },
      emptyWeight: { label: "Peso Vacío", value: "1.005 lb", detail: "Config. trainer (típico)" },
      usefulLoad: { label: "Carga Útil", value: "595 lb", detail: "Piloto + pasajero + equipaje + combustible" },
      ceiling: { label: "Techo de Servicio", value: "12.650 ft", detail: "Día estándar, peso máximo" },
      cruise: { label: "Velocidad de Crucero", detail: "75% potencia · 7.000 ft (TAS)" },
      range: { label: "Autonomía", value: "475 sm", detail: "75% @ 7.000 ft, 22,5 gal, sin reserva" },
    },
    limits: {
      heading: "LIMITACIONES PRINCIPALES",
      note: "Limitaciones POH (CAS)",
      vne: "Nunca exceder (línea roja)",
      vno: "Máx. crucero estructural",
      va: "Maniobra",
      vs0: "Pérdida, flaps 40°",
    },
  },
  airspeed: {
    title: "Velocidades V",
    intro:
      "Todas las velocidades que importan en el 150 viven en un solo dial, y los arcos de colores piensan casi todo por vos. El blanco es donde se permiten los flaps, el verde es el vuelo normal de todos los días, el amarillo es sólo para aire calmo, y la línea roja es la velocidad que nunca cruzás. Aprendé los colores y casi no vas a necesitar los números.",
    intro2:
      "Los arcos coinciden con el Owner's Manual de 1969 del 150J, en velocidad calibrada. Pasá el cursor por el dial de abajo y cada banda te dice qué está haciendo el avión a esa velocidad.",
    callout:
      "La mayoría de los 150 tienen su POH y su anemómetro marcados en MPH. Algunos aviones tienen la aviónica actualizada y leen en nudos. Usá el toggle para cambiar las unidades.",
    callout_mphStrong: "MPH",
    zones: {
      white: "Arco Blanco",
      green: "Arco Verde",
      yellow: "Arco Amarillo",
      red: "Línea Roja",
    },
    pilotNote: "NOTA AL PILOTO",
    pilotNoteBody:
      "El rango operativo de flaps es el arco blanco ({white}). El arco amarillo sólo se opera en aire calmo. Está prohibido operar por encima de la línea roja ({red}).",
    current: "LECTURA ACTUAL",
    digit: { airspeed: "VELOCIDAD" },
    contexts: {
      idle: "Pasá el cursor sobre el dial para ver qué representa cada velocidad.",
      belowStall: {
        label: "Bajo Pérdida",
        body: "El avión no puede sostener el vuelo a esta velocidad, ni siquiera con flaps totalmente extendidos.",
      },
      flapsOnly: {
        label: "Requiere Flaps",
        body: "Por debajo de la velocidad de pérdida limpia (VS1). El avión solo puede volar con flaps extendidos; en configuración limpia entra en pérdida.",
      },
      normalFlaps: {
        label: "Normal · Flaps Permitidos",
        body: "Dentro del arco blanco y del arco verde. Los flaps pueden extenderse o replegarse según lo requiera la maniobra.",
      },
      normalClean: {
        label: "Normal · Sin Flaps",
        body: "Por encima de la velocidad máxima con flaps extendidos (VFE). Los flaps deben permanecer replegados para no exceder el límite estructural.",
      },
      caution: {
        label: "Precaución",
        body: "Arco amarillo. Operar sólo en aire calmo y evitar comandos bruscos.",
      },
      exceed: {
        label: "Nunca Exceder",
        body: "Por encima de VNE. Operación prohibida; riesgo de falla estructural.",
      },
    },
  },
  units: {
    title: "MPH, Nudos y el C150",
    intro:
      "Los pilotos que se entrenan en el 150 se topan con una rareza el primer día: el anemómetro y el POH hablan en MPH, mientras las cartas modernas, el ATC y la aviónica hablan en nudos. Si creciste con el sistema métrico, las dos son extrañas. Abajo: el decodificador, la historia y un slider para sentir cada velocidad.",
    decoder: {
      title: "DECODIFICADOR — SI VES...",
      intro:
        "Cada unidad estatuta a la izquierda tiene su contraparte náutica a la derecha. KIAS / MIAS son lo que marca el dial; KTAS / MTAS son la velocidad real del aire pasando por el avión, corregida por altitud y temperatura.",
      statuteHeading: "ESTATUTA · BASE MILLA",
      nauticalHeading: "NÁUTICA · BASE NUDO",
      items: {
        sm: "Milla estatuta · 1.609 m (la milla de ruta de EE.UU.)",
        mph: "Millas estatutas por hora",
        mias: "Velocidad indicada en mph (lectura cruda del dial)",
        mtas: "Velocidad real en mph (corregida — la velocidad real)",
        nm: "Milla náutica · 1.852 m (un minuto de arco)",
        kts: "Nudos · millas náuticas por hora (1 KT = 1 NM/h)",
        kias: "Velocidad indicada en nudos (lectura cruda del dial)",
        ktas: "Velocidad real en nudos (corregida — la velocidad real)",
      },
    },
    whyMph: {
      label: "POR QUÉ EL C150 ESTÁ EN MPH",
      body:
        "El Cessna 150 fue diseñado a fines de los años '50, cuando la aviación general en Estados Unidos medía la velocidad en millas estatutas por hora. El Owner's Manual 1969 del 150J lista cada velocidad de referencia — VS, VFE, VNE, VY, VX — en MPH IAS. No era una excepción: era el estándar de los aviones livianos de la época. Cessna recién empezó a entregar monomotores con el anemómetro marcado en nudos a mediados de los '70.",
    },
    whyKnots: {
      label: "POR QUÉ LA AVIACIÓN MODERNA USA NUDOS",
      body:
        "ICAO, la FAA, EASA y prácticamente todos los fabricantes estandarizaron en nudos. La razón es geométrica: un minuto de latitud equivale exactamente a una milla náutica, lo que reduce la navegación a aritmética mental. Una velocidad sobre tierra de 60 nudos cubre un minuto de latitud por cada minuto de vuelo — tiempo, distancia y rumbos encajan sin factores de conversión.",
    },
    smVsNm: {
      label: "MILLA ESTATUTA vs MILLA NÁUTICA",
      body:
        "La milla estatuta (sm) es la milla de ruta estadounidense: 1.609,34 m. La milla náutica (nm) es geometría terrestre — 1.852 m, exactamente un minuto de arco a lo largo de un círculo máximo. Un nudo es una milla náutica por hora. Como la milla náutica es ~15% más larga que la estatuta, la misma velocidad real se lee con un número más chico en nudos que en MPH.",
    },
    modernized: {
      label: "150 MODERNIZADOS",
      body:
        "Muchos 150 que siguen volando tienen el panel actualizado. Vas a encontrar anemómetros marcados sólo en nudos, o diales de doble escala que muestran MPH y nudos en paralelo (uno en el anillo externo y el otro en el interno). Antes de volar siempre confirmá qué escala usa tu avión — y en qué unidades viene el suplemento del POH.",
    },
    exactTitle: "FÓRMULA EXACTA",
    exactBody:
      "Multiplicá por el factor de conversión y redondeá a la unidad más cercana.",
    exactKtsToMph: "MPH = KTS × 1,15078",
    exactMphToKts: "KTS = MPH × 0,86898",
    exactNote:
      "1 milla náutica = 1,15078 millas estatutas · 1 milla estatuta = 0,86898 millas náuticas. Métrico: 1 KT = 1,852 km/h · 1 MPH = 1,609 km/h.",
    slider: {
      title: "PROBALO — CONVERTIDOR DE VELOCIDAD",
      intro:
        "Arrastrá el slider. La misma velocidad aparece en MPH, nudos y km/h, y la caja de abajo describe qué estaría haciendo el C150 a esa velocidad.",
      hint: "Arrastrá para cambiar la velocidad →",
      mphFull: "Millas estatutas/h",
      ktsFull: "Nudos",
      kmhFull: "Kilómetros/hora",
      contextLabel: "A ESTA VELOCIDAD, EL C150 ESTÁ…",
      contexts: {
        taxi: {
          label: "Rodando o parado",
          body:
            "Por debajo de la velocidad en la que el ala puede sustentar al avión. Esto es ritmo de rodaje o menos — pies en los pedales, mano en el acelerador, nariz al viento.",
        },
        belowStall: {
          label: "Debajo de la velocidad de pérdida",
          body:
            "El ala no genera sustentación suficiente para mantener el vuelo. El avión estaría cayendo, no volando. La bocina de pérdida estaría sonando.",
        },
        stallRegime: {
          label: "Régimen de pérdida",
          body:
            "Con flaps 40° el avión entra en pérdida a VS0 = 48 MPH. Limpio (sin flaps) entra en pérdida más alto, a VS1 = 55 MPH. El arco blanco del anemómetro arranca acá.",
        },
        slowFlight: {
          label: "Vuelo lento con flaps",
          body:
            "Dentro del arco blanco. La final de campo corto se vuela a 58 MPH con flaps 40°. Despacio, nariz arriba, mucho acelerador para mantener altitud.",
        },
        vxGlide: {
          label: "Mejor ángulo / mejor planeo",
          body:
            "VX = 64 MPH da el ascenso más empinado — más altura por distancia recorrida en el suelo, se usa cuando hay un obstáculo después del despegue. El mejor planeo motor parado es 65 MPH.",
        },
        vyClimb: {
          label: "Mejor régimen de ascenso",
          body:
            "VY = 73 MPH da la mayor altura por unidad de tiempo. Es la actitud estándar de ascenso después del despegue cuando no hay obstáculos al frente.",
        },
        pattern: {
          label: "Velocidad de circuito",
          body:
            "Velocidad de tránsito en el circuito: subiendo, viento en cola, base. Dentro del arco blanco (flaps permitidos) y del arco verde (operación normal).",
        },
        cruise: {
          label: "Crucero",
          body:
            "Rango operativo normal. ~110 MPH es lo típico al 75% de potencia y 7.000 ft. Los flaps deben estar replegados arriba de VFE = 100 MPH.",
        },
        caution: {
          label: "Precaución — arco amarillo",
          body:
            "Arriba de VNO = 120 MPH (máximo crucero estructural). Operar sólo en aire calmo, sin comandos bruscos — una ráfaga podría sobre-exigir la célula.",
        },
        vne: {
          label: "Arriba de VNE — prohibido",
          body:
            "Pasaste la línea roja en 162 MPH. Operación prohibida — riesgo de falla estructural o flutter en superficies de control.",
        },
      },
    },
    quickTitle: "REGLA RÁPIDA (+10)",
    quickBody:
      "Para las velocidades que realmente volás, un atajo mental útil:",
    quickKtsToMph: "MPH ≈ KTS + 10",
    quickMphToKts: "KTS ≈ MPH − 10",
    quickAccuracy:
      "Precisión dentro de ~3 unidades entre 60 y 90 KTS. Por encima de 100 KTS la regla se queda corta — a 110 KTS el valor real es 127 MPH, la regla da 120. Para velocidades altas usá +15% (multiplicá por 1,15) en su lugar.",
  },
  stall: {
    title: "Velocidad de Pérdida y Banqueo",
    intro:
      "Banqueá el avión y el ala tiene que generar más sustentación sólo para mantener la altura. Esa carga extra sube la velocidad a la que entra en pérdida, y cuanto más cerrado el viraje, más sube esa velocidad. Los valores acá son las velocidades de pérdida del POH del 150J: sin potencia, 1.600 lb, velocidad calibrada.",
    flapConfigs: {
      up: "Flaps ARRIBA",
      twenty: "Flaps 20°",
      forty: "Flaps 40°",
    },
    bankIndicator: "INDICADOR DE BANQUEO",
    stallSpeed: "VELOCIDAD DE PÉRDIDA",
    loadFactor: "FACTOR DE CARGA",
    chartTitle: "VEL. DE PÉRDIDA vs BANQUEO",
    chartCaption: "{config} · sin potencia · 1.600 lb · base {base}",
    chartXAxis: "Banqueo",
    chartYAxis: "Vel. de Pérdida ({unit})",
    chartStallTooltip: "Vel. de Pérdida",
    remember: "RECORDÁ",
    rememberBody:
      "A 60° de banqueo estás tirando 2 G y la velocidad de pérdida sube alrededor del 41%. Un viraje cerrado y bajo es el peor lugar para descubrirlo, así que dejá margen.",
  },
  flaps: {
    title: "Configuración de Flaps",
    intro:
      "El Cessna 150 tiene flaps totalmente eléctricos. Un motor DC en la raíz del ala mueve un husillo (jackscrew) que extiende o repliega los tirantes de los flaps, controlado desde la cabina por una llave de tres posiciones (UP / OFF / DOWN) en el panel. El motor corre sólo mientras mantenés presionada la llave, así que mirás el indicador analógico de posición y la soltás en la deflexión deseada. El circuito está protegido por un fusible SLO-BLO (POH §2-3). La velocidad máxima con cualquier deflexión de flap (VFE) es {vfe} según POH §3-2, coincidente con el extremo superior del arco blanco del anemómetro. El POH §2-9 indica que 30° y 40° \"no se recomiendan en ningún momento para despegue\", y §2-10 pide reducir inmediatamente a 20° en un motor y al aire.",
    intro2:
      "Los flaps aumentan la combadura y (por encima de 20°) la resistencia, bajando la velocidad de pérdida y aumentando el ángulo de descenso sin agregar velocidad. Mantené la llave del motor abajo para llevar los flaps a cualquier posición entre UP y 40°. La placa, el corte del perfil y las velocidades de referencia se actualizan con la deflexión actual.",
    configuration: "CONFIGURACIÓN",
    flapsTitle: "FLAPS {label}",
    items: {
      vs: "VS (PÉRDIDA)",
      vfe: "VFE (MÁX)",
      approach: "APROXIMACIÓN",
      position: "POSICIÓN",
      vx: "VX (MEJOR ÁNGULO)",
      vy: "VY (MEJOR RÉGIMEN)",
      glide: "MEJOR PLANEO",
      shortField: "CAMPO CORTO",
    },
    pilotNote: "NOTA AL PILOTO",
    indicator: "INDICADOR DE POSICIÓN DE FLAPS",
    clean: "Limpio",
    notPublished: "No publicado en POH",
    nearest: "POSICIÓN MÁS CERCANA",
    measured: "ÁNGULO MEDIDO",
    cabinView: "VISTA DESDE CABINA",
    switchLabel: "LLAVE DEL MOTOR DE FLAPS",
    switchUp: "UP",
    switchOff: "OFF",
    switchDown: "DOWN",
    switchHint:
      "Apretá UP o DOWN para mover el motor. Los flaps sólo se detienen cuando volvés la llave a OFF, como en el avión real.",
    soundLabel: "SONIDO DEL MOTOR",
    soundOn: "ON",
    soundOff: "MUDO",
    legend: "DETENTES",
    settings: {
      up: {
        role: "CRUCERO / ASCENSO",
        desc: "Configuración limpia. Se usa para crucero, ascenso normal y despegues con obstáculo.",
        notes:
          "El despegue normal y el de máxima performance se hacen con flaps arriba (POH §2-9). VX 64 / VY 73 / Mejor Planeo 65 (todas en MPH IAS).",
      },
      ten: {
        role: "CARRERA CORTA / CAMPO BLANDO",
        desc: "Reservado para mínima carrera de despegue o para despegar en campos blandos o ásperos sin obstáculos adelante. Acorta la carrera ~10%.",
        notes:
          "Si usás 10° en la carrera, dejalos extendidos en lugar de replegarlos en el ascenso al obstáculo. El POH no publica velocidad de pérdida para 10°.",
      },
      twenty: {
        role: "CIRCUITO / MOTOR Y AL AIRE",
        desc: "Posición intermedia, y la posición de motor y al aire (balked landing): reducí a 20° apenas aplicás potencia total.",
        notes:
          "Útil para maniobrar en el circuito. Continuá replegando una vez alcanzada una velocidad segura.",
      },
      forty: {
        role: "FLAPS COMPLETOS / ATERRIZAJE",
        desc: "Flaps completos para aterrizar. Máxima sustentación y resistencia, acorta significativamente la distancia de aterrizaje.",
        notes:
          "POH: 30°/40° NO se recomiendan para despegue. La aproximación de campo corto se vuela a 58 MPH con flaps 40°.",
      },
    },
  },
  throttle: {
    title: "Acelerador y Potencia",
    intro:
      "El acelerador del Cessna 150 es un pomo negro tipo push-pull montado en el centro inferior del panel de instrumentos, con la placa \"THROTTLE PUSH OPEN\". Un cable enfundado corre a través del firewall hasta la mariposa del acelerador en el carburador Marvel-Schebler: empujar el pomo HACIA ADENTRO abre la mariposa, tirar HACIA AFUERA la cierra. No hay palanca de cuadrante; un pequeño anillo de freno cromado en la parte alta de la varilla mantiene la posición contra la vibración del motor. El Continental O-200-A está calificado a 100 BHP a 2.750 RPM (POH §3-3, línea roja). El POH 1969 indica Crucero en 2.000–2.750 RPM, chequeo de magnetos a 1.700 RPM (§1-2, antes del despegue) y arranque a \"Throttle — Open 1/4 inch\" (§2-13).",
    intro2:
      "Con la hélice de paso fijo McCauley 1A101 no hay control de paso separado, así que la posición del acelerador se traduce casi directamente en RPM. Arrastrá el pomo: la aguja del tacómetro sigue el movimiento y la placa describe el régimen que estás volando.",
    callout:
      "El RPM máximo del motor (línea roja) es 2.750. Según el POH §2-13, no se opera por debajo de 1.000 RPM. Es la potencia mínima de calentamiento y el piso para operación continua en tierra.",
    current: "POTENCIA ACTUAL",
    pilotNote: "NOTA AL PILOTO",
    pilotNoteBody:
      "El RPM máximo del motor (línea roja) es {redline}. El arco verde que se muestra (2.000–2.550 RPM) es el rango normal a nivel del mar; según el POH §3-3 se amplía con la altitud, hasta 2.000–2.750 RPM a 10.000 ft. Tratá al acelerador a fondo como régimen de despegue / ascenso, no de crucero.",
    digit: { rpm: "RPM", hundreds: "× 100" },
    soundOn: "ON",
    soundOff: "MUDO",
    lever: {
      title: "ACELERADOR",
    },
    zones: {
      green: "Arco Verde (SL)",
      red: "Línea Roja",
    },
    contexts: {
      belowMin: {
        label: "Bajo el Mínimo Recomendado",
        body: "Por debajo de 1.000 RPM, la operación continua acá no se recomienda. El POH §2-13 fija el régimen de calentamiento en 1.000 RPM; por debajo de eso el motor puede correr áspero y la operación prolongada a bajas RPM ensucia las bujías.",
      },
      idle: {
        label: "Ralentí / Calentamiento",
        body: "≈ 1.000 RPM, el régimen de calentamiento del POH y el mínimo recomendado para operación continua en tierra. Mantenete acá después del arranque y mientras la temperatura de aceite sube.",
      },
      taxi: {
        label: "Rodaje",
        body: "≈ 1.200–1.500 RPM. Suficiente para mantener el avión rodando en superficie nivelada sin abusar de los frenos; sobre piedra suelta mantenelo bajo para no dañar las puntas de la hélice.",
      },
      runup: {
        label: "Run-up / Chequeo de Magnetos",
        body: "1.700 RPM según POH §2-8, manteniendo frenos para el chequeo de magnetos (caída ≤ 75 RPM, diferencial ≤ 75 RPM) y verificación del calentador del carburador antes del despegue.",
      },
      economy: {
        label: "Crucero Económico",
        body: "≈ 65 % de potencia. Crucero de largo alcance y bajo consumo: empobrecé la mezcla, baja resistencia y el motor consume poco.",
      },
      cruise: {
        label: "Crucero Normal",
        body: "≈ 75 % de potencia. El POH §2-10 indica 2.525 RPM a nivel del mar para ~110 MPH TAS. Mezcla ajustada para mejor economía.",
      },
      climb: {
        label: "Potencia de Ascenso",
        body: "Parte alta del arco verde. Se usa en el ascenso inicial y después de un motor y al aire; acelerador a fondo cuando la altitud y los obstáculos lo permiten.",
      },
      takeoff: {
        label: "Despegue / Potencia Total",
        body: "Acelerador a fondo, máxima potencia continua. El run-up estático debería dar ~2.500–2.600 RPM con calefacción de carburador en frío; en vuelo, acelerador a fondo entrega los 2.750 RPM placardados de línea roja.",
      },
    },
  },
  mixture: {
    title: "Mezcla y Leaneo",
    lead:
      "Con hélice de paso fijo, el 150 no tiene control de hélice, así que el motor se maneja con solo dos pomos: el acelerador y, justo al lado, el pomo rojo de mezcla, que es el que los estudiantes usan último. El pomo de mezcla define cuánto combustible mezcla el carburador con el aire que entra: empujalo para una mezcla rica, tiralo y la carga se vuelve más pobre. Con la altura el aire se enrarece, así que un ajuste correcto en tierra queda demasiado rico allá arriba, con motor áspero, bujías engrasadas y combustible desperdiciado. Leanear ajusta el combustible para que acompañe al aire, y encontrar el punto justo es de lo que trata esta sección.",
    intro:
      "El pomo tira de un cable hasta el control de mezcla en el carburador Marvel-Schebler, dosificando el flujo de combustible; tiralo del todo y llegás a IDLE CUT-OFF, que es como se apaga el motor. Muchos 150 salieron de fábrica sin ningún indicador de EGT, así que el medidor de temperatura de gases de escape de una sonda que ves acá es un agregado aftermarket común. Lee el escape de un solo cilindro: a medida que empobrecés, la EGT sube hasta un pico y después vuelve a bajar cuando la carga pasa al lado pobre. Ese pico es la referencia sobre la que se construye toda la técnica de leaneo.",
    intro2:
      "Elegí un escenario y ajustá el pomo rojo. Mirá la aguja del EGT y escuchá el motor: si te pasás de pobre, empieza a correr áspero. El truco es encontrar el pico, marcarlo con el bug y después enriquecer unos 50°F por el lado rico.",
    callout:
      "El leaneo es para crucero. Abajo y a alta potencia (despegue, ascenso, aterrizaje) el motor quiere full rich para enfriarse y dar toda su potencia. Los números acá son ilustrativos, pensados para enseñar la técnica, no reemplazan el procedimiento de leaneo del POH de tu avión.",
    current: "MEZCLA ACTUAL",
    rpmLabel: "RPM",
    pilotNote: "NOTA AL PILOTO",
    pilotNoteBody:
      "¿Sin EGT? Leanéa igual, de oído y con el tacómetro: tirá el pomo despacio hasta que el motor apenas empieza a ponerse áspero, después empujalo de nuevo hasta que se suaviza y rinde mejor. Ese es tu punto rich of peak sin instrumento.",
    egt: {
      title: "EGT",
      max: "MÁX",
    },
    bug: {
      label: "BUG DE PICO",
      increase: "Subir el bug de pico",
      decrease: "Bajar el bug de pico",
    },
    trend: {
      rich: "Lado rico, EGT baja y fría",
      rising: "Empobreciendo, EGT subiendo hacia el pico",
      peak: "En el pico, no empobrezcas más",
      lean: "Pasado el pico, EGT bajando",
    },
    lever: {
      title: "MEZCLA",
      rich: "RICA",
      lean: "TIRAR POBRE",
      cutoff: "IDLE CUT-OFF",
    },
    scenarioLabel: "ESCENARIO",
    scenarios: {
      taxi: {
        title: "Carreteo",
        scene: "En tierra, en ralentí y rodando hacia la zona de prueba de motor.",
        explain:
          "El O-200 engrasa las bujías fácil a baja potencia en tierra. Tirá el pomo un poco hacia afuera, alrededor de media pulgada, para leanear en carreteo. Solo acordate de volverlo a full rich antes del run-up y el despegue.",
      },
      takeoffLanding: {
        title: "Despegue y aterrizaje",
        scene: "Potencia máxima en pista, o en aproximación final para aterrizar.",
        explain:
          "Llevá la mezcla a FULL RICH y dejala ahí. Full rich da la máxima potencia para el despegue y el combustible extra ayuda a enfriar el motor. En el aterrizaje importa igual: si tenés que motorizar, full rich significa que toda la potencia está disponible apenas empujás el acelerador, sin tener que deshacer ningún leaneo primero.",
      },
      cruise: {
        title: "Crucero a 5.000 ft",
        scene: "Nivelado, ya establecido en crucero. Acá arriba el aire es fino y el motor está corriendo rico.",
        explain:
          "Encontrá la mezcla ideal. Empobrecé despacio y mirá la EGT subir. Cuando la aguja deja de subir estás en el pico, así que marcalo con el bug amarillo. Después enriquecé hasta que la aguja baje unos 50°F, dos marcas, por el lado rico. Eso es 50°F rich of peak.",
      },
    },
    feedback: {
      rich: "Demasiado rica. Empobrecé.",
      lean: "Demasiado pobre. Enriquecé.",
      rough: "El motor está corriendo áspero, te pasaste del pico. Enriquecé hasta que se suavice.",
      findPeak: "Empobrecé para encontrar el pico, después girá el knob para parar el bug amarillo encima.",
      stillLean: "Del lado pobre del pico. Enriquecé hacia el bug.",
      leanToRop: "Bug parado en el pico. Ahora enriquecé hasta que la aguja quede 50°F por debajo.",
      tooFarRich: "Demasiado rica ahora, más de 50°F por debajo del pico. Empobrecé un poco.",
      okTaxi: "✓ LEANEADA PARA CARRETEO",
      okTakeoffLanding: "✓ FULL RICH",
      okCruise: "✓ 50°F RICH OF PEAK",
    },
    retry: "Nuevo objetivo",
    regimesTitle: "REGÍMENES DE MEZCLA",
    regimes: {
      fullRich: {
        label: "Full Rich",
        body: "Pomo todo adentro. Despegue, ascenso, aterrizaje y vuelo a baja altura. Máxima potencia y enfriamiento.",
      },
      bestPower: {
        label: "Mejor Potencia",
        body: "Apenas rich of peak. La mezcla de máxima potencia una vez que estás leaneando, se usa en ascenso de crucero.",
      },
      peak: {
        label: "Pico de EGT",
        body: "Lo más caliente que corre el escape. El punto de referencia al que leaneás y desde el que después enriquecés.",
      },
      leanOfPeak: {
        label: "Lean of Peak",
        body: "Pasado el pico. La EGT vuelve a bajar y el motor corre áspero en un O-200 carburado. Volvé a enriquecer.",
      },
      cutoff: {
        label: "Idle Cut-Off",
        body: "Pomo todo afuera. Sin combustible. Así se apaga el motor al final del vuelo.",
      },
    },
  },
  fuel: {
    title: "Combustible y Sistema",
    intro:
      "El Cessna 150 lleva el combustible en dos tanques integrales, uno en la raíz de cada ala, de 13 galones US cada uno. La alimentación es por gravedad, sin bomba de combustible en este avión de ala alta, y la nafta baja desde ambos tanques a través de una única válvula de corte ON/OFF y un filtro hasta el carburador. Según el Owner's Manual usa nafta de aviación de grado mínimo 80/87 (el avgas rojo de su época); hoy el 100LL (azul), universal, es un sustituto de grado superior aprobado. La figura 2-2 del POH indica 26,0 gal totales, de los cuales sólo 22,5 gal son utilizables en todas las condiciones de vuelo; 3,5 gal quedan atrapados como combustible no utilizable.",
    intro2:
      "Acá está la trampa con la que se topa todo alumno en un clásico como éste: los indicadores de combustible no son confiables en vuelo. Los sensores de flotante de un ala de 50 años se desvían, se traban y rebotan con la turbulencia, y por reglamento sólo están obligados a ser precisos en un punto: VACÍO. Por eso los pilotos miden el combustible directamente: se suben, abren la tapa de carga y leen el nivel con una varilla calibrada (la pipeta). Cargá los tanques abajo y medilos vos mismo.",
    callout:
      "Nunca planifiques el combustible con los indicadores de cabina de un avión de esta edad. Sólo están certificados como precisos en cero combustible utilizable; todo lo que esté por encima de E es una estimación. Confirmá la cantidad visualmente o con la pipeta antes de cada vuelo.",
    specsTitle: "DATOS DE COMBUSTIBLE",
    units: {
      gal: "gal US",
      liters: "L",
      gph: "gal/h",
      lph: "L/h",
      inches: "in",
    },
    specs: {
      grade: {
        label: "Grado",
        value: "80/87",
        detail: "nafta de aviación mín. · 100LL (azul) es sustituto aprobado",
      },
      total: {
        label: "Capacidad total",
        detail: "dos tanques de ala · 13 gal US c/u",
      },
      usable: {
        label: "Combustible utilizable",
        detail: "todas las condiciones · POH fig. 2-2",
      },
      unusable: {
        label: "No utilizable",
        detail: "atrapado en el sistema · nunca lo cuentes",
      },
      feed: {
        label: "Alimentación",
        value: "Gravedad",
        detail: "ala alta · sin bomba · válvula de corte ON/OFF",
      },
    },
    interactive: {
      title: "CARGÁ EL AVIÓN Y MEDÍ CON LA PIPETA",
      intro:
        "Agarrá la pistola del surtidor y arrastrala sobre una tapa de carga para cargar, pero el ala es de chapa, así que no ves cuánto entró realmente. Para saberlo con certeza, arrastrá la pipeta adentro de un tanque y sacala: la marca mojada queda en la varilla. Fijate cómo las marcas de galones se amontonan arriba, donde el tanque es más ancho; justamente por eso una varilla calibrada le gana al indicador de flotante.",
      nozzleLabel: "PISTOLA",
      nozzleHint: "Arrastrala a una tapa de carga para cargar",
      dipstickLabel: "PIPETA",
      dipstickHint: "Metela en un tanque y sacala para leer",
      tankLeft: "TANQUE IZQ.",
      tankRight: "TANQUE DER.",
      fueling: "CARGANDO…",
      full: "LLENO",
      unknown: "—.—",
      unknownHint: "Medí para leer",
      measuring: "MIDIENDO…",
      stickReads: "LA PIPETA MARCA",
      notDipped: "Sin medir todavía. Meté la pipeta.",
      gaugeTitle: "INDICADORES DE CABINA",
      gaugeReliable: "Vagos y erróneos sobre E",
      totalOnboard: "TOTAL MEDIDO",
      usableOnboard: "UTILIZABLE",
      measureBothHint: "Medí ambos tanques para totalizar",
      drainButton: "Vaciar tanques",
      stickVsGauge:
        "La pipeta mide el combustible directamente; el indicador de flotante sólo lo estima, y en un avión de esta edad lo estima mal. Cuando no coinciden, creele a la pipeta.",
    },
    burn: {
      title: "CONSUMO POR FASE",
      intro:
        "Elegí una fase para ver el flujo de combustible y cuánto duraría el combustible utilizable que tenés a bordo a ese régimen.",
      selectLabel: "FASE",
      rate: "FLUJO",
      endurance: "AUTONOMÍA",
      rangeLabel: "ALCANCE",
      fromUsable: "con {gal} utilizables a bordo",
      needMeasure: "Medí ambos tanques para calcular autonomía y alcance",
      noRange: "operación en tierra",
      pohNote:
        "Los valores de crucero y económico salen del cuadro de performance de crucero del POH; rodaje, despegue/ascenso y descenso son estimaciones ilustrativas de rampa; el consumo real depende de la mezcla, la altitud y la técnica.",
      phases: {
        taxi: { label: "Rodaje / Ralentí", note: "≈1.000–1.200 RPM en tierra" },
        takeoff: { label: "Despegue / Ascenso", note: "Acelerador a fondo, mezcla rica" },
        cruise: { label: "Crucero 75%", note: "≈2.600 RPM · ~111 MPH TAS · POH" },
        economy: { label: "Crucero económico", note: "≈2.200 RPM · largo alcance · POH" },
        descent: { label: "Descenso", note: "Potencia atrás, mezcla rica" },
      },
    },
    pilotNote: "NOTA AL PILOTO",
    pilotNoteBody:
      "En el primer vuelo del día y después de cada recarga, drená una muestra del filtro de combustible y del sumidero de cada tanque (preflight del POH). El avgas está teñido: combustible transparente o turbio, o gotas asentadas en el fondo del vaso, indican agua en los tanques. Seguí drenando hasta que salga limpio y brillante.",
  },
  trim: {
    title: "Compensador",
    intro:
      "El compensador de profundidad del Cessna 150 es totalmente mecánico. Una rueda vertical en el pedestal inferior — entre los asientos — mueve un cable que corre hacia atrás hasta un husillo en la cola; el husillo deflecta una única aleta de compensación (trim tab) en el borde de fuga del timón de profundidad. No hay compensador eléctrico ni servos. La rueda tiene una escala impresa con NARIZ ARRIBA / NARIZ ABAJO y una marca blanca de referencia TAKE-OFF apenas nariz-arriba de neutral. El POH 1969 §1-2 simplemente menciona \"Trim Tab — TAKE-OFF setting\" en el checklist antes del despegue y en otras partes instruye al piloto a \"ajustar el compensador para ascenso / vuelo nivelado / régimen de descenso deseado\" — el valor de cada fase se determina por sensación, no por números publicados.",
    intro2:
      "Lo que hace el compensador: no cambia la actitud, saca la carga del comando. Elegí un escenario abajo, sentí la fuerza que estarías sosteniendo sin compensar, y girá la rueda hasta que la fuerza se vaya.",
    callout:
      "Los valores de fuerza son ilustrativos, basados en lo que enseña la escuela. El POH 1969 no publica rangos de deflexión del compensador ni fuerzas en el comando — la fuerza real depende de velocidad, CG y peso.",
    current: "FUERZA ACTUAL",
    trimmed: "COMPENSADO ✓",
    pull: "Tirar {n} lb",
    push: "Empujar {n} lb",
    wheelLabel: "RUEDA DEL COMPENSADOR",
    scaleNoseUp: "NARIZ ARRIBA",
    scaleNoseDn: "NARIZ ABAJO",
    scaleTakeoff: "DESP.",
    trimReadout: "TRIM",
    pilotNote: "NOTA AL PILOTO",
    pilotNoteBody:
      "Compensá temprano y seguido. Después de cualquier cambio de actitud o de potencia, re-compensá — que el avión vuele sin manos te deja escanear instrumentos, leer cartas y configurar la próxima fase sin pelearte con el bastón.",
    scenarioLabel: "ESCENARIO",
    scenarios: {
      climb: {
        title: "Ascenso inicial a Vy",
        scene: "Apenas rotás. Acelerador a fondo, flaps arriba, ascendiendo a 73 MPH.",
        explain:
          "Con nariz arriba a baja velocidad, el avión tiende a picar si soltás el comando. Girá la rueda hacia NARIZ ARRIBA hasta que la fuerza de tirón desaparezca.",
      },
      cruise: {
        title: "Crucero nivelado 110 MPH",
        scene: "75 % de potencia a ~2.525 RPM, 7.000 ft, vuelo nivelado.",
        explain:
          "El crucero nivelado pide muy poca compensación NARIZ ARRIBA — bastante menos que el ascenso. Un giro suave hacia atrás alivia el tirón residual.",
      },
      approach: {
        title: "Final 65 MPH, flaps 40°",
        scene: "Final corto, flaps completos, poca potencia, 65 MPH.",
        explain:
          "Flaps completos + baja velocidad = tirón fuerte sin compensar. Compensá agresivo hacia NARIZ ARRIBA para que la aproximación se vuele sola.",
      },
      descent: {
        title: "Descenso de crucero 120 MPH",
        scene: "Potencia reducida, flaps arriba, ~500 fpm de descenso a 120 MPH.",
        explain:
          "Más rápido que tu compensación de crucero, el avión tiende a levantar la nariz. Girá la rueda hacia NARIZ ABAJO hasta que el empuje se vaya.",
      },
    },
    anatomy: {
      title: "ANATOMÍA DEL TRIM TAB",
      elevator: "Timón de profundidad",
      tab: "Trim tab",
      stab: "Estabilizador horizontal",
      hint: "El trim tab deflecta opuesto al timón de profundidad — por eso una posición con el tab hacia arriba mantiene el timón abajo (nariz abajo) y viceversa.",
    },
  },
  pilot: {
    title: "Notas del Piloto",
    intro:
      "Procedimientos y velocidades memorizables tomadas del Owner's Manual Cessna 1969 para el Modelo 150J. Esto es una referencia, no reemplaza el POH oficial — siempre consultá el manual del avión antes del vuelo.",
    memoryTitle: "MEMORIZABLES — VELOCIDADES",
    disclaimer:
      "Estas notas son sólo de referencia. Siempre consultá el Owner's Manual / POH aprobado por la FAA del Cessna 150 específico que estés volando y cumplí con todas las regulaciones aplicables y los procedimientos operativos estándar de tu operador.",
    motto: "VOLÁ SEGURO — VOLÁ PROFESIONAL",
    memory: {
      vs0: "Pérdida, flaps 40°",
      vs1: "Pérdida, flaps arriba",
      vx: "Mejor ángulo de ascenso",
      vy: "Mejor régimen de ascenso (a nivel del mar)",
      bestGlide: "Mejor Planeo",
      bestGlideDesc: "Motor parado, flaps arriba",
      vfe: "Máx con flaps extendidos",
      va: "Maniobra",
      vno: "Máx crucero estructural",
      vne: "Nunca exceder",
    },
    proc: {
      normalTo: {
        title: "DESPEGUE NORMAL",
        steps: [
          "Flaps — ARRIBA",
          "Calefacción carburador — FRÍA",
          "Acelerador — TODO ABIERTO",
          "Rotar a {v1}",
          "Ascenso — {v2} hasta librar obstáculos, luego ASCENSO NORMAL",
        ],
      },
      maxPerfTo: {
        title: "DESPEGUE DE MÁXIMA PERFORMANCE",
        source: "POH §1-2 (obstáculo / campo corto)",
        steps: [
          "Flaps — ARRIBA",
          "Calefacción carburador — FRÍA",
          "Frenos — MANTENER",
          "Acelerador — TODO ABIERTO",
          "Frenos — SOLTAR",
          "Comando de profundidad — ligeramente cola abajo",
          "Ascenso — {v1} con obstáculos adelante",
        ],
      },
      climb: {
        title: "ASCENSO NORMAL",
        steps: [
          "Velocidad — {v1} a {v2}",
          "Potencia — TODO el acelerador",
          "Mezcla — RICA (salvo motor áspero)",
        ],
      },
      normalLdg: {
        title: "ATERRIZAJE NORMAL",
        steps: [
          "Mezcla — RICA",
          "Calefacción carburador — aplicar CALOR TOTAL antes de cerrar acelerador",
          "Velocidad — {v1} a {v2} (flaps arriba)",
          "Flaps — a discreción por debajo de {v3}",
          "Velocidad — {v4} a {v5} con flaps extendidos",
          "Toque — RUEDAS PRINCIPALES primero",
          "Carrera de aterrizaje — bajar la rueda de nariz suavemente",
          "Frenado — el mínimo necesario",
        ],
      },
      shortFieldLdg: {
        title: "ATERRIZAJE DE CAMPO CORTO",
        source: "POH §2-11",
        steps: [
          "Aproximación — SIN POTENCIA a {v1} con flaps 40°",
          "Toque — RUEDAS PRINCIPALES primero",
          "Rueda de nariz — bajar al suelo; aplicar frenado firme",
          "Flaps — REPLEGAR luego de tener las tres ruedas en tierra",
          "Comando de profundidad — mantener TODO ATRÁS",
          "Frenos — máximo sin patinar las cubiertas",
        ],
      },
      goAround: {
        title: "MOTOR Y AL AIRE (BALKED LANDING)",
        source: "POH §2-11",
        steps: [
          "Acelerador — TODO ABIERTO",
          "Flaps — reducir a 20° inmediatamente",
          "Velocidad — establecer actitud de ascenso seguro",
          "Flaps — REPLEGAR lentamente a todo arriba una vez seguro",
          "Calefacción carburador — FRÍA",
        ],
      },
    },
  },
  controls: {
    units: "UNIDADES",
    language: "IDIOMA",
    sound: "SONIDO",
    detail: "Ver detalle técnico",
    why: "¿Por qué?",
    close: "Cerrar",
  },
  nav: {
    index: "ÍNDICE",
    partLabel: "PARTE",
    chapters: {
      aircraft: "El Avión",
      speeds: "Velocidades",
      controls: "Controles de Cabina",
      operation: "Operación",
    },
    items: {
      heritage: "Legado",
      overview: "Generalidades",
      airspeed: "Velocidades V",
      stall: "Pérdida",
      flaps: "Flaps",
      throttle: "Acelerador",
      mixture: "Mezcla",
      fuel: "Combustible",
      trim: "Compensador",
      procedures: "Notas",
    },
  },
  footer: {
    madeWith: "Hecho con",
    by: "por",
    source: "Código en GitHub",
    disclaimerProject:
      "Love the 150 es un proyecto educativo independiente hecho por fans.",
    disclaimerTrademark:
      "Cessna® y Cessna 150® son marcas registradas de Textron Aviation Inc.",
    disclaimerAffiliation:
      "Este sitio no está afiliado, avalado ni patrocinado por Textron Aviation.",
  },
};

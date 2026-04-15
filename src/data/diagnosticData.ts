export interface DiagnosticQuestion {
  id: number;
  title: string;
  sub: string;
  opts: DiagnosticOption[];
}

export interface DiagnosticOption {
  label: string;
  text: string;
  score: number;
}

export interface DiagnosticProfile {
  color: string;
  tagline: string;
  desc: string;
  mirror: string[];
  symptoms: string[];
  ctaTitle: string;
  ctaText: string;
}

export const BANCO_PREGUNTAS: DiagnosticQuestion[] = [
  {
    id: 1,
    title: "Si mañana no estás, ¿qué pasa con tu negocio?",
    sub: "Pensá en la última vez que te fuiste de vacaciones o estuviste enfermo.",
    opts: [
      { label: "A", text: "Todo sigue funcionando. Mi equipo sabe qué hacer sin mí.", score: 5 },
      { label: "B", text: "Funciona, pero hay decisiones que solo yo puedo tomar.", score: 3 },
      { label: "C", text: "Se genera un caos controlable, pero me llaman para todo.", score: 2 },
      { label: "D", text: "El negocio se paraliza. Sin mí, no hay negocio.", score: 1 },
    ],
  },
  {
    id: 2,
    title: "¿Cómo llegan los clientes nuevos a tu negocio?",
    sub: "Pensá en los últimos 5 clientes que cerraste.",
    opts: [
      { label: "A", text: "Tengo un sistema claro: publicidad, redes, referidos trabajados. Llegan de forma predecible.", score: 5 },
      { label: "B", text: "Principalmente por recomendaciones. Funciona, pero no es un sistema mío.", score: 3 },
      { label: "C", text: "De manera irregular. Algunos meses bien, otros preocupantes.", score: 2 },
      { label: "D", text: "No tengo claro de dónde vienen. Espero que aparezcan y rezo.", score: 1 },
    ],
  },
  {
    id: 3,
    title: "Cuando un prospecto dice \"está caro\", ¿qué pasa?",
    sub: "Tu reacción más honesta, no la más prolija.",
    opts: [
      { label: "A", text: "Defiendo el precio con seguridad. Explico el valor y rara vez descuento.", score: 5 },
      { label: "B", text: "Explico el valor, pero si insisten, termino bajando algo para cerrar.", score: 3 },
      { label: "C", text: "Me cuesta responder. Suelo hacer algún descuento o me quedo sin argumentos.", score: 2 },
      { label: "D", text: "Bajo el precio directamente o pierdo la venta. No sé cómo manejarlo.", score: 1 },
    ],
  },
  {
    id: 4,
    title: "¿Tu equipo tira para el mismo lado que vos?",
    sub: "Pensá en la semana laboral promedio.",
    opts: [
      { label: "A", text: "Sí. Saben para dónde vamos, tienen iniciativa y confío en ellos.", score: 5 },
      { label: "B", text: "En general sí, aunque siempre hay alguno que hay que estar empujando.", score: 3 },
      { label: "C", text: "Tengo gente buena, pero falta organización. Cada uno tira para su lado.", score: 2 },
      { label: "D", text: "Estoy solo o rodeado de personas que no están a la altura.", score: 1 },
    ],
  },
  {
    id: 5,
    title: "¿Cuántas veces resolvés el mismo problema en un mes?",
    sub: "Los problemas que deberían estar resueltos para siempre y siguen volviendo.",
    opts: [
      { label: "A", text: "Casi nunca. Los problemas se procesan una vez y quedan resueltos para siempre.", score: 5 },
      { label: "B", text: "Algunos se repiten pero los manejo rápido porque ya sé cómo.", score: 3 },
      { label: "C", text: "Varios se repiten. Quiero sistematizar pero no tengo tiempo para hacerlo.", score: 2 },
      { label: "D", text: "Vivo apagando incendios. Lo mismo de siempre, todos los meses, sin parar.", score: 1 },
    ],
  },
  {
    id: 6,
    title: "¿Tenés asesores o referentes con quienes hablar de tu negocio?",
    sub: "Alguien que te diga la verdad, no solo lo que querés escuchar.",
    opts: [
      { label: "A", text: "Sí. Trabajo con asesores que me aportan perspectiva real y me empujan a mejorar.", score: 5 },
      { label: "B", text: "Tengo algunos contactos del rubro que consulto de vez en cuando.", score: 3 },
      { label: "C", text: "Tuve malas experiencias con asesores. Mucha teoría, pocos resultados.", score: 2 },
      { label: "D", text: "No tengo a nadie. Las decisiones importantes las tomo solo, sin perspectiva externa.", score: 1 },
    ],
  },
  {
    id: 7,
    title: "¿Podés describir cómo querés que sea tu negocio en 3 años?",
    sub: "No lo que querés ganar. Cómo querés que funcione.",
    opts: [
      { label: "A", text: "Sí, tengo una visión clara: sé qué empresa quiero ser, qué mercado atacar y cómo escalar.", score: 5 },
      { label: "B", text: "Tengo ideas generales pero no está definido con claridad ni escrito en ningún lado.", score: 3 },
      { label: "C", text: "Me cuesta proyectarme. El día a día no me deja pensar en el futuro.", score: 2 },
      { label: "D", text: "Honestamente, no sé. Vivo el presente y que sea lo que Dios quiera.", score: 1 },
    ],
  },
  {
    id: 8,
    title: "Si tuvieras que describir tu momento actual como dueño, ¿cuál es el más honesto?",
    sub: "La respuesta que no le darías a tu contador ni a tu familia.",
    opts: [
      { label: "A", text: "Estoy creciendo y disfruto el proceso. El negocio me da energía.", score: 5 },
      { label: "B", text: "Funciona, pero algo me dice que podría ir mucho mejor.", score: 3 },
      { label: "C", text: "Estoy cansado. Trabajé mucho y los resultados no reflejan el esfuerzo.", score: 2 },
      { label: "D", text: "La verdad es que estoy atascado y no sé por dónde empezar a destrabar esto.", score: 1 },
    ],
  },
];

export const PERFILES: Record<string, DiagnosticProfile> = {
  SATURADO: {
    color: "#C64E4A",
    tagline: "Trabajás el doble. Ganás la mitad de lo que deberías.",
    desc: "Empezaste esto para tener libertad. Y terminaste siendo el empleado más exigido de tu propia empresa. No porque seas desorganizado — sino porque el negocio creció sin estructura y ahora todo pasa por vos. Cada decisión, cada problema, cada incendio. Sabés que algo tiene que cambiar, pero no encontrás el momento para sentarte a cambiarlo. Eso también es parte del problema.",
    mirror: [
      '"Si yo no empujo, nada avanza."',
      '"Estoy en mil cosas a la vez y ninguna la termino bien."',
      '"Sé que podría estar mejor, pero no sé por dónde empezar."',
      '"No tengo tiempo para ordenar — tengo que seguir trabajando."',
    ],
    symptoms: [
      "Resolvés los mismos problemas todos los meses — nunca quedan cerrados",
      "Si parás 3 días, el negocio lo nota. Y eso te pesa más que el trabajo",
      "Llegás al viernes sin haber avanzado en lo que realmente importaba",
      "Tenés ideas para crecer pero nunca hay tiempo para ejecutarlas",
    ],
    ctaTitle: "No es falta de esfuerzo. Es falta de sistema.",
    ctaText: "El problema tiene nombre y tiene solución concreta. En 45 minutos te mostramos exactamente cómo salir de la rueda.",
  },
  INVISIBLE: {
    color: "#495F93",
    tagline: "Sos muy bueno en lo que hacés. El problema es que nadie lo sabe.",
    desc: "Tus clientes actuales te valoran — los que ya llegaron, saben lo que valés. Pero los que todavía no te conocen no tienen forma de distinguirte. No tenés un argumento construido para defender tu precio. No porque no lo merezcas, sino porque nunca nadie te ayudó a armarlo. El resultado: cobrás menos de lo que deberías y competís en un terreno que no te representa.",
    mirror: [
      '"Sé que soy bueno, pero no sé cómo explicarlo sin sonar soberbio."',
      '"No sé cómo diferenciarme — siento que soy uno más del montón."',
      '"Cuando dicen que está caro, no sé qué responder."',
      '"Podría cobrar más, pero me da miedo perder clientes."',
    ],
    symptoms: [
      "Casi todos tus clientes llegaron por recomendación — no por un sistema tuyo",
      "Ante la objeción de precio, terminás bajando o perdiendo la venta",
      "No tenés un mensaje claro que explique por qué vos y no otro",
      "Tu nivel real no se refleja en lo que cobrás ni en cómo te presentás",
    ],
    ctaTitle: "No te falta talento. Te falta visibilidad estratégica.",
    ctaText: "El problema no es lo que sabés hacer. Es cómo lo estás comunicando al mercado. Eso tiene solución en una sesión.",
  },
  LIDER_SOLO: {
    color: "#495F93",
    tagline: "Tenés la visión. Falta el equipo que la ejecute sin que estés encima.",
    desc: "Ves claramente para dónde va el negocio. El problema es que esa visión existe sólo en tu cabeza y en tus manos. Cada vez que delegás algo importante, termina saliendo mal o lo terminás rehaciendo vos. No porque tu equipo sea malo — sino porque nunca construiste el sistema que les permita ejecutar a tu nivel sin supervisión constante.",
    mirror: [
      '"Yo pensé que si delegaba me liberaba — pero termino controlando todo igual."',
      '"No entiendo por qué es tan difícil que las cosas salgan como yo las imagino."',
      '"Si no estoy encima, algo siempre se complica."',
      '"Sé exactamente lo que quiero pero no encuentro quién lo lleve a cabo."',
    ],
    symptoms: [
      "Sos el primer filtro de todas las decisiones, aunque sean pequeñas",
      "Delegás, pero termina saliendo mal o lo rehacés vos",
      "Cada vez que te ausentás, algo se complica o se frena",
      "El negocio creció en facturación pero no en autonomía real",
    ],
    ctaTitle: "Tu negocio no escala más si seguís siendo el cuello de botella.",
    ctaText: "El próximo paso es construir el sistema que permite delegar con resultados reales. En 45 minutos lo definimos juntos.",
  },
  DESCONECTADO: {
    color: "#E5A000",
    tagline: "Tu negocio funciona. Vos ya no sabés hacia dónde lo llevás.",
    desc: "Lograste algo que muchos no logran: una operación que corre sola. Pero en algún punto te desconectaste del rol estratégico. No porque hayas fallado — sino porque estabas ejecutando. Ahora el negocio avanza, pero sin que nadie lo esté llevando. Las decisiones grandes las tomás solo, sin perspectiva externa, sin visión clara de largo plazo. Y eso tiene un costo que todavía no ves.",
    mirror: [
      '"Estoy pagando por cosas que no sé si sirven."',
      '"No sé si me están diciendo la verdad o lo que quiero escuchar."',
      '"El negocio funciona, pero siento que algo grande se me está escapando."',
      '"Tomo decisiones importantes y en el fondo no sé si son las correctas."',
    ],
    symptoms: [
      "El negocio funciona pero no tenés claro cuál es el próximo paso grande",
      "Tomás las decisiones importantes solo, sin perspectiva externa real",
      "No tenés una visión concreta de adónde va el negocio en 3 años",
      "Sentís que el negocio te lleva a vos, en vez de vos llevarlo a él",
    ],
    ctaTitle: "Es momento de recuperar el rol estratégico.",
    ctaText: "Un negocio sin timón no cae de golpe — se desvía lentamente. Hoy es el momento de corregir el rumbo con criterio externo.",
  },
  ESTANCADO: {
    color: "#656565",
    tagline: "Funciona. Pero sabés que debería estar yendo mucho mejor.",
    desc: "No estás en crisis. Eso está bien. Pero tampoco estás creciendo — y eso lo sabés. Hubo una época en que el negocio avanzaba casi solo. Hoy se sostiene por inercia y referidos. Lo que te trajo hasta acá no es lo mismo que te va a llevar al siguiente nivel. Y en algún lugar de tu cabeza, eso te está molestando hace un tiempo.",
    mirror: [
      '"Funciona, pero algo me dice que podría ir mucho mejor."',
      '"No entiendo por qué no despega si estoy haciendo todo bien."',
      '"Los referidos no alcanzan para crecer — necesito otra cosa, pero no sé qué."',
      '"Siento que trabajo mucho y los resultados no reflejan el esfuerzo."',
    ],
    symptoms: [
      "Los resultados son estables pero el crecimiento se frenó hace tiempo",
      "No tenés claro qué hay que cambiar exactamente para romper el techo",
      "Dependés de referidos — no tenés un canal de adquisición que sea tuyo",
      "Hay una visión de crecimiento, pero nunca pasa del pensamiento al plan",
    ],
    ctaTitle: "El estancamiento no es un problema de esfuerzo. Es de estrategia.",
    ctaText: "Identificamos exactamente dónde está el freno y cuál es la palanca para moverlo. Sin rodeos, sin humo.",
  },
  NUEVA_GEN: {
    color: "#495F93",
    tagline: "Tenés el motor encendido. Necesitás la estructura que lo sostenga.",
    desc: "Tenés energía, tenés visión y tenés movimiento. El problema no es la falta de ganas — es que el negocio todavía corre por impulso, no por sistema. En esta etapa, eso es normal. Pero también es la etapa que define todo: los que ponen la estructura ahora escalan. Los que no la ponen, llegan a un techo en 2 años y no saben por qué.",
    mirror: [
      '"Hago un montón de cosas pero no siempre sé cuál es la prioridad real."',
      '"Quiero crecer, pero nadie me muestra el mapa claro."',
      '"No tengo a quién consultar cuando tomo decisiones difíciles."',
      '"Siento que algo falta para despegar, pero no sé exactamente qué."',
    ],
    symptoms: [
      "Hacés muchas cosas — pero no siempre está claro qué mueve el negocio de verdad",
      "No tenés a quién consultar cuando las decisiones se ponen difíciles",
      "El negocio creció, pero sin un plan detrás — creció como pudo",
      "Sentís que algo falta para despegar, pero no podés nombrarlo con precisión",
    ],
    ctaTitle: "Con la estructura correcta ahora, el crecimiento se multiplica.",
    ctaText: "Esta es la etapa donde se decide el techo de tu negocio. Hablemos antes de que ese techo se construya solo.",
  },
  EQUIPO_DESALINEADO: {
    color: "#E5A000",
    tagline: "Tu equipo quiere avanzar. Pero nadie sabe hacia dónde.",
    desc: "No es que tu equipo sea malo. Es que no tienen un marco común. Las prioridades cambian cada semana, las reuniones no producen decisiones, y los conflictos se acumulan en silencio. Cada uno interpreta su rol a su manera porque nadie se sentó a definirlo con claridad. El resultado: mucha energía desperdiciada y poca tracción real.",
    mirror: [
      '"Tengo gente buena pero cada uno tira para su lado."',
      '"Las reuniones no sirven — hablamos mucho y decidimos poco."',
      '"No sé si el problema soy yo como líder o el equipo."',
      '"Hay tensiones que nadie nombra pero todos sienten."',
    ],
    symptoms: [
      "Los roles no están claros — hay superposiciones y huecos",
      "Las prioridades cambian cada semana sin criterio definido",
      "Las reuniones terminan sin decisiones concretas ni responsables",
      "Los conflictos se acumulan en silencio hasta que explotan",
    ],
    ctaTitle: "No están desmotivados. Están desordenados.",
    ctaText: "Un equipo sin marco común gasta más energía en coordinarse que en producir. Eso se resuelve con claridad, no con motivación.",
  },
  VENDEDOR_SIN_RESULTADOS: {
    color: "#C64E4A",
    tagline: "Ponés el cuerpo todos los días. Pero la caja no lo refleja.",
    desc: "No es que no trabajes — trabajás más que la mayoría. El problema es que el esfuerzo no se traduce en resultados porque no hay una estrategia detrás. Vendés por impulso, reaccionás a lo que aparece, y al final del mes los números no cierran. Y eso te genera un péndulo emocional entre la euforia de un buen día y la angustia de una semana vacía.",
    mirror: [
      '"Trabajo un montón pero la plata no aparece."',
      '"Un mes bien, otro mal — no hay regularidad."',
      '"Probé de todo: redes, publicidad, cursos… nada funciona de verdad."',
      '"A veces pienso que el problema soy yo."',
    ],
    symptoms: [
      "Los ingresos son irregulares — no podés predecir el mes que viene",
      "No tenés un proceso de venta definido, vendés como podés",
      "Invertiste en soluciones que prometían resultados mágicos y no funcionaron",
      "El desgaste emocional es tan grande como el esfuerzo físico",
    ],
    ctaTitle: "No te falta esfuerzo. Te falta estrategia.",
    ctaText: "El problema no es cuánto trabajás sino cómo lo hacés. En 45 minutos te mostramos dónde está la fuga y cómo taparla.",
  },
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function detectarPerfil(answers: Record<number, number>): string {
  const v1 = answers[1] || 3;
  const v2 = answers[2] || 3;
  const v3 = answers[3] || 3;
  const v4 = answers[4] || 3;
  const v5 = answers[5] || 3;
  const v6 = answers[6] || 3;
  const v7 = answers[7] || 3;
  const v8 = answers[8] || 3;

  const ejeOperativo = v1 + v5;
  const ejeComercial = v2 + v3;
  const ejeEstrategico = v6 + v7;

  // BP1: Saturado — todo depende de él, sin procesos
  if (v1 <= 2 && v5 <= 2) return "SATURADO";
  if (v5 === 1 && v4 <= 2 && v8 <= 2) return "SATURADO";

  // BP4: Equipo Desalineado — equipo sin marco común
  if (v4 <= 2 && v1 >= 3 && v5 >= 3) return "EQUIPO_DESALINEADO";
  if (v4 <= 2 && v7 >= 3 && v8 <= 3) return "EQUIPO_DESALINEADO";

  // BP7: Vendedor sin Resultados — esfuerzo sin retorno
  if (v2 <= 2 && v3 <= 2 && v8 <= 2) return "VENDEDOR_SIN_RESULTADOS";
  if (v3 <= 2 && v2 <= 2 && v5 <= 3 && v8 <= 2) return "VENDEDOR_SIN_RESULTADOS";

  // BP3: Invisible — no sabe posicionarse
  if (v2 <= 2 && v3 <= 2) return "INVISIBLE";
  if (v2 === 3 && v3 <= 2 && v6 <= 2) return "INVISIBLE";

  // BP2: Líder Solo — visión sin equipo que ejecute
  if (v7 >= 3 && v1 <= 3 && v4 <= 2) return "LIDER_SOLO";
  if (v1 <= 2 && v7 >= 3 && v6 <= 2 && v5 >= 3) return "LIDER_SOLO";

  // BP5: Desconectado — funciona pero sin timón estratégico
  if (v1 >= 3 && v7 <= 2 && v6 <= 2) return "DESCONECTADO";
  if (v1 >= 5 && v6 === 1 && v7 <= 3) return "DESCONECTADO";

  // BP8: Estancado — funciona pero no crece
  if (v2 === 3 && v7 <= 3 && (v8 === 3 || v8 === 2)) return "ESTANCADO";
  if (v2 <= 3 && v7 <= 2 && v5 >= 3 && v1 >= 3) return "ESTANCADO";

  // BP6: Nueva Generación
  if (v8 >= 3 && v7 >= 2 && v6 <= 2 && v2 <= 3) return "NUEVA_GEN";

  // Fallbacks por eje más débil
  const ejeEquipo = v4;
  const min = Math.min(ejeOperativo, ejeComercial, ejeEstrategico);
  if (ejeEquipo <= 2 && min > ejeEquipo * 2) return "EQUIPO_DESALINEADO";
  if (min === ejeComercial && v8 <= 2) return "VENDEDOR_SIN_RESULTADOS";
  if (min === ejeOperativo) return "SATURADO";
  if (min === ejeComercial) return "INVISIBLE";
  if (min === ejeEstrategico) return v1 >= 3 ? "DESCONECTADO" : "LIDER_SOLO";

  const total = v1 + v2 + v3 + v4 + v5 + v6 + v7 + v8;
  return total <= 20 ? "SATURADO" : "ESTANCADO";
}

export const WA_NUMBER = "543764358152";

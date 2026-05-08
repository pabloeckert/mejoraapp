/**
 * Business Mirror Gamer — Test Data
 *
 * Los 5 tests iniciales del sistema de gamificación.
 * Cada test tiene su propio game_type, questions, scoring_rules y profiles.
 */

// ── Types ──────────────────────────────────────────────────────

export type GameType = "classic" | "puzzle" | "adventure" | "mental" | "logic";

export interface TestQuestion {
  id: number;
  title: string;
  subtitle?: string;
  options: TestOption[];
  /** Para games tipo "mental": tiempo límite en segundos */
  timeLimit?: number;
}

export interface TestOption {
  label: string;
  text: string;
  score: number;
  /** Para adventure: siguiente pregunta (branching) */
  next?: number;
  /** Para puzzle: si es la opción óptima */
  optimal?: boolean;
}

export interface TestProfile {
  key: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  icon: string;
  traits: string[];
  advice: string;
}

export interface TestDefinition {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  bgColor: string;
  gameType: GameType;
  timeEstimateMin: number;
  questions: TestQuestion[];
  scoringRules: ScoringRule[];
  profiles: Record<string, TestProfile>;
}

export interface ScoringRule {
  profileKey: string;
  /** Function that receives answers and returns a fit score */
  fit: (answers: Record<number, number>, totalTime?: number) => number;
}

// ── Test 1: Mirror Estratégico (Classic) ───────────────────────

const mirrorEstrategico: TestDefinition = {
  slug: "mirror-estrategico",
  title: "Mirror Estratégico",
  subtitle: "Descubrí tu perfil de empresario",
  description:
    "8 preguntas que reflejan cómo está tu negocio hoy. No es un test de conocimiento — es un espejo honesto de tu realidad como dueño.",
  category: "diagnostico",
  icon: "Mirror",
  color: "#495F93",
  bgColor: "bg-blue-50 dark:bg-blue-950/30",
  gameType: "classic",
  timeEstimateMin: 2,
  questions: [
    {
      id: 1,
      title: "Si mañana no estás, ¿qué pasa con tu negocio?",
      subtitle: "Pensá en la última vez que te fuiste de vacaciones o estuviste enfermo.",
      options: [
        { label: "A", text: "Todo sigue funcionando. Mi equipo sabe qué hacer sin mí.", score: 5 },
        { label: "B", text: "Funciona, pero hay decisiones que solo yo puedo tomar.", score: 3 },
        { label: "C", text: "Se genera un caos controlable, pero me llaman para todo.", score: 2 },
        { label: "D", text: "El negocio se paraliza. Sin mí, no hay negocio.", score: 1 },
      ],
    },
    {
      id: 2,
      title: '¿Cómo llegan los clientes nuevos a tu negocio?',
      subtitle: "Pensá en los últimos 5 clientes que cerraste.",
      options: [
        { label: "A", text: "Tengo un sistema claro: publicidad, redes, referidos trabajados. Llegan de forma predecible.", score: 5 },
        { label: "B", text: "Principalmente por recomendaciones. Funciona, pero no es un sistema mío.", score: 3 },
        { label: "C", text: "De manera irregular. Algunos meses bien, otros preocupantes.", score: 2 },
        { label: "D", text: "No tengo claro de dónde vienen. Espero que aparezcan y rezo.", score: 1 },
      ],
    },
    {
      id: 3,
      title: 'Cuando un prospecto dice "está caro", ¿qué pasa?',
      subtitle: "Tu reacción más honesta, no la más prolija.",
      options: [
        { label: "A", text: "Defiendo el precio con seguridad. Explico el valor y rara vez descuento.", score: 5 },
        { label: "B", text: "Explico el valor, pero si insisten, termino bajando algo para cerrar.", score: 3 },
        { label: "C", text: "Me cuesta responder. Suelo hacer algún descuento o me quedo sin argumentos.", score: 2 },
        { label: "D", text: "Bajo el precio directamente o pierdo la venta. No sé cómo manejarlo.", score: 1 },
      ],
    },
    {
      id: 4,
      title: "¿Tu equipo tira para el mismo lado que vos?",
      subtitle: "Pensá en la semana laboral promedio.",
      options: [
        { label: "A", text: "Sí. Saben para dónde vamos, tienen iniciativa y confío en ellos.", score: 5 },
        { label: "B", text: "En general sí, aunque siempre hay alguno que hay que estar empujando.", score: 3 },
        { label: "C", text: "Tengo gente buena, pero falta organización. Cada uno tira para su lado.", score: 2 },
        { label: "D", text: "Estoy solo o rodeado de personas que no están a la altura.", score: 1 },
      ],
    },
    {
      id: 5,
      title: "¿Cuántas veces resolvés el mismo problema en un mes?",
      subtitle: "Los problemas que deberían estar resueltos para siempre y siguen volviendo.",
      options: [
        { label: "A", text: "Casi nunca. Los problemas se procesan una vez y quedan resueltos para siempre.", score: 5 },
        { label: "B", text: "Algunos se repiten pero los manejo rápido porque ya sé cómo.", score: 3 },
        { label: "C", text: "Varios se repiten. Quiero sistematizar pero no tengo tiempo para hacerlo.", score: 2 },
        { label: "D", text: "Vivo apagando incendios. Lo mismo de siempre, todos los meses, sin parar.", score: 1 },
      ],
    },
    {
      id: 6,
      title: "¿Tenés asesores o referentes con quienes hablar de tu negocio?",
      subtitle: "Alguien que te diga la verdad, no solo lo que querés escuchar.",
      options: [
        { label: "A", text: "Sí. Trabajo con asesores que me aportan perspectiva real y me empujan a mejorar.", score: 5 },
        { label: "B", text: "Tengo algunos contactos del rubro que consulto de vez en cuando.", score: 3 },
        { label: "C", text: "Tuve malas experiencias con asesores. Mucha teoría, pocos resultados.", score: 2 },
        { label: "D", text: "No tengo a nadie. Las decisiones importantes las tomo solo, sin perspectiva externa.", score: 1 },
      ],
    },
    {
      id: 7,
      title: "¿Podés describir cómo querés que sea tu negocio en 3 años?",
      subtitle: "No lo que querés ganar. Cómo querés que funcione.",
      options: [
        { label: "A", text: "Sí, tengo una visión clara: sé qué empresa quiero ser, qué mercado atacar y cómo escalar.", score: 5 },
        { label: "B", text: "Tengo ideas generales pero no está definido con claridad ni escrito en ningún lado.", score: 3 },
        { label: "C", text: "Me cuesta proyectarme. El día a día no me deja pensar en el futuro.", score: 2 },
        { label: "D", text: "Honestamente, no sé. Vivo el presente y que sea lo que Dios quiera.", score: 1 },
      ],
    },
    {
      id: 8,
      title: "Si tuvieras que describir tu momento actual como dueño, ¿cuál es el más honesto?",
      subtitle: "La respuesta que no le darías a tu contador ni a tu familia.",
      options: [
        { label: "A", text: "Estoy creciendo y disfruto el proceso. El negocio me da energía.", score: 5 },
        { label: "B", text: "Funciona, pero algo me dice que podría ir mucho mejor.", score: 3 },
        { label: "C", text: "Estoy cansado. Trabajé mucho y los resultados no reflejan el esfuerzo.", score: 2 },
        { label: "D", text: "La verdad es que estoy atascado y no sé por dónde empezar a destrabar esto.", score: 1 },
      ],
    },
  ],
  scoringRules: [
    { profileKey: "SATURADO", fit: (a) => (a[1] <= 2 ? 3 : 0) + (a[5] <= 2 ? 3 : 0) + (a[4] <= 2 ? 1 : 0) + (a[8] <= 2 ? 1 : 0) },
    { profileKey: "EQUIPO_DESALINEADO", fit: (a) => (a[4] <= 2 ? 3 : 0) + (a[1] >= 3 ? 1 : 0) + (a[5] >= 3 ? 1 : 0) + (a[7] >= 3 ? 1 : 0) },
    { profileKey: "VENDEDOR_SIN_RESULTADOS", fit: (a) => (a[2] <= 2 ? 2 : 0) + (a[3] <= 2 ? 2 : 0) + (a[8] <= 2 ? 2 : 0) },
    { profileKey: "INVISIBLE", fit: (a) => (a[2] <= 2 ? 2 : 0) + (a[3] <= 2 ? 2 : 0) + (a[6] <= 2 ? 1 : 0) },
    { profileKey: "LIDER_SOLO", fit: (a) => (a[7] >= 3 ? 2 : 0) + (a[1] <= 2 ? 2 : 0) + (a[4] <= 2 ? 2 : 0) + (a[5] >= 3 ? 1 : 0) },
    { profileKey: "DESCONECTADO", fit: (a) => (a[1] >= 3 ? 1 : 0) + (a[7] <= 2 ? 2 : 0) + (a[6] <= 2 ? 2 : 0) },
    { profileKey: "ESTANCADO", fit: (a) => (a[2] <= 3 ? 1 : 0) + (a[7] <= 2 ? 1 : 0) + (a[8] <= 3 ? 1 : 0) + (a[1] >= 3 ? 1 : 0) + (a[5] >= 3 ? 1 : 0) },
    { profileKey: "NUEVA_GEN", fit: (a) => (a[8] >= 3 ? 2 : 0) + (a[7] >= 2 ? 1 : 0) + (a[6] <= 2 ? 1 : 0) + (a[2] <= 3 ? 1 : 0) },
  ],
  profiles: {
    SATURADO: {
      key: "SATURADO",
      title: "Saturado",
      tagline: "Trabajás el doble. Ganás la mitad de lo que deberías.",
      description: "El negocio creció sin estructura y ahora todo pasa por vos. Cada decisión, cada problema, cada incendio.",
      color: "#C64E4A",
      icon: "Flame",
      traits: ["Operativo crónico", "Delegación nula", "Procesos repetitivos"],
      advice: "Necesitás construir sistemas que funcionen sin vos. Empezá por documentar los 3 procesos que más te consumen tiempo.",
    },
    INVISIBLE: {
      key: "INVISIBLE",
      title: "Invisible",
      tagline: "Sos muy bueno en lo que hacés. El problema es que nadie lo sabe.",
      description: "Tus clientes actuales te valoran, pero los que no te conocen no tienen forma de distinguirte.",
      color: "#495F93",
      icon: "EyeOff",
      traits: ["Comunicación débil", "Precio sin defensa", "Diferenciación ausente"],
      advice: "Construí tu argumento de valor. ¿Por qué vos y no otro? Si no podés responder eso en 2 frases, tenés trabajo por hacer.",
    },
    LIDER_SOLO: {
      key: "LIDER_SOLO",
      title: "Líder Solo",
      tagline: "Tenés la visión. Falta el equipo que la ejecute sin que estés encima.",
      description: "Ves claramente para dónde va el negocio. Pero esa visión existe solo en tu cabeza.",
      color: "#495F93",
      icon: "UserX",
      traits: ["Micro-management", "Delegación fallida", "Visión sin ejecución"],
      advice: "Delegá resultados, no tareas. Definí qué esperás como resultado y dale a tu equipo la autonomía para llegar.",
    },
    DESCONECTADO: {
      key: "DESCONECTADO",
      title: "Desconectado",
      tagline: "Tu negocio funciona. Vos ya no sabés hacia dónde lo llevás.",
      description: "Lograste una operación que corre sola. Pero te desconectaste del rol estratégico.",
      color: "#E5A000",
      icon: "Unplug",
      traits: ["Estrategia ausente", "Decisiones sin perspectiva", "Inercia operativa"],
      advice: "Reservá 2 horas por semana para pensar en el negocio, no en el negocio. Sin laptop, sin teléfono, solo vos y una libreta.",
    },
    ESTANCADO: {
      key: "ESTANCADO",
      title: "Estancado",
      tagline: "Funciona. Pero sabés que debería estar yendo mucho mejor.",
      description: "No estás en crisis. Pero tampoco estás creciendo. Lo que te trajo hasta acá no es lo que te va a llevar al siguiente nivel.",
      color: "#656565",
      icon: "Pause",
      traits: ["Crecimiento frenado", "Sin canal propio", "Estrategia difusa"],
      advice: "El estancamiento no se rompe con más esfuerzo. Se rompe cambiando algo. Identificá qué te trajo hasta acá y qué necesitás cambiar.",
    },
    NUEVA_GEN: {
      key: "NUEVA_GEN",
      title: "Nueva Generación",
      tagline: "Tenés el motor encendido. Necesitás la estructura que lo sostenga.",
      description: "Tenés energía, visión y movimiento. El negocio corre por impulso, no por sistema.",
      color: "#495F93",
      icon: "Rocket",
      traits: ["Alta energía", "Sin estructura", "Potencial sin techo"],
      advice: "Los que ponen estructura ahora escalan. Los que no, llegan a un techo en 2 años y no saben por qué.",
    },
    EQUIPO_DESALINEADO: {
      key: "EQUIPO_DESALINEADO",
      title: "Equipo Desalineado",
      tagline: "Tu equipo quiere avanzar. Pero nadie sabe hacia dónde.",
      description: "No es que tu equipo sea malo. Es que no tienen un marco común.",
      color: "#E5A000",
      icon: "Users",
      traits: ["Roles difusos", "Reuniones improductivas", "Conflictos silenciosos"],
      advice: "Sentate con tu equipo y definan juntos: ¿Qué es prioridad? ¿Quién hace qué? ¿Cómo medimos el éxito?",
    },
    VENDEDOR_SIN_RESULTADOS: {
      key: "VENDEDOR_SIN_RESULTADOS",
      title: "Vendedor Sin Resultados",
      tagline: "Ponés el cuerpo todos los días. Pero la caja no lo refleja.",
      description: "Trabajás más que la mayoría. Pero el esfuerzo no se traduce en resultados porque no hay estrategia detrás.",
      color: "#C64E4A",
      icon: "TrendingDown",
      traits: ["Ventas sin proceso", "Ingresos irregulares", "Desgaste emocional"],
      advice: "Dejá de vender por impulso. Definí un proceso claro: prospectar → calificar → presentar → cerrar → seguir.",
    },
  },
};

// ── Test 2: Misión Rescate (Puzzle) ───────────────────────────

const misionRescate: TestDefinition = {
  slug: "mision-rescate",
  title: "Misión Rescate",
  subtitle: "¿Cómo reaccionás ante una crisis?",
  description:
    "Tu negocio está en crisis. Tenés 5 situaciones de emergencia y debés priorizar. No hay tiempo para pensar de más — solo para actuar.",
  category: "puzzle",
  icon: "Siren",
  color: "#DC2626",
  bgColor: "bg-red-50 dark:bg-red-950/30",
  gameType: "puzzle",
  timeEstimateMin: 3,
  questions: [
    {
      id: 1,
      title: "🚨 Lunes 8am: tu mayor cliente amenaza con irse.",
      subtitle: "Representa el 35% de tu facturación. Te da 48hs para mejorar.",
      options: [
        { label: "A", text: "Agendás reunión presencial hoy mismo para entender qué pasa y ofrecer una solución concreta.", score: 5, optimal: true },
        { label: "B", text: "Le mandás un email con un descuento del 15% para retenerlo.", score: 2 },
        { label: "C", text: "Lo pensás un par de días para armar una propuesta completa.", score: 1 },
      ],
    },
    {
      id: 2,
      title: "🚨 Tu empleado clave renuncia sin aviso.",
      subtitle: "Es el único que maneja el sistema de facturación y tiene clientes asignados.",
      options: [
        { label: "A", text: "Pedís una reunión de transferencia de conocimiento antes de que se vaya. Mientras tanto, buscás reemplazo.", score: 5, optimal: true },
        { label: "B", text: "Lo dejás ir y asumís vos temporalmente sus tareas.", score: 2 },
        { label: "C", text: "Le ofrecés más plata para que se quede.", score: 1 },
      ],
    },
    {
      id: 3,
      title: "🚨 Se corta el suministro de tu proveedor principal.",
      subtitle: "Tenés stock para 5 días. Tus clientes esperan entregas esta semana.",
      options: [
        { label: "A", text: "Contactás proveedores alternativos ya. Comunicás el posible retraso a clientes con un plan de contingencia.", score: 5, optimal: true },
        { label: "B", text: "Esperás a ver si el proveedor resuelve en 2-3 días.", score: 1 },
        { label: "C", text: "Cancelás los pedidos y ofrecés reembolsos.", score: 2 },
      ],
    },
    {
      id: 4,
      title: "🚨 Un cliente publica una reseña negativa viral en redes.",
      subtitle: "Tiene 200+ compartidos. Los comentarios se multiplican.",
      options: [
        { label: "A", text: "Respondés públicamente con empatía, asumís el error y ofrecés resolverlo por privado. Luego contactás al cliente.", score: 5, optimal: true },
        { label: "B", text: "Ignorás esperando que paje. Cuanto más atención, peor.", score: 1 },
        { label: "C", text: "Pedís que la reseña sea eliminada por la plataforma.", score: 2 },
      ],
    },
    {
      id: 5,
      title: "🚨 Hacienda te notifica una inspección para mañana.",
      subtitle: "Tenés algunos papeles atrasados y una factura sin registrar.",
      options: [
        { label: "A", text: "Organizás lo que tenés, preparás la documentación disponible y contactás a tu contador para estar acompañado.", score: 5, optimal: true },
        { label: "B", text: "Intentás pedir postergación de la inspección.", score: 2 },
        { label: "C", text: "Te ponés nervioso y no sabés por dónde empezar. Dejás que pase lo que tenga que pasar.", score: 1 },
      ],
    },
  ],
  scoringRules: [
    { profileKey: "ESTRATEGA", fit: (a) => Object.values(a).filter((v) => v === 5).length },
    { profileKey: "BOMBERO", fit: (a) => Object.values(a).filter((v) => v === 2).length * 2 },
    { profileKey: "PARALIZADO", fit: (a) => Object.values(a).filter((v) => v === 1).length * 3 },
  ],
  profiles: {
    ESTRATEGA: {
      key: "ESTRATEGA",
      title: "Estratega",
      tagline: "Bajo presión, priorizás con claridad y ejecutás con precisión.",
      description: "Cuando la crisis golpea, no te congelás — actuás. Pensás en el problema, no en el pánico.",
      color: "#059669",
      icon: "Target",
      traits: ["Claridad bajo presión", "Priorización natural", "Comunicación proactiva"],
      advice: "Tu fortaleza es tomar decisiones bajo presión. Asegurate de que tu equipo también tenga herramientas para hacerlo.",
    },
    BOMBERO: {
      key: "BOMBERO",
      title: "Bombero",
      tagline: "Apagás el incendio, pero no siempre elegís el mejor extintor.",
      description: "Reaccionás rápido, pero a veces la urgencia te lleva a soluciones parche en vez de soluciones reales.",
      color: "#F59E0B",
      icon: "Flame",
      traits: ["Reacción rápida", "Soluciones parche", "Energía alta"],
      advice: "Tu velocidad es una ventaja, pero necesitás un framework de decisión. Preguntate: ¿esto resuelve el problema o solo lo posterga?",
    },
    PARALIZADO: {
      key: "PARALIZADO",
      title: "Paralizado",
      tagline: "La crisis te frena cuando más necesitás actuar.",
      description: "No es que no te importe — es que la presión te bloquea. Necesitás estructura para actuar cuando el instinto te dice que te quedes quieto.",
      color: "#6B7280",
      icon: "ShieldAlert",
      traits: ["Análisis excesivo", "Evitación de conflicto", "Respuesta tardía"],
      advice: "Creá un protocolo de crisis antes de que lo necesités. Cuando llegue la crisis, seguí el protocolo, no tu instinto.",
    },
  },
};

// ── Test 3: El Camino (Adventure) ─────────────────────────────

const elCamino: TestDefinition = {
  slug: "el-camino",
  title: "El Camino",
  subtitle: "Tu estilo de negociación",
  description:
    "Una narrativa ramificada donde cada decisión revela cómo negociás, tomás decisiones y manejás los conflictos.",
  category: "aventura",
  icon: "Route",
  color: "#7C3AED",
  bgColor: "bg-violet-50 dark:bg-violet-950/30",
  gameType: "adventure",
  timeEstimateMin: 4,
  questions: [
    {
      id: 1,
      title: "Llegás a una encrucijada en tu negocio.",
      subtitle: "Tenés que elegir un camino. No hay vuelta atrás.",
      options: [
        { label: "A", text: "Tomás el camino seguro: crecimiento lento pero sostenible.", score: 3, next: 2 },
        { label: "B", text: "Tomás el camino arriesgado: crecimiento rápido pero incierto.", score: 5, next: 3 },
        { label: "C", text: "Buscas un mapa antes de elegir: investigás todas las opciones.", score: 2, next: 4 },
      ],
    },
    {
      id: 2,
      title: "El camino seguro tiene un obstáculo: un competidor grande bloquea tu paso.",
      subtitle: "Tenés menos recursos que él.",
      options: [
        { label: "A", text: "Lo enfrentás directamente con una propuesta diferenciada.", score: 5 },
        { label: "B", text: "Buscas un nicho que él no está atacando.", score: 4 },
        { label: "C", text: "Esperás a que se vaya o cometa un error.", score: 1 },
      ],
    },
    {
      id: 3,
      title: "El camino arriesgado te lleva a una oportunidad grande pero con un socio complicado.",
      subtitle: "El socio tiene contactos pero es difícil de manejar.",
      options: [
        { label: "A", text: "Aceptás, pero ponés reglas claras desde el día uno.", score: 5 },
        { label: "B", text: "Aceptás y vas viendo sobre la marcha.", score: 2 },
        { label: "C", text: "Rechazás. Preferís crecer más lento pero mantener el control.", score: 4 },
      ],
    },
    {
      id: 4,
      title: "Mientras investigás, descubrís que tu producto tiene un defecto que nadie notó.",
      subtitle: "Corregirlo cuesta plata y tiempo. No corregirlo es un riesgo latente.",
      options: [
        { label: "A", text: "Parás todo y corregís. La reputación es lo primero.", score: 5 },
        { label: "B", text: "Lo corregís en silencio en la próxima versión, sin decir nada.", score: 3 },
        { label: "C", text: "Lo ignorás por ahora. Si nadie se quejó, ¿para qué alarmar?", score: 1 },
      ],
    },
    {
      id: 5,
      title: "Después de tu elección, un empleado te pide una reunión urgente.",
      subtitle: "Parece nervioso. Dice que tiene algo importante que contarte.",
      options: [
        { label: "A", text: "Lo escuchás ahora mismo. Si tiene algo importante, no puede esperar.", score: 5 },
        { label: "B", text: "Le decís que agende para mañana. Tenés cosas más urgentes.", score: 2 },
        { label: "C", text: "Le pedís que te lo mande por email primero para evaluar.", score: 3 },
      ],
    },
  ],
  scoringRules: [
    { profileKey: "DIPLOMATICO", fit: (a) => (a[1] === 3 ? 2 : 0) + (a[3] === 5 ? 2 : 0) + (a[5] === 5 ? 2 : 0) + (a[2] === 4 ? 1 : 0) + (a[4] === 5 ? 1 : 0) },
    { profileKey: "AGRESIVO", fit: (a) => (a[1] === 5 ? 2 : 0) + (a[2] === 5 ? 2 : 0) + (a[3] === 2 ? 1 : 0) + (a[4] === 1 ? 2 : 0) },
    { profileKey: "EVITADOR", fit: (a) => (a[1] === 2 ? 2 : 0) + (a[2] === 1 ? 2 : 0) + (a[3] === 4 ? 1 : 0) + (a[4] === 3 ? 1 : 0) + (a[5] === 2 ? 1 : 0) },
  ],
  profiles: {
    DIPLOMATICO: {
      key: "DIPLOMATICO",
      title: "Diplomático",
      tagline: "Negociás con inteligencia emocional. Cerrás acuerdos que duran.",
      description: "No buscás ganar — buscás que funcione para todos. Tu fortaleza es leer la situación y adaptar tu estrategia.",
      color: "#059669",
      icon: "Handshake",
      traits: ["Empatía estratégica", "Acuerdos duraderos", "Comunicación asertiva"],
      advice: "Tu estilo construye relaciones. Cuidado con ser tan diplomático que evitás los conflictos necesarios.",
    },
    AGRESIVO: {
      key: "AGRESIVO",
      title: "Directo",
      tagline: "Vas al grano. Cerrás rápido. A veces dejás cosas en el camino.",
      description: "No perdés tiempo. Sabés lo que querés y vas por ello. El riesgo es que a veces la velocidad te hace perder detalles importantes.",
      color: "#DC2626",
      icon: "Zap",
      traits: ["Decisión rápida", "Orientado a resultados", "Impaciente con rodeos"],
      advice: "Tu velocidad es poderosa, pero aprendé a pausar antes de decisiones grandes. 5 minutos de reflexión pueden salvarte 5 meses de problemas.",
    },
    EVITADOR: {
      key: "EVITADOR",
      title: "Evitador",
      tagline: "Preferís la paz. Pero a veces la paz es estancamiento disfrazado.",
      description: "No te gustan los conflictos ni las decisiones irreversibles. Tu prudencia es una virtud hasta que se convierte en parálisis.",
      color: "#6B7280",
      icon: "Shield",
      traits: ["Prudente", "Análisis excesivo", "Evita confrontación"],
      advice: "La evitación no es paz — es deuda. Cada conflicto evitado hoy es un problema mayor mañana. Practicá tener conversaciones difíciles.",
    },
  },
};

// ── Test 4: Mind Lab (Mental) ─────────────────────────────────

const mindLab: TestDefinition = {
  slug: "mind-lab",
  title: "Mind Lab",
  subtitle: "Tu patrón de comunicación",
  description:
    "10 preguntas rápidas. Cada una mide cómo respondés ante situaciones laborales y emocionales. No pensés de más — dejá que tu instinto hable.",
  category: "mental",
  icon: "Brain",
  color: "#0891B2",
  bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  gameType: "mental",
  timeEstimateMin: 3,
  questions: [
    {
      id: 1,
      title: "Un cliente te manda un audio de 5 minutos quejándose.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Lo escuchás completo y respondés con calma.", score: 4 },
        { label: "B", text: "Leés el resumen y respondés directo al punto.", score: 5 },
        { label: "C", text: "Te da ansiedad y lo dejás para después.", score: 1 },
      ],
    },
    {
      id: 2,
      title: "En una reunión, alguien dice algo incorrecto sobre tu rubro.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Lo corregís en el momento, con datos.", score: 5 },
        { label: "B", text: "Lo dejás pasar para no generar conflicto.", score: 2 },
        { label: "C", text: "Lo corregís después, en privado.", score: 3 },
      ],
    },
    {
      id: 3,
      title: "Tu equipo está discutiendo y las voces se elevan.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Intervenís y ponés orden. Hay que bajar la temperatura.", score: 4 },
        { label: "B", text: "Los dejás resolver solos. Son adultos.", score: 2 },
        { label: "C", text: "Cambiás el tema y lo hablan en otro momento.", score: 3 },
      ],
    },
    {
      id: 4,
      title: "Te llega un mensaje de un contacto que no hablás hace 2 años pidiéndote un favor.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Respondés rápido y ayudás. Las redes se cuidan.", score: 4 },
        { label: "B", text: "Respondés cuando puedás, sin urgencia.", score: 3 },
        { label: "C", text: "Lo ignorás. Si no habló en 2 años, ¿por qué ahora?", score: 1 },
      ],
    },
    {
      id: 5,
      title: "Tenés que dar feedback negativo a alguien de tu equipo.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Lo hacés en privado, con ejemplos concretos y un plan de mejora.", score: 5 },
        { label: "B", text: "Se lo decés rápido para no prolongar la incomodidad.", score: 2 },
        { label: "C", text: "Se lo dejás por escrito para evitar la cara.", score: 1 },
      ],
    },
    {
      id: 6,
      title: "Un proveedor te aumenta un 30% sin aviso.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Llamás y negociás. Si no cede, buscás alternativas.", score: 5 },
        { label: "B", text: "Lo aceptás porque no tenés tiempo de buscar otro.", score: 1 },
        { label: "C", text: "Le mandás un mensaje enojado.", score: 2 },
      ],
    },
    {
      id: 7,
      title: "Estás agotado y llega un pedido urgente de un cliente importante.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Lo hacés, pero marcás que la próxima vez necesitás más tiempo.", score: 4 },
        { label: "B", text: "Lo hacés sin decir nada. Es tu trabajo.", score: 2 },
        { label: "C", text: "Le decís que no podés y lo reprogramás.", score: 5 },
      ],
    },
    {
      id: 8,
      title: "Alguien de tu red publica un logro profesional grande.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Le escribís una felicitación genuina.", score: 5 },
        { label: "B", text: "Le das like y listo.", score: 3 },
        { label: "C", text: "Sentís envidia y scrolleás.", score: 1 },
      ],
    },
    {
      id: 9,
      title: "Tenés 3 prioridades urgentes y solo tiempo para 1.",
      timeLimit: 15,
      options: [
        { label: "A", text: "Elegís la que más impacto tiene en el negocio.", score: 5 },
        { label: "B", text: "Elegís la más fácil de resolver.", score: 2 },
        { label: "C", text: "Tratás de hacer las 3 a medias.", score: 1 },
      ],
    },
    {
      id: 10,
      title: "Después de un día difícil, ¿qué hacés?",
      timeLimit: 15,
      options: [
        { label: "A", text: "Desconectás: deporte, familia, algo que no sea trabajo.", score: 5 },
        { label: "B", text: "Seguís revisando emails hasta dormir.", score: 1 },
        { label: "C", text: "Repasás mentalmente todo lo que salió mal.", score: 2 },
      ],
    },
  ],
  scoringRules: [
    { profileKey: "CONECTOR", fit: (a) => (a[1] >= 4 ? 2 : 0) + (a[3] >= 4 ? 2 : 0) + (a[4] >= 4 ? 2 : 0) + (a[5] >= 4 ? 1 : 0) + (a[8] >= 4 ? 1 : 0) },
    { profileKey: "TECNICO", fit: (a) => (a[2] >= 4 ? 2 : 0) + (a[5] >= 4 ? 2 : 0) + (a[6] >= 4 ? 2 : 0) + (a[9] >= 4 ? 1 : 0) },
    { profileKey: "CAOTICO", fit: (a) => (a[1] <= 2 ? 2 : 0) + (a[3] <= 2 ? 2 : 0) + (a[7] <= 2 ? 2 : 0) + (a[9] <= 2 ? 2 : 0) + (a[10] <= 2 ? 1 : 0) },
  ],
  profiles: {
    CONECTOR: {
      key: "CONECTOR",
      title: "Conector",
      tagline: "Tu inteligencia emocional es tu mayor activo comercial.",
      description: "Leés las personas, construís relaciones y mantenés redes. La gente confía en vos.",
      color: "#059669",
      icon: "Heart",
      traits: ["Empatía alta", "Redes fuertes", "Comunicación fluida"],
      advice: "Tu fortaleza es relacional. Cuidado con absorber las emociones de todos — poné límites sanos.",
    },
    TECNICO: {
      key: "TECNICO",
      title: "Técnico",
      tagline: "Sos claro, directo y eficiente. Pero a veces faltá calidez.",
      description: "Priorizás la eficiencia sobre la empatía. Tus respuestas son correctas, pero no siempre las más humanas.",
      color: "#2563EB",
      icon: "Cpu",
      traits: ["Eficiente", "Directo", "Orientado a datos"],
      advice: "Tu claridad es una ventaja. Sumá una dosis de empatía y vas a ser imparable. Las personas no recuerdan qué dijiste, sino cómo las hiciste sentir.",
    },
    CAOTICO: {
      key: "CAOTICO",
      title: "Caótico",
      tagline: "Tus respuestas son inconsistentes. A veces brillante, a veces desastroso.",
      description: "Tu comunicación depende de tu estado de ánimo. Un día sos el mejor líder, al siguiente generás conflicto sin querer.",
      color: "#F59E0B",
      icon: "Tornado",
      traits: ["Inconsistente", "Emocional", "Impredecible"],
      advice: "La consistencia es la base de la confianza. Creá rutinas de comunicación: agendas, templates, checklists. Reducí la dependencia de tu humor.",
    },
  },
};

// ── Test 5: Logic Gate (Logic) ────────────────────────────────

const logicGate: TestDefinition = {
  slug: "logic-gate",
  title: "Logic Gate",
  subtitle: "Tu pensamiento sistémico",
  description:
    "5 escenarios de negocio con múltiples variables. Elegís la mejor estrategia. No hay trampa — solo lógica.",
  category: "logica",
  icon: "CircuitBoard",
  color: "#4F46E5",
  bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  gameType: "logic",
  timeEstimateMin: 4,
  questions: [
    {
      id: 1,
      title: "Tu negocio tiene 3 productos. El A da 60% de ganancia pero se vende lento. El B da 20% pero se vende rápido. El C da 40% y tiene demanda estable.",
      subtitle: "Tenés presupuesto para promocionar solo uno este mes.",
      options: [
        { label: "A", text: "Promociono A: mayor margen, mayor impacto si despega.", score: 3 },
        { label: "B", text: "Promociono B: volumen alto = flujo de caja seguro.", score: 2 },
        { label: "C", text: "Promociono C: equilibrio entre margen y volumen. Menor riesgo.", score: 5 },
      ],
    },
    {
      id: 2,
      title: "Tenés 2 canales de venta: online (crece 15%/mes) y presencial (crece 3%/mes). El online requiere inversión tech. El presencial ya funciona.",
      subtitle: "Tenés $100 para distribuir entre ambos.",
      options: [
        { label: "A", text: "$80 online, $20 presencial. Apostar al crecimiento.", score: 3 },
        { label: "B", text: "$50 y $50. Equilibrar riesgo y crecimiento.", score: 2 },
        { label: "C", text: "$60 online, $40 presencial. Crecer online sin matar presencial.", score: 5 },
      ],
    },
    {
      id: 3,
      title: "Un competidor baja precios un 25%. Tu margen actual es del 30%.",
      subtitle: "Si bajás, perdés margen. Si no bajás, podés perder clientes.",
      options: [
        { label: "A", text: "No bajo. Me diferencio en calidad y servicio.", score: 5 },
        { label: "B", text: "Bajo un 15% para no perder volumen.", score: 2 },
        { label: "C", text: "Bajo un 25% para igualarlo. Guerra de precios.", score: 1 },
      ],
    },
    {
      id: 4,
      title: "Tu equipo de 5 personas tiene 2 personas top y 3 promedio. Tenés presupuesto para capacitar a todos o contratar a 1 persona top más.",
      subtitle: "La capacitación cuesta lo mismo que 1 contratación.",
      options: [
        { label: "A", text: "Capacito a los 5. Elevo el piso del equipo.", score: 3 },
        { label: "B", text: "Contrato 1 top. Sumo fuerza donde más necesito.", score: 2 },
        { label: "C", text: "Capacito a los 3 promedio y delego a los 2 top para que lideren.", score: 5 },
      ],
    },
    {
      id: 5,
      title: "Tu facturación crece 20% mensual pero tu flujo de caja es negativo hace 3 meses.",
      subtitle: "Estás creciendo, pero gastando más de lo que entra.",
      options: [
        { label: "A", text: "Sigo creciendo. El crecimiento se paga solo eventualmente.", score: 1 },
        { label: "B", text: "Freno el crecimiento y mejoro márgenes antes de seguir.", score: 5 },
        { label: "C", text: "Busco financiamiento para bancar el crecimiento.", score: 3 },
      ],
    },
  ],
  scoringRules: [
    { profileKey: "ARQUITECTO", fit: (a) => Object.values(a).filter((v) => v === 5).length * 3 },
    { profileKey: "INTUITIVO", fit: (a) => Object.values(a).filter((v) => v === 3).length * 2 },
    { profileKey: "IMPROVISADOR", fit: (a) => Object.values(a).filter((v) => v <= 2).length * 2 },
  ],
  profiles: {
    ARQUITECTO: {
      key: "ARQUITECTO",
      title: "Arquitecto",
      tagline: "Pensás en sistemas. Cada decisión tiene un porqué.",
      description: "No improvisás — diseñás. Tu fortaleza es ver las conexiones entre las decisiones y sus consecuencias.",
      color: "#4F46E5",
      icon: "Layers",
      traits: ["Pensamiento sistémico", "Planificación", "Visión de largo plazo"],
      advice: "Tu pensamiento es tu ventaja competitiva. Cuidado con el análisis paralysis — a veces hay que actuar con 80% de información.",
    },
    INTUITIVO: {
      key: "INTUITIVO",
      title: "Intuitivo",
      tagline: "Tu instinto es bueno. Pero no siempre sabés por qué.",
      description: "Tomás decisiones razonables sin un framework explícito. Tu intuición es experiencia acumulada, pero a veces te falla.",
      color: "#7C3AED",
      icon: "Lightbulb",
      traits: ["Instinto agudo", "Adaptabilidad", "Decisiones rápidas"],
      advice: "Tu intuición es valiosa — pero documentala. Cuando aciertás, escribí por qué. Eso convierte tu instinto en un sistema replicable.",
    },
    IMPROVISADOR: {
      key: "IMPROVISADOR",
      title: "Improvisador",
      tagline: "Resolvés sobre la marcha. A veces funciona, a veces no.",
      description: "No tenés un framework de decisión. Elegís lo que parece mejor en el momento, sin evaluar todas las variables.",
      color: "#F59E0B",
      icon: "Dice5",
      traits: ["Reactividad", "Sin framework", "Resultados variables"],
      advice: "Antes de cada decisión grande, hacete 3 preguntas: ¿Qué puede salir mal? ¿Cuál es el costo de no hacer nada? ¿Qué haría alguien que sabe más que yo?",
    },
  },
};

// ── Export all tests ───────────────────────────────────────────

export const ALL_TESTS: TestDefinition[] = [
  mirrorEstrategico,
  misionRescate,
  elCamino,
  mindLab,
  logicGate,
];

export function getTestBySlug(slug: string): TestDefinition | undefined {
  return ALL_TESTS.find((t) => t.slug === slug);
}

export function calculateProfile(
  test: TestDefinition,
  answers: Record<number, number>,
  totalTime?: number
): string {
  let bestKey = "";
  let bestScore = -1;

  for (const rule of test.scoringRules) {
    const score = rule.fit(answers, totalTime);
    if (score > bestScore) {
      bestScore = score;
      bestKey = rule.profileKey;
    }
  }

  return bestKey || Object.keys(test.profiles)[0];
}

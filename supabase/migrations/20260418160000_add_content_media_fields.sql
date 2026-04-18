-- Add media fields to content_posts for rich content types
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'infographic', 'book'));
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.content_posts ADD COLUMN IF NOT EXISTS resumen TEXT;

-- Insert sample content with different media types
-- VIDEOS
INSERT INTO public.content_posts (titulo, contenido, content_type, video_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Cómo definir tu propuesta de valor en 5 minutos',
  E'La mayoría de los emprendedores caen en el error de querer ser todo para todos. Eso es una receta para ser invisible.\n\nTu propuesta de valor tiene que responder UNA sola pregunta: ¿por qué alguien te elegiría a vos en vez de a tu competencia?\n\nEn este video te mostramos el ejercicio de los 3 filtros:\n1. ¿Qué problema específico resolvés?\n2. ¿Qué hacés diferente?\n3. ¿Por qué debería importarle al cliente?\n\nSi no podés responder las 3 en una oración, todavía no tenés propuesta de valor. Tenés un slogan vacío.\n\nMirá el video, hacé el ejercicio hoy. Mañana ya es tarde.',
  'video',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Ejercicio práctico de 5 minutos para definir qué te hace único frente a la competencia.',
  (SELECT id FROM public.content_categories WHERE slug = 'tip' LIMIT 1),
  'publicado',
  'admin',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Cómo definir tu propuesta de valor en 5 minutos');

-- INFOGRAPHIC
INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Los 7 errores que te están fundiendo (infografía)',
  E'Esta infografía resume los 7 errores más comunes que cometen los emprendedores argentinos:\n\n1. No separar las finanzas personales de las del negocio\n2. Fijar precios por lo que cobra la competencia (no por tu valor)\n3. No tener un sistema de seguimiento de clientes\n4. Reinventar la rueda en vez de usar procesos\n5. No medir nada (si no medís, no gestionás)\n6. Esperar el momento perfecto para lanzar\n7. No pedir ayuda cuando la necesitás\n\nDescargá la infografía, pegala en tu pared de trabajo. Cada semana revisá cuántos de estos errores estás cometiendo. El objetivo: llegar a cero.',
  'infographic',
  'https://placehold.co/800x1200/1e40af/ffffff?text=7+Errores+que+te+Funden%0AInfografia+MejoraApp',
  'Infografía con los 7 errores más comunes de emprendedores. Pegala en tu pared.',
  (SELECT id FROM public.content_categories WHERE slug = 'reflexion' LIMIT 1),
  'publicado',
  'ia',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Los 7 errores que te están fundiendo (infografía)');

-- BOOK / PDF
INSERT INTO public.content_posts (titulo, contenido, content_type, pdf_url, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Guía: Cómo armar tu primer plan de negocios (PDF)',
  E'Tener un plan de negocios no es burocracia. Es brújula.\n\nEsta guía de 12 páginas te lleva paso a paso:\n\nCAPÍTULO 1 — Definí tu visión\n¿Dónde querés estar en 12 meses? No más, no menos.\n\nCAPÍTULO 2 — Conocé tu mercado\nQuién te compra, por qué, cuánto está dispuesto a pagar.\n\nCAPÍTULO 3 — Tu modelo de ingresos\nCómo entra la plata. Fijo, recurrente, por proyecto.\n\nCAPÍTULO 4 — Costos reales\nLo que nadie cuenta: tu tiempo tiene un costo.\n\nCAPÍTULO 5 — Proyección a 12 meses\nNúmeros honestos. Ni optimistas ni pesimistas.\n\nCAPÍTULO 6 — Plan de acción\n3 prioridades por trimestre. Solo 3.\n\nDescargala gratis. Lela hoy. Aplicá mañana.',
  'book',
  'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
  'https://placehold.co/400x560/dc2626/ffffff?text=Plan+de+Negocios%0AGuia+MejoraApp',
  'Guía descargable de 12 páginas para armar tu primer plan de negocios desde cero.',
  (SELECT id FROM public.content_categories WHERE slug = 'estrategia' LIMIT 1),
  'publicado',
  'ia',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Guía: Cómo armar tu primer plan de negocios (PDF)');

-- ARTICLE (existing style, with image)
INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Dejá de competir por precio. Ahora.',
  E'Cada vez que bajás un precio para cerrar una venta, le estás mandando un mensaje a tu cliente: "lo que hago no vale lo que pido".\n\nEl cliente que te elige por precio se va por precio. No hay lealtad en la baratura.\n\nLa solución no es ser caro. Es ser claro.\n\n¿Qué problema resolvés? ¿Cuánto le cuesta a tu cliente NO resolverlo? Ahí está tu precio.\n\nEjemplo real: Un contador que cobra $50.000/mes parece caro hasta que le mostrás que te está ahorrando $200.000 en impuestos que pagarías mal.\n\nCobrá por lo que generás, no por lo que hacés. Hay una diferencia enorme.',
  'article',
  'https://placehold.co/800x400/0f172a/fbbf24?text=No+compitas+por+precio',
  'Por qué bajar precios es una trampa y cómo fijar precios por valor real.',
  (SELECT id FROM public.content_categories WHERE slug = 'estrategia' LIMIT 1),
  'publicado',
  'admin',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Dejá de competir por precio. Ahora.');

-- Another VIDEO
INSERT INTO public.content_posts (titulo, contenido, content_type, video_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Sistema de seguimiento de clientes en 15 minutos',
  E'¿Cuántos clientes potenciales perdés por no hacer seguimiento?\n\nEl 80% de las ventas se cierran entre el 5° y 12° contacto. La mayoría se rinde después del 2°.\n\nEn este video te armamos un sistema de seguimiento con herramientas gratuitas:\n- Google Sheets como CRM básico\n- Recordatorios automáticos\n- Scripts de mensajes que no suenan a spam\n\nNo necesitás un CRM caro. Necesitás disciplina y un proceso.\n\n15 minutos. Un spreadsheet. Cero excusas.',
  'video',
  'https://www.youtube.com/embed/jNQXAC9IVRw',
  'Armá un sistema de seguimiento de clientes con herramientas gratis en 15 minutos.',
  (SELECT id FROM public.content_categories WHERE slug = 'tip' LIMIT 1),
  'publicado',
  'admin',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Sistema de seguimiento de clientes en 15 minutos');

-- Another INFOGRAPHIC
INSERT INTO public.content_posts (titulo, contenido, content_type, imagen_url, resumen, category_id, estado, fuente, published_at)
SELECT
  'Mapa de decisiones: ¿Es momento de invertir o ahorrar?',
  E'Cada peso que entra a tu negocio es una decisión: ¿lo invertís o lo guardás?\n\nLa mayoría de los emprendedores caen en dos extremos:\n- Reinvierten todo y no tienen colchón para imprevistos\n- Ahorran todo y el negocio no crece\n\nEsta infografía te da el mapa de decisión:\n\n¿Tenés fondo de emergencia de 3 meses? → SÍ: invertí. → NO: ahorrá.\n¿La inversión tiene retorno en 90 días? → SÍ: priorizala. → NO: escalala.\n¿Podés medir el resultado? → SÍ: hacela. → NO: replanteala.\n\nRegla de oro: 30% ahorro, 70% inversión medible. Siempre.',
  'infographic',
  'https://placehold.co/800x1000/059669/ffffff?text=Mapa+de+Decisiones%0AInvertir+o+Ahorrar',
  'Mapa visual para decidir si invertir o ahorrar cada peso que entra.',
  (SELECT id FROM public.content_categories WHERE slug = 'tip' LIMIT 1),
  'publicado',
  'ia',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.content_posts WHERE titulo = 'Mapa de decisiones: ¿Es momento de invertir o ahorrar?');

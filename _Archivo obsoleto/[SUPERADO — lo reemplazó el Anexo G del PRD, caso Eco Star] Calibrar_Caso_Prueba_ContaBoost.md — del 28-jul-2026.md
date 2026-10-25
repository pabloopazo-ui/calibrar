# Caso de prueba — ContaBoost (cliente ficticio)
**Para validar el System Prompt Maestro en el Workbench de Anthropic · Junio 2026**

Cliente ficticio diseñado con problemas en varias capas (viabilidad, medición, arquitectura, copy) + una contradicción P16/P19 + landing sin fetch. Sirve para verificar que el prompt diagnostica en capas, señala contradicciones sin resolverlas y marca N/D sin inventar.

---

## 1. Mensaje "User" — pégalo en el Workbench

```
<datos_contacto>
nombre: Rodrigo Martínez
empresa: ContaBoost
sitio_web: https://contaboost.cl
whatsapp: +56998765432
email: rodrigo@contaboost.cl
</datos_contacto>

<respuestas_formulario>
p1_tipo_negocio: B2B — vendemos a otras empresas
p2_rubro: Software SaaS de facturación electrónica y contabilidad para PYMEs
p3_antiguedad: 3 a 6 años
p4_tamano_equipo: 6 a 20 personas
p5_ticket: Plan mensual de $29.990 CLP (suscripción)
p6_quien_cierra: Tengo 2 vendedores y yo también cierro
p7_plataformas: Meta (Facebook e Instagram) y LinkedIn
p8_tiempo_invirtiendo: Más de 6 meses
p9_presupuesto: $400.000 CLP al mes
p10_objetivo: Tráfico al sitio web
p11_destino: Una landing page propia (prueba gratis)
p12_url_landing: https://contaboost.cl/prueba-gratis
p13_geografia: Todo Chile
p14_geografia_detalle:
p15_copy_anuncio: "ContaBoost: la forma más fácil de llevar tu contabilidad. Software en la nube, soporte en español. Prueba gratis 14 días. Haz clic y empieza hoy."
p16_pixel: No estoy seguro si lo tengo instalado
p17_pixel_id:
p18_capi: No sé qué es la API de Conversiones
p19_eventos: Sí, creo que tengo algunos eventos configurados, pero no sé si funcionan
p20_utms: No uso UTMs
p21_analitica: Tengo Google Analytics (GA4)
p22_a_quien_vende: Dueños y gerentes de PYMEs
p23_describe_icp: Dueño de PYME de 5 a 20 empleados que todavía lleva la contabilidad en Excel o con un contador externo caro
p24_edad_icp: 35 a 54 años
p25_sintoma: Los leads no califican — piden información, prueban y desaparecen. Casi nadie se convierte en cliente pagado.
p26_mide_cpl: No lo tengo medido con exactitud
p27_cpl_declarado:
p28_intentos: Tuvimos una agencia 6 meses que solo nos mandaba reportes de impresiones y alcance, nunca de ventas. Cambiamos el público objetivo tres veces y el costo por resultado solo subió. Ahora lo llevamos nosotros y seguimos sin cerrar clientes pagados.
</respuestas_formulario>

<landing_html>
</landing_html>

Genera el informe de diagnóstico en JSON según el schema.
```

> Nota: dejé `<landing_html>` vacío a propósito — así verificas que la Sección 3 sale como N/D sin inventar contenido (igual que cuando el Módulo 6 de Make no logra el fetch).

---

## 2. Output esperado (generado con este prompt — referencia de estructura y tono)

```json
{
  "meta": {
    "nombre_empresa": "ContaBoost",
    "tipo_negocio": "B2B — SaaS de facturación y contabilidad para PYMEs",
    "datos_faltantes": ["P14 (sin dato — geografía es 'Todo Chile')", "P17 (Pixel ID no entregado)", "P27 (CPL no declarado; coherente con P26 'no medido')"],
    "contradicciones_detectadas": [
      "P16 dice 'no estoy seguro si tengo Pixel' pero P19 dice 'tengo algunos eventos configurados'. Los eventos de conversión no pueden existir sin un Pixel activo. Inconsistencia de medición a auditar — no se asume cuál respuesta es correcta."
    ],
    "landing_evaluable": false
  },
  "seccion_1_diagnostico_rapido": {
    "reasoning": "Tres hallazgos dominantes en orden de capa. Capa 3 (arquitectura): el objetivo 'Tráfico' contradice la meta de leads y explica directamente el síntoma 'no califican'. Capa 2 (medición): la cuenta está prácticamente ciega — sin Pixel confirmado, sin CAPI, sin UTMs, eventos contradictorios. Capa 1 (viabilidad): LinkedIn sobre un ticket de $29.990 destruye unit economics. Los tres son CRÍTICOS; ninguna optimización de creativo los rescata.",
    "resumen_ejecutivo": "Llevas 6 meses sin cerrar clientes pagados, pero el problema no es tu producto ni tu público: es que tus campañas están configuradas para generar visitas, no ventas, y tu cuenta no puede medir quién convierte. Estás pagando por clics de gente que nunca tuvo intención de pagar, y no tienes forma de saberlo.",
    "tres_hallazgos": [
      {"hallazgo": "El objetivo de campaña es 'Tráfico': Meta te trae clics baratos, no compradores. Por eso los leads no califican.", "severidad": "CRÍTICO", "evidencia": "P10 'Tráfico' × P25 'no califican' (Matriz D.1)"},
      {"hallazgo": "Cuenta ciega: no hay certeza de Pixel, no hay CAPI, no hay UTMs y los eventos se contradicen. Meta optimiza a oscuras y tú no puedes atribuir nada.", "severidad": "CRÍTICO", "evidencia": "P16, P18, P19, P20 (Matriz B.9 / B.12)"},
      {"hallazgo": "LinkedIn sobre un ticket de $29.990/mes: es el canal más caro del mercado contra tu ticket más bajo. Cada lead de LinkedIn cuesta más de lo que deja un mes de suscripción.", "severidad": "CRÍTICO", "evidencia": "P5 ticket bajo × P7 LinkedIn (Matriz A.4)"}
    ]
  },
  "seccion_2_analisis_copy": {
    "reasoning": "Grupo F. El copy no filtra al ICP declarado en P22/P23 y su CTA ('haz clic') está alineado al objetivo equivocado (Tráfico), reforzando el problema de la Capa 3.",
    "filtra_al_icp": "No. El copy es genérico ('la forma más fácil de llevar tu contabilidad') y no menciona al ICP que tú mismo definiste: dueño de PYME de 5-20 empleados que hoy usa Excel o un contador caro. No repele a estudiantes, contadores curiosos ni microempresas de 1 persona — atrae a todos, por eso entran leads que no califican.",
    "uso_de_negacion_hook": "No usa negación ni precalificación. Abre con un beneficio suave y universal. Un hook que filtrara diría algo como 'Si todavía llevas la contabilidad de tu PYME en Excel, estás perdiendo horas y arriesgando multas del SII'.",
    "friccion_cta": "El CTA 'Haz clic y empieza hoy' empuja al clic, no a la conversión. Coherente con el objetivo 'Tráfico' pero incoherente con tu meta real (clientes pagados). Debería invitar a la acción de valor: 'Activa tu prueba' o 'Agenda una demo de 15 min'.",
    "veredicto": "El copy está optimizado para que la gente entre, no para que la gente correcta entre. Refuerza exactamente el problema que reportas."
  },
  "seccion_3_analisis_landing": {
    "reasoning": "No se proporcionó landing_html en esta ejecución, por lo tanto landing_evaluable=false. No se evalúa contenido que no se vio. Pendiente de revisión cuando el fetch (Módulo 6) entregue el HTML de https://contaboost.cl/prueba-gratis.",
    "hallazgo": "N/D — no se pudo acceder a la landing al momento del análisis. Esta sección queda pendiente de revisión manual.",
    "message_match": "N/D",
    "cta_landing": "N/D",
    "evidencias_conversion": "N/D"
  },
  "seccion_4_evaluacion_configuracion": {
    "reasoning": "Capa 2 (medición) y Capa 3 (arquitectura). El stack es el agujero más profundo: con el objetivo en Tráfico, Meta ni siquiera intenta optimizar conversiones, y aunque quisiera, no podría, porque la señal está rota o ausente.",
    "objetivo_vs_meta": "Desalineado y crítico. Tu meta es clientes pagados; tu objetivo configurado es Tráfico, que optimiza clics. Meta cumple su instrucción (te trae visitas) y tú interpretas el resultado como 'leads malos'. El objetivo correcto es Conversiones o Leads, una vez que la medición exista.",
    "segmentacion": "Audiencia amplia ('Todo Chile', 35-54, dueños de PYME) es razonable para Meta, pero LinkedIn no se justifica para este ticket. Recomendación: concentrar el presupuesto en Meta y soltar LinkedIn hasta que exista un plan anual de mayor valor.",
    "presupuesto_vs_meta": "$400.000/mes repartido entre Meta y LinkedIn no alcanza la masa crítica de 50 conversiones/semana en ninguno de los dos. Concentrado solo en Meta, recién entra en rango mínimo viable para Chile [referencial].",
    "stack_medicion": "Crítico. P16: no hay certeza de Pixel. P18: sin CAPI (estándar 2026; sin ella se sub-reporta 15-30% de conversiones [referencial]). P20: sin UTMs (GA4 queda ciego al origen de cada campaña). CONTRADICCIÓN a resolver: P19 declara eventos configurados pero P16 no confirma Pixel — los eventos no existen sin Pixel. Probablemente el Pixel está instalado pero sin verificar. Acción: auditar el Gestor de Eventos de Meta antes de cualquier otra cosa. No asumimos cuál de las dos respuestas es la correcta."
  },
  "seccion_5_tres_problemas_criticos": {
    "reasoning": "Orden por impacto en CAC respetando capas: medición (Capa 2) primero porque sin ella no se puede ni diagnosticar ni optimizar; luego objetivo (Capa 3) que es la causa directa del síntoma; luego canal (Capa 1) que sangra presupuesto. El ticket bajo B2B se observa pero requiere dato de LTV/recompra que no entregaste, así que no lo elevamos a problema #1 sin evidencia.",
    "problemas": [
      {"orden": 1, "problema": "La cuenta no puede medir conversiones: Pixel sin confirmar, sin CAPI, sin UTMs y eventos contradictorios.", "impacto_cac": "Sin señal, Meta no aprende quién convierte y el CPA se infla 20-40% o más. Además no puedes calcular tu CAC real, así que ninguna decisión de inversión está fundamentada.", "severidad": "CRÍTICO", "evidencia": "P16/P18/P19/P20 (Matriz B.9, B.12)"},
      {"orden": 2, "problema": "El objetivo de campaña es 'Tráfico', no Conversiones/Leads. Estás comprando clics, no clientes.", "impacto_cac": "Atraes volumen de baja intención; el 'lead' promedio nunca tuvo intención de pagar. Tu costo por cliente real es muchísimo mayor que tu costo por clic, y por eso la percepción de 'leads que no califican'.", "severidad": "CRÍTICO", "evidencia": "P10 × P25 (Matriz D.1)"},
      {"orden": 3, "problema": "LinkedIn activo sobre un ticket de $29.990/mes.", "impacto_cac": "El CPL de LinkedIn (el más alto del mercado) supera el ingreso de varios meses de suscripción. Cada peso ahí destruye margen y fragmenta el presupuesto que Meta necesita para salir de la fase de aprendizaje.", "severidad": "CRÍTICO", "evidencia": "P5 × P7 (Matriz A.4, A.6)"}
    ]
  },
  "seccion_6_tres_acciones_prioritarias": {
    "reasoning": "Cada acción ataca un problema en orden de palanca. Primero se destapa la medición (sin eso nada se puede comprobar), luego se corrige el objetivo (causa directa del síntoma) y se concentra el presupuesto. Son ejecutables en una semana.",
    "acciones": [
      {"orden": 1, "accion": "Esta semana: entra al Gestor de Eventos de Meta y verifica si el Pixel existe y está activo. Instala/verifica el Pixel, activa la CAPI de un clic (gratis desde 2026) y crea el evento que represente un cliente real (registro de prueba o pago), no un PageView. Agrega UTMs a todos los links.", "ataca_problema": 1},
      {"orden": 2, "accion": "Cambia el objetivo de campaña de 'Tráfico' a Conversiones (o Leads), apuntando al evento de valor que acabas de crear. Deja que Meta optimice hacia quien prueba/paga, no hacia quien hace clic.", "ataca_problema": 2},
      {"orden": 3, "accion": "Pausa LinkedIn y concentra el 100% de los $400.000 en Meta. Con un solo canal financiado tienes opción real de alcanzar las 50 conversiones/semana y salir de la fase de aprendizaje.", "ataca_problema": 3}
    ],
    "cierre_cta": "Estos tres cambios corrigen la base, pero el orden y el detalle de ejecución dependen de lo que encontremos al auditar tu cuenta en vivo — incluido el estado real del Pixel y tu CAC verdadero una vez que la medición exista. Agenda una reunión estratégica con Pablo para revisar tu cuenta juntos y priorizar la ejecución sin perder presupuesto en el intento."
  }
}
```

---

## 3. Cómo correrlo tú en el Workbench (paso a paso)

1. Abre **https://console.anthropic.com/workbench** e inicia sesión con la cuenta de Anthropic de Precisión (la misma que paga la API de Calibrar).
2. Arriba a la derecha, selecciona el modelo **claude-sonnet-4-6** (el de producción). En los parámetros (engranaje o panel derecho): **Temperature = 0.4**, **Max tokens = 6000**.
3. Busca el campo **"System prompt"** (suele estar arriba, como un bloque separado del chat). Pega ahí TODO el contenido entre las líneas `===` del archivo `Calibrar_System_Prompt_Maestro_v1.md`.
4. En el área de mensaje **User**, pega el bloque completo del punto 1 de este archivo (desde `<datos_contacto>` hasta `Genera el informe…`).
5. Presiona **Run** (o Ctrl/Cmd + Enter).
6. Verifica el output contra esta checklist:
   - [ ] Devuelve **solo JSON**, sin texto antes ni después, sin ```.
   - [ ] Las **6 secciones** están completas y cada una tiene su campo `reasoning`.
   - [ ] La **Sección 3** salió **N/D** (no inventó la landing).
   - [ ] `meta.contradicciones_detectadas` **detectó el choque P16/P19** y NO eligió una versión.
   - [ ] Los hallazgos están **ordenados por capa** (medición/objetivo antes que copy).
   - [ ] El tono es directo y en lenguaje de negocio (CAC/CPL), no métricas de plataforma.

Si algo de la checklist falla, ese es el punto a ajustar en el prompt antes de llevarlo a Make. Si todo pasa, el prompt está listo para el Módulo 8 de la Fase 2.
```

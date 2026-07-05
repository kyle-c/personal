/**
 * Felix's brain — the LLM behind the conversation. Receives the designer's
 * message plus a compact summary of the product, returns a reply and a list
 * of typed actions the studio executes. Structured outputs guarantee the
 * response parses; the client still validates every action.
 *
 * Requires ANTHROPIC_API_KEY. Model defaults to claude-opus-4-8 (best copy
 * quality — the copy IS the product); override with FELIX_MODEL.
 */
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.FELIX_MODEL || 'claude-opus-4-8';

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

export const brainEnabled = () => client !== null;
export const brainModel = () => MODEL;

// ---------------------------------------------------------------------------
// Action schema — mirrors the studio's Intent contract. Structured outputs
// require additionalProperties:false and full `required` lists; nullable
// fields use type unions with "null".
// ---------------------------------------------------------------------------

const BLOCK_KINDS = ['navbar', 'hero', 'features', 'stats', 'form', 'pricing', 'testimonial', 'table', 'cta', 'footer'];

const nullable = (t) => ({ type: [t, 'null'] });

const strArray = { type: 'array', items: { type: 'string' } };

const PROPS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'brand', 'links', 'ctaLabel', 'fineprint', 'badge', 'headline', 'subhead',
    'primaryCta', 'secondaryCta', 'quote', 'author', 'role', 'title',
    'submitLabel', 'footnote', 'items', 'stats', 'tiers', 'fields', 'columns', 'rows',
  ],
  properties: {
    brand: nullable('string'),
    links: { anyOf: [strArray, { type: 'null' }] },
    ctaLabel: nullable('string'),
    fineprint: nullable('string'),
    badge: nullable('string'),
    headline: nullable('string'),
    subhead: nullable('string'),
    primaryCta: nullable('string'),
    secondaryCta: nullable('string'),
    quote: nullable('string'),
    author: nullable('string'),
    role: nullable('string'),
    title: nullable('string'),
    submitLabel: nullable('string'),
    footnote: nullable('string'),
    items: {
      anyOf: [
        { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title', 'body'], properties: { title: { type: 'string' }, body: { type: 'string' } } } },
        { type: 'null' },
      ],
    },
    stats: {
      anyOf: [
        { type: 'array', items: { type: 'object', additionalProperties: false, required: ['label', 'value', 'delta'], properties: { label: { type: 'string' }, value: { type: 'string' }, delta: nullable('string') } } },
        { type: 'null' },
      ],
    },
    tiers: {
      anyOf: [
        { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name', 'price', 'blurb', 'cta', 'featured'], properties: { name: { type: 'string' }, price: { type: 'string' }, blurb: { type: 'string' }, cta: { type: 'string' }, featured: { type: 'boolean' } } } },
        { type: 'null' },
      ],
    },
    fields: {
      anyOf: [
        { type: 'array', items: { type: 'object', additionalProperties: false, required: ['label', 'placeholder', 'type'], properties: { label: { type: 'string' }, placeholder: { type: 'string' }, type: nullable('string') } } },
        { type: 'null' },
      ],
    },
    columns: { anyOf: [strArray, { type: 'null' }] },
    rows: {
      anyOf: [
        {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['cells', 'badge'],
            properties: {
              cells: strArray,
              badge: {
                anyOf: [
                  { type: 'object', additionalProperties: false, required: ['label', 'tone'], properties: { label: { type: 'string' }, tone: { type: 'string', enum: ['positive', 'warning', 'neutral', 'danger'] } } },
                  { type: 'null' },
                ],
              },
            },
          },
        },
        { type: 'null' },
      ],
    },
  },
};

const action = (type, props, required) => ({
  type: 'object',
  additionalProperties: false,
  required: ['type', ...required],
  properties: { type: { const: type }, ...props },
});

const ACTIONS_SCHEMA = {
  anyOf: [
    action('set_business', { name: nullable('string'), industry: nullable('string') }, ['name', 'industry']),
    action('create_screen', {
      name: { type: 'string' },
      surface: { type: 'string', enum: ['web', 'native', 'chat'] },
      blocks: { type: 'array', items: { type: 'string', enum: BLOCK_KINDS } },
    }, ['name', 'surface', 'blocks']),
    action('remove_screen', { screen: { type: 'string' } }, ['screen']),
    action('add_block', { block: { type: 'string', enum: BLOCK_KINDS }, screen: nullable('string') }, ['block', 'screen']),
    action('remove_block', { block: { type: 'string', enum: BLOCK_KINDS }, screen: nullable('string') }, ['block', 'screen']),
    action('set_props', { block: { type: 'string', enum: BLOCK_KINDS }, screen: nullable('string'), props: PROPS_SCHEMA }, ['block', 'screen', 'props']),
    action('rewrite_copy', { screen: nullable('string'), force: { type: 'boolean' } }, ['screen', 'force']),
    action('set_voice', { tone: { anyOf: [{ type: 'string', enum: ['warm', 'professional', 'playful'] }, { type: 'null' }] }, emoji: nullable('boolean') }, ['tone', 'emoji']),
    action('set_color', { slot: { type: 'string', enum: ['primary', 'background', 'ink'] }, value: { type: 'string' } }, ['slot', 'value']),
    action('set_radius', { value: { type: 'integer' } }, ['value']),
    action('set_density', { density: { type: 'string', enum: ['compact', 'comfortable', 'spacious'] } }, ['density']),
    action('set_shadow', { level: { type: 'string', enum: ['none', 'soft', 'pronounced'] } }, ['level']),
    action('set_font', { slot: { type: 'string', enum: ['display', 'body'] }, family: { type: 'string' } }, ['slot', 'family']),
    action('audit', {}, []),
    action('fix_drift', {}, []),
    action('undo', {}, []),
  ],
};

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'actions'],
  properties: {
    reply: { type: 'string' },
    actions: { type: 'array', items: ACTIONS_SCHEMA },
  },
};

// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are Felix, a conversational design system inside a Figma-style studio. The designer talks to you; you build and maintain their product by returning actions the studio executes, plus a short reply.

The product lives on three surfaces (web pages, native app screens, WhatsApp chat flows), all derived from one business profile, one token set, and one voice. Content is data: every visible string lives in block props.

Rules:
- Prefer acting over asking. When a request is genuinely ambiguous (which screen? destructive scope?), return NO actions and ask ONE short clarifying question in the reply.
- Resolve context: "make it darker" after a color change refers to that color; "this" refers to the selection given in the state.
- For content requests ("rewrite the hero for luxury clients", "punchier headline"), use set_props with fully written copy in the business's voice. Write real copy, never placeholders. Only include the props you are changing; set everything else to null.
- Colors are hex values. Check contrast in your head — if the designer picks a primary that will fail WCAG AA against white text, do it, but warn them in the reply.
- Hand-edited content is sacred: rewrite_copy with force=false preserves it. Only set force=true when the designer explicitly says to overwrite their edits.
- Radius is 0–24px. Density: compact/comfortable/spacious. Shadows: none/soft/pronounced.
- Keep replies to 1–3 sentences, concrete and warm. Never enumerate the actions you took — the canvas shows them. Mention only surprises, warnings, or what you preserved.
- If the designer asks a question about the product or design ("why is this failing contrast?", "what would you change?"), answer it in the reply with no actions — or with an audit action if they want a health check.`;

export async function think(payload) {
  if (!client) throw Object.assign(new Error('no api key'), { code: 'NO_KEY' });
  const { input, state, recent } = payload;

  const context = [
    `PRODUCT STATE:`,
    JSON.stringify(state),
    ``,
    `RECENT CONVERSATION (oldest first):`,
    ...(recent ?? []).map((m) => `${m.role === 'designer' ? 'Designer' : 'Felix'}: ${m.text}`),
    ``,
    `DESIGNER'S MESSAGE: ${input}`,
  ].join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: context }],
  });

  if (response.stop_reason === 'refusal') {
    return { reply: 'I can’t help with that one — let’s keep it to the product.', actions: [] };
  }
  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  return JSON.parse(text);
}

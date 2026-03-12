import type { UserSession } from '../types';
import { sendListMessage, sendTextMessage, sendInteractiveButtons } from '../services/whatsapp';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

const strings = { en, es };

export async function handleCommunityMenu(to: string, session: UserSession): Promise<UserSession> {
  const s = strings[session.language];

  await sendListMessage(to, s.community.title, s.menuButton, [
    {
      title: s.community.title.split('\n')[0],
      rows: [
        { id: 'health', title: s.community.health },
        { id: 'education', title: s.community.education },
        { id: 'housing', title: s.community.housing },
        { id: 'events', title: s.community.events },
        { id: 'backToMenu', title: s.community.back },
      ],
    },
  ]);

  return { ...session, currentNode: 'community-menu' };
}

export async function handleCommunityAction(
  to: string,
  actionId: string,
  session: UserSession
): Promise<UserSession> {
  const s = strings[session.language];
  const lang = session.language;

  const contentMap: Record<string, string> = {
    health: lang === 'es'
      ? '🏥 Recursos de Salud\n\n• Centros Comunitarios (FQHCs): Tarifas según ingreso\n• Clínicas Gratuitas: freeclinics.com\n• Emergencias: No pueden rechazarte\n• WIC: Nutrición para embarazadas y niños\n• CHIP: Seguro para niños'
      : '🏥 Healthcare Resources\n\n• Community Health Centers (FQHCs): Sliding-scale fees\n• Free Clinics: freeclinics.com\n• Emergency Rooms: Cannot turn you away\n• WIC: Nutrition for pregnant women & children\n• CHIP: Children\'s health insurance',
    education: lang === 'es'
      ? '🎓 Educación\n\n📚 Niños: Escuela pública K-12 GRATIS, Head Start, comidas escolares\n📖 Adultos: Clases ESL, GED, biblioteca\n🎓 Superior: Matrícula estatal, becas TheDream.US'
      : '🎓 Education\n\n📚 Children: Public K-12 FREE, Head Start, school meals\n📖 Adults: ESL classes, GED, library programs\n🎓 Higher Ed: In-state tuition, TheDream.US scholarships',
    housing: lang === 'es'
      ? '🏠 Vivienda\n\n• HUD: hud.gov\n• Sección 8: Vales de renta\n• Refugios: Llama al 211\n• Habitat for Humanity\n\nDerechos: No discriminación, vivienda segura, debido proceso'
      : '🏠 Housing\n\n• HUD: hud.gov\n• Section 8: Rental vouchers\n• Shelters: Call 211\n• Habitat for Humanity\n\nRights: No discrimination, safe housing, due process',
    events: lang === 'es'
      ? '📅 Eventos\n\n🗓️ Clínica Legal Gratuita — Cada sábado\n🗓️ Taller Conoce Tus Derechos — Mar 15\n🗓️ Preparación de Impuestos VITA — Hasta abril 15\n🗓️ Clases ESL — Inscripción continua\n🗓️ Feria de Empleo — Mar 22'
      : '📅 Events\n\n🗓️ Free Legal Clinic — Every Saturday\n🗓️ Know Your Rights Workshop — Mar 15\n🗓️ Tax Prep VITA — Through April 15\n🗓️ ESL Classes — Ongoing enrollment\n🗓️ Job Fair — Mar 22',
  };

  const content = contentMap[actionId];
  if (content) {
    await sendTextMessage(to, content);
    await sendInteractiveButtons(to, s.back, [
      { id: 'community', title: s.community.back.slice(0, 20) },
      { id: 'backToMenu', title: s.backToMenu.slice(0, 20) },
    ]);
    return { ...session, currentNode: `community-${actionId}` };
  }

  return session;
}

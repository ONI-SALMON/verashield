// Platforms where the content can appear. Language-neutral data: the steps and the text to paste
// live in lib/content/{lang}.js under platforms[id]. status has the same meaning as in lib/countries.
// A platform without a verified route is never given a made-up link or invented menu path.
const ON = '2026-11-01';

export const PLATFORMS = [
  {
    id: 'takeitdown', kind: 'tool',
    url: 'https://takeitdown.ncmec.org',
    status: 'verified', verifiedOn: ON,
    source: 'https://www.nbcnews.com/tech/security/take-tool-teens-remove-explicit-images-rcna72518',
  },
  {
    id: 'instagram', kind: 'app',
    url: 'https://help.instagram.com/contact/1141853830778488',
    status: 'partial', verifiedOn: ON,
    source: 'https://help.instagram.com/contact/1141853830778488',
  },
  {
    id: 'facebook', kind: 'app',
    url: 'https://www.meta.com/help/policies/867240510905645/',
    status: 'partial', verifiedOn: ON,
    source: 'https://www.meta.com/help/policies/867240510905645/',
  },
  {
    id: 'tiktok', kind: 'app',
    status: 'partial', verifiedOn: ON,
    source: 'https://maldita.es/investigaciones/20251211/tiktok-moderation-accounts-pornography-telegram/',
  },
  {
    id: 'snapchat', kind: 'app',
    status: 'partial', verifiedOn: ON,
    source: 'https://www.thewhitehatter.ca/post/how-to-request-the-removal-of-non-consensual-posted-intimate-images-video-from-social-networks',
  },
  {
    id: 'x', kind: 'app',
    url: 'https://help.x.com/rules-and-policies/intimate-media',
    status: 'partial', verifiedOn: ON,
    source: 'https://help.x.com/rules-and-policies/intimate-media',
  },
  {
    id: 'whatsapp', kind: 'app',
    status: 'partial', verifiedOn: ON,
  },
  {
    id: 'telegram', kind: 'app',
    status: 'partial', verifiedOn: ON,
    source: 'https://www.thestar.com.my/tech/tech-news/2026/04/08/researchers-unmask-trade-in-nude-images-on-telegram',
  },
  {
    id: 'google', kind: 'search',
    url: 'https://support.google.com/websearch/answer/9116649',
    status: 'partial', verifiedOn: ON,
    source: 'https://support.google.com/websearch/answer/9116649',
  },
  {
    id: 'other', kind: 'other',
    status: 'partial', verifiedOn: ON,
  },
];

export function getPlatform(id) {
  return PLATFORMS.find((p) => p.id === id);
}

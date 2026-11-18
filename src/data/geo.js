// Reference data (ISO 3166-1 / ISO 639-1). Names come from the browser's Intl API.
const C = 'IN US GB CA AU DE FR AE PK BD NP LK SG AF AL DZ AR AM AT AZ BH BY BE BR BG KH CL CN CO HR CY CZ DK EG EE ET FI GE GH GR HK HU ID IR IQ IE IL IT JP JO KZ KE KW LV LB LT MY MV MX MA MM NL NZ NG NO OM PH PL PT QA RO RU SA RS ZA KR ES SE CH SY TW TH TR UA UZ VN YE ZW'.split(' ')
const dn = new Intl.DisplayNames(['en'], { type: 'region' })
export const flag = (cc) => !cc || cc === 'XX' ? '🌐' : String.fromCodePoint(...[...cc.toUpperCase()].map(c => 127397 + c.charCodeAt(0)))
export const COUNTRIES = [...C.map(code => ({ value: code, label: dn.of(code), flag: flag(code) })).sort((a, b) => a.label.localeCompare(b.label)), { value: 'XX', label: 'Other / International', flag: '🌐' }]
const L = 'en hi es fr de ar bn ur pt ru ja ko zh ta te mr gu pa'.split(' ')
const ln = new Intl.DisplayNames(['en'], { type: 'language' })
export const LANGUAGES = [...L.map(code => ({ value: code, label: ln.of(code) })), { value: 'multi', label: 'Other / Multilingual' }]
export const countryName = (code) => COUNTRIES.find(c => c.value === code)?.label
export const languageName = (code) => LANGUAGES.find(l => l.value === code)?.label

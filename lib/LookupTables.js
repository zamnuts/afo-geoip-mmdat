var LookupTables,
	GeoIPCountryModel = require('./models/GeoIPCountryModel.js');

module.exports = LookupTables = {};

/**
 * Get country info (3 parts) from a known 2-letter country code.
 * @param {string} countryCode
 * @return {GeoIPCountryModel}
 */
LookupTables.fromCountryCode = function(countryCode) {
	countryCode = countryCode.toUpperCase();
	var model = new GeoIPCountryModel(),
		index = LookupTables.CountryCodes.indexOf(countryCode);
	if ( index > -1 ) {
		model.countryCode = LookupTables.CountryCodes[index]||'';
		model.countryCode3 = LookupTables.CountryCodes3[index]||'';
		model.countryName = LookupTables.CountryNames[index]||'';
	}
	return model;
};

/**
 * Get country info (3 parts) from a known 3-letter country code.
 * @param {string} countryCode3
 * @return {GeoIPCountryModel}
 */
LookupTables.fromCountryCode3 = function(countryCode3) {
	countryCode3 = countryCode3.toUpperCase();
	var model = new GeoIPCountryModel(),
		index = LookupTables.CountryCodes3.indexOf(countryCode3);
	if ( index > -1 ) {
		model.countryCode = LookupTables.CountryCodes[index]||'';
		model.countryCode3 = LookupTables.CountryCodes3[index]||'';
		model.countryName = LookupTables.CountryNames[index]||'';
	}
	return model;
};

/**
 * Get country info (3 parts) from a known country name.
 * @param {string} countryName
 * @return {GeoIPCountryModel}
 */
LookupTables.fromCountryName = function(countryName) {
	countryName = countryName.toUpperCase();
	var model = new GeoIPCountryModel(),
		index = LookupTables.CountryNames.map(function(item){
			return item.toUpperCase();
		}).indexOf(countryName);
	if ( index > -1 ) {
		model.countryCode = LookupTables.CountryCodes[index]||'';
		model.countryCode3 = LookupTables.CountryCodes3[index]||'';
		model.countryName = LookupTables.CountryNames[index]||'';
	}
	return model;
};

/**
 * Get country info (3 parts) from a known index.
 * @param {int} index
 * @return {GeoIPCountryModel}
 */
LookupTables.fromCountryIndex = function(index) {
	var model = new GeoIPCountryModel();
	model.countryCode = LookupTables.CountryCodes[index]||'';
	model.countryCode3 = LookupTables.CountryCodes3[index]||'';
	model.countryName = LookupTables.CountryNames[index]||'';
	return model;
};

/**
 * @type {string[]}
 */
LookupTables.CountryCodes = [
	'','AP','EU','AD','AE','AF','AG','AI','AL','AM','AN','AO','AQ',
	'AR','AS','AT','AU','AW','AZ','BA','BB','BD','BE','BF','BG','BH',
	'BI','BJ','BM','BN','BO','BR','BS','BT','BV','BW','BY','BZ','CA',
	'CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU',
	'CV','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG',
	'EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','FX','GA','GB',
	'GD','GE','GF','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT',
	'GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IN',
	'IO','IQ','IR','IS','IT','JM','JO','JP','KE','KG','KH','KI','KM',
	'KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS',
	'LT','LU','LV','LY','MA','MC','MD','MG','MH','MK','ML','MM','MN',
	'MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA',
	'NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA',
	'PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
	'QA','RE','RO','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI',
	'SJ','SK','SL','SM','SN','SO','SR','ST','SV','SY','SZ','TC','TD',
	'TF','TG','TH','TJ','TK','TM','TN','TO','TL','TR','TT','TV','TW',
	'TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN',
	'VU','WF','WS','YE','YT','RS','ZA','ZM','ME','ZW','A1','A2','O1',
	'AX','GG','IM','JE','BL','MF'
];

/**
 * @type {string[]}
 */
LookupTables.CountryCodes3 = [
	'','AP','EU','AND','ARE','AFG','ATG','AIA','ALB','ARM','ANT','AGO','AQ','ARG',
	'ASM','AUT','AUS','ABW','AZE','BIH','BRB','BGD','BEL','BFA','BGR','BHR','BDI',
	'BEN','BMU','BRN','BOL','BRA','BHS','BTN','BV','BWA','BLR','BLZ','CAN','CC',
	'COD','CAF','COG','CHE','CIV','COK','CHL','CMR','CHN','COL','CRI','CUB','CPV',
	'CX','CYP','CZE','DEU','DJI','DNK','DMA','DOM','DZA','ECU','EST','EGY','ESH',
	'ERI','ESP','ETH','FIN','FJI','FLK','FSM','FRO','FRA','FX','GAB','GBR','GRD',
	'GEO','GUF','GHA','GIB','GRL','GMB','GIN','GLP','GNQ','GRC','GS','GTM','GUM',
	'GNB','GUY','HKG','HM','HND','HRV','HTI','HUN','IDN','IRL','ISR','IND','IO',
	'IRQ','IRN','ISL','ITA','JAM','JOR','JPN','KEN','KGZ','KHM','KIR','COM','KNA',
	'PRK','KOR','KWT','CYM','KAZ','LAO','LBN','LCA','LIE','LKA','LBR','LSO','LTU',
	'LUX','LVA','LBY','MAR','MCO','MDA','MDG','MHL','MKD','MLI','MMR','MNG','MAC',
	'MNP','MTQ','MRT','MSR','MLT','MUS','MDV','MWI','MEX','MYS','MOZ','NAM','NCL',
	'NER','NFK','NGA','NIC','NLD','NOR','NPL','NRU','NIU','NZL','OMN','PAN','PER',
	'PYF','PNG','PHL','PAK','POL','SPM','PCN','PRI','PSE','PRT','PLW','PRY','QAT',
	'REU','ROU','RUS','RWA','SAU','SLB','SYC','SDN','SWE','SGP','SHN','SVN','SJM',
	'SVK','SLE','SMR','SEN','SOM','SUR','STP','SLV','SYR','SWZ','TCA','TCD','TF',
	'TGO','THA','TJK','TKL','TLS','TKM','TUN','TON','TUR','TTO','TUV','TWN','TZA',
	'UKR','UGA','UM','USA','URY','UZB','VAT','VCT','VEN','VGB','VIR','VNM','VUT',
	'WLF','WSM','YEM','YT','SRB','ZAF','ZMB','MNE','ZWE','A1','A2','O1',
	'ALA','GGY','IMN','JEY','BLM','MAF'
];

/**
 * @type {string[]}
 */
LookupTables.CountryNames = [
	"", "Asia/Pacific Region", "Europe", "Andorra", "United Arab Emirates",
	"Afghanistan", "Antigua and Barbuda", "Anguilla", "Albania", "Armenia",
	"Netherlands Antilles", "Angola", "Antarctica", "Argentina", "American Samoa",
	"Austria", "Australia", "Aruba", "Azerbaijan", "Bosnia and Herzegovina",
	"Barbados", "Bangladesh", "Belgium", "Burkina Faso", "Bulgaria", "Bahrain",
	"Burundi", "Benin", "Bermuda", "Brunei Darussalam", "Bolivia", "Brazil",
	"Bahamas", "Bhutan", "Bouvet Island", "Botswana", "Belarus", "Belize",
	"Canada", "Cocos (Keeling) Islands", "Congo, The Democratic Republic of the",
	"Central African Republic", "Congo", "Switzerland", "Cote D'Ivoire", "Cook Islands",
	"Chile", "Cameroon", "China", "Colombia", "Costa Rica", "Cuba", "Cape Verde",
	"Christmas Island", "Cyprus", "Czech Republic", "Germany", "Djibouti",
	"Denmark", "Dominica", "Dominican Republic", "Algeria", "Ecuador", "Estonia",
	"Egypt", "Western Sahara", "Eritrea", "Spain", "Ethiopia", "Finland", "Fiji",
	"Falkland Islands (Malvinas)", "Micronesia, Federated States of", "Faroe Islands",
	"France", "France, Metropolitan", "Gabon", "United Kingdom",
	"Grenada", "Georgia", "French Guiana", "Ghana", "Gibraltar", "Greenland",
	"Gambia", "Guinea", "Guadeloupe", "Equatorial Guinea", "Greece", "South Georgia and the South Sandwich Islands",
	"Guatemala", "Guam", "Guinea-Bissau",
	"Guyana", "Hong Kong", "Heard Island and McDonald Islands", "Honduras",
	"Croatia", "Haiti", "Hungary", "Indonesia", "Ireland", "Israel", "India",
	"British Indian Ocean Territory", "Iraq", "Iran, Islamic Republic of",
	"Iceland", "Italy", "Jamaica", "Jordan", "Japan", "Kenya", "Kyrgyzstan",
	"Cambodia", "Kiribati", "Comoros", "Saint Kitts and Nevis", "Korea, Democratic People's Republic of",
	"Korea, Republic of", "Kuwait", "Cayman Islands",
	"Kazakstan", "Lao People's Democratic Republic", "Lebanon", "Saint Lucia",
	"Liechtenstein", "Sri Lanka", "Liberia", "Lesotho", "Lithuania", "Luxembourg",
	"Latvia", "Libyan Arab Jamahiriya", "Morocco", "Monaco", "Moldova, Republic of",
	"Madagascar", "Marshall Islands", "Macedonia",
	"Mali", "Myanmar", "Mongolia", "Macau", "Northern Mariana Islands",
	"Martinique", "Mauritania", "Montserrat", "Malta", "Mauritius", "Maldives",
	"Malawi", "Mexico", "Malaysia", "Mozambique", "Namibia", "New Caledonia",
	"Niger", "Norfolk Island", "Nigeria", "Nicaragua", "Netherlands", "Norway",
	"Nepal", "Nauru", "Niue", "New Zealand", "Oman", "Panama", "Peru", "French Polynesia",
	"Papua New Guinea", "Philippines", "Pakistan", "Poland", "Saint Pierre and Miquelon",
	"Pitcairn Islands", "Puerto Rico", "Palestinian Territory",
	"Portugal", "Palau", "Paraguay", "Qatar", "Reunion", "Romania",
	"Russian Federation", "Rwanda", "Saudi Arabia", "Solomon Islands",
	"Seychelles", "Sudan", "Sweden", "Singapore", "Saint Helena", "Slovenia",
	"Svalbard and Jan Mayen", "Slovakia", "Sierra Leone", "San Marino", "Senegal",
	"Somalia", "Suriname", "Sao Tome and Principe", "El Salvador", "Syrian Arab Republic",
	"Swaziland", "Turks and Caicos Islands", "Chad", "French Southern Territories",
	"Togo", "Thailand", "Tajikistan", "Tokelau", "Turkmenistan",
	"Tunisia", "Tonga", "Timor-Leste", "Turkey", "Trinidad and Tobago", "Tuvalu",
	"Taiwan", "Tanzania, United Republic of", "Ukraine",
	"Uganda", "United States Minor Outlying Islands", "United States", "Uruguay",
	"Uzbekistan", "Holy See (Vatican City State)", "Saint Vincent and the Grenadines",
	"Venezuela", "Virgin Islands, British", "Virgin Islands, U.S.",
	"Vietnam", "Vanuatu", "Wallis and Futuna", "Samoa", "Yemen", "Mayotte",
	"Serbia", "South Africa", "Zambia", "Montenegro", "Zimbabwe",
	"Anonymous Proxy","Satellite Provider","Other",
	"Aland Islands","Guernsey","Isle of Man","Jersey","Saint Barthelemy","Saint Martin"
];

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
// service for managing session data
JUCI.app.factory('$tr', function(gettextCatalog) {
	return function(str){
		return gettextCatalog.getString(str);
	}
}).run(function(gettextCatalog){
	JUCI.$tr = function(str){
		return gettextCatalog.getString(str);
	}
});

JUCI.app.factory('$languages', function($config, gettextCatalog, $localStorage) {
	return {
		getLanguages: function(){
			var languages = ($config.settings.localization)?($config.settings.localization.languages.value):[]; 
			return languages.filter(function(lang){
				return lang in gettextCatalog.strings; 
			}).map(function(lang){
				return {
					title: getLanguageNativeName(lang), 
					short_code: lang
				}
			}); 
		}, 
		getLanguage: function(){
			return gettextCatalog.getCurrentLanguage();
		},
		setLanguage: function(short_code){
			gettextCatalog.setCurrentLanguage(short_code);
			$localStorage.setItem("language", short_code); 
		}
	}
});

/**
 * @author Anatoly Mironov (mirontoli)
 * http://sharepointkunskap.wordpress.com
 * http://www.bool.se
 *  
 * http://stackoverflow.com/questions/3605495/generate-a-list-of-localized-language-names-with-links-to-google-translate/14800384#14800384
 * http://stackoverflow.com/questions/10997128/language-name-from-iso-639-1-code-in-javascript/14800499#14800499
 * 
 * using Phil Teare's answer on stackoverflow
 * http://stackoverflow.com/questions/3217492/list-of-language-codes-in-yaml-or-json/4900304#4900304
 * Just for testing only. Incorporate in your own javascript namespace
 * Example: getLanguageName("cv-RU") --> Chuvash
 */
(function() {
  'use strict';
	
	/**
	 * @author Phil Teare
	 * using wikipedia data
	 */
	var isoLangs = {
		"ab":{
			"name":"Abkhaz",
			"nativeName":"аҧсуа"
		},
		"aa":{
			"name":"Afar",
			"nativeName":"Afaraf"
		},
		"af":{
			"name":"Afrikaans",
			"nativeName":"Afrikaans"
		},
		"ak":{
			"name":"Akan",
			"nativeName":"Akan"
		},
		"sq":{
			"name":"Albanian",
			"nativeName":"Shqip"
		},
		"am":{
			"name":"Amharic",
			"nativeName":"Amharic"
		},
		"ar":{
			"name":"Arabic",
			"nativeName":"العربية"
		},
		"an":{
			"name":"Aragonese",
			"nativeName":"Aragonés"
		},
		"hy":{
			"name":"Armenian",
			"nativeName":"Հայերեն"
		},
		"as":{
			"name":"Assamese",
			"nativeName":"Assameset"
		},
		"av":{
			"name":"Avaric",
			"nativeName":"авар мацӀ, магӀарул мацӀ"
		},
		"ae":{
			"name":"Avestan",
			"nativeName":"avesta"
		},
		"ay":{
			"name":"Aymara",
			"nativeName":"aymar aru"
		},
		"az":{
			"name":"Azerbaijani",
			"nativeName":"azərbaycan dili"
		},
		"bm":{
			"name":"Bambara",
			"nativeName":"bamanankan"
		},
		"ba":{
			"name":"Bashkir",
			"nativeName":"башҡорт теле"
		},
		"eu":{
			"name":"Basque",
			"nativeName":"euskara, euskera"
		},
		"be":{
			"name":"Belarusian",
			"nativeName":"Беларуская"
		},
		"bn":{
			"name":"Bengali",
			"nativeName":"Bengali"
		},
		"bh":{
			"name":"Bihari",
			"nativeName":"Biharit"
		},
		"bi":{
			"name":"Bislama",
			"nativeName":"Bislama"
		},
		"bs":{
			"name":"Bosnian",
			"nativeName":"bosanski jezik"
		},
		"br":{
			"name":"Breton",
			"nativeName":"brezhoneg"
		},
		"bg":{
			"name":"Bulgarian",
			"nativeName":"български език"
		},
		"my":{
			"name":"Burmese",
			"nativeName":"Burmese"
		},
		"ca":{
			"name":"Catalan; Valencian",
			"nativeName":"Català"
		},
		"ch":{
			"name":"Chamorro",
			"nativeName":"Chamoru"
		},
		"ce":{
			"name":"Chechen",
			"nativeName":"нохчийн мотт"
		},
		"ny":{
			"name":"Chichewa; Chewa; Nyanja",
			"nativeName":"chiCheŵa, chinyanja"
		},
		"zh":{
			"name":"Chinese",
			"nativeName":"Chinese (Zhōngwén)"
		},
		"cv":{
			"name":"Chuvash",
			"nativeName":"чӑваш чӗлхи"
		},
		"kw":{
			"name":"Cornish",
			"nativeName":"Kernewek"
		},
		"co":{
			"name":"Corsican",
			"nativeName":"corsu, lingua corsa"
		},
		"cr":{
			"name":"Cree",
			"nativeName":"ᓀᐦᐃᔭᐍᐏᐣ"
		},
		"hr":{
			"name":"Croatian",
			"nativeName":"hrvatski"
		},
		"cs":{
			"name":"Czech",
			"nativeName":"česky, čeština"
		},
		"da":{
			"name":"Danish",
			"nativeName":"dansk"
		},
		"dv":{
			"name":"Divehi; Dhivehi; Maldivian;",
			"nativeName":"Divehi; Dhivehi; Maldivian;"
		},
		"nl":{
			"name":"Dutch",
			"nativeName":"Nederlands, Vlaams"
		},
		"en":{
			"name":"English",
			"nativeName":"English"
		},
		"eo":{
			"name":"Esperanto",
			"nativeName":"Esperanto"
		},
		"et":{
			"name":"Estonian",
			"nativeName":"eesti, eesti keel"
		},
		"ee":{
			"name":"Ewe",
			"nativeName":"Eʋegbe"
		},
		"fo":{
			"name":"Faroese",
			"nativeName":"føroyskt"
		},
		"fj":{
			"name":"Fijian",
			"nativeName":"vosa Vakaviti"
		},
		"fi":{
			"name":"Finnish",
			"nativeName":"suomi, suomen kieli"
		},
		"fr":{
			"name":"French",
			"nativeName":"français, langue française"
		},
		"ff":{
			"name":"Fula; Fulah; Pulaar; Pular",
			"nativeName":"Fulfulde, Pulaar, Pular"
		},
		"gl":{
			"name":"Galician",
			"nativeName":"Galego"
		},
		"ka":{
			"name":"Georgian",
			"nativeName":"ქართული"
		},
		"de":{
			"name":"German",
			"nativeName":"Deutsch"
		},
		"el":{
			"name":"Greek, Modern",
			"nativeName":"Ελληνικά"
		},
		"gn":{
			"name":"Guaraní",
			"nativeName":"Avañeẽ"
		},
		"gu":{
			"name":"Gujarati",
			"nativeName":"Gujarati"
		},
		"ht":{
			"name":"Haitian; Haitian Creole",
			"nativeName":"Kreyòl ayisyen"
		},
		"ha":{
			"name":"Hausa",
			"nativeName":"Hausa, هَوُسَ"
		},
		"he":{
			"name":"Hebrew (modern)",
			"nativeName":"עברית"
		},
		"hz":{
			"name":"Herero",
			"nativeName":"Otjiherero"
		},
		"hi":{
			"name":"Hindi",
			"nativeName":"Hindi"
		},
		"ho":{
			"name":"Hiri Motu",
			"nativeName":"Hiri Motu"
		},
		"hu":{
			"name":"Hungarian",
			"nativeName":"Magyar"
		},
		"ia":{
			"name":"Interlingua",
			"nativeName":"Interlingua"
		},
		"id":{
			"name":"Indonesian",
			"nativeName":"Bahasa Indonesia"
		},
		"ie":{
			"name":"Interlingue",
			"nativeName":"Originally called Occidental; then Interlingue after WWII"
		},
		"ga":{
			"name":"Irish",
			"nativeName":"Gaeilge"
		},
		"ig":{
			"name":"Igbo",
			"nativeName":"Asụsụ Igbo"
		},
		"ik":{
			"name":"Inupiaq",
			"nativeName":"Iñupiaq, Iñupiatun"
		},
		"io":{
			"name":"Ido",
			"nativeName":"Ido"
		},
		"is":{
			"name":"Icelandic",
			"nativeName":"Íslenska"
		},
		"it":{
			"name":"Italian",
			"nativeName":"Italiano"
		},
		"iu":{
			"name":"Inuktitut",
			"nativeName":"ᐃᓄᒃᑎᑐᑦ"
		},
		"ja":{
			"name":"Japanese",
			"nativeName":"Japanese"
		},
		"jv":{
			"name":"Javanese",
			"nativeName":"basa Jawa"
		},
		"kl":{
			"name":"Kalaallisut, Greenlandic",
			"nativeName":"kalaallisut, kalaallit oqaasii"
		},
		"kn":{
			"name":"Kannada",
			"nativeName":"Kannada"
		},
		"kr":{
			"name":"Kanuri",
			"nativeName":"Kanuri"
		},
		"ks":{
			"name":"Kashmiri",
			"nativeName":"Kashmiri كشميري"
		},
		"kk":{
			"name":"Kazakh",
			"nativeName":"Қазақ тілі"
		},
		"km":{
			"name":"Khmer",
			"nativeName":"Khmer"
		},
		"ki":{
			"name":"Kikuyu, Gikuyu",
			"nativeName":"Gĩkũyũ"
		},
		"rw":{
			"name":"Kinyarwanda",
			"nativeName":"Ikinyarwanda"
		},
		"ky":{
			"name":"Kirghiz, Kyrgyz",
			"nativeName":"кыргыз тили"
		},
		"kv":{
			"name":"Komi",
			"nativeName":"коми кыв"
		},
		"kg":{
			"name":"Kongo",
			"nativeName":"KiKongo"
		},
		"ko":{
			"name":"Korean",
			"nativeName":"Korean"
		},
		"ku":{
			"name":"Kurdish",
			"nativeName":"Kurdî, كوردی"
		},
		"kj":{
			"name":"Kwanyama, Kuanyama",
			"nativeName":"Kuanyama"
		},
		"la":{
			"name":"Latin",
			"nativeName":"latine, lingua latina"
		},
		"lb":{
			"name":"Luxembourgish, Letzeburgesch",
			"nativeName":"Lëtzebuergesch"
		},
		"lg":{
			"name":"Luganda",
			"nativeName":"Luganda"
		},
		"li":{
			"name":"Limburgish, Limburgan, Limburger",
			"nativeName":"Limburgs"
		},
		"ln":{
			"name":"Lingala",
			"nativeName":"Lingála"
		},
		"lo":{
			"name":"Lao",
			"nativeName":"ພາສາລາວ"
		},
		"lt":{
			"name":"Lithuanian",
			"nativeName":"lietuvių kalba"
		},
		"lu":{
			"name":"Luba-Katanga",
			"nativeName":""
		},
		"lv":{
			"name":"Latvian",
			"nativeName":"latviešu valoda"
		},
		"gv":{
			"name":"Manx",
			"nativeName":"Gaelg, Gailck"
		},
		"mk":{
			"name":"Macedonian",
			"nativeName":"македонски јазик"
		},
		"mg":{
			"name":"Malagasy",
			"nativeName":"Malagasy fiteny"
		},
		"ms":{
			"name":"Malay",
			"nativeName":"bahasa Melayu, بهاس ملايو‎"
		},
		"ml":{
			"name":"Malayalam",
			"nativeName":"Malayalam"
		},
		"mt":{
			"name":"Maltese",
			"nativeName":"Malti"
		},
		"mi":{
			"name":"Māori",
			"nativeName":"te reo Māori"
		},
		"mr":{
			"name":"Marathi (Marāṭhī)",
			"nativeName":"Marathi (Marāṭhī)"
		},
		"mh":{
			"name":"Marshallese",
			"nativeName":"Kajin M̧ajeļ"
		},
		"mn":{
			"name":"Mongolian",
			"nativeName":"монгол"
		},
		"na":{
			"name":"Nauru",
			"nativeName":"Ekakairũ Naoero"
		},
		"nv":{
			"name":"Navajo, Navaho",
			"nativeName":"Diné bizaad, Dinékʼehǰí"
		},
		"nb":{
			"name":"Norwegian Bokmål",
			"nativeName":"Norsk bokmål"
		},
		"nd":{
			"name":"North Ndebele",
			"nativeName":"isiNdebele"
		},
		"ne":{
			"name":"Nepali",
			"nativeName":"Nepali"
		},
		"ng":{
			"name":"Ndonga",
			"nativeName":"Owambo"
		},
		"nn":{
			"name":"Norwegian Nynorsk",
			"nativeName":"Norsk nynorsk"
		},
		"no":{
			"name":"Norwegian",
			"nativeName":"Norsk"
		},
		"ii":{
			"name":"Nuosu",
			"nativeName":"Nuosu Nuosuhxop"
		},
		"nr":{
			"name":"South Ndebele",
			"nativeName":"isiNdebele"
		},
		"oc":{
			"name":"Occitan",
			"nativeName":"Occitan"
		},
		"oj":{
			"name":"Ojibwe, Ojibwa",
			"nativeName":"ᐊᓂᔑᓈᐯᒧᐎᓐ"
		},
		"cu":{
			"name":"Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic",
			"nativeName":"ѩзыкъ словѣньскъ"
		},
		"om":{
			"name":"Oromo",
			"nativeName":"Afaan Oromoo"
		},
		"or":{
			"name":"Oriya",
			"nativeName":"Oriya"
		},
		"os":{
			"name":"Ossetian, Ossetic",
			"nativeName":"ирон æвзаг"
		},
		"pa":{
			"name":"Panjabi, Punjabi",
			"nativeName":"Panjabi, Punjab پنجابی"
		},
		"pi":{
			"name":"Pāli",
			"nativeName":"Pāli"
		},
		"fa":{
			"name":"Persian",
			"nativeName":"فارسی"
		},
		"pl":{
			"name":"Polish",
			"nativeName":"polski"
		},
		"ps":{
			"name":"Pashto, Pushto",
			"nativeName":"پښتو"
		},
		"pt":{
			"name":"Portuguese",
			"nativeName":"Português"
		},
		"qu":{
			"name":"Quechua",
			"nativeName":"Runa Simi, Kichwa"
		},
		"rm":{
			"name":"Romansh",
			"nativeName":"rumantsch grischun"
		},
		"rn":{
			"name":"Kirundi",
			"nativeName":"kiRundi"
		},
		"ro":{
			"name":"Romanian, Moldavian, Moldovan",
			"nativeName":"română"
		},
		"ru":{
			"name":"Russian",
			"nativeName":"русский язык"
		},
		"sa":{
			"name":"Sanskrit (Saṁskṛta)",
			"nativeName":"Sanskrit (Saṁskṛta)"
		},
		"sc":{
			"name":"Sardinian",
			"nativeName":"sardu"
		},
		"sd":{
			"name":"Sindhi",
			"nativeName":"Sindhi سنڌي، سندھی"
		},
		"se":{
			"name":"Northern Sami",
			"nativeName":"Davvisámegiella"
		},
		"sm":{
			"name":"Samoan",
			"nativeName":"gagana faa Samoa"
		},
		"sg":{
			"name":"Sango",
			"nativeName":"yângâ tî sängö"
		},
		"sr":{
			"name":"Serbian",
			"nativeName":"српски језик"
		},
		"gd":{
			"name":"Scottish Gaelic; Gaelic",
			"nativeName":"Gàidhlig"
		},
		"sn":{
			"name":"Shona",
			"nativeName":"chiShona"
		},
		"si":{
			"name":"Sinhala, Sinhalese",
			"nativeName":"Sinhala, Sinhalese"
		},
		"sk":{
			"name":"Slovak",
			"nativeName":"slovenčina"
		},
		"sl":{
			"name":"Slovene",
			"nativeName":"slovenščina"
		},
		"so":{
			"name":"Somali",
			"nativeName":"Soomaaliga, af Soomaali"
		},
		"st":{
			"name":"Southern Sotho",
			"nativeName":"Sesotho"
		},
		"es":{
			"name":"Spanish; Castilian",
			"nativeName":"español, castellano"
		},
		"es-SV":{
			"name":"Spanish; El Salvador",
			"nativeName":"Español"
		},
		"su":{
			"name":"Sundanese",
			"nativeName":"Basa Sunda"
		},
		"sw":{
			"name":"Swahili",
			"nativeName":"Kiswahili"
		},
		"ss":{
			"name":"Swati",
			"nativeName":"SiSwati"
		},
		"sv":{
			"name":"Swedish",
			"nativeName":"svenska"
		},
		"sv-SE":{
			"name":"Swedish",
			"nativeName":"Svenska"
		},
		"ta":{
			"name":"Tamil",
			"nativeName":"Tamil"
		},
		"te":{
			"name":"Telugu",
			"nativeName":"Telugu"
		},
		"tg":{
			"name":"Tajik",
			"nativeName":"тоҷикӣ, toğikī, تاجیکی"
		},
		"th":{
			"name":"Thai",
			"nativeName":"Thai"
		},
		"ti":{
			"name":"Tigrinya",
			"nativeName":"Tigrinya"
		},
		"bo":{
			"name":"Tibetan Standard, Tibetan, Central",
			"nativeName":"Tibetan Standard, Tibetan, Central"
		},
		"tk":{
			"name":"Turkmen",
			"nativeName":"Türkmen, Түркмен"
		},
		"tl":{
			"name":"Tagalog",
			"nativeName":"Wikang Tagalog, Tagalog"
		},
		"tn":{
			"name":"Tswana",
			"nativeName":"Setswana"
		},
		"to":{
			"name":"Tonga (Tonga Islands)",
			"nativeName":"faka Tonga"
		},
		"tr":{
			"name":"Turkish",
			"nativeName":"Türkçe"
		},
		"ts":{
			"name":"Tsonga",
			"nativeName":"Xitsonga"
		},
		"tt":{
			"name":"Tatar",
			"nativeName":"татарча, tatarça, تاتارچا"
		},
		"tw":{
			"name":"Twi",
			"nativeName":"Twi"
		},
		"ty":{
			"name":"Tahitian",
			"nativeName":"Reo Tahiti"
		},
		"ug":{
			"name":"Uighur, Uyghur",
			"nativeName":"Uyƣurqə, ئۇيغۇرچە"
		},
		"uk":{
			"name":"Ukrainian",
			"nativeName":"українська"
		},
		"ur":{
			"name":"Urdu",
			"nativeName":"اردو"
		},
		"uz":{
			"name":"Uzbek",
			"nativeName":"zbek, Ўзбек, أۇزبېك"
		},
		"ve":{
			"name":"Venda",
			"nativeName":"Tshivenḓa"
		},
		"vi":{
			"name":"Vietnamese",
			"nativeName":"Tiếng Việt"
		},
		"vo":{
			"name":"Volapük",
			"nativeName":"Volapük"
		},
		"wa":{
			"name":"Walloon",
			"nativeName":"Walon"
		},
		"cy":{
			"name":"Welsh",
			"nativeName":"Cymraeg"
		},
		"wo":{
			"name":"Wolof",
			"nativeName":"Wollof"
		},
		"fy":{
			"name":"Western Frisian",
			"nativeName":"Frysk"
		},
		"xh":{
			"name":"Xhosa",
			"nativeName":"isiXhosa"
		},
		"yi":{
			"name":"Yiddish",
			"nativeName":"ייִדיש"
		},
		"yo":{
			"name":"Yoruba",
			"nativeName":"Yorùbá"
		},
		"za":{
			"name":"Zhuang, Chuang",
			"nativeName":"Saɯ cueŋƅ, Saw cuengh"
		}
	}
	
	var getLanguageName = function(key) {
		key = key.slice(0,2);
		var lang = isoLangs[key];
		return lang ? lang.name : undefined;
	}
	var getLanguageNativeName = function(key) {
		key = key.slice(0,2);
		var lang = isoLangs[key];
		var name = lang ? lang.nativeName : ""; 
		name = name.split(",")[0]; 
		name = name.charAt(0).toUpperCase() + name.slice(1);
		return name;
	}
	window.getLanguageName = getLanguageName;
	window.getLanguageNativeName = getLanguageNativeName;
})();

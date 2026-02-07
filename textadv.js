const gameState = {
    currentScene: 'start',
    health: 100,
    maxHealth: 100,
    sanity: 100,
    inventory: [],
    flags: {},
    companions: [],
    knowledge: [],
    deaths: 0
};

const scenes = {
    start: {
        location: "Tmurna Šuma",
        text: `Budiš se na hladnoj, vlažnoj zemlji. Magla se vijuga oko tebe poput živih prstiju, gušeći svaki zvuk osim vlastitog disanja. Ne sjećaš se kako si stigao ovdje, niti tko si zapravo. Jedino što znaš je da te nešto zove... dublje u šumu.

Pred tobom se pruža uska staza koja se gubi u tami. S lijeve strane čuješ tiho mrmljanje vode. S desne strane primjećuješ blijedi sjaj između stabala.`,
        choices: [
            { text: "Kreni stazom prema nepoznatom", next: "path_forward" },
            { text: "Istraži izvor vode", next: "stream" },
            { text: "Pristupi blijedom sjaju", next: "pale_light" },
            { text: "Ostani i pokuš se sjetiti", next: "remember" }
        ]
    },

    remember: {
        location: "Tmurna Šuma",
        text: `Zatvaraš oči i pokušavaš se sjetiti... Ali sjećanja su kao voda koja ti curi kroz prste. Vidiš bljesak: kamenu kulu, plamen, lice prekriveno kapuljačom. Nečiji vrisak koji bi mogao biti tvoj vlastiti.

Kada otvoriš oči, magla je gušća. Osjećaš prisutnost koja te posmatra.`,
        sanityChange: -5,
        flags: { triedToRemember: true },
        choices: [
            { text: "Kreni stazom naprijed", next: "path_forward" },
            { text: "Pozovi u tamu", next: "call_darkness" },
            { text: "Istraži izvor vode", next: "stream" }
        ]
    },

    call_darkness: {
        location: "Tmurna Šuma",
        text: `"Tko si?!" viknuo si u maglu. Tvoj glas se gubi u tišini.

Nekoliko trenutaka kasnije, čuješ odgovor - ne riječima, već šapatom koji dolazi iznutra tvoje vlastite glave: "Ti znaš tko sam. Uvijek si znao."

Hladnoća te obuzima.`,
        sanityChange: -10,
        flags: { heardVoice: true },
        choices: [
            { text: "Pobjegni niz stazu", next: "path_forward" },
            { text: "Stani i suoči se sa glasom", next: "confront_voice" },
            { text: "Kreni prema vodi, možda će ti pomoći", next: "stream" }
        ]
    },

    confront_voice: {
        location: "Sjene Sjećanja",
        text: `"Nisam te se bojao prije, neću ni sada!" viknuo si s više hrabrosti nego što zapravo osjećaš.

Magla se zgušnjava i oblikuje - poprima obris čovjeka. Ne, nečeg sličnog čovjeku. Njegove oči gore poput ugljena.

"Hrabar si... ili glup. Ali to neće biti važno na kraju. Ja sam tvoja prošlost. Ja sam tvoja budućnost. Ja sam ono što si pokušao zaboraviti."

Sjećanje ti se vraća: ti si nekad bio nešto drugo. Nešto mračno.`,
        sanityChange: -15,
        flags: { confrontedPast: true },
        knowledge: ['dark_origin'],
        choices: [
            { text: "Prihvati svoju prošlost", next: "accept_darkness" },
            { text: "Odbi je i pobjegni", next: "reject_past" },
            { text: "Napadni sjenu", next: "attack_shadow", danger: true }
        ]
    },

    accept_darkness: {
        location: "Srce Tame",
        text: `Pustio si da sjećanja zaplave. Bio si lovac sjena, služenik mraka koji je vladao ovim šumama. Ali nešto se promijenilo - vidjeo si svjetlost koju nisi trebao vidjeti.

Pokušao si pobjeći, ali ono što si nekad služio ne pušta tako lako.

Sjena se smiješi. "Dobro. Onda znaš što moraš učiniti. Kula te čeka. Završi ritual i bit ćeš slobodan."

Dobio si nov cilj, ali je li to sloboda ili konačno ropstvo?`,
        flags: { acceptedDarkness: true, knowsRitual: true },
        item: "Sjajni Medaljon",
        choices: [
            { text: "Kreni prema Kuli", next: "tower_path" },
            { text: "Traži drugi put", next: "alternate_path" }
        ]
    },

    reject_past: {
        location: "Tmurna Šuma",
        text: `"Ne! To nisam ja više!" viknuo si i pobjegao niz stazu.

Čuješ smijeh iza sebe - hladan i prazan. "Možeš bježati, ali istina te uvijek čeka."

Grane te grabe dok juriš kroz šumu. Jedna od njih ti zadire duboko u rame.`,
        healthChange: -15,
        sanityChange: -5,
        flags: { rejectedPast: true },
        choices: [
            { text: "Nastavi trčati", next: "deep_forest" },
            { text: "Sakrij se u grmlju", next: "hide_bushes" }
        ]
    },

    attack_shadow: {
        location: "Bitka sa Sjenom",
        text: `Zamahnuo si prema sjeni, ali tvoja ruka prolazi kroz nju kao kroz dim. Sjena te hvata za zapešće - njen dodir je ledeno bolniji nego što si mogao zamisliti.

"Možeš li boriti protiv onoga što si sam?" pita sjena dok njena hladnoća puzit će ti kroz vene.`,
        healthChange: -25,
        sanityChange: -10,
        choices: [
            { text: "Izvuci se i bježi", next: "escape_shadow" },
            { text: "Pokuša upotrijebiti svoj mrak protiv nje", next: "dark_vs_dark", condition: 'acceptedDarkness' },
            { text: "Predaj se", next: "surrender_shadow" }
        ]
    },

    stream: {
        location: "Šaptavi Potok",
        text: `Krećeš se prema zvuku vode i pronalaziš mali potok čija voda blijedo svetluca u tami. Voda je čudno topla i ima srebrenkast odsjaj.

Kada se prigneš da je ispitaš, vidiš svoje lice u odrazu - ali nije samo tvoje. Za tren se čini kao da još netko gleda iz vode natrag prema tebi.`,
        choices: [
            { text: "Popij vodu", next: "drink_water" },
            { text: "Operi ranu (ako je imaš)", next: "wash_wound", condition: 'wounded' },
            { text: "Prati odraz pažljivije", next: "study_reflection" },
            { text: "Napusti potok i vrati se", next: "stream_leave" }
        ]
    },

    drink_water: {
        location: "Šaptavi Potok",
        text: `Voda ima sladak, gotovo medeni okus. Toplina se širi kroz tvoje tijelo i osjećaš kako te snaga obnavlja.

Ali dok piješ, vidiš vizije - ne u vodi, već u svojoj glavi. Stara žena kraj vatre. Dijete koje plače. Crvena kula na horizontu. Je li to sjećanje ili upozorenje?`,
        healthChange: 20,
        sanityChange: -8,
        flags: { drankFromStream: true },
        knowledge: ['red_tower_vision'],
        item: "Srebrna Tikvica",
        choices: [
            { text: "Napuni tikvicu vodom za kasnije", next: "fill_flask" },
            { text: "Kreni prema viziji crvene kule", next: "tower_path" },
            { text: "Zaobiđi kulu i istraži dalje", next: "deep_forest" }
        ]
    },

    study_reflection: {
        location: "Šaptavi Potok",
        text: `Zurićeš u odraz. Drugo lice je zamagljeno, ali moćnije. Starije. Oči su mu pune mudrosti i tuge.

"Oprez, lutajući." šapće glas iz vode. "Kula će ti ponuditi moć, ali moć ima cijenu. Traži Staru Vrbu. Ona pamti prije nego što je mrak pao."

Voda se smiruje i vidićeš samo svoju zabrinuto lice.`,
        sanityChange: 5,
        flags: { metWaterSpirit: true },
        knowledge: ['old_willow_hint'],
        choices: [
            { text: "Popij vodu prije odlaska", next: "drink_water" },
            { text: "Traži Staru Vrbu", next: "search_willow" },
            { text: "Ignoriraj upozorenje i kreni dalje", next: "ignore_spirit" }
        ]
    },

    pale_light: {
        location: "Čudna Čistina",
        text: `Krećeš se prema sjaju i izlaziš na malu čistinu. U centru raste stablo koje svetluca blijedim, duhovno zelenim svjetlom. Oko stabla kruži svjetlucavi insekt - ili je to možda šta drugo?

Ispod stabla primjećuješ skelet u oštećenom oklopu. Jedna ruka mu je ispružena kao da je došao ovdje tražeći pomoć.`,
        choices: [
            { text: "Istraži skelet i oklop", next: "examine_skeleton" },
            { text: "Dotakni svijetleće stablo", next: "touch_tree" },
            { text: "Pokušaj uhvatiti svijetleću krilaticu", next: "catch_wisp" },
            { text: "Napusti čistinu", next: "leave_clearing" }
        ]
    },

    examine_skeleton: {
        location: "Čudna Čistina",
        text: `Prilazićeš oprezno. Oklop je star i prohrđan, ali još uvijek solidne izrade. U njegovoj ruci je bodež sa simbolima koji svjetlucaju slabašnim plavim svjetlom.

Kada uzmeš bodež, osjećaš puls energije. Nije prijateljski, ali nije ni neprijateljski. Jednostavno... budan.

Na unutrašnjoj strani skeleta vidiš urezano: "Branio sam svetište. Nisam uspio. Neka tko dođe poslije završi što ja nisam mogao."`,
        item: "Bodež Čuvara",
        flags: { foundGuardianDagger: true },
        knowledge: ['failed_guardian'],
        choices: [
            { text: "Dotakni svijetleće stablo", next: "touch_tree" },
            { text: "Pokušaj uhvatiti krilaticu", next: "catch_wisp" },
            { text: "Napusti čistinu s bodežem", next: "leave_with_dagger" }
        ]
    },

    touch_tree: {
        location: "Svijetleće Stablo",
        text: `Tvoja ruka se približava kori. U trenutku dodira, sve se mijenja.

Vidiš šumu kakva je bila prije - puna života, smjeha, sunca koje probija krošnje. Vidiš ljude koji žive u miru. I onda... tamu. Pukotinu koja se otvara na nebu. Nešto što dolazi izvana.

Stablo ti pokazuje istinu: ovaj svijet je bio lep. Netko ga je prokleo. A taj netko još uvijek živi u Crvenoj Kuli.`,
        sanityChange: 10,
        healthChange: 15,
        flags: { sawTruePast: true },
        knowledge: ['curse_origin', 'tower_location'],
        choices: [
            { text: "Zakletva se pred stablom da ćeš ukloniti prokletstvo", next: "vow_guardian" },
            { text: "Napusti čistinu sa novim znanjem", next: "leave_with_knowledge" },
            { text: "Pokušaj uzeti grančicu stabla", next: "take_branch", danger: true }
        ]
    },

    vow_guardian: {
        location: "Svijetleće Stablo",
        text: `"Obečavam," rekao si tiho, "da ću učiniti što moram da zaustavim prokletstvo."

Stablo pulsira svjetlom i osjećaš kako te nešto prožima - toplo, moćno, čisto. Tvoje tijelo postaje snažnije. Tvoj um jasniji.

Jedna grančica tiho otpada i pada u tvoju ruku. Nije oružje, ali ćeš osjetiti njenu zaštitu.`,
        healthChange: 30,
        maxHealthChange: 20,
        sanityChange: 20,
        item: "Grančica Svjetlosti",
        flags: { guardianVow: true, blessed: true },
        choices: [
            { text: "Kreni prema Crvenoj Kuli", next: "tower_path_blessed" },
            { text: "Prvo traži saveznike i znanje", next: "seek_allies" }
        ]
    },

    path_forward: {
        location: "Tamna Staza",
        text: `Krećeš se stazom. Magla postaje gušća s svakim korakom. Grane nad tobom su isprepletane poput kandži koje čekaju da te zgrabe.

Nakon nekog vremena, staza se dijeli. Lijevi put vodi prema zvuku dalje - plač ili vjetar? Desni put vodi prema crvenkastom sjaju na horizontu.`,
        choices: [
            { text: "Kreni lijevom stazom prema zvuku", next: "crying_path" },
            { text: "Kreni desnom stazom prema sjaju", next: "tower_approach" },
            { text: "Napusti stazu i probijaj kroz šumu", next: "off_path" }
        ]
    },

    crying_path: {
        location: "Staza Plača",
        text: `Približavaš se zvuku. Plač postaje jasniji - glas djeteta, prestravljen i usamljen.

Kroz maglu vidiš malu figuru koja sjedi kraj drveta, lice sakriveno u rukama. Kada se približiš, dijete podiže glavu. Oči su mu prazne duplje iz kojih izlazi crni dim.

"Pomozi mi..." šapće glasom koji nije ljudski. "Uđi u mene... bit ćeš ponovno cio..."`,
        choices: [
            { text: "Pomozi djetetu", next: "help_child", danger: true },
            { text: "Napadni stvorenje", next: "attack_changeling", condition: 'foundGuardianDagger' },
            { text: "Pobjegni natrag", next: "flee_changeling" },
            { text: "Pokušaj razgovarati s njim", next: "talk_changeling" }
        ]
    },

    help_child: {
        location: "Staza Plača",
        text: `Pružaš ruku prema djetetu. Njegova hladna prsti te grabe i snaga te napušta kao voda koja curi kroz pukotinu.

"Hvala ti..." šapće dok se njegovo lice rasteže u grotesknu parodiju osmijeha. "Sada pripadaš magli..."

Osjećaš kako te nešto vuče dublje u tamu. Moraš odlučiti brzo!`,
        healthChange: -30,
        sanityChange: -20,
        choices: [
            { text: "Daj se u borbu dok još imaš snage", next: "fight_changeling" },
            { text: "Iskoristi Bodež Čuvara (ako ga imaš)", next: "dagger_changeling", condition: 'foundGuardianDagger' },
            { text: "Pokušaj slomiti vezu snagom volje", next: "willpower_break" },
            { text: "Predaj se magpli", next: "surrender_fog", danger: true }
        ]
    },

    fight_changeling: {
        location: "Borba s Mijenjacem",
        text: `Zabijajš šaku u lice stvorenja. Ono vrišti - zvuk koji reže kroz mozak poput stakla. Grip ti se labavi i uspjevaš se osloboditi, ali gubiš još krvi i snage u procesu.

Mijenjač se povlači u maglu, vrištući: "Vratit ću se... uvijek se vraćam..."`,
        healthChange: -20,
        sanityChange: -10,
        flags: { foughtChangeling: true },
        choices: [
            { text: "Bježi dok možeš", next: "escape_changeling_area" },
            { text: "Traži gdje se sakrio", next: "hunt_changeling", danger: true }
        ]
    },

    dagger_changeling: {
        location: "Borba s Mijenjacem",
        text: `Izvlačiš Bodež Čuvara. Plave rune zasvijetluju jasno i mijenjač vrišti, puštajući tvoju ruku.

"Ne! Ne taj nož! Čuvar je mrtav!" vrišti dok se povlači.

Zamahneš i bodež probija mijenačevo tijelo. Ono se raspada u crni dim koji brzo nestaje. Tamo gdje je stajalo, ostaje samo mala lutka napravljena od sjena.`,
        sanityChange: 5,
        flags: { killedChangeling: true },
        item: "Srce Sjena",
        knowledge: ['changeling_weakness'],
        choices: [
            { text: "Uzmi Srce Sjena", next: "take_shadow_heart" },
            { text: "Uništi ga i nastavi dalje", next: "destroy_heart" }
        ]
    },

    tower_approach: {
        location: "Prilaz Kuli",
        text: `Crvenkasti sjaj postaje jači. Pred tobom se uzdižje ogromna kamena kula, stara i raspadnuta, ali još uvijek prijeteća. Njene zidove prekrivaju čudni simboli koji pulsiraju slabašnim crvenim svjetlom.

Na vratima stoji figura u crnom ogrtaču. Kada te primjeti, podiže ruku u pozdravu.

"Dobrodošao, lutalajući. Gospodar te čeka. Hoćeš li ući dobrovoljno ili te moramo natjerati?"`,
        choices: [
            { text: "Uđi dobrovoljno", next: "enter_tower_willing" },
            { text: "Odbij i pokušaj pobjeći", next: "refuse_tower" },
            { text: "Napadni figuru", next: "attack_guardian", danger: true },
            { text: "Pokušaj razgovarati i saznati više", next: "talk_tower_guardian" }
        ]
    },

    talk_tower_guardian: {
        location: "Prilaz Kuli",
        text: `"Tko je tvoj gospodar? Što želi od mene?" pitaš.

Figura se tiho smije. "On želi ono što je bilo tvoje prije nego što si zaboravio. On želi dovršiti ono što ste zajedno započeli. Ti si bio njegov učenik, njegov instrument. Pokušao si pobjeći, ali prokletstvo se ne može tako lako prekinuti."

"Ima dva puta: ponovno postani ono što si bio i dijeli njegovu moć. Ili umri pokušavajući mu se oprijeti. Nema trećeg izbora."`,
        flags: { talkedToGuardian: true },
        knowledge: ['player_apprentice'],
        choices: [
            { text: "Prihvati ponudu i uđi", next: "enter_tower_willing" },
            { text: "Odbij - radije umri nego se vratiš", next: "refuse_tower" },
            { text: "Pitaj za treći put", next: "seek_third_way" }
        ]
    },

    seek_third_way: {
        location: "Prilaz Kuli",
        text: `"Mora postojati treći put. Uvijek postoji." rekao si s više uvjerenja nego što osjećaš.

Figura zastaje. "Možda... Stara Vrba sjećanja govori o proročanstvu. Onaj koji je bio tama ali je odabrao svjetlost može slomiti krug. Ali put je težak i zahtjeva žrtvu."

"Trebaš tri stvari: Svjetlost koja nije bila ugašena. Tamu koja je odbila svoju prirodu. I Volju koja neće pasti."

Figura korača u stranu. "Traži ako hoćeš. Ali vrijeme ističe. Gospodar neće čekati zauvijek."`,
        flags: { knowsThirdWay: true },
        knowledge: ['third_way_quest', 'three_requirements'],
        choices: [
            { text: "Traži Staru Vrbu", next: "search_willow" },
            { text: "Ipak uđi u kulu", next: "enter_tower_willing" },
            { text: "Napadni dok je spuštena straža", next: "attack_guardian", danger: true }
        ]
    },

    search_willow: {
        location: "Dubine Šume",
        text: `Zaobilaziš kulu i zaronjavaš dublje u šumu, tražeći Staru Vrbu koja je spominjana. Šuma postaje gušća, starija. Drveća ovdje su ogromna i iskrivljena, njihovi korijeni poput zmija.

Nakon što se čini kao sati lutanja, pronalaziš je - vrbu toliko staru da bi mogla biti tu prije nego što je ikakav svijet postojao. Njeno deblo je široko poput kuće, a grane padaju kao zelena kosa.

Čuješ glas - mudar, ženski, davni: "Došao si, dijete izgubljene memorije. Pristupi."`,
        location: "Stara Vrba Sjećanja",
        choices: [
            { text: "Pristupi vrbi", next: "approach_willow" },
            { text: "Pozovi iz sigurne udaljenosti", next: "call_willow" },
            { text: "Ovo je zamka - bježi!", next: "flee_willow", danger: true }
        ]
    },

    approach_willow: {
        location: "Stara Vrba Sjećanja",
        text: `Prilazićeš i dodirušeš koru. Topla je, živa na način na koji kamek nikad ne može biti.

"Vidiš istinu sada," šapće vrba. "Bio si oruđe mračnog čarobnjaka. Izvršavao si njegova naređenja - palež, ubojstva, strahote koje san ne može nositi. Ali nešto te promijenilo. Vidio si dijete koje je umiralo zbog tebe. I nešto u tebi se slomilo."

"Pokušao si pobjeći. On ti je uzeo sjećanja kao kaznu. Ali ti još uvijek imaš izbor."

Vrba ti pokazuje tri staze kroz viziju:

**Prvi Put - Iskupljenje**: Unište čarobnjaka i sebe s njim. Prokletstvo će pasti, ali ti nećeš preživjeti.

**Drugi Put - Prihvaćanje**: Postani novo zlo, zamijeni svog bivšeg gospodara. Moć će biti tvoja, ali i prokletstvo.

**Treći Put - Preobrazba**: Odbij i mrak i iskupljenje. Nađi ravnotežu. Najteži put, koji zahtjeva sve tri stvari koje je spomenuo čuvar.`,
        flags: { metWillow: true, knowsAllPaths: true },
        sanityChange: 15,
        knowledge: ['three_paths_revealed'],
        choices: [
            { text: "Odaberi Put Iskupljenja", next: "path_redemption" },
            { text: "Odaberi Put Prihvaćanja", next: "path_acceptance" },
            { text: "Odaberi Put Preobrazbe", next: "path_transformation" },
            { text: "Odbij sve puteve - traži svoj vlastiti", next: "path_own", danger: true }
        ]
    },

    path_transformation: {
        location: "Stara Vrba Sjećanja",
        text: `"Odabirem treći put," izjavljuješ. "Neću biti ni heroj ni zlikovac. Bit ću nešto između - nešto novo."

Vrba se krešti od zadovoljstva. "Mudro. Ali trebaš tri stvari:

**Svjetlost Neokaljanog**: Traži svijetleće stablo na čistini. Ako već nisi dobio njegovu moć, moraš se zakleti kao njegov čuvar.

**Tamu Odbijenu**: Srce Mijenjača koji je odbio postati dio magle. Moraš ga pobijeli ne iz mržnje, već iz saučešća.

**Nepokolebljivu Volju**: To već imaš ili nemaš. Pokazat češ je u konačnom suočenju.

Idi i skupi što trebaš. Ja ću te čekati za konačni ritual."`,
        flags: { chosenTransformation: true, questGiven: true },
        knowledge: ['transformation_requirements'],
        choices: [
            { text: "Ako imaš sve - započni ritual sada", next: "begin_ritual", condition: 'hasAllThree' },
            { text: "Idi tražiti nedostajuće djelove", next: "gather_items" },
            { text: "Predomisli se - odaberi drugi put", next: "approach_willow" }
        ]
    },

    gather_items: {
        location: "Dubine Šume",
        text: `Odlučuješ skupiti što ti treba. Ispred tebe su različiti zadaci.`,
        choices: [
            { text: "Vrati se na svijetleću čistinu", next: "pale_light" },
            { text: "Traži Mijenjača ako ga već nisi ubio", next: "hunt_changeling_quest" },
            { text: "Kreni prema kuli za finalni obračun", next: "final_tower_approach" }
        ]
    },

    final_tower_approach: {
        location: "Pred Crvenkom Kulom",
        text: `Vraćaš se kuli s novim ciljem. Figura u ogrtaču više nije tamo - put je otvoren.

Vrata su masivna i pokrivena runama. Osjećaš moć koja pulsira iza njih. Ovo je točka bez povratka.`,
        choices: [
            { text: "Otvori vrata i uđi", next: "tower_interior" },
            { text: "Koristi Grančicu Svjetlosti da očistis vrata", next: "purify_entrance", condition: 'blessed' },
            { text: "Još nije vrijeme - vrati se i pripremi se bolje", next: "retreat_prepare" }
        ]
    },

    tower_interior: {
        location: "Unutrašnjost Kule",
        text: `Unutrašnjost kule je hladna i vlažna. Zidovi su pokriveni pokretnim sjenama koje ne pripadaju ničemu vidljivom. Stepenice se penju u spirali prema vrhu gdje osječaš jak izvor tame.

Dok penjećeš se, čuješ glas koji odjekuje: "Znao sam da ćeš doći. Bilo je samo pitanje vremena. Moje najdraže dijete, moje najveće razočaranje."`,
        choices: [
            { text: "Nastavi prema vrhu", next: "tower_top" },
            { text: "Istraži donje prostorije", next: "tower_basement" },
            { text: "Odgovori na glas", next: "answer_master" }
        ]
    },

    tower_top: {
        location: "Vrh Crvene Kule",
        text: `Dolaziš na vrh. Prostorija je kružna, sa velikim otvorima kroz koje ulazi magla. U centru stoji stara figura u crvenom ogrtaču, lice skriveno duboko u kapuljači.

"Dobrodošao kući." kaže glas koji je previše poznat. Figura skida kapuljaču i vidiš... svoje lice. Starije, iskrivljeno, ali nepogrešivo tvoje.

"Jesam ti. Ti si meni. Pokušao si se odvojiti, stvoriti novi identitet, pobjeći od onoga što jesi. Ali ne možeš pobjeći od sebe."`,
        sanityChange: -20,
        flags: { metTrueSelf: true },
        choices: [
            { text: "Odbij ga - ti nisi on!", next: "reject_self" },
            { text: "Prihvati da je dio tebe", next: "accept_self" },
            { text: "Napadni ga odmah", next: "attack_self", danger: true },
            { text: "Koristi moć koju si skupio", next: "use_gathered_power", condition: 'hasAllThree' }
        ]
    },

    use_gathered_power: {
        location: "Finalni Ritual",
        text: `Izvlačićeš sve što si skupio: Grančicu Svjetlosti, Srce Sjena, i svoju vlastitu nepokolebljivu Volju.

"Ne," kažeš jasno. "Nisi ti ja. Ti si ono što sam mogao postati. Ali ja biram drugačije."

Grančica počinje svijetliti. Srce Sjena pulsira. Tvoja volja se manifestira kao zlatni plamen oko tebe.

"Nemoguće!" vrišti tvoja tamna verzija. "Nemaš snagu!"

"Imam," odgovaraš. "Imam ono što ti nikad nećeš imati. Imam volju da promijenim."

Tri snage se spajaju. Svjetlost, Tama i Volja postaju jedno - nije ni dobro ni zlo, već ravnoteža.`,
        choices: [
            { text: "Dovršsi preobrazbu", next: "ending_transformation" },
            { text: "U zadnjem trenutku - zaustavi se", next: "hesitate_final" }
        ]
    },

    ending_transformation: {
        location: "Novo Svijetanje",
        text: `Snage eksplodiraju. Tvoja tamna verzija vrišti dok se raspada u svjetlost i sjenu koja se miješa i nestaje.

Kula oko tebe počinje padati. Prokletstvo se kidsa. Osjećaš kako se šuma budi - prvi put nakon toliko vremena.

Kada se probudiš, leziš na mekanoj travi. Sunce sija kroz krošnje drveća. Magla je nestala. Ptice pjevaju.

Nisi potpuno isti. Dio tame ostaje u tebi, ali sada pod tvojom kontrolom. Grančica svjetlosti se pretovrila u štap koji držiš u ruci.

Ti si nešto novo - ni svetac ni čudovište. Čuvar ravnoteže. I pred tobom je cijeli svijet koji treba pomoć da se obnovi.

**ENDING REACHED: THE TRANSFORMED GUARDIAN**

Završio si igru. Želiš li pokušati drugi put ili drugi kraj?`,
        isEnding: true,
        choices: [
            { text: "Nova igra", next: "start" }
        ]
    },

    reject_self: {
        location: "Bitka sa Sobom",
        text: `"Nisam ti!" viknuo si. "Možda sam bio, ali više nisam!"

Tvoja tmurna verzija se smiješi. "Onda si slabiji od mene. A u tom slučaju..." On podiže ruku i talasa moći te udara, bacajući te na pod.

"Pridruži mi se ili umri. To su jedine opcije."`,
        healthChange: -30,
        choices: [
            { text: "Bori se do kraja", next: "fight_to_death" },
            { text: "Pokušaj pregovarati", next: "negotiate_self" },
            { text: "Koristi sve što imaš protiv njega", next: "desperate_final_attack" }
        ]
    },

    fight_to_death: {
        location: "Posljednja Bitka",
        text: `Dižeš se, krvarećI i slomljen, ali ne porazen. "Onda biram smrt. Ali povest ću te sa sobom!"

Juriš prema njemu. Bitka je brutalna i kaotična. Razmjenjujete udarce - magične i fizičke. Kula se trese oko vas.

Na kraju, kad oba padnete, kula počinje pucati. Prokletstvo se kidsa - ne zbog pobjede svjetlosti, već zbog uništenja izvora tame.

Dok leziš u ruševinama, vidiš maglu kako se razilazi. Tvoja žrtva je spasila šumu, ali te košta života.

**ENDING REACHED: THE MARTYR'S SACRIFICE**

Možda postoji bolji način?`,
        isEnding: true,
        choices: [
            { text: "Pokušaj ponovo", next: "start" }
        ]
    },

    accept_self: {
        location: "Spajanje",
        text: `"Možda... možda si u pravu," šapćeš. "Možda si dio mene."

Tvoja tmurna verzija se približava. "Napokon razumiješ. Zajedno, moćniji nego ikad."

Doxustuš da te dotakne. Vas dvojica se spajate - ne potpuno jedan, ali više ne odvojeni.

Osjećaš moć koja teče kroz tebe. Prokletstvo je tvoje da kontroliraš. Šuma će ostati mračna, ali sada pod tvojim gospodstvom.

Posatješ novi Gospodar Crvene Kule.

**ENDING REACHED: THE DARK LORD'S HEIR**

Je li to pobjeda ili tragedija? Postoje i drugi putevi.`,
        isEnding: true,
        choices: [
            { text: "Počni ispočetka", next: "start" }
        ]
    },

    path_redemption: {
        location: "Put Iskupljenja",
        text: `"Odabirem iskupljenje," kažeš tiho. "Ono što sam bio... mora umrijeti."

Vrba žalošno šušti. "Hrabro. Ali znaš što to znači."

Daje ti blagoslov - snagu dovoljnu da savladaš čarobnjaka, ali ne i da prežviš poslje. Tvoj život će biti cijena čišćenja šume.

"Idi," kaže vrba. "Završi to."`,
        flags: { chosenRedemption: true },
        healthChange: 50,
        item: "Blagoslov Žrtve",
        choices: [
            { text: "Kreni prema kuli za posljednju bitku", next: "redemption_tower_attack" }
        ]
    },

    redemption_tower_attack: {
        location: "Napad na Kulu",
        text: `S blagoslovom vrbe, juriš u kulu. Čuvari pokušavaju te zaustaviti, ali tvoja snaga je nadljudska. Probijaj se do vrha gdje te gospodar čeka.

"Budala!" vrišti on. "Misliš da možeš pobijediti?!"

"Ne," odgovaraš mirno. "Ali mogu te povesti sa sobom."

Konačna bitka je kratka ali intenzivna. Koristiš svoju moć da stvoriš eksploziju čiste energije koja uništava vas oboje i kulu.

Dok umireš, vidiš sunce koje se probija kroz oblake po prvi put poslije toliko vremena.

**ENDING REACHED: REDEMPTION THROUGH SACRIFICE**

Našao si mir.`,
        isEnding: true,
        choices: [
            { text: "Nova igra", next: "start" }
        ]
    },

    path_acceptance: {
        location: "Put Prihvaćanja",
        text: `"Zašto bježati od onoga što jesam?" kažeš. "Moć je moć. Koristit ću je bolje od njega."

Vrba vzdigne. "Opasan put. Moć kvari. Ali... tvoj izbor."

Daje ti znanje - kako sruši tsvog gospodara i zauzmeš njegovo mjesto. Bit ćeš nov gospodar, možda pravedniiji, možda ne.`,
        flags: { chosenAcceptance: true },
        knowledge: ['power_ritual'],
        choices: [
            { text: "Kreni prema kuli zauzeti prijestolje", next: "acceptance_tower_takeover" }
        ]
    },

    acceptance_tower_takeover: {
        location: "Preuzimanje Kule",
        text: `Ulaziš u kulu ne kao prosac, već kao izazivač. Gospodar te čeka na vrhu, ali ovaj put si spreman.

"Došao si uzeti što je tvoje," kaže on. "Dobro. Pokažmi da si dostojan."

Bitka je dugačka. Na kraju, koristiš ritual koji ti je vrba pokazala i apsorbuješ njegovu moć. On nestaje u visokom vrištanju.

Ti sada stojiš kao novi Gospodar Crvene Kule. Šuma je još uvijek mračna, ali sada pod tvojom kontrolom. Što ćeš učiniti s ovom moći?

**ENDING REACHED: THE NEW DARK LORD**

Moć je tvoja. Ali po koju cijenu?`,
        isEnding: true,
        choices: [
            { text: "Započni ponovo i istraži druge puteve", next: "start" }
        ]
    },

    death: {
        location: "Smrt",
        text: `Tama te obuzima. Tvoje zadnje misli su nejasne i ispunjene žaljenjem.

Pao si u prokletoj šumi. Tvoja priča je završena... ali možda postoji drugi put?`,
        isEnding: true,
        choices: [
            { text: "Pokušaj ponovo", next: "start" }
        ]
    }
};

const items = {
    "Sjajni Medaljon": "Medaljon koji blijedo svjetluca, simbol tvoje mračne prošlosti",
    "Srebrna Tikvica": "Tikvica napunjena čarobnom vodom koja iscjeljuje",
    "Bodež Čuvara": "Drevni bodež s plavim runama, oštrica protiv mračnih bića",
    "Srce Sjena": "Kristalizirani ostatak porženog Mijenjača, moćan ali uznemirujući",
    "Grančica Svjetlosti": "Grančica sa Svijetlećeg Stabla, pruža zaštitu i snagu",
    "Blagoslov Žrtve": "Vrhunska moć darivana za konačnu žrtvu"
};

function updateDisplay() {
    document.getElementById('health').textContent = gameState.health;
    document.getElementById('maxHealth').textContent = gameState.maxHealth;
    document.getElementById('sanity').textContent = gameState.sanity;
    
    const scene = scenes[gameState.currentScene];
    if (scene) {
        document.getElementById('location').textContent = scene.location || "???";
    }
    
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '';
    
    if (gameState.inventory.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'item item-empty';
        empty.textContent = 'Prazan inventar';
        inventoryDiv.appendChild(empty);
    } else {
        gameState.inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.textContent = item;
            itemDiv.title = items[item] || item;
            inventoryDiv.appendChild(itemDiv);
        });
    }
}

function displayScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error('Scene not found:', sceneId);
        return;
    }
    
    gameState.currentScene = sceneId;
    
    if (scene.healthChange) {
        gameState.health = Math.max(0, Math.min(gameState.maxHealth, gameState.health + scene.healthChange));
        if (scene.healthChange > 0) {
            document.getElementById('health').classList.add('heal-flash');
            setTimeout(() => document.getElementById('health').classList.remove('heal-flash'), 500);
        } else {
            document.getElementById('health').classList.add('damage-flash');
            setTimeout(() => document.getElementById('health').classList.remove('damage-flash'), 500);
        }
    }
    
    if (scene.maxHealthChange) {
        gameState.maxHealth += scene.maxHealthChange;
        gameState.health = Math.min(gameState.health, gameState.maxHealth);
    }
    
    if (scene.sanityChange) {
        gameState.sanity = Math.max(0, Math.min(100, gameState.sanity + scene.sanityChange));
    }
    
    if (scene.flags) {
        Object.assign(gameState.flags, scene.flags);
    }
    
    if (scene.knowledge) {
        scene.knowledge.forEach(k => {
            if (!gameState.knowledge.includes(k)) {
                gameState.knowledge.push(k);
            }
        });
    }
    
    if (scene.item) {
        if (!gameState.inventory.includes(scene.item)) {
            gameState.inventory.push(scene.item);
        }
    }
    
    if (scene.companion) {
        if (!gameState.companions.includes(scene.companion)) {
            gameState.companions.push(scene.companion);
        }
    }
    
    if (gameState.health <= 0) {
        displayScene('death');
        return;
    }
    
    const storyDiv = document.getElementById('story-text');
    storyDiv.className = 'story-section fade-in';
    storyDiv.innerHTML = `<p>${scene.text.replace(/\n\n/g, '</p><p>')}</p>`;
    
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    
    if (scene.choices) {
        scene.choices.forEach(choice => {
            if (choice.condition && !checkCondition(choice.condition)) {
                return;
            }
            
            const button = document.createElement('button');
            button.className = 'choice-btn';
            if (choice.danger) {
                button.classList.add('dangerous');
            }
            button.textContent = choice.text;
            button.onclick = () => displayScene(choice.next);
            choicesDiv.appendChild(button);
        });
    }
    
    updateDisplay();
    
    if (scene.isEnding) {
        gameState.deaths++;
    }
}

function checkCondition(condition) {
    switch(condition) {
        case 'wounded':
            return gameState.health < gameState.maxHealth;
        case 'foundGuardianDagger':
            return gameState.inventory.includes('Bodež Čuvara');
        case 'acceptedDarkness':
            return gameState.flags.acceptedDarkness;
        case 'blessed':
            return gameState.flags.blessed;
        case 'hasAllThree':
            return gameState.inventory.includes('Grančica Svjetlosti') && 
                   gameState.inventory.includes('Srce Sjena') && 
                   gameState.sanity >= 60;
        default:
            return gameState.flags[condition] || false;
    }
}

function processCommand(command) {
    const cmd = command.toLowerCase().trim();
    const storyDiv = document.getElementById('story-text');
    
    if (cmd === 'pomoć' || cmd === 'pomoc' || cmd === 'help') {
        storyDiv.innerHTML += `<p style="color: #9b59b6; margin-top: 15px;">
        <strong>Dostupne naredbe:</strong><br>
        - inventar: Prikaži svoj inventar<br>
        - status: Prikaži svoje stanje<br>
        - gdje sam: Prikaži lokaciju<br>
        - povijest: Prikaži što znaš<br>
        - pomoć: Prikaži ovu listu<br>
        Koristi gumbe za odabir akcija u priči.
        </p>`;
    } else if (cmd === 'inventar' || cmd === 'inv') {
        if (gameState.inventory.length === 0) {
            storyDiv.innerHTML += `<p style="color: #9b59b6; margin-top: 15px;">Tvoj inventar je prazan.</p>`;
        } else {
            let invText = '<p style="color: #9b59b6; margin-top: 15px;"><strong>Inventar:</strong><br>';
            gameState.inventory.forEach(item => {
                invText += `- ${item}: ${items[item] || 'Nepoznat predmet'}<br>`;
            });
            invText += '</p>';
            storyDiv.innerHTML += invText;
        }
    } else if (cmd === 'status' || cmd === 'stanje') {
        storyDiv.innerHTML += `<p style="color: #9b59b6; margin-top: 15px;">
        <strong>Tvoje stanje:</strong><br>
        Život: ${gameState.health}/${gameState.maxHealth}<br>
        Volja: ${gameState.sanity}/100<br>
        Predmeti: ${gameState.inventory.length}<br>
        Saznanja: ${gameState.knowledge.length}
        </p>`;
    } else if (cmd === 'gdje sam' || cmd === 'lokacija' || cmd === 'location') {
        const scene = scenes[gameState.currentScene];
        storyDiv.innerHTML += `<p style="color: #9b59b6; margin-top: 15px;">Trenutno si u: <strong>${scene.location}</strong></p>`;
    } else if (cmd === 'povijest' || cmd === 'znanje' || cmd === 'knowledge') {
        if (gameState.knowledge.length === 0) {
            storyDiv.innerHTML += `<p style="color: #9b59b6; margin-top: 15px;">Još nisi otkrio ništa značajno.</p>`;
        } else {
            let knowText = '<p style="color: #9b59b6; margin-top: 15px;"><strong>Što znaš:</strong><br>';
            gameState.knowledge.forEach(k => {
                knowText += `- ${k.replace(/_/g, ' ')}<br>`;
            });
            knowText += '</p>';
            storyDiv.innerHTML += knowText;
        }
    } else {
        storyDiv.innerHTML += `<p style="color: #ff6b6b; margin-top: 15px;">Nepoznata naredba. Upiši "pomoć" za listu naredbi.</p>`;
    }
    
    storyDiv.scrollTop = storyDiv.scrollHeight;
}

function saveGame() {
    try {
        localStorage.setItem('darkFantasyGameSave', JSON.stringify(gameState));
        alert('Igra spremljena!');
    } catch (e) {
        alert('Greška pri spremanju igre.');
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem('darkFantasyGameSave');
        if (saved) {
            const loaded = JSON.parse(saved);
            Object.assign(gameState, loaded);
            displayScene(gameState.currentScene);
            alert('Igra učitana!');
        } else {
            alert('Nema spremljene igre.');
        }
    } catch (e) {
        alert('Greška pri učitavanju igre.');
    }
}

function restartGame() {
    if (confirm('Jesi li siguran da želiš početi novu igru? Sve nespremleni napredak će biti izgubljen.')) {
        gameState.currentScene = 'start';
        gameState.health = 100;
        gameState.maxHealth = 100;
        gameState.sanity = 100;
        gameState.inventory = [];
        gameState.flags = {};
        gameState.companions = [];
        gameState.knowledge = [];
        displayScene('start');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayScene('start');
    
    document.getElementById('command-submit').addEventListener('click', () => {
        const input = document.getElementById('command-input');
        const command = input.value;
        if (command.trim()) {
            processCommand(command);
            input.value = '';
        }
    });
    
    document.getElementById('command-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('command-submit').click();
        }
    });
    
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);
});
export interface IconPreset {
  id: string;
  label: string;
  description: string;
  styleHint: string;
}

export interface IconCategory {
  id: string;
  label: string;
  icons: IconPreset[];
}

export const ICON_PRESETS: IconCategory[] = [
  {
    "id": "app_system",
    "label": "App & System",
    "icons": [
      {
        "id": "app_generic",
        "label": "General App Icon",
        "description": "Minimalistické logo aplikácie so stredovým symbolom a jemným glowom.",
        "styleHint": "čisté tvary, jemný gradient, bez textu"
      },
      {
        "id": "settings_tool",
        "label": "Tool / Settings",
        "description": "Ikona ozubeného kolieska reprezentujúca nastavenia alebo nástroj.",
        "styleHint": "jednoduché gear tvary, trochu 3D, bez komplikovaných detailov"
      }
    ]
  },
  {
    "id": "productivity",
    "label": "Productivity",
    "icons": [
      {
        "id": "task_check",
        "label": "Task / Checkmark",
        "description": "Štvorcová karta s veľkým checkmarkom uprostred.",
        "styleHint": "silný kontrast, jasná fajka, vhodné aj v malom rozlíšení"
      },
      {
        "id": "calendar",
        "label": "Calendar",
        "description": "Kalendárový list s horným pásom a dátumovým symbolom.",
        "styleHint": "jednoduché bloky, žiadne reálne čísla, len abstraktný dátum"
      }
    ]
  },
  {
    "id": "business_services",
    "label": "Business & Services",
    "icons": [
      {
        "id": "briefcase",
        "label": "Briefcase",
        "description": "Ikona aktovky reprezentujúca biznis a služby.",
        "styleHint": "jemné zakrivenia, profesionálny vzhľad"
      },
      {
        "id": "analytics_graph",
        "label": "Analytics Graph",
        "description": "Stĺpcový alebo čiarový graf na karte.",
        "styleHint": "čisté bar/line prvky, žiadny text ani čísla"
      }
    ]
  },
  {
    "id": "navigation",
    "label": "Navigation",
    "icons": [
      {
        "id": "map_pin",
        "label": "Map Pin",
        "description": "Klasická mapová špendlíková ikona na jemnom pozadí.",
        "styleHint": "veľký pin, jednoduché pozadie, dobre čitateľné"
      },
      {
        "id": "compass",
        "label": "Compass",
        "description": "Kompasový kruh so šípkou smeru.",
        "styleHint": "centrálna šípka, minimalistické smerové body"
      }
    ]
  },
  {
    "id": "social_messaging",
    "label": "Social & Messaging",
    "icons": [
      {
        "id": "chat_bubble",
        "label": "Chat Bubble",
        "description": "Bublina chatu s jemným vnútorným tieňom.",
        "styleHint": "zaoblené tvary, žiadny text, možno drobné bodky"
      },
      {
        "id": "notification_bell",
        "label": "Notification Bell",
        "description": "Zvonička s malou bodkou notifikácie.",
        "styleHint": "jednoduchý siluetový tvar, bodka v rohu"
      }
    ]
  },
  {
    "id": "media",
    "label": "Media",
    "icons": [
      {
        "id": "camera",
        "label": "Camera",
        "description": "Fotoaparát s objektívom a malým highlightom.",
        "styleHint": "ikonická kamera, jeden hlavný kruh ako objektív"
      },
      {
        "id": "play_button",
        "label": "Play Button",
        "description": "Trojuholníkový play symbol v kruhu alebo štvorci.",
        "styleHint": "veľký trojuholník, silný kontrast"
      }
    ]
  },
  {
    "id": "health_lifestyle",
    "label": "Health & Lifestyle",
    "icons": [
      {
        "id": "heart",
        "label": "Heart",
        "description": "Srdce reprezentujúce zdravie alebo obľúbené položky.",
        "styleHint": "čistý tvar, jemný gradient"
      },
      {
        "id": "heartbeat_monitor",
        "label": "Heartbeat Monitor",
        "description": "Obdĺžnik s EKG vlnou uprostred.",
        "styleHint": "jednoduchá čiara s dvomi ostrejšími peakmi"
      }
    ]
  },
  {
    "id": "shopping_ecommerce",
    "label": "Shopping & E-commerce",
    "icons": [
      {
        "id": "shopping_cart",
        "label": "Shopping Cart",
        "description": "Košík z bočného pohľadu.",
        "styleHint": "zjednodušené línie, bez drobných mreží"
      },
      {
        "id": "tag",
        "label": "Price Tag",
        "description": "Visačka s dierkou v rohu.",
        "styleHint": "šikmý tvar tagu, jedna diagonálna hrana"
      }
    ]
  },
  {
    "id": "tech_dev",
    "label": "Tech & Dev",
    "icons": [
      {
        "id": "code_brackets",
        "label": "Code Brackets",
        "description": "Dvojica zátvoriek reprezentujúca kód.",
        "styleHint": "silné, hrubšie zátvorky, jednoduché pozadie"
      },
      {
        "id": "terminal",
        "label": "Terminal",
        "description": "Obrazovka s malou šípkou a podčiarkovníkom.",
        "styleHint": "ikonický `>_` štýl, ale bez skutočného textu"
      }
    ]
  },
  {
    "id": "finance",
    "label": "Finance",
    "icons": [
      {
        "id": "wallet",
        "label": "Wallet",
        "description": "Peňaženka s jemným prehybom.",
        "styleHint": "jednoduchý obdĺžnik, malý uzáver"
      },
      {
        "id": "coin_stack",
        "label": "Coin Stack",
        "description": "Dve až tri mince na sebe.",
        "styleHint": "kruhy s jemným 3D náznakom"
      }
    ]
  },
  {
    "id": "education",
    "label": "Education",
    "icons": [
      {
        "id": "book",
        "label": "Book",
        "description": "Otvorená alebo zatvorená kniha.",
        "styleHint": "jednoduché bloky, slabé vrstvy strán"
      },
      {
        "id": "graduation_cap",
        "label": "Graduation Cap",
        "description": "Maturitná čiapka reprezentujúca štúdium.",
        "styleHint": "ikonický tvar, čisté línie"
      }
    ]
  },
  {
    "id": "brand_special",
    "label": "Brand Specific",
    "icons": [
      {
        "id": "hair_salon",
        "label": "Hair Salon",
        "description": "Nožnice so zakriveným prameňom vlasov.",
        "styleHint": "elegantný, luxusný štýl"
      },
      {
        "id": "fitness_dumbbell",
        "label": "Fitness",
        "description": "Jednoduchá jednoručka.",
        "styleHint": "výrazný tvar, hrubšie línie"
      }
    ]
  }
];
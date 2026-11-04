// src/data/assets.js
// 🌟 商業級 16-Bit 復古像素圖集編譯器 (Ver 4.0 完整修復版)

const PALETTE = {
    '.': null,
    'K': '#141013', // 像素黑邊
    'W': '#ffffff', // 高光白
    'G': '#9badb7', // 銀灰
    'D': '#595652', // 暗灰
    'S': '#f4cca1', // 膚色
    's': '#d3976c', // 膚色陰影
    'R': '#d93829', // 紅
    'r': '#8f1d14', // 深紅
    'B': '#2864b8', // 藍
    'b': '#153670', // 深藍
    'Y': '#f7d51d', // 黃金
    'O': '#e88b25', // 銅橘
    'o': '#9e5211', // 棕
    'M': '#734623', // 木褐
    'm': '#472911', // 深木
    'L': '#71aa34', // 綠
    'l': '#3e7327', // 深綠
    'd': '#1d4018', // 暗綠
    'P': '#9b36b5', // 紫
    'p': '#58186e', // 暗紫
    'C': '#42c5f5', // 青藍
    'c': '#1976a6', // 深青
    'Z': '#c0c0c0', // 銀白
    'z': '#808080'  // 銀灰
};

function compileMatrixToSVG(matrix, bgHex = null) {
    let rects = '';
    if (bgHex) rects += `<rect width="16" height="16" fill="${bgHex}"/>`;
    for (let y = 0; y < 16; y++) {
        const row = matrix[y] || '';
        for (let x = 0; x < 16; x++) {
            const ch = row[x];
            const color = PALETTE[ch];
            if (color) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
        }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges">${rects}</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

const MATRICES = {
    grass: {
        bg: '#59962b',
        art: [
            "................",
            "..L..........l..",
            ".LLL........ll..",
            "..........L.....",
            "....l..........L",
            "...ll.......L...",
            "................",
            "......L.........",
            ".l...LL......l..",
            ".ll.........ll..",
            "................",
            "...........L....",
            "...L......LL....",
            "..LL............",
            "........l.......",
            "................"
        ]
    },
    tree: {
        bg: '#59962b',
        art: [
            ".....KKKKKK.....",
            "...KKLLLLLLKK...",
            "..KLLWWLLLLLLK..",
            ".KLLWLLLLLLLLLK.",
            ".KLLLLLLLLllllK.",
            "KLLLLLLLlllllllK",
            "KLLLLllllllldddK",
            ".KLLllllllddddK.",
            ".KKllllllllllKK.",
            "..KddddddddddK..",
            "...KKKKKKKKKK...",
            ".....KMMMMK.....",
            ".....KMMmmK.....",
            "....KMMMmmmK....",
            "....KKKKKKKK....",
            "................"
        ]
    },
    stone: {
        bg: '#59962b',
        art: [
            "................",
            "................",
            ".....KKKKKK.....",
            "...KKGGGGGGKK...",
            "..KGGWWGGGGGGK..",
            ".KGGWGGGGGGGGGK.",
            ".KGGGGGGGGDDDDK.",
            "KGGGGGGGDDDDDDDK",
            "KGGGGGDDDDDDDDDK",
            "KGGGDDDDDDDDDDDK",
            ".KDDDDDDDDDDDDK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    iron: {
        bg: '#59962b',
        art: [
            "................",
            "................",
            ".....KKKKKK.....",
            "...KKDDDDDDKK...",
            "..KDDYYDDDDDDK..",
            ".KDDYYDDDDYYDDK.",
            ".KDDDDDDDDYYDDK.",
            "KDDDYYDDDDDDDDDK",
            "KDDDYYDDDYYDDDDK",
            "KDDDDDDDDYYDDDDK",
            ".KDDDDDDDDDDDDK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    copper: {
        bg: '#59962b',
        art: [
            "................",
            "................",
            ".....KKKKKK.....",
            "...KKDDDDDDKK...",
            "..KDDOOODDDDDK..",
            ".KDDOOODDDOODDK.",
            ".KDDDDDDDDOODDK.",
            "KDDDOOODDDDDDDDK",
            "KDDDOOODDOODDDDK",
            "KDDDDDDDDOODDDDK",
            ".KDDDDDDDDDDDDK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    gold: {
        bg: '#59962b',
        art: [
            "................",
            "................",
            ".....KKKKKK.....",
            "...KKYYYYYYKK...",
            "..KYYWWYYYYYYK..",
            ".KYYWYYYYWWYYYK.",
            ".KYYYYYYYYYYYYK.",
            "KYYYYOOOOYYYYYYK",
            "KYYOOOOOOOOYYYYK",
            "KOOOOOOOOOOOOOOK",
            ".KooooooooooooK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    water: {
        bg: '#1d57a6',
        art: [
            "................",
            "..CCC...........",
            ".C...C....CCC...",
            ".........C...C..",
            "................",
            "......CCC.......",
            ".....C...C......",
            "................",
            "...........CCC..",
            "..CCC.....C...C.",
            ".C...C..........",
            "................",
            ".....CCC........",
            "....C...C.......",
            "................",
            "................"
        ]
    },
    portal: {
        bg: '#59962b',
        art: [
            "....KKKKKKKK....",
            "..KKPPPPPPPPKK..",
            ".KPPCCCCCCCCPPK.",
            "KPPCCWWWWWWCCPPK",
            "KPPCWPPPPPPWCPPK",
            "KPPCWPCCCCPWCPPK",
            "KPPCWPCWWCPWCPPK",
            "KPPCWPCWWCPWCPPK",
            "KPPCWPCCCCPWCPPK",
            "KPPCWPPPPPPWCPPK",
            "KPPCCWWWWWWCCPPK",
            ".KPPCCCCCCCCPPK.",
            "..KKPPPPPPPPKK..",
            "....KKKKKKKK....",
            "................",
            "................"
        ]
    },
    camp_portal: {
        bg: '#59962b',
        art: [
            ".......KK.......",
            "......KYYK......",
            ".....KOOOOK.....",
            "....KOOOOOOK....",
            "...KOOORROOOK...",
            "..KOOORRRROOOK..",
            ".KOOORRRRRROOOK.",
            ".KOOORKKKKROOOK.",
            "KOOOORKMMKROOOOK",
            "KOOOORKMMKROOOOK",
            "KooooRKMMKRooooK",
            "KooooRKMMKRooooK",
            "KKKKKKKKKKKKKKKK",
            "................",
            "................",
            "................"
        ]
    },
    cracked_wall: {
        bg: '#474442',
        art: [
            "KKKKKKKKKKKKKKKK",
            "KGGGGGGKGGGGGGGK",
            "KGGGGGKGGGGGGGGK",
            "KDDDDKDDDDDDDDDK",
            "KKKKKKKGGGGGGGGK",
            "KGGGGGGKGGGGGGGK",
            "KGGGGGGGKGGGGGGK",
            "KDDDDDDDDKDDDDDK",
            "KKKKKKKKKKKGGGGK",
            "KGGGGGGGGGKGGGGK",
            "KGGGGGGGGKGGGGGK",
            "KDDDDDDDKDDDDDDK",
            "KKKKKKKKKKKKKKKK",
            "KGGGGGGKGGGGGGGK",
            "KDDDDDDKDDDDDDDK",
            "KKKKKKKKKKKKKKKK"
        ]
    },
    ruin_wall: {
        bg: '#595652',
        art: [
            "KKKKKKKKKKKKKKKK",
            "KGGGGGGGKGGGGGGK",
            "KGGGGGGGKGGGGGGK",
            "KDDDDDDDKDDDDDDK",
            "KKKKKKKKKKKKKKKK",
            "KGGGGKGGGGGGGGGK",
            "KGGGGKGGGGGGGGGK",
            "KDDDDKDDDDDDDDDK",
            "KKKKKKKKKKKKKKKK",
            "KGGGGGGGGGKGGGGK",
            "KGGGGGGGGGKGGGGK",
            "KDDDDDDDDDKDDDDK",
            "KKKKKKKKKKKKKKKK",
            "KGGGGGGKGGGGGGGK",
            "KDDDDDDKDDDDDDDK",
            "KKKKKKKKKKKKKKKK"
        ]
    },
    chest: {
        bg: '#59962b',
        art: [
            "................",
            "................",
            "..KKKKKKKKKKKK..",
            ".KOOOOOOOOOOOOK.",
            "KOOYYYYYYYYYYOOK",
            "KOOOOOOOOOOOOOOK",
            "KKKKKKKKKKKKKKKK",
            "KOOOOOOKYYKOOOOK",
            "KOOOOOOKYYKOOOOK",
            "KooooooKKKKooooK",
            "KooooooooooooooK",
            "KooooooooooooooK",
            ".KKKKKKKKKKKKKK.",
            "................",
            "................",
            "................"
        ]
    },
    farm_empty: {
        bg: '#734623',
        art: [
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            "................"
        ]
    },
    farm_grow: {
        bg: '#734623',
        art: [
            "................",
            ".mmmmmmmmmmmmmm.",
            "................",
            "...LL......LL...",
            "..LLLL....LLLL..",
            "...ll......ll...",
            ".mmmmmmmmmmmmmm.",
            "................",
            "................",
            "...LL......LL...",
            "..LLLL....LLLL..",
            "...ll......ll...",
            ".mmmmmmmmmmmmmm.",
            "................",
            "................",
            "................"
        ]
    },
    farm_ready: {
        bg: '#734623',
        art: [
            "................",
            "..KLLK....KLLK..",
            ".KLLLLK..KLLLLK.",
            ".KLLWLK..KLLWLK.",
            "..KllK....KllK..",
            "...KK......KK...",
            ".mmmmmmmmmmmmmm.",
            "................",
            "..KLLK....KLLK..",
            ".KLLLLK..KLLLLK.",
            ".KLLWLK..KLLWLK.",
            "..KllK....KllK..",
            "...KK......KK...",
            ".mmmmmmmmmmmmmm.",
            "................",
            "................"
        ]
    },
    player: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "...KRRRRRRRRK...",
            "..KRRRRRRRRRRK..",
            "..KSSSSSSSSSSK..",
            "..KSKSSSSSSKSK..",
            "..KSKSSSSSSKSK..",
            "...KssssssssK...",
            "..KKBBBBBBBBKK..",
            ".KSSKBBBBBBKSSK.",
            ".KSSKBBBBBBKSSK.",
            "..KKKYYYYYYKKK..",
            "...KbbbbbbbbK...",
            "...KbbKKKKbbK...",
            "...KMMK..KMMK...",
            "...KKKK..KKKK...",
            "................"
        ]
    },
    merchant: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "...KPPPPPPPPK...",
            "..KPPPPPPPPPPK..",
            "..KSSSSSSSSSSK..",
            "..KSKSSSSSSKSK..",
            "...KssssssssK...",
            "..KKPPPPPPPPKK..",
            ".KMMKPPPPPPKMMK.",
            ".KMMKPPYYPPKMMK.",
            ".KMMKPPPPPPKMMK.",
            "..KKKppppppKKK..",
            "...KppppppppK...",
            "...KppKKKKppK...",
            "...KMMK..KMMK...",
            "...KKKK..KKKK...",
            "................"
        ]
    },
    witch: {
        bg: null,
        art: [
            "......KKKK......",
            ".....KPPPPK.....",
            "....KPPPPPPK....",
            "..KKPPPPPPPPKK..",
            ".KPPPPYYYYPPPPK.",
            "KKKKKKKKKKKKKKKK",
            "...KLLLLLLLLK...",
            "...KLKLLLLKLK...",
            "....KllllllK....",
            "...KKPPPPPPKK...",
            "..KPPKPPPPKPPK..",
            "..KPPKPPPPKPPK..",
            "...KKKppppKKK...",
            "....KppppppK....",
            "....KppKKppK....",
            "....KKKK.KKKK..."
        ]
    },
    skeleton: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "...KWWWWWWWWK...",
            "..KWWWWWWWWWWK..",
            "..KWKKWWWWKKWK..",
            "..KWKKWWWWKKWK..",
            "...KWWKKKKWWK...",
            "....KWWWWWWK....",
            "...KKDDDDDDKK...",
            "..KWWKWWWWKWWK..",
            "..KWWKDDDDKWWK..",
            "...KKKWWWWKKK...",
            "....KWK..KWK....",
            "....KWK..KWK....",
            "....KDK..KDK....",
            "...KKK....KKK...",
            "................"
        ]
    },
    fire_monster: {
        bg: null,
        art: [
            ".....KK..KK.....",
            "....KYYKKYYK....",
            "...KYYOOOOYYK...",
            "..KOOORRRROOOK..",
            ".KOORRRRRRRROOK.",
            ".KORRYYRRYYRROK.",
            "KORRRKKRRKKRRRRO",
            "KORRRRRRRRRRRRRO",
            "KORRRRKKKKRRRRRO",
            ".KORRKKKKKKRROK.",
            ".KrrrrrrrrrrrrK.",
            "..KrrrrrrrrrrK..",
            "..KrrrKKKKrrrK..",
            "..KrrK....KrrK..",
            "..KKKK....KKKK..",
            "................"
        ]
    },
    ice_monster: {
        bg: null,
        art: [
            "......KKKK......",
            "....KKCCCCKK....",
            "...KCCWWWWCCK...",
            "..KCCWCCCCWCCK..",
            ".KCCCCWWWWCCCCK.",
            ".KCCCKCCCCKCCCK.",
            ".KCCCKCCCCKCCCK.",
            "KCCCCCCCCCCCCCCK",
            "KcccCCCCCCCCcccK",
            ".KccccCCCCCCccK.",
            "..KccccccccccK..",
            "...KccccccccK...",
            "....KccKKccK....",
            "....KCK..KCK....",
            "....KK....KK....",
            "................"
        ]
    },
    boss: {
        bg: null,
        art: [
            ".KK..........KK.",
            "KYYK..KKKK..KYYK",
            "KYYKKRRRRRRKKYYK",
            ".KKRRRRRRRRRRKK.",
            ".KRRRRRRRRRRRRK.",
            "KRRRYYRRRRYYRRRK",
            "KRRRKKRRRRKKRRRK",
            "KRRRRRRRRRRRRRRK",
            "KRRRKKKKKKKKRRRK",
            ".KRRKWWWWWWKRRK.",
            ".KrrrrrrrrrrrrK.",
            "KrrrrrYYYYrrrrrK",
            "KrrrrrYYYYrrrrrK",
            ".KrrrKKKKKKrrrK.",
            "..KrrK....KrrK..",
            "..KKKK....KKKK.."
        ]
    },
    mushroom: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "..KKRRRRRRRRKK..",
            ".KRRWWWRRRRWWWR.",
            "KRRWWWRRRRRWWWRK",
            "KRRRRRRRRRRRRRRK",
            "KRRRRRWWWRRRRRRK",
            ".KKKKKKKKKKKKKK.",
            "....KSSSSSSK....",
            "....KSSSSSSK....",
            "....KssssssK....",
            "....KssssssK....",
            ".....KKKKKK.....",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    sword: {
        bg: null,
        art: [
            "...........KKKK.",
            "..........KGGWWK",
            ".........KGGWWGK",
            "........KGGWWGGK",
            ".......KGGWWGGK.",
            "......KGGWWGGK..",
            "..KKKKGGWWGGK...",
            ".KYYYYGWWGGK....",
            "..KKKKGGGGK.....",
            "...KMMKKKK......",
            "..KMMMKYYYY.....",
            ".KMMMK.KKKK.....",
            "KMMMK...........",
            "KKKK............",
            "................",
            "................"
        ]
    },
    iron_sword: {
        bg: null,
        art: [
            "...........KKKK.",
            "..........KWWWWK",
            ".........KWWGGWK",
            "........KWWGGGGK",
            ".......KWWGGGGK.",
            "......KWWGGGGK..",
            "..KKKKWWGGGGK...",
            ".KYYYYWGGGGK....",
            "..KKKKGGGGK.....",
            "...KMMKKKK......",
            "..KMMMKYYYY.....",
            ".KMMMK.KKKK.....",
            "KMMMK...........",
            "KKKK............",
            "................",
            "................"
        ]
    },
    fire_sword: {
        bg: null,
        art: [
            "...........KKKK.",
            "..........KRRYYK",
            ".........KRROOYK",
            "........KRROOORK",
            ".......KRROOORK.",
            "......KRROOORK..",
            "..KKKKRROOORK...",
            ".KYYYYROOORK....",
            "..KKKKRRRRK.....",
            "...KMMKKKK......",
            "..KMMMKYYYY.....",
            ".KMMMK.KKKK.....",
            "KMMMK...........",
            "KKKK............",
            "................",
            "................"
        ]
    },
    water_sword: {
        bg: null,
        art: [
            "...........KKKK.",
            "..........KCCWWK",
            ".........KCCWWCK",
            "........KCCWWCCK",
            ".......KCCWWCCK.",
            "......KCCWWCCK..",
            "..KKKKCCWWCCK...",
            ".KYYYYCWWCCK....",
            "..KKKKCCCCK.....",
            "...KbbKKKK......",
            "..KbbbKYYYY.....",
            ".KbbbK.KKKK.....",
            "KbbbK...........",
            "KKKK............",
            "................",
            "................"
        ]
    },
    nature_sword: {
        bg: null,
        art: [
            "...........KKKK.",
            "..........KLLWWK",
            ".........KLLWWLK",
            "........KLLWWLLK",
            ".......KLLWWLLK.",
            "......KLLWWLLK..",
            "..KKKKLLWWLLK...",
            ".KYYYYLWWLLK....",
            "..KKKKLLLLK.....",
            "...KMMKKKK......",
            "..KMMMKYYYY.....",
            ".KMMMK.KKKK.....",
            "KMMMK...........",
            "KKKK............",
            "................",
            "................"
        ]
    },
    shield: {
        bg: null,
        art: [
            "..KKKKKKKKKKKK..",
            ".KGGGGGGGGGGGGK.",
            "KGGBBBBBBBBBBGGK",
            "KGBBYYYYYYYYBBGK",
            "KGBBYBBBBBBYBBGK",
            "KGBBYBBBBBBYBBGK",
            "KGBBYYYYYYYYBBGK",
            ".KGBBBBBBBBBBGK.",
            ".KGBBBBBBBBBBGK.",
            "..KGBBBBBBBBGK..",
            "...KGBBBBBBGK...",
            "....KGGGGGGK....",
            ".....KKKKKK.....",
            "................",
            "................",
            "................"
        ]
    },
    pickaxe: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "..KKGGGGGGGGKK..",
            ".KGGWWWWWWWWGGK.",
            "KGGKKKMMMMKKKGGK",
            "KGK...KMMK...KGK",
            "KK....KMMK....KK",
            "......KMMK......",
            "......KMMK......",
            "......KMMK......",
            "......KMMK......",
            "......KMMK......",
            "......KMMK......",
            "......KMMK......",
            "......KKKK......",
            "................",
            "................"
        ]
    },
    potion: {
        bg: null,
        art: [
            "......KKKK......",
            ".....KOOOO......",
            ".....KKKKKK.....",
            "......KWWK......",
            ".....KWWWWK.....",
            "...KKWWWWWWKK...",
            "..KWWWRRRRWWWK..",
            ".KWWWRRRRRRWWWK.",
            ".KWRRRRRRRRRRWK.",
            ".KWRRRWWWRRRRWK.",
            ".KWRRRRRRRRRRWK.",
            "..KWRRRRRRRRWK..",
            "...KKKKKKKKKK...",
            "................",
            "................",
            "................"
        ]
    },
    bomb: {
        bg: null,
        art: [
            ".........KKY....",
            "........KOOYY...",
            ".......KMMK.....",
            ".....KKKKKKK....",
            "...KKDDDDDDDKK..",
            "..KDDWWDDDDDDDK.",
            ".KDDWDDDDDDDDDDK",
            ".KDDDDDDDDDDDDDK",
            ".KDDDDDDDDDDDDDK",
            ".KDDDDDDDDDDDDDK",
            "..KDDDDDDDDDDDK.",
            "...KKDDDDDDDKK..",
            ".....KKKKKKK....",
            "................",
            "................",
            "................"
        ]
    },
    gem: {
        bg: null,
        art: [
            ".....KKKKKK.....",
            "...KKCCCCCCKK...",
            "..KCCWWWWWWCCK..",
            ".KCCWCCCCCCWCCK.",
            "KCCWCCCCCCCCWCCK",
            "KCCCCCCCCCCCCCCK",
            ".KCCCCcCCcCCCCK.",
            "..KCCCccccCCCK..",
            "...KCCccccCCK...",
            "....KCccccCK....",
            ".....KccccK.....",
            "......KKKK......",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    wood_log: {
        bg: null,
        art: [
            "................",
            "................",
            "................",
            "..KKKKKKKKKKKK..",
            ".KMMMMMMMMMMMMK.",
            "KMMSSMMMMOOOOOMK",
            "KMSSSSMMOOOOOOOK",
            "KMMSSMMMMMMMMMMK",
            "KmmmmmmmmmmmmmmK",
            ".KKKKKKKKKKKKKK.",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    heart: {
        bg: null,
        art: [
            "................",
            "..KKKK....KKKK..",
            ".KRRRRK..KRRRRK.",
            "KRRWWWRKKRRRRRRK",
            "KRRWWWRRRRRRRRRK",
            "KRRRRRRRRRRRRRRK",
            "KRRRRRRRRRRRRRRK",
            ".KRRRRRRRRRRRRK.",
            "..KRRRRRRRRRRK..",
            "...KRRRRRRRRK...",
            "....KRRRRRRK....",
            ".....KRRRRK.....",
            "......KKKK......",
            "................",
            "................",
            "................"
        ]
    },
    magnifier: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "..KKGGGGGGGGKK..",
            ".KGGCCCCCCCCGGK.",
            "KGGCCWWCCCCCCGGK",
            "KGGCWWCCCCCCCGGK",
            "KGGCCCCCCCCCCGGK",
            ".KGGCCCCCCCCGGK.",
            "..KKGGGGGGGGKK..",
            "....KKKKKKKKMMK.",
            "...........KMMMK",
            "............KMMK",
            ".............KK.",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    bag: {
        bg: null,
        art: [
            ".....KKKKKK.....",
            "....KOOOOOOK....",
            "...KOOYYYYOOK...",
            "..KKKKKKKKKKKK..",
            ".KOOOOOOOOOOOOK.",
            "KOOOOOOOOOOOOOOK",
            "KOOOOOKYYKOOOOOK",
            "KOOOOOKYYKOOOOOK",
            "KoooooKKKKoooooK",
            "KooooooooooooooK",
            "KooooooooooooooK",
            ".KKKKKKKKKKKKKK.",
            "................",
            "................",
            "................",
            "................"
        ]
    }
};

export const Base64Strings = {};
export const sprites = {};

for (const key in MATRICES) {
    const dataUrl = compileMatrixToSVG(MATRICES[key].art, MATRICES[key].bg);
    Base64Strings[key] = dataUrl;
    const img = new Image();
    img.src = dataUrl;
    sprites[key] = img;
}

export function getPixelIconHtml(spriteKey, size = 20) {
    const src = Base64Strings[spriteKey] || Base64Strings.gem;
    return `<img src="${src}" class="px-icon" style="width:${size}px;height:${size}px;" alt="" />`;
}

// 🌟 請直接加在 src/data/assets.js 最底部：
const EXTRA_MATRICES = {
    // 頂部 HUD 專屬 16x16 純像素圖示
    coin: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "..KKYYYYYYYYKK..",
            ".KYYWWWWYYYYYYK.",
            "KYYWYYYYOOYYYYYK",
            "KYYWYYYOOOOYYYYK",
            "KYYYYYYOOOOYYYYK",
            "KYYYYYYOOOOYYYYK",
            "KYYYYYYOOOOYYYYK",
            "KYYYYYYOOOOYYYYK",
            "KYYYYYYYOOYYYYYK",
            ".KYYYYYYYYYYYYK.",
            "..KKOOOOOOOOOO..",
            "....KKKKKKKK....",
            "................",
            "................",
            "................"
        ]
    },
    scroll_icon: {
        bg: null,
        art: [
            "..KKKKKKKKKKKK..",
            ".KYYYYYYYYYYYYK.",
            ".KSSSSSSSSSSSSK.",
            "..KSKKKKKKKKSK..",
            "..KSSSSSSSSSSK..",
            "..KSKKKKKKSSSK..",
            "..KSSSSSSSSSSK..",
            "..KSKKKKKKKKSK..",
            "..KSSSSSSSSSSK..",
            "..KSKKKKSSSSSK..",
            "..KssssssssssK..",
            ".KYYYYYYYYYYYYK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................"
        ]
    },
    shop_icon: {
        bg: null,
        art: [
            ".......KK.......",
            "......KYYK......",
            "..KKKKKKKKKKKK..",
            ".KYYYYYYYYYYYYK.",
            "..K..KYYYYK..K..",
            ".K.K..KYYK..K.K.",
            "K...K.KYYK.K...K",
            "KKKKK.KYYK.KKKKK",
            ".KYYK.KYYK.KYYK.",
            "..KK..KYYK..KK..",
            ".....KYYYYK.....",
            "...KKOOOOOOKK...",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................"
        ]
    },
    music_icon: {
        bg: null,
        art: [
            "......KKKKKKKKKK",
            ".....KCCCCCCCCCK",
            ".....KCCKKKKKCCK",
            ".....KCCK....KCK",
            ".....KCCK....KCK",
            ".....KCCK....KCK",
            ".....KCCK....KCK",
            "..KKKKCCK..KKKKK",
            ".KCCCCCCK.KCCCCK",
            ".KCCWWCCK.KCWWCK",
            ".KCCCCCCK.KCCCCK",
            "..KKKKKK...KKKK.",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    fs_icon: {
        bg: null,
        art: [
            "KKKKKK....KKKKKK",
            "KWWWWK....KWWWWK",
            "KWWKK......KKWWK",
            "KWK..........KWK",
            "KK............KK",
            "................",
            "................",
            "................",
            "................",
            "KK............KK",
            "KWK..........KWK",
            "KWWKK......KKWWK",
            "KWWWWK....KWWWWK",
            "KKKKKK....KKKKKK",
            "................",
            "................"
        ]
    },
    sun_icon: {
        bg: null,
        art: [
            ".......KK.......",
            "..K....YY....K..",
            "...K.KKKKKK.K...",
            "....KYYYYYYK....",
            "..KKYYWWWWYYKK..",
            ".KYYYYWYYYYYYYK.",
            "KYYYYYYYYYYYYYYK",
            ".KYYYYYYYYYYYYK.",
            "..KKYYYYYYYYKK..",
            "....KOOOOOOK....",
            "...K.KKKKKK.K...",
            "..K....YY....K..",
            ".......KK.......",
            "................",
            "................",
            "................"
        ]
    },
    lock_icon: {
        bg: null,
        art: [
            ".....KKKKKK.....",
            "...KKGGGGGGKK...",
            "..KGGKKKKKKGGK..",
            "..KGK......KGK..",
            "..KGK......KGK..",
            ".KKKKKKKKKKKKKK.",
            ".KYYYYYYYYYYYYK.",
            ".KYYYYKKKKYYYYK.",
            ".KYYYKWWWWKYYYK.",
            ".KYYYYKWWKYYYYK.",
            ".KYYYYKWWKYYYYK.",
            ".KooooooooooooK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................"
        ]
    },
    // 全新多樣化地圖採集點像素圖
    birch_tree: {
        bg: '#59962b',
        art: [
            ".....KKKKKK.....",
            "...KKLLLLLLKK...",
            "..KLLYYYYLLLLK..",
            ".KLLLLLLLLLLLLK.",
            "KLLLLLLLLllllllK",
            "KLLLLllllllldddK",
            ".KLLllllllddddK.",
            "..KKllllllllKK..",
            "....KKKKKKKK....",
            ".....KWWWWK.....",
            ".....KWKKWK.....",
            "....KWWWWWKK....",
            "....KKKKKKKK....",
            "................",
            "................",
            "................"
        ]
    },
    pine_tree: {
        bg: '#59962b',
        art: [
            ".......KK.......",
            "......KllK......",
            ".....KllllK.....",
            "....KllllllK....",
            "...KlllKKKKlK...",
            "....KllllllK....",
            "...KllllldddK...",
            "..KllllldddddK..",
            ".KllllddddddddK.",
            "..KKKKKKKKKKKK..",
            "......KMMK......",
            ".....KMMMMK.....",
            ".....KKKKKK.....",
            "................",
            "................",
            "................"
        ]
    },
    crimson_tree: {
        bg: '#59962b',
        art: [
            ".....KKKKKK.....",
            "...KKRRRRRRKK...",
            "..KRRYYRRRRRRK..",
            ".KRRRRRRRRrrrrK.",
            "KRRRRRRRrrrrrrrK",
            "KRRRRrrrrrrrrrrK",
            ".KRRrrrrrrrrrrK.",
            "..KKrrrrrrrrKK..",
            "....KKKKKKKK....",
            ".....KmmmmK.....",
            "....KmmmmmmK....",
            "....KKKKKKKK....",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    ruby_vein: {
        bg: '#59962b',
        art: [
            "......KKKK......",
            "....KKRRRRKK....",
            "...KRRWWWRRRK...",
            "..KDDDRRRRRDDK..",
            ".KDDDRRRRRRRDDK.",
            "KDDDRRWWWRRRDDDK",
            "KDDDDDRRRRRDDDDK",
            ".KDDDDDDDDDDDDK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    amethyst_vein: {
        bg: '#59962b',
        art: [
            "......KKKK......",
            "....KKPPPPKK....",
            "...KPPWWWPPPK...",
            "..KDDDPPPPPDDK..",
            ".KDDDPPPPPPPDDK.",
            "KDDDPPWWWPPPDDDK",
            "KDDDDDPPPPPDDDDK",
            ".KDDDDDDDDDDDDK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    emerald_vein: {
        bg: '#59962b',
        art: [
            "......KKKK......",
            "....KKLLLLKK....",
            "...KLLWWWLLLK...",
            "..KDDDLLLLLDDK..",
            ".KDDDLLLLLLLDDK.",
            "KDDDLLWWWLLLDDDK",
            "KDDDDDLLLLLDDDDK",
            ".KDDDDDDDDDDDDK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    herb_bush: {
        bg: null,
        art: [
            "................",
            "...KK......KK...",
            "..KLLK....KLLK..",
            ".KLLLLK..KLLLLK.",
            ".KLLWLKKKKLLWLK.",
            "..KLLLLLLLLLLK..",
            "..KllllllllllK..",
            "...KddddddddK...",
            "....KKKKKKKK....",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    gold_flower: {
        bg: null,
        art: [
            ".....KKKKKK.....",
            "...KKYYYYYYKK...",
            "..KYYOOOOOOYYK..",
            "..KYOOYYYYOOYK..",
            "...KYYOOOOYYK...",
            "....KKYYYYKK....",
            "..KK..KKKK..KK..",
            ".KLLK..KLK.KLLK.",
            "..KLLKKKLKKLLK..",
            "...KKKKKKKKKK...",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    blue_mushroom: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "..KKCCCCCCCCKK..",
            ".KCCWWWCCCCWWWC.",
            "KCCWWWCCCCCCWWWK",
            "KCCCCCCCCCCCCCCK",
            ".KKKKKKKKKKKKKK.",
            "....KWWWWWWK....",
            "....KGGGGGGK....",
            ".....KKKKKK.....",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    }
};

for (const key in EXTRA_MATRICES) {
    const dataUrl = compileMatrixToSVG(EXTRA_MATRICES[key].art, EXTRA_MATRICES[key].bg);
    Base64Strings[key] = dataUrl;
    const img = new Image();
    img.src = dataUrl;
    sprites[key] = img;
}

// 🌟 修正後：直接對應已定義好的 Base64Strings 與 compileMatrixToSVG
const PLAYER_DIRECTION_MATRICES = {
    player_down: MATRICES.player,
    player_up: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "...KBBBBBBBBK...",
            "..KBBBBBBBBBBK..",
            "..KbbbbbbbbbbK..",
            "..KRRRRRRRRRRK..",
            "..KRRRRRRRRRRK..",
            ".KRRRRRRRRRRRRK.",
            ".KRRRRRRRRRRRRK.",
            ".KRRRRRRRRRRRRK.",
            "..KRRRRRRRRRRK..",
            "..KrrrrrrrrrrK..",
            "...KDDDDDDDDK...",
            "...KDDK..KDDK...",
            "...KMMK..KMMK...",
            "...KKKK..KKKK...",
            "................"
        ]
    },
    player_left: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "...KBBBBBBBBK...",
            "..KBBYYYYBBBBK..",
            "..KWWSSSSBBBBK..",
            "..KKWSSSSBBBBK..",
            "...KSSSSSBBBBK..",
            "...KBBBBBBBBK...",
            "..KKBBBBBBBKK...",
            ".KGGKBBBBBRRRK..",
            "KGGGKBBBBBRRRK..",
            ".KKKKBBBBBRRRK..",
            "....KDDDDDRRRK..",
            "....KDDK.KDDK...",
            "....KMMK.KMMK...",
            "....KKKK.KKKK...",
            "................"
        ]
    },
    player_right: {
        bg: null,
        art: [
            "....KKKKKKKK....",
            "...KBBBBBBBBK...",
            "..KBBBBYYYYBBK..",
            "..KBBBBSSSSWWK..",
            "..KBBBBSSSSWKK..",
            "..KBBBBSSSSSK...",
            "...KBBBBBBBBK...",
            "...KKBBBBBBBKK..",
            "..KRRRBBBBBKGK..",
            "..KRRRBBBBBKGGGK",
            "..KRRRBBBBBKKKK.",
            "..KRRRDDDDDK....",
            "...KDDK.KDDK....",
            "...KMMK.KMMK....",
            "...KKKK.KKKK....",
            "................"
        ]
    }
};

for (const dirKey in PLAYER_DIRECTION_MATRICES) {
    const mat = PLAYER_DIRECTION_MATRICES[dirKey];
    if (mat && mat.art) {
        const url = compileMatrixToSVG(mat.art, mat.bg);
        Base64Strings[dirKey] = url;
        const img = new Image();
        img.src = url;
        sprites[dirKey] = img;
    }
}

// 🌟 2. 為 300 款素材動態生成專屬不重複的 16x16 像素 SVG 圖示 (依名稱特徵與階級色盤繪製)
const TIER_PALETTES = [
    { main: '#a16207', light: '#fde047', dark: '#451a03' }, // 棕木/青銅色
    { main: '#0284c7', light: '#bae6fd', dark: '#0c4a6e' }, // 寒鐵/秘銀藍
    { main: '#dc2626', light: '#fca5a5', dark: '#7f1d1d' }, // 烈焰/深紅
    { main: '#9333ea', light: '#e9d5ff', dark: '#4c1d95' }, // 星辰/史詩紫
    { main: '#eab308', light: '#fef08a', dark: '#713f12' }, // 創世/傳說金
    { main: '#16a34a', light: '#bbf7d0', dark: '#14532d' }, // 翡翠/森林綠
    { main: '#0d9488', light: '#99f6e4', dark: '#134e4a' }, // 潮汐/深海青
    { main: '#db2777', light: '#fbcfe8', dark: '#831843' }, // 妖精/玫瑰粉
    { main: '#475569', light: '#e2e8f0', dark: '#0f172a' }, // 黑曜/暗影灰
    { main: '#ea580c', light: '#fed7aa', dark: '#7c2d12' }  // 熔岩/琥珀橙
];

const SHAPE_TEMPLATES = {
    log: [
        "................","....KKKKKKKK....","..KKMMMMMMMMKK..",".KMMLMMMMMMLLMK.",".KMMMMMMMMMMMMK.",".KMMddddddddddK.",".KddddddddddddK.","..KKKKKKKKKKKK..","................","................","................","................","................","................","................","................"
    ],
    branch: [
        "............KK..","...........KMMK.","..KK......KMMK..",".KMMK....KMMK...","..KMMK..KMMK....","...KMMKKMMK.....","....KMMMMK......","...KMMddMMK.....","..KMMK..KddK....",".KddK....KKKK...","KKKK............","................","................","................","................","................"
    ],
    vine: [
        "....KKKK........","..KKMMMMKK......",".KMMLLLLMMK.....","KMMK....KMMK....","KMMK....KMMK....",".KMMKKKKMMK.....","..KKMMMMKK..KK..","....KMMK...KLLK.","....KMMK..KLLK..",".....KMMKKMMK...","......KKKKKK....","................","................","................","................","................"
    ],
    fiber: [
        ".....KKKKKK.....","...KKLLLLLLKK...","..KLLLLLLLLLLK..",".KLLLLMMMMMMMMK.",".KLLLMMMMMMMMMK.",".KLLMMMMMMMMddK.","..KMMMMMMMMddK..","...KKddddddKK...",".....KKKKKK.....","................","................","................","................","................","................","................"
    ],
    bamboo: [
        ".....KKKK.......",".....KLMK.......","....KKKKKK......",".....KLMK.......",".....KLMK..KKKK.","....KKKKKK.KLMK.",".....KLMK.KKKKKK",".....KLMK..KLMK.","....KKKKKK.KLMK.",".....KddK.KKKKKK",".....KddK..KddK.",".....KKKK..KKKK.","................","................","................","................"
    ],
    resin: [
        ".......KK.......","......KLLK......",".....KLLLLK.....","....KLLMMMMK....","...KLLMMMMMMK...","..KLLMMMMMMMMK..","..KMMMMMMMMddK..","..KMMMMMMMdddK..","...KddddddddK...","....KKKKKKKK....","................","................","................","................","................","................"
    ],
    ore: [
        ".....KKKKKK.....","...KKddddddKK...","..KddMMLLMMddK..",".KddMLLLLLLdddk.",".KdMMLLMMMMdddk.",".KddMMMMddLLddK.","..KdddddddddddK.","...KKKKKKKKKKK..","................","................","................","................","................","................","................","................"
    ],
    crystal: [
        ".......KK.......","......KLLK......",".....KLLLLK.....","..KK.KLLLLK.KK..",".KLLKKMMMMKKLLK.",".KLLLMMMMMMLLLK.","..KMMMMMMMMMMK..","...KddddddddK...","....KKKKKKKK....","................","................","................","................","................","................"
    ],
    gem: [
        "....KKKKKKKK....","..KKLLLLLLLLKK..",".KLLWWWWLLLLLLK.",".KLLWMMMMMMMMMK.","..KMMMMMMMMMMK..","...KMMMMMMMMK...","....KddddddK....",".....KKKKKK.....","................","................","................","................","................","................","................","................"
    ],
    dust: [
        ".......KK.......","..KK..KLLK..KK..",".KLLK..KK..KLLK.","..KK..KKKK..KK..","....KKMMMMKK....","...KMMLLLLMMK...","..KMMMMMMMMMMK..","..KddddddddddK..","...KKKKKKKKKK...","................","................","................","................","................","................"
    ],
    pelt: [
        "..KKKK....KKKK..",".KMMMMKKKKMMMMK.",".KMMMMMMMMMMMMK.","..KMMLLLLLLMMK..","..KMMLLLLLLMMK..","..KMMMMMMMMMMK..","...KMMMMMMMMK...","..KMMddddddMMK..",".KddK......KddK.",".KKKK......KKKK.","................","................","................","................"
    ],
    fang: [
        "......KKKK......","....KKLLLLKK....","...KLLLLLLLLK...","..KLLLMMMMMMK...","..KLLMMMMMMK....","...KMMMMMMK.....","....KMMMMK......",".....KddK.......","......KK........","................","................","................","................","................","................","................"
    ],
    wing: [
        "....KKKK........","..KKMMMMKK......",".KMMLLLLMMKK....","KMMLLLLLLLLMK...","KMMMMKKKKMMddK..","KMMMK....KddddK.",".KMK......KKKK..","..K.............","................","................","................","................","................","................","................","................"
    ],
    vial: [
        ".....KKKKKK.....","......KddK......","......KddK......","....KKKKKKKK....","...KWWWWWWWWK...","..KWLLLLLLLLWK..","..KWMMMMMMMMWK..","..KWMMMMMMMMWK..","...KddddddddK...","....KKKKKKKK....","................","................","................","................","................","................"
    ],
    herb: [
        " ..KK......KK...",".KLLK....KLLK..","KLLLLK..KLLLLK.","KLLMLKKKKLMLLK.",".KLLLLLLLLLLK..","..KMMMMMMMMK...","...KddddddK....","....KKKKKK.....","......KK.......","................","................","................","................","................","................","................"
    ],
    flower: [
        "....KKKKKKKK....","..KKLLLLLLLLKK..",".KLLMMMMMMMMLLK.",".KLLMMYYYYMMLLK.","..KLLMMMMMMLLK..","....KKKKKKKK....","......KddK......","...KKKKddKKKK...","..KddddddddddK..","....KKKKKKKK....","................","................","................","................","................","................"
    ],
    fruit: [
        ".......KK.......","......KddK......","....KKKKKKKK....","..KKLLLLLLLLKK..",".KLLWWMMMMMMMdd.",".KLLMMMMMMMMddd.",".KMMMMMMMMddddK.","..KddddddddddK..","....KKKKKKKK....","................","................","................","................","................","................","................"
    ],
    gear: [
        "....KK....KK....","..KKMMKKKKMMKK..",".KMMLLLLLLLLMMK.","..KLLKKKKKKLLK..",".KMLK......KLMK.",".KMLK......KLMK.","..KLLKKKKKKLLK..",".KMMddddddddMMK.","..KKddKKKKddKK..","....KK....KK....","................","................","................","................","................","................"
    ],
    coin_item: [
        "....KKKKKKKK....","..KKLLLLLLLLKK..",".KLLWWMMMMMMLLK.",".KLLWMMKKKKMMLK.",".KLLMMMKKKKMMLK.",".KLLMMMMMMMMLLK.","..KKdddddddddd..","....KKKKKKKK....","................","................","................","................","................","................","................","................"
    ],
    book: [
        "...KKKKKKKKKK...","..KMMMMMMMMMMK..",".KMMLLLLLLLLMMK.",".KMMLLKKKKLLMMK.",".KMMLLLLLLLLMMK.",".KMMLLKKKKLLMMK.",".KMMMMMMMMMMMMK.",".KMMWWWWWWWWWWK.","..KKKKKKKKKKKK..","................","................","................","................","................","................","................"
    ],
    crown: [
        ".KK....KK....KK.","KLLK..KLLK..KLLK","KLLLKKLLLLKKLLLK","KMMMMMMMMMMMMMMK","KMMRRMMMMYYMMMMK","KddddddddddddddK",".KKKKKKKKKKKKKK.","................","................","................","................","................","................","................","................","................"
    ]
};

export function generateDistinctMaterialSvg(numId, name, category, tier) {
    const palIdx = (numId * 3 + tier * 2) % TIER_PALETTES.length;
    const pal = TIER_PALETTES[palIdx];

    let shapeKey = 'ore';
    if (category === 'wood_plant') {
        if (/樹枝|枝/.test(name)) shapeKey = 'branch';
        else if (/藤/.test(name)) shapeKey = 'vine';
        else if (/纖維|棉/.test(name)) shapeKey = 'fiber';
        else if (/竹/.test(name)) shapeKey = 'bamboo';
        else if (/脂|液|漿|露|琥珀/.test(name)) shapeKey = 'resin';
        else shapeKey = 'log';
    } else if (category === 'ore_mineral') {
        if (/砂|粉|泥/.test(name)) shapeKey = 'dust';
        else if (/晶|鑽|玉/.test(name)) shapeKey = 'crystal';
        else shapeKey = 'ore';
    } else if (category === 'gem_element') {
        if (/塵/.test(name)) shapeKey = 'dust';
        else if (/核|晶|鏡/.test(name)) shapeKey = 'crystal';
        else shapeKey = 'gem';
    } else if (category === 'monster_drop') {
        if (/牙|爪|角|刺|骨|脊椎/.test(name)) shapeKey = 'fang';
        else if (/羽|翅|翼/.test(name)) shapeKey = 'wing';
        else if (/液|血|膠|粉|心|眼/.test(name)) shapeKey = 'vial';
        else shapeKey = 'pelt';
    } else if (category === 'herb_alchemy') {
        if (/花|蓮|玫瑰/.test(name)) shapeKey = 'flower';
        else if (/果|莓|椒|桃|蘋|種|麥/.test(name)) shapeKey = 'fruit';
        else if (/水|露|泉/.test(name)) shapeKey = 'vial';
        else shapeKey = 'herb';
    } else if (category === 'relic_boss') {
        if (/幣/.test(name)) shapeKey = 'coin_item';
        else if (/書|紙|卷|記|碑|板/.test(name)) shapeKey = 'book';
        else if (/冠|戒|環|章|杯/.test(name)) shapeKey = 'crown';
        else shapeKey = 'gear';
    }

    const template = SHAPE_TEMPLATES[shapeKey] || SHAPE_TEMPLATES.ore;
    let svgRects = '';
    const customColors = {
        K: '#141013',
        W: '#ffffff',
        Y: '#facc15',
        R: '#ef4444',
        M: pal.main,
        L: pal.light,
        d: pal.dark
    };

    for (let r = 0; r < 16; r++) {
        const rowStr = (template[r] || '').trim();
        for (let c = 0; c < 16; c++) {
            const ch = rowStr[c];
            if (ch && ch !== '.' && customColors[ch]) {
                svgRects += `<rect x="${c}" y="${r}" width="1" height="1" fill="${customColors[ch]}"/>`;
            }
        }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">${svgRects}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 🌟 請加在 src/data/assets.js 最底部 (Survival RPG 帆船、動態行動圖示與食物道具)：
const SRPG_EXTRA_SPRITES = {
    boat: {
        bg: null,
        art: [
            ".......KK.......",
            "......KWWK......",
            ".....KWWWWK.....",
            "....KWWWWWWK....",
            "...KWWWWWWWWK...",
            "..KWWWWWWWWWWK..",
            "..KKKKKKKKKKKK..",
            "......KMMK......",
            ".KKKKKKKKKKKKKK.",
            "KMMMMMMMMMMMMMMK",
            "KMMOOOOOOOOOOMMK",
            ".KmmmmmmmmmmmmK.",
            "..KKKKKKKKKKKK..",
            "................",
            "................",
            "................"
        ]
    },
    hand_icon: {
        bg: null,
        art: [
            "....KK.KK.KK....",
            "...KSKKSKKSKK...",
            "...KSKKSKKSKKSK.",
            ".KKKSKKSKKSKKSK.",
            "KSKSSSSSSSSSSSK.",
            "KSSSSSSSSSSSSSK.",
            ".KSSSSSSSSSSSSK.",
            ".KSSSSSSSSSSSK..",
            "..KsssssssssK...",
            "...KsssssssK....",
            "....KKKKKKK.....",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    rod_icon: {
        bg: null,
        art: [
            "...........KKKK.",
            "..........KMMK.K",
            ".........KMMK..K",
            "........KMMK...K",
            ".......KMMK....K",
            "......KMMK.....K",
            ".....KMMK.....K.",
            "....KMMK......K.",
            "...KMMK......K..",
            "..KMMK......K...",
            ".KMMK......KRRK.",
            "KMMK.......KWWK.",
            "KKK.........KK..",
            "................",
            "................",
            "................"
        ]
    },
    axe_icon: {
        bg: null,
        art: [
            "......KKKKKK....",
            "....KKGGGGGGK...",
            "...KGGWWWWGGGK..",
            "...KGGGGGGGGGK..",
            "....KKGGGKKKK...",
            "......KMMK......",
            ".....KMMK.......",
            "....KMMK........",
            "...KMMK.........",
            "..KMMK..........",
            ".KMMK...........",
            "KKKK............",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    shovel_icon: {
        bg: null,
        art: [
            "..........KKKK..",
            ".........KGGGGK.",
            "........KGGWWGGK",
            "........KGGGGGGK",
            "........KGGGGK..",
            ".......KMMKKK...",
            "......KMMK......",
            ".....KMMK.......",
            "....KMMK........",
            "...KMMK.........",
            "..KKKK..........",
            ".KMMK...........",
            "..KK............",
            "................",
            "................",
            "................"
        ]
    },
    campfire_icon: {
        bg: null,
        art: [
            ".......KK.......",
            "......KORK......",
            ".....KORROK.....",
            "....KORYYROK....",
            "...KORYYYYYOK...",
            "...KORYWWWYOK...",
            "....KYYYYYYK....",
            "..KKKMMMMMMKKK..",
            ".KMMMMMMMMMMMMK.",
            "..KKKKmmmmKKKK..",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    bread_icon: {
        bg: null,
        art: [
            "................",
            "....KKKKKKKK....",
            "..KKOOOOOOOOOO..",
            ".KOOYYOOOOYYOOK.",
            "KOOOOOOOOOOOOOOK",
            "KOOSSSSSSSSSSOOK",
            "KmmmmmmmmmmmmmmK",
            ".KKKKKKKKKKKKKK.",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    fish_icon: {
        bg: null,
        art: [
            "................",
            ".....KKKKKK.....",
            "...KKCCCCCCKK...",
            "..KCCWWCCCCCCK..",
            ".KCCKWCCCCCCCCKK",
            "KCCCCCCCCCCCCCKK",
            ".KcccccccccccKK.",
            "...KKKKKKKKKK...",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    },
    bottle_icon: {
        bg: null,
        art: [
            ".....KKKKKK.....",
            "....KOOOOOOK....",
            ".....KMMMMK.....",
            "....KMMMMMMK....",
            "...KMMMMMMMMK...",
            "..KMMOOOOOOMMK..",
            "..KMMOOOOOOMMK..",
            "...KMMMMMMMMK...",
            "....KmmmmmmK....",
            "....KKKKKKKK....",
            "................",
            "................",
            "................",
            "................",
            "................",
            "................"
        ]
    }
};

for (const k in SRPG_EXTRA_SPRITES) {
    const url = compileMatrixToSVG(SRPG_EXTRA_SPRITES[k].art, SRPG_EXTRA_SPRITES[k].bg);
    Base64Strings[k] = url;
    const img = new Image();
    img.src = url;
    sprites[k] = img;
}
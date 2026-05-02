import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════
const T = {
  bg:"#070b12", surf:"#0d1420", card:"#121a2b", cardHi:"#182236",
  border:"#1c2b44", borderHi:"#28406a",
  acc:"#00e5a0", accDim:"#00e5a010", accGlow:"#00e5a028", accSoft:"#00e5a055",
  pro:"#38bdf8", carb:"#fb923c", cal:"#facc15",
  red:"#f87171", green:"#34d399", purple:"#a78bfa",
  hi:"#eef2ff", text:"#8ba3c0", muted:"#3d5270",
};

// ══════════════════════════════════════════════════════════════════
// ADMIN CONFIG — أكواد التفعيل والجيمات
// ══════════════════════════════════════════════════════════════════
const ADMIN_PASSWORD = "fittrack2025";

const DEFAULT_CODES = {
  "FIT-2025-AHMAD": { type:"individual", used:false, createdAt:"2025-01-01" },
  "FIT-2025-SARA":  { type:"individual", used:false, createdAt:"2025-01-01" },
  "GYM-IRON-2025":  { type:"gym", gymId:"iron-house", used:false, createdAt:"2025-01-01" },
  "GYM-FLEX-2025":  { type:"gym", gymId:"flex-gym",   used:false, createdAt:"2025-01-01" },
  "DEMO-CODE-001":  { type:"individual", used:false, createdAt:"2025-01-01" },
};

const DEFAULT_GYMS = {
  "iron-house": { name:"Iron House Gym", color:"#ef4444", logo:"🏋️", city:"بغداد", members:0 },
  "flex-gym":   { name:"Flex Gym",       color:"#3b82f6", logo:"💪", city:"البصرة", members:0 },
};

// ══════════════════════════════════════════════════════════════════
// FOOD DATABASE — عراقي + عالمي
// ══════════════════════════════════════════════════════════════════
// وحدات منزلية عراقية + عالمية
const UNITS = [
  // ── عالمية ──────────────────────────────────────────────────
  {id:"g",      label:"غرام",          short:"غ",       toG:1},
  {id:"tsp",    label:"م.صغيرة",       short:"م.ص",     toG:5},
  {id:"tbsp",   label:"م.كبيرة/ملعقة أكل", short:"م.ك",toG:15},
  {id:"cup",    label:"كوب",           short:"كوب",     toG:240},
  {id:"half",   label:"نصف كوب",       short:"½كوب",    toG:120},
  {id:"scoop",  label:"سكوب",          short:"سكوب",    toG:30},
  {id:"can",    label:"علبة",          short:"علبة",    toG:null},
  {id:"slice",  label:"شريحة",         short:"شريحة",   toG:null},
  // ── عراقية أصيلة ────────────────────────────────────────────
  {id:"piece",  label:"قطعة / حبة",    short:"حبة",     toG:null},
  {id:"skewer", label:"شيش",           short:"شيش",     toG:null}, // كباب، تكة، طاووق
  {id:"wrap",   label:"لفة / كص",      short:"لفة",     toG:null}, // كص دجاج/لحم
  {id:"mawon",  label:"ماعون",         short:"ماعون",   toG:null}, // وعاء عراقي متوسط
  {id:"plate",  label:"صحن",           short:"صحن",     toG:null},
  {id:"bowl",   label:"طبق / قصعة",    short:"طبق",     toG:null},
  {id:"raghif", label:"رغيف",          short:"رغيف",    toG:null}, // خبز تنور/صاج
  {id:"samona", label:"صمونة",         short:"صمونة",   toG:null}, // خبز صمون
  {id:"qurs",   label:"قرص",           short:"قرص",     toG:null}, // فلافل
  {id:"pack",   label:"عبوة / باكيت",  short:"عبوة",    toG:null},
];

const ALL_FOODS = [
  // ══════════════════════════════════════════════════════════════
  // بروتين عالمي
  // ══════════════════════════════════════════════════════════════
  {id:"p1", e:"🍗",g:"بروتين", n:"صدر دجاج مشوي",  a:["دجاج","chicken","فراخ","chicken breast"],   cal:165,pro:31,  crb:0,   u:["g","piece","plate"],           pG:150, plG:200, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"p2", e:"🥩",g:"بروتين", n:"لحم بقري مفروم",  a:["لحم مفروم","beef","برغر","مفروم"],          cal:254,pro:26,  crb:0,   u:["g","plate","tbsp"],            pG:null,plG:200, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"p3", e:"🥚",g:"بروتين", n:"بيضة مسلوقة",     a:["بيض","egg","مسلوق","بيضة"],                cal:72, pro:6.3, crb:0.5, u:["piece","g"],                    pG:55,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"p4", e:"🥚",g:"بروتين", n:"بيضة مقلية",      a:["بيض مقلي","fried egg","مقلي","عيون"],       cal:90, pro:6.3, crb:0.5, u:["piece","g"],                    pG:60,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"p5", e:"🐟",g:"بروتين", n:"سلمون مشوي",      a:["salmon","سمك سلمون","فيليه"],               cal:208,pro:28,  crb:0,   u:["g","piece","plate"],           pG:170, plG:200, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"p6", e:"🐠",g:"بروتين", n:"تونة معلبة",       a:["تونه","tuna","علبة تونة"],                  cal:116,pro:26,  crb:0,   u:["can","g","tbsp"],              pG:null,plG:null,bG:null, sG:null, cG:185,  skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"p7", e:"🍖",g:"بروتين", n:"ران دجاج مشوي",    a:["فخذ دجاج","ران","thigh","ران مشوي"],        cal:209,pro:26,  crb:0,   u:["piece","g","plate"],           pG:120, plG:300, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"p8", e:"🦐",g:"بروتين", n:"جمبري مشوي",       a:["روبيان","shrimp","قريدس"],                  cal:99, pro:24,  crb:0,   u:["g","plate","piece"],           pG:15,  plG:200, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  // ── مكملات ──────────────────────────────────────────────────
  {id:"s1", e:"💪",g:"بروتين", n:"واي بروتين",       a:["whey","واي","protein powder","سكوب"],       cal:120,pro:25,  crb:2,   u:["scoop","g"],                    pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"s2", e:"💊",g:"بروتين", n:"أيزو بروتين",      a:["iso","أيزو","isolate","zero carb"],          cal:108,pro:27,  crb:0,   u:["scoop","g"],                    pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"s3", e:"🍫",g:"بروتين", n:"بروتين بار",       a:["protein bar","بروتين بار","بار"],            cal:200,pro:20,  crb:25,  u:["piece","g"],                    pG:60,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ══════════════════════════════════════════════════════════════
  // ألبان
  // ══════════════════════════════════════════════════════════════
  {id:"d1", e:"🥛",g:"ألبان",  n:"حليب كامل الدسم",  a:["milk","لبن","حليب","حليب بقر"],             cal:61, pro:3.2, crb:4.8, u:["cup","half","g"],              pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"d2", e:"🥣",g:"ألبان",  n:"زبادي يوناني",     a:["يوغرت","yogurt","زبادي","لبن يوناني"],       cal:59, pro:10,  crb:3.6, u:["cup","half","g","bowl"],        pG:null,plG:null,bG:200,  sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"d3", e:"🧀",g:"ألبان",  n:"جبن شيدر",         a:["جبنة","cheese","شيدر"],                      cal:402,pro:25,  crb:1.3, u:["slice","g"],                    pG:null,plG:null,bG:null, sG:28,  cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"d4", e:"🧀",g:"ألبان",  n:"جبن قريش",         a:["cottage","جبن ابيض","cottage cheese"],       cal:98, pro:11,  crb:3.4, u:["cup","half","g","bowl"],        pG:null,plG:null,bG:200,  sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ══════════════════════════════════════════════════════════════
  // نشويات
  // ══════════════════════════════════════════════════════════════
  {id:"c1", e:"🍚",g:"نشويات", n:"أرز مطبوخ / تمن",  a:["رز","rice","ارز","تمن","تمن ابيض"],         cal:130,pro:2.7, crb:28,  u:["cup","half","plate","mawon","g"],pG:null,plG:300,bG:200,  sG:null, cG:null, skG:null,wrG:null,mwG:250,rgG:null,smG:null,qrG:null},
  {id:"c2", e:"🍞",g:"نشويات", n:"خبز صمون",         a:["صمون","samoon","صمونة","خبز صمون"],          cal:270,pro:9,   crb:52,  u:["samona","piece","g"],           pG:90,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:90, qrG:null},
  {id:"c3", e:"🫓",g:"نشويات", n:"خبز تنور عراقي",   a:["تنور","خبز تنور","رغيف تنور","طابگ"],        cal:265,pro:8,   crb:54,  u:["raghif","half","g"],            pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:120,smG:null,qrG:null},
  {id:"c4", e:"🫓",g:"نشويات", n:"خبز صاج",          a:["صاج","saj","خبز رقيق","صاج رقيق"],           cal:295,pro:8,   crb:58,  u:["raghif","piece","g"],           pG:60,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:60, smG:null,qrG:null},
  {id:"c5", e:"🌾",g:"نشويات", n:"شوفان",            a:["oats","اوتس","oatmeal","شوفان"],             cal:389,pro:17,  crb:66,  u:["cup","half","g","tbsp"],        pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"c6", e:"🥔",g:"نشويات", n:"بطاطس مسلوقة",     a:["بطاطا","potato","بطاطه","بطاطس"],            cal:87, pro:1.9, crb:20,  u:["piece","g","plate","cup"],      pG:150, plG:250, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"c7", e:"🍝",g:"نشويات", n:"مكرونة مطبوخة",    a:["pasta","باستا","معكرونة","سباغيتي"],         cal:131,pro:5,   crb:25,  u:["cup","plate","mawon","g"],      pG:null,plG:280,bG:200,  sG:null, cG:null, skG:null,wrG:null,mwG:220,rgG:null,smG:null,qrG:null},

  // ══════════════════════════════════════════════════════════════
  // خضروات
  // ══════════════════════════════════════════════════════════════
  {id:"v1", e:"🥦",g:"خضروات", n:"بروكلي",           a:["broccoli","بروكلي"],                         cal:35, pro:2.4, crb:7,   u:["cup","g","plate","piece"],      pG:150, plG:150, bG:180,  sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"v2", e:"🍅",g:"خضروات", n:"طماطم",            a:["tomato","بندورة","طماطه"],                    cal:18, pro:0.9, crb:3.9, u:["piece","cup","g"],              pG:123, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"v3", e:"🥒",g:"خضروات", n:"خيار",             a:["cucumber","خيارة","خيار"],                   cal:15, pro:0.7, crb:3.6, u:["piece","cup","g"],              pG:200, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"v4", e:"🥗",g:"خضروات", n:"سلطة خضراء",       a:["salad","سلطه","خس","سلطة"],                  cal:15, pro:1.3, crb:2.9, u:["plate","bowl","cup","g"],       pG:null,plG:200, bG:150,  sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"v5", e:"🥕",g:"خضروات", n:"جزر",              a:["carrot","جزره","جزر"],                       cal:41, pro:0.9, crb:10,  u:["piece","cup","g"],              pG:61,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ══════════════════════════════════════════════════════════════
  // فواكه
  // ══════════════════════════════════════════════════════════════
  {id:"f1", e:"🍌",g:"فواكه",  n:"موز",              a:["banana","موزة","بنانا"],                     cal:89, pro:1.1, crb:23,  u:["piece","g"],                    pG:120, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"f2", e:"🍎",g:"فواكه",  n:"تفاح",             a:["apple","تفاحة","تفاحه"],                     cal:52, pro:0.3, crb:14,  u:["piece","g"],                    pG:182, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"f3", e:"🥭",g:"فواكه",  n:"مانجو",            a:["mango","مانغو","انبة","عنبة"],               cal:60, pro:0.8, crb:15,  u:["piece","cup","g"],              pG:200, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"f4", e:"🍊",g:"فواكه",  n:"برتقال",           a:["orange","برتقاله","بورتقال"],                cal:47, pro:0.9, crb:12,  u:["piece","g"],                    pG:131, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ══════════════════════════════════════════════════════════════
  // دهون
  // ══════════════════════════════════════════════════════════════
  {id:"o1", e:"🫒",g:"دهون",   n:"زيت زيتون",        a:["olive oil","زيت","زيت زيتون"],               cal:884,pro:0,   crb:0,   u:["tbsp","tsp","g"],               pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"o2", e:"🥑",g:"دهون",   n:"أفوكادو",          a:["avocado","افوكادو","أڤوكادو"],               cal:160,pro:2,   crb:9,   u:["piece","half","g","tbsp"],      pG:200, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"o3", e:"🥜",g:"دهون",   n:"لوز",              a:["almonds","لوز","almond"],                     cal:579,pro:21,  crb:22,  u:["g","tbsp","piece"],             pG:1.2, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ══════════════════════════════════════════════════════════════
  // عراقي — مشاوي (بوحدات الشيش)
  // ══════════════════════════════════════════════════════════════
  {id:"iq1", e:"🍢",g:"عراقي", n:"كباب عراقي",        a:["كباب","kabab","كبابة","كباب مشوي"],          cal:176,pro:15,  crb:2,   u:["skewer","plate","g"],           pG:null,plG:320,bG:null, sG:null, cG:null, skG:80, wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq2", e:"🍢",g:"عراقي", n:"تكة دجاج / طاووق",  a:["تكة دجاج","طاووق","tawook","شيش طاووق"],    cal:88, pro:12,  crb:1,   u:["skewer","plate","g"],           pG:null,plG:280,bG:null, sG:null, cG:null, skG:60, wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq3", e:"🍢",g:"عراقي", n:"تكة لحم مشوية",     a:["تكة لحم","تكه","tikka","تكة"],               cal:115,pro:13,  crb:0,   u:["skewer","plate","g"],           pG:null,plG:300,bG:null, sG:null, cG:null, skG:70, wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq4", e:"🍢",g:"عراقي", n:"معلاق مشوي",        a:["معلاق","مغلاق","دجاج معلاق"],               cal:84, pro:10,  crb:2,   u:["skewer","plate","g"],           pG:null,plG:250,bG:null, sG:null, cG:null, skG:55, wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ── كصات (لفات) ─────────────────────────────────────────────
  {id:"iq5", e:"🌯",g:"عراقي", n:"كص دجاج",           a:["كص دجاج","كص","lafa dajaj","لفة دجاج"],      cal:418,pro:28,  crb:45,  u:["wrap","piece","g"],             pG:200, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:200,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq6", e:"🌯",g:"عراقي", n:"كص لحم",            a:["كص لحم","لفة لحم","lafa lahm"],              cal:442,pro:25,  crb:45,  u:["wrap","piece","g"],             pG:210, plG:null,bG:null, sG:null, cG:null, skG:null,wrG:210,mwG:null,rgG:null,smG:null,qrG:null},

  // ── تشاريب ومراقات ──────────────────────────────────────────
  {id:"iq7", e:"🍲",g:"عراقي", n:"تشريب دجاج",        a:["تشريب دجاج","tashreeb","طاشريب"],            cal:423,pro:22,  crb:50,  u:["mawon","plate","g"],            pG:null,plG:500,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:450,rgG:null,smG:null,qrG:null},
  {id:"iq8", e:"🍲",g:"عراقي", n:"تشريب لحم",         a:["تشريب لحم","مرق لحم خروف","تشريب"],          cal:480,pro:25,  crb:50,  u:["mawon","plate","g"],            pG:null,plG:550,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:480,rgG:null,smG:null,qrG:null},
  {id:"iq9", e:"🫕",g:"عراقي", n:"دولمة عراقية",      a:["دولمة","dolma","يبرق","دولمه","ورق عنب"],    cal:355,pro:10,  crb:45,  u:["piece","plate","mawon","g"],    pG:35,  plG:350,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:350,rgG:null,smG:null,qrG:null},
  {id:"iq10",e:"🍛",g:"عراقي", n:"قوزي عراقي",        a:["قوزي","goozi","قوزي خروف","أرز بالقوزي"],    cal:210,pro:14,  crb:18,  u:["plate","mawon","bowl","g"],     pG:null,plG:500,bG:400, sG:null, cG:null, skG:null,wrG:null,mwG:420,rgG:null,smG:null,qrG:null},
  {id:"iq11",e:"🐟",g:"عراقي", n:"سمك مسكوف",         a:["مسكوف","masgouf","سمك مشوي عراقي"],          cal:161,pro:20,  crb:0,   u:["plate","g","piece"],            pG:null,plG:400,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq12",e:"🍛",g:"عراقي", n:"برياني عراقي دجاج", a:["برياني","biryani","برياني عراقي"],            cal:220,pro:22,  crb:55,  u:["mawon","plate","bowl","g"],     pG:null,plG:500,bG:400, sG:null, cG:null, skG:null,wrG:null,mwG:450,rgG:null,smG:null,qrG:null},
  {id:"iq13",e:"🫘",g:"عراقي", n:"باجلا بالدهن",       a:["باجلا","bajla","باقلاء","باجلة"],             cal:430,pro:18,  crb:40,  u:["mawon","plate","g"],            pG:null,plG:480,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:380,rgG:null,smG:null,qrG:null},
  {id:"iq14",e:"🫕",g:"عراقي", n:"قيمة نجفية",        a:["قيمة","qeema","كيمة نجفية","قيمه"],          cal:288,pro:15,  crb:30,  u:["mawon","plate","bowl","g"],     pG:null,plG:380,bG:300, sG:null, cG:null, skG:null,wrG:null,mwG:300,rgG:null,smG:null,qrG:null},
  {id:"iq15",e:"🫕",g:"عراقي", n:"هريس لحم",          a:["هريس","harees","جريش","هريسه"],               cal:300,pro:12,  crb:45,  u:["mawon","plate","bowl","g"],     pG:null,plG:400,bG:320, sG:null, cG:null, skG:null,wrG:null,mwG:350,rgG:null,smG:null,qrG:null},
  {id:"iq16",e:"🫘",g:"عراقي", n:"فاصولياء باللحم",    a:["فاصولياء","fasolia","فاصوليا"],               cal:132,pro:9,   crb:14,  u:["mawon","plate","bowl","g"],     pG:null,plG:380,bG:300, sG:null, cG:null, skG:null,wrG:null,mwG:320,rgG:null,smG:null,qrG:null},
  {id:"iq17",e:"🫕",g:"عراقي", n:"بامية باللحم",       a:["بامية","bamia","مرق بامية"],                  cal:115,pro:7,   crb:10,  u:["mawon","plate","bowl","g"],     pG:null,plG:380,bG:300, sG:null, cG:null, skG:null,wrG:null,mwG:320,rgG:null,smG:null,qrG:null},
  {id:"iq18",e:"🍲",g:"عراقي", n:"مرق بطاطس باللحم",  a:["مرق بطاطس","يخنة بطاطس","مرق"],              cal:128,pro:8,   crb:13,  u:["mawon","plate","bowl","g"],     pG:null,plG:400,bG:320, sG:null, cG:null, skG:null,wrG:null,mwG:340,rgG:null,smG:null,qrG:null},
  {id:"iq19",e:"🫕",g:"عراقي", n:"مخلمة لحم وبيض",    a:["مخلمة","مخلمه","لحم مع بيض","مخلمة لحم"],   cal:262,pro:20,  crb:5,   u:["mawon","plate","g"],            pG:null,plG:320,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:270,rgG:null,smG:null,qrG:null},

  // ── ريوق وإفطار عراقي ───────────────────────────────────────
  {id:"iq20",e:"🥛",g:"عراقي", n:"قيمر عراقي",        a:["قيمر","geymar","قشطة","كيمر","سدة"],         cal:140,pro:0.5, crb:1,   u:["tbsp","bowl","g"],              pG:null,plG:null,bG:150, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq21",e:"🧀",g:"عراقي", n:"جبن عرب",           a:["جبن عرب","جبن عراقي","جبنة عراقية"],         cal:86, pro:7,   crb:1,   u:["piece","slice","g"],            pG:40,  plG:null,bG:null, sG:30,  cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq22",e:"🥞",g:"عراقي", n:"كاهي بالقيمر",      a:["كاهي","gahi","عجينة كاهي","كاهي قيمر"],      cal:385,pro:5,   crb:38,  u:["piece","plate","g"],            pG:80,  plG:240, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq23",e:"🍳",g:"عراقي", n:"عجة عراقية",         a:["عجة","ujja","بيض مع بصل","عجه"],             cal:168,pro:10,  crb:4,   u:["mawon","plate","piece","g"],    pG:110, plG:220, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:200,rgG:null,smG:null,qrG:null},

  // ── شارع وسناك عراقي ────────────────────────────────────────
  {id:"iq24",e:"🥟",g:"عراقي", n:"سمبوسك",            a:["سمبوسك","samboosa","سمبوسة"],                cal:285,pro:9,   crb:28,  u:["piece","g"],                    pG:50,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq25",e:"🧆",g:"عراقي", n:"فلافل عراقية",       a:["فلافل","falafel","قرص فلافل"],               cal:57, pro:2,   crb:8,   u:["qurs","plate","g"],             pG:null,plG:160, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:18},
  {id:"iq26",e:"🥙",g:"عراقي", n:"شاورما دجاج",        a:["شاورما","shawarma","شاورمة"],                 cal:225,pro:18,  crb:20,  u:["wrap","piece","g","plate"],     pG:190, plG:370, bG:null, sG:null, cG:null, skG:null,wrG:190,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq27",e:"🥧",g:"عراقي", n:"پاچة عراقية",        a:["پاچة","pacha","باچة","كوارع","راس وكوارع"],  cal:195,pro:22,  crb:1,   u:["mawon","plate","bowl","g"],     pG:null,plG:400,bG:320, sG:null, cG:null, skG:null,wrG:null,mwG:350,rgG:null,smG:null,qrG:null},
  {id:"iq28",e:"🍲",g:"عراقي", n:"كوباء / كبة",        a:["كوباء","kubbah","كبة","كوبه","كبه"],          cal:245,pro:12,  crb:22,  u:["piece","plate","g"],            pG:70,  plG:280, bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ── حلويات وتمر ─────────────────────────────────────────────
  {id:"iq29",e:"🍪",g:"عراقي", n:"كليجة تمر",         a:["كليجة","kleija","كعك التمر","كليجه"],         cal:385,pro:5,   crb:58,  u:["piece","g"],                    pG:40,  plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq30",e:"🍯",g:"عراقي", n:"تمر عراقي",         a:["تمر","dates","رطب","برحي","زهدي"],            cal:277,pro:2,   crb:74,  u:["piece","g","tbsp"],             pG:8,   plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ── مشروبات ─────────────────────────────────────────────────
  {id:"iq31",e:"☕",g:"عراقي", n:"چاي عراقي بسكر",    a:["چاي","chai","شاي عراقي","شاي","استكان"],     cal:30, pro:0,   crb:8,   u:["cup","g"],                      pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq32",e:"☕",g:"عراقي", n:"قهوة عراقية بالهيل", a:["قهوة عراقية","gahwa","قهوه بالهيل"],         cal:5,  pro:0.3, crb:0.5, u:["cup","g"],                      pG:null,plG:null,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},

  // ── وجبات شعبية إضافية ──────────────────────────────────────
  {id:"iq33",e:"🍛",g:"عراقي", n:"مجبوس دجاج",        a:["مجبوس","machboos","بخاري","كبسة"],            cal:182,pro:13,  crb:22,  u:["mawon","plate","bowl","g"],     pG:null,plG:420,bG:320, sG:null, cG:null, skG:null,wrG:null,mwG:380,rgG:null,smG:null,qrG:null},
  {id:"iq34",e:"🫕",g:"عراقي", n:"مسحن الدجاج",        a:["مسحن","musakhan","مسخن"],                     cal:268,pro:20,  crb:22,  u:["mawon","plate","piece","g"],    pG:null,plG:400,bG:null, sG:null, cG:null, skG:null,wrG:null,mwG:360,rgG:null,smG:null,qrG:null},
  {id:"iq35",e:"🍲",g:"عراقي", n:"حمص باللحم",         a:["حمص باللحم","حمص مطبوخ","حمص"],              cal:165,pro:11,  crb:16,  u:["mawon","plate","bowl","g"],     pG:null,plG:380,bG:300, sG:null, cG:null, skG:null,wrG:null,mwG:300,rgG:null,smG:null,qrG:null},
  {id:"iq36",e:"🧀",g:"عراقي", n:"جبن داودي",          a:["جبن داودي","dawodi","جبن عراقي","داودي"],     cal:280,pro:18,  crb:2,   u:["slice","piece","g"],            pG:40,  plG:null,bG:null, sG:30,  cG:null, skG:null,wrG:null,mwG:null,rgG:null,smG:null,qrG:null},
  {id:"iq37",e:"🍲",g:"عراقي", n:"مرق الرأس",          a:["مرق رأس","شوربة رأس","راس","باجة"],           cal:145,pro:18,  crb:2,   u:["mawon","bowl","plate","g"],     pG:null,plG:400,bG:320, sG:null, cG:null, skG:null,wrG:null,mwG:330,rgG:null,smG:null,qrG:null},
];

const CATS = ["الكل","عراقي","بروتين","نشويات","خضروات","فواكه","ألبان","دهون"];

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════
function norm(s){return s.toLowerCase().replace(/[أإآا]/g,"ا").replace(/[ةه]/g,"ه").replace(/ى/g,"ي").trim();}
function lev(a,b){const m=a.length,n=b.length,dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i?j?0:i:j));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);return dp[m][n];}
function fscore(q,f){const nq=norm(q);const ts=[f.n,...(f.a||[])].map(norm);let best=99;for(const t of ts){if(t===nq)return 0;if(t.startsWith(nq)||nq.startsWith(t))return 1;if(t.includes(nq))return 2;const tw=t.split(" "),qw=nq.split(" ");if(qw.every(w=>tw.some(t2=>t2.includes(w)||lev(w,t2)<=1)))return 3;const d=Math.min(...qw.map(w=>Math.min(...tw.map(t2=>lev(w,t2)))));if(d<=2)best=Math.min(best,4+d);}return best;}
function fSearch(q,cat){return ALL_FOODS.filter(f=>cat==="الكل"||f.g===cat).map(f=>({...f,sc:q?fscore(q,f):0})).filter(f=>f.sc<(q?7:1)).sort((a,b)=>a.sc-b.sc);}
function getG(food,uid,qty){const u=UNITS.find(x=>x.id===uid);if(!u)return qty*100;if(u.toG)return qty*u.toG;const m={piece:food.pG,plate:food.plG,bowl:food.bG,slice:food.sG,can:food.cG,skewer:food.skG,wrap:food.wrG,mawon:food.mwG,raghif:food.rgG,samona:food.smG,qurs:food.qrG};return qty*(m[uid]||100);}
function calcM(food,uid,qty){const g=getG(food,uid,qty),f=g/100;return{grams:Math.round(g),cal:Math.round(food.cal*f),pro:+((food.pro*f)).toFixed(1),crb:+((food.crb*f)).toFixed(1)};}
function useDebounce(v,d){const[s,ss]=useState(v);useEffect(()=>{const t=setTimeout(()=>ss(v),d);return()=>clearTimeout(t)},[v,d]);return s;}
function today(){return new Date().toISOString().split("T")[0];}
function generateCode(){const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";let c="FIT-";for(let i=0;i<4;i++)c+=chars[Math.floor(Math.random()*chars.length)];c+="-";for(let i=0;i<4;i++)c+=chars[Math.floor(Math.random()*chars.length)];return c;}

// BMR / GOALS
const ACT={sedentary:1.2,light:1.375,moderate:1.55,active:1.725};
const GMOD={cut:-0.2,maintain:0,bulk:0.15};
const GMAC={cut:{p:0.40,c:0.35},maintain:{p:0.30,c:0.40},bulk:{p:0.30,c:0.45}};
function calcGoals(pr){
  const w=+pr.weight,h=+pr.height,a=+pr.age;
  if(!w||!h||!a)return null;
  const bmr=pr.gender==="male"?10*w+6.25*h-5*a+5:10*w+6.25*h-5*a-161;
  const tdee=bmr*ACT[pr.activity];
  const cal=Math.round(tdee*(1+GMOD[pr.goal]));
  const r=GMAC[pr.goal];
  return{cal,protein:Math.round(cal*r.p/4),carbs:Math.round(cal*r.c/4)};
}

// Storage helpers
function load(key,def){try{const v=localStorage.getItem(key);return v?JSON.parse(v):def;}catch{return def;}}
function save(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}

// ══════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════════════════════════
function AdminPanel({onClose}){
  const[pw,setPw]=useState("");
  const[auth,setAuth]=useState(false);
  const[tab,setTab]=useState("codes");
  const[codes,setCodes]=useState(()=>load("ft_codes",DEFAULT_CODES));
  const[gyms,setGyms]=useState(()=>load("ft_gyms",DEFAULT_GYMS));
  const[newGym,setNewGym]=useState({id:"",name:"",color:"#00e5a0",logo:"🏋️",city:""});
  const[msg,setMsg]=useState("");

  function addCode(type="individual",gymId=""){
    const code=generateCode();
    const updated={...codes,[code]:{type,gymId,used:false,createdAt:today()}};
    setCodes(updated);save("ft_codes",updated);
    setMsg(`✓ كود جديد: ${code}`);setTimeout(()=>setMsg(""),3000);
  }
  function deleteCode(c){const updated={...codes};delete updated[c];setCodes(updated);save("ft_codes",updated);}
  function addGym(){
    if(!newGym.id||!newGym.name)return;
    const updated={...gyms,[newGym.id]:{name:newGym.name,color:newGym.color,logo:newGym.logo,city:newGym.city,members:0}};
    setGyms(updated);save("ft_gyms",updated);
    setNewGym({id:"",name:"",color:"#00e5a0",logo:"🏋️",city:""});
    setMsg("✓ تم إضافة الجيم");setTimeout(()=>setMsg(""),2000);
  }

  const inp=(label,val,onChange,placeholder="")=>(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <label style={{fontSize:11,color:T.muted}}>{label}</label>
      <input value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.hi,fontSize:13,fontFamily:"'Tajawal',sans-serif",outline:"none"}}
        onFocus={e=>e.target.style.borderColor=T.acc} onBlur={e=>e.target.style.borderColor=T.border}/>
    </div>
  );

  if(!auth) return(
    <div style={{position:"fixed",inset:0,background:"#000e",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Tajawal',sans-serif",direction:"rtl"}}>
      <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:16,padding:28,width:320}}>
        <div style={{fontSize:18,fontWeight:700,color:T.hi,marginBottom:16}}>🔐 لوحة الأدمن</div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="كلمة المرور"
          style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.hi,fontSize:14,fontFamily:"'Tajawal',sans-serif",outline:"none",marginBottom:10}}
          onKeyDown={e=>e.key==="Enter"&&(pw===ADMIN_PASSWORD?setAuth(true):setMsg("كلمة المرور خاطئة"))}/>
        {msg&&<div style={{color:T.red,fontSize:12,marginBottom:8}}>{msg}</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",borderRadius:8,background:T.card,border:`1px solid ${T.border}`,color:T.muted,cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>إلغاء</button>
          <button onClick={()=>pw===ADMIN_PASSWORD?setAuth(true):setMsg("خاطئة")} style={{flex:1,padding:"9px",borderRadius:8,background:T.acc,border:"none",color:"#000",fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>دخول</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"#000e",zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",fontFamily:"'Tajawal',sans-serif",direction:"rtl",padding:16}}>
      <div style={{width:"100%",maxWidth:700,background:T.surf,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",marginTop:20}}>
        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:T.card}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:T.acc,boxShadow:`0 0 8px ${T.acc}`}}/>
            <span style={{fontSize:16,fontWeight:700,color:T.hi}}>لوحة الأدمن — FitTrack Pro</span>
          </div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 12px",color:T.muted,cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>✕ إغلاق</button>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:T.border}}>
          {[
            {l:"أكواد نشطة",v:Object.values(codes).filter(c=>!c.used).length,c:T.acc},
            {l:"أكواد مستخدمة",v:Object.values(codes).filter(c=>c.used).length,c:T.green},
            {l:"جيمات",v:Object.keys(gyms).length,c:T.pro},
          ].map(s=>(
            <div key={s.l} style={{background:T.surf,padding:"16px",textAlign:"center"}}>
              <div style={{fontFamily:"monospace",fontSize:28,fontWeight:700,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:4}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.card}}>
          {[{id:"codes",l:"🔑 الأكواد"},{id:"gyms",l:"🏋️ الجيمات"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${tab===t.id?T.acc:T.border}`,background:tab===t.id?T.accDim:T.bg,color:tab===t.id?T.acc:T.muted,cursor:"pointer",fontSize:13,fontFamily:"'Tajawal',sans-serif"}}>{t.l}</button>
          ))}
        </div>

        <div style={{padding:16}}>
          {msg&&<div style={{background:T.accDim,border:`1px solid ${T.accSoft}`,borderRadius:8,padding:"8px 14px",fontSize:12,color:T.acc,marginBottom:12,fontFamily:"monospace"}}>{msg}</div>}

          {/* CODES TAB */}
          {tab==="codes"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>addCode("individual")} style={{flex:1,padding:"10px",borderRadius:8,background:T.accDim,border:`1px solid ${T.acc}`,color:T.acc,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Tajawal',sans-serif"}}>+ كود فردي</button>
                <button onClick={()=>addCode("gym","iron-house")} style={{flex:1,padding:"10px",borderRadius:8,background:`${T.pro}18`,border:`1px solid ${T.pro}`,color:T.pro,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Tajawal',sans-serif"}}>+ كود جيم</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:400,overflowY:"auto"}}>
                {Object.entries(codes).map(([code,info])=>(
                  <div key={code} style={{display:"flex",alignItems:"center",gap:10,background:T.card,border:`1px solid ${info.used?T.border:T.acc+"33"}`,borderRadius:10,padding:"10px 14px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:info.used?T.muted:T.acc,letterSpacing:1}}>{code}</div>
                      <div style={{fontSize:10,color:T.muted,marginTop:2}}>
                        {info.type==="gym"?"🏋️ جيم":"👤 فردي"} · {info.used?"✓ مستخدم":"○ متاح"} · {info.createdAt}
                      </div>
                    </div>
                    <button onClick={()=>deleteCode(code)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,padding:"4px 8px",borderRadius:6}}
                      onMouseEnter={e=>e.target.style.color=T.red} onMouseLeave={e=>e.target.style.color=T.muted}>🗑</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GYMS TAB */}
          {tab==="gyms"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:14,display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontSize:13,fontWeight:700,color:T.hi,marginBottom:4}}>إضافة جيم جديد</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {inp("معرف الجيم (بالإنجليزي)",newGym.id,v=>setNewGym(g=>({...g,id:v.toLowerCase().replace(/\s/g,"-")})),"iron-house")}
                  {inp("اسم الجيم",newGym.name,v=>setNewGym(g=>({...g,name:v})),"Iron House Gym")}
                  {inp("المدينة",newGym.city,v=>setNewGym(g=>({...g,city:v})),"بغداد")}
                  {inp("إيموجي",newGym.logo,v=>setNewGym(g=>({...g,logo:v})),"🏋️")}
                </div>
                <button onClick={addGym} style={{padding:"10px",borderRadius:8,background:`linear-gradient(135deg,${T.acc}bb,${T.acc})`,border:"none",color:"#000",fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",fontSize:13}}>+ إضافة الجيم</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {Object.entries(gyms).map(([id,gym])=>(
                  <div key={id} style={{display:"flex",alignItems:"center",gap:12,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px"}}>
                    <div style={{fontSize:28}}>{gym.logo}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:T.hi}}>{gym.name}</div>
                      <div style={{fontSize:11,color:T.muted,marginTop:2,fontFamily:"monospace"}}>/{id} · {gym.city}</div>
                    </div>
                    <div style={{width:12,height:12,borderRadius:"50%",background:gym.color,flexShrink:0}}/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ACTIVATION SCREEN
// ══════════════════════════════════════════════════════════════════
function ActivationScreen({trialExpired,onActivate,onTrial}){
  const[code,setCode]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);

  function submit(){
    if(!code.trim()){setErr("أدخل الكود");return;}
    setLoading(true);
    setTimeout(()=>{
      const codes=load("ft_codes",DEFAULT_CODES);
      const upper=code.trim().toUpperCase();
      if(codes[upper]){
        if(codes[upper].used){setErr("هذا الكود مستخدم مسبقاً");setLoading(false);return;}
        const updated={...codes,[upper]:{...codes[upper],used:true,usedAt:today()}};
        save("ft_codes",updated);
        onActivate({type:codes[upper].type,gymId:codes[upper].gymId,code:upper});
      } else {setErr("الكود غير صحيح");setLoading(false);}
    },800);
  }

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Tajawal',sans-serif",direction:"rtl",padding:20,
      backgroundImage:`radial-gradient(ellipse at 30% 50%, ${T.acc}07 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, ${T.pro}07 0%, transparent 60%)`}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:12}}>💪</div>
          <div style={{fontSize:10,color:T.acc,letterSpacing:3,fontFamily:"monospace",textTransform:"uppercase",marginBottom:8}}>FitTrack Pro</div>
          <div style={{fontSize:24,fontWeight:900,color:T.hi}}>{trialExpired?"انتهت الفترة التجريبية":"أهلاً بك"}</div>
          <div style={{fontSize:13,color:T.muted,marginTop:8,lineHeight:1.6}}>
            {trialExpired
              ?"للاستمرار، تواصل معنا وادفع الاشتراك للحصول على كود التفعيل"
              :"أدخل كود التفعيل أو ابدأ الفترة التجريبية المجانية 3 أيام"}
          </div>
        </div>

        <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:16,padding:24,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:11,color:T.muted,letterSpacing:.5}}>كود التفعيل</label>
            <input value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setErr("");}}
              placeholder="FIT-XXXX-XXXX"
              style={{background:T.bg,border:`1px solid ${err?T.red:T.border}`,borderRadius:9,padding:"12px 14px",color:T.hi,fontSize:15,fontFamily:"monospace",letterSpacing:2,outline:"none",textAlign:"center",transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor=T.acc} onBlur={e=>e.target.style.borderColor=err?T.red:T.border}
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
            {err&&<div style={{fontSize:11,color:T.red,textAlign:"center"}}>{err}</div>}
          </div>

          <button onClick={submit} disabled={loading} style={{padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${T.acc}cc,${T.acc})`,border:"none",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",boxShadow:`0 4px 20px ${T.accGlow}`,opacity:loading?0.7:1}}>
            {loading?"جاري التحقق...":"تفعيل الحساب"}
          </button>

          {!trialExpired&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:1,background:T.border}}/>
                <span style={{fontSize:11,color:T.muted}}>أو</span>
                <div style={{flex:1,height:1,background:T.border}}/>
              </div>
              <button onClick={onTrial} style={{padding:"12px",borderRadius:9,background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:13,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.borderHi} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                ابدأ 3 أيام مجانية تجريبية
              </button>
            </>
          )}

          <div style={{textAlign:"center",fontSize:11,color:T.muted,marginTop:4}}>
            للاشتراك: تواصل معنا عبر واتساب أو انستغرام
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SETUP WIZARD
// ══════════════════════════════════════════════════════════════════
function Setup({gymId,onDone}){
  const gyms=load("ft_gyms",DEFAULT_GYMS);
  const gym=gymId?gyms[gymId]:null;
  const[step,setStep]=useState(0);
  const[p,setP]=useState({gender:"male",age:"25",weight:"80",height:"175",activity:"moderate",goal:"cut",targetWeight:"72",rate:"0.5"});
  const set=(k,v)=>setP(pr=>({...pr,[k]:v}));
  const g=calcGoals(p);
  const weeks=+p.weight&&+p.targetWeight&&+p.rate?Math.abs(+p.weight-+p.targetWeight)/+p.rate:0;
  const steps=["بياناتك","هدفك","الوزن المستهدف"];
  const accent=gym?.color||T.acc;

  const Inp=({label,k,unit,min,max})=>(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:11,color:T.muted}}>{label}</label>
      <div style={{position:"relative"}}>
        <input type="number" value={p[k]} min={min} max={max} onChange={e=>set(k,e.target.value)}
          style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 38px 10px 12px",color:T.hi,fontSize:14,fontFamily:"'Tajawal',sans-serif",outline:"none"}}
          onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor=T.border}/>
        {unit&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:11,color:T.muted}}>{unit}</span>}
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"'Tajawal',sans-serif",direction:"rtl",
      backgroundImage:`radial-gradient(ellipse at 20% 50%, ${accent}08 0%, transparent 55%)`}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          {gym&&<div style={{fontSize:10,color:accent,letterSpacing:2,fontFamily:"monospace",textTransform:"uppercase",marginBottom:6}}>{gym.logo} {gym.name}</div>}
          <div style={{fontSize:10,color:T.acc,letterSpacing:3,fontFamily:"monospace",textTransform:"uppercase",marginBottom:6}}>FitTrack Pro</div>
          <div style={{fontSize:24,fontWeight:900,color:T.hi}}>إعداد ملفك الشخصي</div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {steps.map((s,i)=>(
            <div key={i} style={{flex:1}}>
              <div style={{height:2,borderRadius:99,background:i<=step?accent:T.border,transition:"background .3s"}}/>
              <div style={{fontSize:10,color:i===step?accent:T.muted,marginTop:4,textAlign:"center"}}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:16,padding:22}}>
          {step===0&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{fontSize:11,color:T.muted,marginBottom:7}}>الجنس</div>
                <div style={{display:"flex",gap:8}}>
                  {[{id:"male",l:"🧔 ذكر"},{id:"female",l:"👩 أنثى"}].map(x=>(
                    <button key={x.id} onClick={()=>set("gender",x.id)} style={{flex:1,padding:"10px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,background:p.gender===x.id?`${accent}18`:T.card,border:`1px solid ${p.gender===x.id?accent:T.border}`,color:p.gender===x.id?accent:T.muted,fontFamily:"'Tajawal',sans-serif"}}>{x.l}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Inp label="العمر" k="age" unit="سنة" min={10} max={100}/>
                <Inp label="الوزن الحالي" k="weight" unit="كغ" min={30} max={300}/>
                <Inp label="الطول" k="height" unit="سم" min={100} max={250}/>
              </div>
              <div>
                <div style={{fontSize:11,color:T.muted,marginBottom:7}}>مستوى النشاط</div>
                {[{id:"sedentary",l:"مستقر",d:"لا رياضة"},{id:"light",l:"خفيف",d:"1–3 أيام"},{id:"moderate",l:"معتدل",d:"3–5 أيام"},{id:"active",l:"نشيط",d:"6–7 أيام"}].map(a=>(
                  <button key={a.id} onClick={()=>set("activity",a.id)} style={{width:"100%",display:"flex",justifyContent:"space-between",padding:"9px 12px",borderRadius:8,cursor:"pointer",marginBottom:5,background:p.activity===a.id?`${accent}18`:T.card,border:`1px solid ${p.activity===a.id?accent:T.border}`,fontFamily:"'Tajawal',sans-serif"}}>
                    <span style={{fontSize:13,fontWeight:600,color:p.activity===a.id?accent:T.hi}}>{a.l}</span>
                    <span style={{fontSize:11,color:T.muted}}>{a.d}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:12,color:T.muted,marginBottom:4}}>ما هدفك؟</div>
              {[{id:"cut",l:"تنشيف 🔥",d:"حرق دهون وتثبيت العضلات",mod:"-20%"},{id:"maintain",l:"تثبيت ⚖️",d:"الحفاظ على وزنك الحالي",mod:"TDEE"},{id:"bulk",l:"تضخيم 💪",d:"بناء كتلة عضلية",mod:"+15%"}].map(x=>(
                <button key={x.id} onClick={()=>set("goal",x.id)} style={{width:"100%",padding:"14px",borderRadius:10,cursor:"pointer",textAlign:"right",background:p.goal===x.id?`${accent}18`:T.card,border:`1px solid ${p.goal===x.id?accent:T.border}`,fontFamily:"'Tajawal',sans-serif"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:p.goal===x.id?accent:T.hi}}>{x.l}</div>
                      <div style={{fontSize:11,color:T.muted,marginTop:2}}>{x.d}</div>
                    </div>
                    <span style={{fontFamily:"monospace",fontSize:11,color:T.muted,background:T.bg,padding:"3px 8px",borderRadius:6}}>{x.mod}</span>
                  </div>
                </button>
              ))}
              {g&&(
                <div style={{background:T.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${T.border}`,marginTop:4}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:8}}>أهدافك اليومية</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                    {[{l:"سعرات",v:g.cal,c:T.cal},{l:"بروتين",v:g.protein+"غ",c:T.pro},{l:"كارب",v:g.carbs+"غ",c:T.carb}].map(x=>(
                      <div key={x.l} style={{textAlign:"center",background:T.card,borderRadius:8,padding:"8px 4px",border:`1px solid ${T.border}`}}>
                        <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:x.c}}>{x.v}</div>
                        <div style={{fontSize:9,color:T.muted,marginTop:2}}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:13,color:T.muted}}>وزنك الحالي: <b style={{color:T.hi}}>{p.weight} كغ</b></div>
              <Inp label="الوزن المستهدف" k="targetWeight" unit="كغ" min={30} max={300}/>
              <div>
                <div style={{fontSize:11,color:T.muted,marginBottom:7}}>معدل التغيير الأسبوعي</div>
                {[{id:"0.25",l:"بطيء",d:"0.25 كغ/أسبوع"},{id:"0.5",l:"معتدل ✓",d:"0.5 كغ/أسبوع"},{id:"1",l:"سريع",d:"1 كغ/أسبوع"}].map(r=>(
                  <button key={r.id} onClick={()=>set("rate",r.id)} style={{width:"100%",display:"flex",justifyContent:"space-between",padding:"9px 12px",borderRadius:8,cursor:"pointer",marginBottom:5,background:p.rate===r.id?`${accent}18`:T.card,border:`1px solid ${p.rate===r.id?accent:T.border}`,fontFamily:"'Tajawal',sans-serif"}}>
                    <span style={{fontSize:13,fontWeight:600,color:p.rate===r.id?accent:T.hi}}>{r.l}</span>
                    <span style={{fontSize:11,color:T.muted}}>{r.d}</span>
                  </button>
                ))}
              </div>
              {weeks>0&&(
                <div style={{background:`${accent}12`,border:`1px solid ${accent}44`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:4}}>التقدير الزمني</div>
                  <div style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:accent}}>{Math.round(weeks)} أسبوع</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>من {p.weight} إلى {p.targetWeight} كغ</div>
                </div>
              )}
            </div>
          )}
          <div style={{display:"flex",gap:8,marginTop:18}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"11px",borderRadius:9,cursor:"pointer",background:T.card,border:`1px solid ${T.border}`,color:T.muted,fontSize:13,fontFamily:"'Tajawal',sans-serif"}}>← رجوع</button>}
            <button onClick={()=>{if(step<2)setStep(s=>s+1);else{const gl=calcGoals(p);onDone({...p,goals:gl,gymId});}}} style={{flex:2,padding:"11px",borderRadius:9,cursor:"pointer",background:`linear-gradient(135deg,${accent}cc,${accent})`,border:"none",color:"#000",fontSize:14,fontWeight:700,fontFamily:"'Tajawal',sans-serif",boxShadow:`0 4px 20px ${accent}30`}}>
              {step<2?"التالي →":"ابدأ 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// FOOD MODAL
// ══════════════════════════════════════════════════════════════════
function FoodModal({onAdd,onClose}){
  const[tab,setTab]=useState("search");
  const[query,setQuery]=useState("");
  const[cat,setCat]=useState("الكل");
  const[selected,setSelected]=useState(null);
  const[unit,setUnit]=useState("");
  const[qty,setQty]=useState(1);
  const[manual,setManual]=useState({name:"",cal:"",pro:"",crb:""});
  const dq=useDebounce(query,350);
  const results=fSearch(dq,cat);

  function pick(food){setSelected(food);setUnit(food.u[0]);setQty(food.u[0]==="g"?100:1);}
  function changeUnit(uid){setUnit(uid);setQty(uid==="g"?100:1);}
  const m=selected?calcM(selected,unit,qty):null;
  const av=selected?UNITS.filter(u=>selected.u.includes(u.id)):[];
  const manualValid=manual.name&&manual.cal&&manual.pro;

  return(
    <div style={{position:"fixed",inset:0,background:"#000d",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"100%",maxWidth:660,background:T.surf,borderRadius:"20px 20px 0 0",border:`1px solid ${T.border}`,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"10px 16px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><div style={{width:36,height:3,borderRadius:99,background:T.border}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:16,fontWeight:700,color:T.hi}}>إضافة طعام</div>
            <button onClick={onClose} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",color:T.muted,cursor:"pointer",fontSize:13}}>✕</button>
          </div>
          <div style={{display:"flex",gap:4,background:T.card,borderRadius:10,padding:3,marginBottom:0}}>
            {[{id:"search",l:"🔍 بحث"},{id:"manual",l:"✍️ يدوي"}].map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setSelected(null);}} style={{flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?T.surf:"transparent",color:tab===t.id?T.hi:T.muted,fontSize:12,fontWeight:tab===t.id?700:400,fontFamily:"'Tajawal',sans-serif",transition:"all .2s"}}>{t.l}</button>
            ))}
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"14px"}}>
          {tab==="search"&&!selected&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{position:"relative"}}>
                <input value={query} onChange={e=>setQuery(e.target.value)} autoFocus placeholder="ابحث... (تشريب، دولمة، chicken...)"
                  style={{width:"100%",background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:10,padding:"11px 42px 11px 14px",color:T.hi,fontSize:14,fontFamily:"'Tajawal',sans-serif",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor=T.acc} onBlur={e=>e.target.style.borderColor=T.borderHi}/>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:15}}>🔍</span>
              </div>
              <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
                {CATS.map(c=>(
                  <button key={c} onClick={()=>setCat(c)} style={{padding:"4px 11px",borderRadius:20,whiteSpace:"nowrap",fontSize:11,cursor:"pointer",border:`1px solid ${cat===c?T.acc:T.border}`,background:cat===c?T.accDim:T.card,color:cat===c?T.acc:T.muted,fontFamily:"'Tajawal',sans-serif"}}>{c}</button>
                ))}
              </div>
              {!query&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {(cat==="الكل"
                    ?["iq1","iq4","iq5","iq6","iq14","iq15","p1","p3","c1","c2","v1","v4","f1","o2","iq27","iq7"].map(id=>ALL_FOODS.find(f=>f.id===id)).filter(Boolean)
                    :ALL_FOODS.filter(f=>f.g===cat)
                  ).slice(0,16).map(food=>(
                    <button key={food.id} onClick={()=>pick(food)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 6px",cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.acc;e.currentTarget.style.background=T.accDim;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card;}}>
                      <span style={{fontSize:26}}>{food.e}</span>
                      <span style={{fontSize:10,color:T.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",width:"100%"}}>{food.n}</span>
                      <span style={{fontSize:10,fontFamily:"monospace",color:T.pro,fontWeight:700}}>{food.pro}غ ب</span>
                    </button>
                  ))}
                </div>
              )}
              {query&&(
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {results.slice(0,12).map(food=>(
                    <button key={food.id} onClick={()=>pick(food)} style={{display:"flex",gap:12,alignItems:"center",padding:"11px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",textAlign:"right",transition:"border-color .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=T.acc} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                      <span style={{fontSize:22,flexShrink:0}}>{food.e}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:T.hi}}>{food.n}</div>
                        <div style={{fontSize:10,color:T.muted,marginTop:2}}>{food.g} · <span style={{color:T.pro,fontFamily:"monospace"}}>{food.pro}غ بروتين</span>/100غ</div>
                      </div>
                      <div style={{textAlign:"left",flexShrink:0}}>
                        <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:T.cal}}>{food.cal}</div>
                        <div style={{fontSize:9,color:T.muted}}>kcal</div>
                      </div>
                    </button>
                  ))}
                  {results.length===0&&<div style={{textAlign:"center",padding:"28px 0",color:T.muted}}><div style={{fontSize:28}}>🔍</div><div style={{marginTop:8,fontSize:13}}>لا نتائج</div></div>}
                </div>
              )}
            </div>
          )}
          {tab==="search"&&selected&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <button onClick={()=>setSelected(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,fontFamily:"'Tajawal',sans-serif",padding:0}}>← رجوع</button>
              <div style={{display:"flex",gap:12,alignItems:"center",background:T.card,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.border}`}}>
                <span style={{fontSize:36}}>{selected.e}</span>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:T.hi}}>{selected.n}</div>
                  <div style={{fontSize:11,color:T.muted}}>{selected.g}</div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6,background:T.accDim,borderRadius:6,padding:"3px 10px",border:`1px solid ${T.accSoft}`}}>
                    <span style={{fontSize:11,color:T.pro,fontFamily:"monospace",fontWeight:700}}>{selected.pro}غ بروتين</span>
                    <span style={{fontSize:10,color:T.muted}}>/ 100غ</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:T.muted,marginBottom:8}}>الوحدة</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {av.map(u=>(
                    <button key={u.id} onClick={()=>changeUnit(u.id)} style={{padding:"6px 14px",borderRadius:20,fontSize:12,cursor:"pointer",background:unit===u.id?T.accDim:T.card,border:`1px solid ${unit===u.id?T.acc:T.border}`,color:unit===u.id?T.acc:T.muted,fontFamily:"'Tajawal',sans-serif"}}>{u.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,color:T.muted}}>الكمية</span>
                  <span style={{fontFamily:"monospace",fontSize:12,color:T.text}}>{qty} {UNITS.find(u=>u.id===unit)?.short} = <b style={{color:T.hi}}>{m?.grams}غ</b></span>
                </div>
                {unit==="g"&&<input type="range" min={10} max={500} step={5} value={qty} onChange={e=>setQty(+e.target.value)} style={{width:"100%",accentColor:T.acc,marginBottom:8}}/>}
                <div style={{display:"flex",alignItems:"center",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,overflow:"hidden"}}>
                  <button onClick={()=>setQty(q=>Math.max(.5,+(q-.5).toFixed(1)))} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,padding:"7px 14px"}}>−</button>
                  <input type="number" value={qty} step={unit==="g"?10:.5} min={.5} onChange={e=>setQty(+e.target.value||1)} style={{flex:1,background:"none",border:"none",color:T.hi,fontFamily:"monospace",fontSize:16,fontWeight:700,textAlign:"center",outline:"none"}}/>
                  <button onClick={()=>setQty(q=>+(q+.5).toFixed(1))} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,padding:"7px 14px"}}>+</button>
                </div>
              </div>
              {m&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[{l:"سعرات",v:m.cal,c:T.cal},{l:"بروتين",v:m.pro,c:T.pro},{l:"كارب",v:m.crb,c:T.carb}].map(x=>(
                    <div key={x.l} style={{textAlign:"center",background:T.card,borderRadius:10,padding:"12px 6px",border:`1px solid ${T.border}`}}>
                      <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,color:x.c}}>{x.v}</div>
                      <div style={{fontSize:9,color:T.muted,marginTop:2}}>{x.l}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={()=>{onAdd([{id:`s_${Date.now()}`,emoji:selected.e,name:selected.n,cal:m.cal,protein:m.pro,carbs:m.crb,grams:m.grams}]);onClose();}}
                style={{width:"100%",padding:"14px",borderRadius:10,cursor:"pointer",background:`linear-gradient(135deg,${T.acc}bb,${T.acc})`,border:"none",color:"#000",fontSize:15,fontWeight:700,fontFamily:"'Tajawal',sans-serif",boxShadow:`0 6px 24px ${T.accGlow}`,marginBottom:8}}>
                + أضف ({m?.cal} kcal · {m?.pro}غ بروتين)
              </button>
            </div>
          )}
          {tab==="manual"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:12,color:T.muted}}>أدخل تفاصيل الطعام يدوياً</div>
              {[{label:"اسم الطعام",k:"name",type:"text",pl:"مثال: كبسة جدتي"},{label:"السعرات",k:"cal",type:"number",pl:"kcal"},{label:"البروتين (غ)",k:"pro",type:"number",pl:"غرام"},{label:"الكربوهيدرات (غ)",k:"crb",type:"number",pl:"غرام"}].map(f=>(
                <div key={f.k} style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:11,color:T.muted}}>{f.label}</label>
                  <input type={f.type} placeholder={f.pl} value={manual[f.k]} onChange={e=>setManual(m=>({...m,[f.k]:e.target.value}))}
                    style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 14px",color:T.hi,fontSize:14,fontFamily:"'Tajawal',sans-serif",outline:"none"}}
                    onFocus={e=>e.target.style.borderColor=T.acc} onBlur={e=>e.target.style.borderColor=T.border}/>
                </div>
              ))}
              <button disabled={!manualValid} onClick={()=>{onAdd([{id:`m_${Date.now()}`,emoji:"🍴",name:manual.name,cal:+manual.cal,protein:+manual.pro,carbs:+manual.crb,grams:null}]);onClose();}}
                style={{width:"100%",padding:"13px",borderRadius:10,cursor:manualValid?"pointer":"not-allowed",background:manualValid?`linear-gradient(135deg,${T.acc}bb,${T.acc})`:T.card,border:`1px solid ${manualValid?T.acc:T.border}`,color:manualValid?"#000":T.muted,fontSize:14,fontWeight:700,fontFamily:"'Tajawal',sans-serif",opacity:manualValid?1:0.6,marginBottom:8}}>
                + أضف يدوياً
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN TRACKER
// ══════════════════════════════════════════════════════════════════
function Tracker({profile,session,onReset}){
  const gyms=load("ft_gyms",DEFAULT_GYMS);
  const gym=profile.gymId?gyms[profile.gymId]:null;
  const accent=gym?.color||T.acc;

  // Persistent state
  const[log,setLog]=useState(()=>load(`ft_log_${today()}`,[]));
  const[weightLog,setWeightLog]=useState(()=>load("ft_weights",[]));
  const[streak,setStreak]=useState(()=>load("ft_streak",{count:0,lastDate:""}));
  const[tab,setTab]=useState("home");
  const[showFood,setShowFood]=useState(false);
  const[showWeight,setShowWeight]=useState(false);
  const[newWeight,setNewWeight]=useState("");
  const[toast,setToast]=useState(null);
  const{goals,weight,targetWeight,rate,goal}=profile;

  // Trial timer
  const trialStart=session.trialStart||Date.now();
  const trialMs=72*60*60*1000;
  const remaining=session.type==="trial"?Math.max(0,trialStart+trialMs-Date.now()):null;
  const[trialLeft,setTrialLeft]=useState(remaining);
  useEffect(()=>{
    if(session.type!=="trial")return;
    const t=setInterval(()=>setTrialLeft(Math.max(0,trialStart+trialMs-Date.now())),60000);
    return()=>clearInterval(t);
  },[]);

  // Save log on change
  useEffect(()=>save(`ft_log_${today()}`,log),[log]);

  // Update streak
  useEffect(()=>{
    if(log.length===0)return;
    const last=streak.lastDate;
    const tod=today();
    if(last===tod)return;
    const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
    const yStr=yesterday.toISOString().split("T")[0];
    const newStreak={count:last===yStr?streak.count+1:1,lastDate:tod};
    setStreak(newStreak);save("ft_streak",newStreak);
  },[log]);

  const totals=log.reduce((a,e)=>({cal:a.cal+e.cal,pro:a.pro+e.protein,crb:a.crb+e.carbs}),{cal:0,pro:0,crb:0});
  const remain={cal:goals.cal-totals.cal,pro:goals.protein-totals.pro,crb:goals.carbs-totals.crb};

  function addItems(items){
    setLog(p=>[...p,...items.map(x=>({...x,id:x.id||`${Date.now()}_${Math.random()}`}))]);
    showToast(items.length===1?`✓ ${items[0].name} — ${items[0].cal} kcal`:`✓ أضيف ${items.length} أصناف`);
  }
  function removeFood(id){setLog(p=>p.filter(e=>e.id!==id));}
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(null),2200);}
  function addWeight(){
    if(!newWeight)return;
    const entry={date:today(),weight:+newWeight};
    const updated=[...weightLog.filter(w=>w.date!==today()),entry].sort((a,b)=>a.date.localeCompare(b.date));
    setWeightLog(updated);save("ft_weights",updated);
    setNewWeight("");setShowWeight(false);
    showToast(`✓ تم تسجيل الوزن: ${newWeight} كغ`);
  }

  const gLabel={cut:"تنشيف",maintain:"تثبيت",bulk:"تضخيم"}[goal];
  const lastWeight=weightLog[weightLog.length-1]?.weight||weight;

  // Format trial
  function fmtTrial(ms){
    const h=Math.floor(ms/3600000);const m=Math.floor((ms%3600000)/60000);
    return`${h}س ${m}د`;
  }

  // Ring
  const Ring=({v,g,col,size=100})=>{
    const r=size/2-7,circ=2*Math.PI*r,pct=Math.min(v/(g||1),1),over=v>g;
    const c=over?T.red:col;
    return(
      <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={6}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={6} strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .8s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 6px ${c}88)`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"monospace",fontSize:18,fontWeight:700,color:T.hi,letterSpacing:-1}}>{Math.round(v)}</span>
          <span style={{fontSize:8,color:T.muted}}>/{Math.round(g)}</span>
          <span style={{fontSize:7,color:T.muted}}>kcal</span>
        </div>
      </div>
    );
  };

  const MBar=({label,eaten,goal:g,color})=>{
    const pct=Math.min(eaten/(g||1)*100,100),over=eaten>g;
    return(
      <div style={{marginBottom:9}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:11,color:T.muted}}>{label}</span>
          <span style={{fontSize:11,fontFamily:"monospace",color:over?T.red:T.text}}>
            <b style={{color:over?T.red:color}}>{Math.round(eaten)}</b>
            <span style={{color:T.muted}}> / {Math.round(g)}غ</span>
          </span>
        </div>
        <div style={{height:5,background:T.border,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:over?T.red:color,borderRadius:99,transition:"width .6s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 8px ${over?T.red:color}66`}}/>
        </div>
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Tajawal',sans-serif",direction:"rtl",backgroundImage:`radial-gradient(ellipse at 10% 20%, ${accent}05 0%, transparent 50%)`}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input::-webkit-inner-spin-button{opacity:.3}@keyframes ti{0%{opacity:0;transform:translate(-50%,10px)}10%{opacity:1;transform:translate(-50%,0)}85%{opacity:1}100%{opacity:0}}@keyframes su{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}input[type=range]{height:4px;border-radius:99px}`}</style>

      {showFood&&<FoodModal onAdd={addItems} onClose={()=>setShowFood(false)}/>}
      {toast&&<div style={{position:"fixed",bottom:80,left:"50%",background:T.card,border:`1px solid ${accent}`,borderRadius:10,padding:"9px 18px",fontSize:12,color:accent,fontFamily:"monospace",zIndex:300,whiteSpace:"nowrap",animation:"ti 2.2s ease forwards",boxShadow:`0 6px 20px ${accent}30`}}>{toast}</div>}

      <div style={{maxWidth:640,margin:"0 auto",padding:"14px 14px 80px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:accent,boxShadow:`0 0 10px ${accent}`}}/>
            <div>
              {gym&&<div style={{fontSize:8,color:accent,letterSpacing:2,fontFamily:"monospace",textTransform:"uppercase"}}>{gym.logo} {gym.name}</div>}
              <div style={{fontSize:8,color:T.muted,letterSpacing:3,fontFamily:"monospace",textTransform:"uppercase"}}>FitTrack Pro</div>
              <div style={{fontSize:18,fontWeight:900,color:T.hi,letterSpacing:-.5}}>تتبع التغذية</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {/* Streak */}
            {streak.count>0&&(
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",textAlign:"center"}}>
                <div style={{fontSize:14}}>🔥</div>
                <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:T.cal}}>{streak.count}</div>
              </div>
            )}
            {/* Trial badge */}
            {session.type==="trial"&&trialLeft>0&&(
              <div style={{background:`${T.red}18`,border:`1px solid ${T.red}44`,borderRadius:8,padding:"5px 10px",textAlign:"center"}}>
                <div style={{fontSize:9,color:T.red}}>تجريبي</div>
                <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:T.red}}>{fmtTrial(trialLeft)}</div>
              </div>
            )}
            <button onClick={onReset} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",color:T.muted,fontSize:11,cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>⚙️</button>
          </div>
        </div>

        {/* HOME TAB */}
        {tab==="home"&&(
          <>
            {/* Profile bar */}
            <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:T.muted}}>الوزن الحالي → الهدف</div>
                <div style={{fontSize:15,fontWeight:700,color:T.hi,marginTop:2}}>{lastWeight} كغ <span style={{color:accent}}>→</span> {targetWeight} كغ</div>
              </div>
              {[{l:"سعرات",v:goals.cal,c:T.cal},{l:"بروتين",v:goals.protein+"غ",c:T.pro},{l:gLabel,v:rate+" كغ/أسبوع",c:T.text}].map(x=>(
                <div key={x.l} style={{textAlign:"center",background:T.card,borderRadius:8,padding:"5px 10px",border:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:x.c}}>{x.v}</div>
                  <div style={{fontSize:9,color:T.muted}}>{x.l}</div>
                </div>
              ))}
            </div>

            {/* Daily summary */}
            <div style={{background:T.surf,border:`1px solid ${totals.cal>goals.cal?T.red+"44":T.border}`,borderRadius:14,padding:16,boxShadow:totals.cal>goals.cal?`0 0 24px ${T.red}18`:`0 0 24px ${accent}20`}}>
              <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
                <Ring v={totals.cal} g={goals.cal} col={accent}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:2}}>متبقي اليوم</div>
                  <div style={{fontFamily:"monospace",fontSize:26,fontWeight:700,letterSpacing:-1,color:remain.cal<0?T.red:accent}}>
                    {Math.abs(Math.round(remain.cal))}<span style={{fontSize:12,color:T.muted,fontWeight:400}}>{remain.cal<0?" تجاوزت":" kcal"}</span>
                  </div>
                  <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                    {[{l:"بروتين",r:remain.pro,c:T.pro},{l:"كارب",r:remain.crb,c:T.carb}].map(x=>(
                      <div key={x.l} style={{background:T.card,borderRadius:6,padding:"3px 8px",border:`1px solid ${T.border}`}}>
                        <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:x.r<0?T.red:x.c}}>{Math.abs(Math.round(x.r))}</span>
                        <span style={{fontSize:9,color:T.muted}}>{x.r<0?"↑ ":"  "}غ {x.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <MBar label="بروتين" eaten={totals.pro} goal={goals.protein} color={T.pro}/>
              <MBar label="كربوهيدرات" eaten={totals.crb} goal={goals.carbs} color={T.carb}/>
            </div>

            {/* Add buttons */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button onClick={()=>setShowFood(true)} style={{padding:"14px",borderRadius:12,cursor:"pointer",background:`${accent}15`,border:`1px solid ${accent}66`,color:accent,fontFamily:"'Tajawal',sans-serif",fontSize:14,fontWeight:700,transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=accent} onMouseLeave={e=>e.currentTarget.style.borderColor=`${accent}66`}>
                🍽️ أضف وجبة
              </button>
              <button onClick={()=>setShowWeight(true)} style={{padding:"14px",borderRadius:12,cursor:"pointer",background:T.surf,border:`1px solid ${T.border}`,color:T.text,fontFamily:"'Tajawal',sans-serif",fontSize:14,fontWeight:600,transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.borderHi} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                ⚖️ سجّل الوزن
              </button>
            </div>

            {/* Weight modal */}
            {showWeight&&(
              <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:14,padding:16,display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:T.muted,display:"block",marginBottom:5}}>وزنك اليوم (كغ)</label>
                  <input type="number" step="0.1" value={newWeight} onChange={e=>setNewWeight(e.target.value)} placeholder={lastWeight}
                    style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.hi,fontSize:15,fontFamily:"monospace",outline:"none"}}
                    onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                </div>
                <button onClick={addWeight} style={{padding:"10px 16px",borderRadius:8,background:`linear-gradient(135deg,${accent}cc,${accent})`,border:"none",color:"#000",fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",fontSize:13}}>حفظ</button>
                <button onClick={()=>setShowWeight(false)} style={{padding:"10px 12px",borderRadius:8,background:T.card,border:`1px solid ${T.border}`,color:T.muted,cursor:"pointer",fontSize:13}}>✕</button>
              </div>
            )}

            {/* Food log */}
            {log.length>0&&(
              <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.hi}}>سجل اليوم</span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:T.muted}}>{log.length} صنف</span>
                </div>
                {log.map((e,i)=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<log.length-1?`1px solid ${T.border}`:"none",animation:"su .25s ease forwards"}}>
                    <span style={{fontSize:20,flexShrink:0}}>{e.emoji||"🍴"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.hi,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div>
                      <div style={{fontSize:10,color:T.muted,fontFamily:"monospace",marginTop:1}}>
                        {e.grams?`${e.grams}غ · `:""}
                        <span style={{color:T.pro,fontWeight:700}}>{e.protein}ب</span> ·
                        <span style={{color:T.carb}}> {e.carbs}ك</span>
                      </div>
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:T.cal,flexShrink:0}}>{e.cal}<span style={{fontSize:9,color:T.muted}}> kcal</span></div>
                    <button onClick={()=>removeFood(e.id)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,padding:"4px 6px",borderRadius:6,transition:"color .15s"}}
                      onMouseEnter={x=>x.target.style.color=T.red} onMouseLeave={x=>x.target.style.color=T.muted}>✕</button>
                  </div>
                ))}
                <div style={{padding:"12px 14px",borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,background:T.card}}>
                  {[{l:"سعرات",v:Math.round(totals.cal),u:"kcal",c:T.cal},{l:"بروتين",v:Math.round(totals.pro),u:"غ",c:T.pro},{l:"كارب",v:Math.round(totals.crb),u:"غ",c:T.carb}].map(x=>(
                    <div key={x.l} style={{textAlign:"center"}}>
                      <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:x.c}}>{x.v}<span style={{fontSize:9}}> {x.u}</span></div>
                      <div style={{fontSize:9,color:T.muted,marginTop:1}}>{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {log.length===0&&(
              <div style={{textAlign:"center",padding:"32px 0",color:T.muted}}>
                <div style={{fontSize:36,marginBottom:8,opacity:.3}}>🍽️</div>
                <div style={{fontSize:13}}>سجلك فارغ — اضغط أضف وجبة</div>
              </div>
            )}
          </>
        )}

        {/* WEIGHT TAB */}
        {tab==="weight"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:15,fontWeight:700,color:T.hi}}>📈 تتبع الوزن</div>
            {weightLog.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:T.muted}}>
                <div style={{fontSize:36,marginBottom:8,opacity:.3}}>⚖️</div>
                <div>لا توجد سجلات بعد</div>
                <div style={{fontSize:11,marginTop:4}}>سجل وزنك يومياً من الصفحة الرئيسية</div>
              </div>
            ):(
              <>
                {/* Progress */}
                <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:14,padding:16}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {[
                      {l:"البداية",v:weight+" كغ",c:T.muted},
                      {l:"الآن",v:lastWeight+" كغ",c:accent},
                      {l:"الهدف",v:targetWeight+" كغ",c:T.green},
                    ].map(x=>(
                      <div key={x.l} style={{textAlign:"center",background:T.card,borderRadius:8,padding:"10px 6px",border:`1px solid ${T.border}`}}>
                        <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:x.c}}>{x.v}</div>
                        <div style={{fontSize:10,color:T.muted,marginTop:2}}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:T.muted,marginBottom:6}}>التقدم نحو الهدف</div>
                  <div style={{height:8,background:T.border,borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",background:`linear-gradient(90deg,${accent},${T.green})`,borderRadius:99,
                      width:`${Math.min(100,Math.abs(+weight-lastWeight)/Math.abs(+weight-+targetWeight)*100||0)}%`,
                      transition:"width .8s cubic-bezier(.4,0,.2,1)"}}/>
                  </div>
                  <div style={{fontSize:11,color:accent,marginTop:6,fontFamily:"monospace"}}>
                    {Math.abs(lastWeight-weight).toFixed(1)} كغ من أصل {Math.abs(+weight-+targetWeight).toFixed(1)} كغ
                  </div>
                </div>

                {/* History */}
                <div style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
                  <div style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.hi}}>السجل الأسبوعي</span>
                  </div>
                  {[...weightLog].reverse().slice(0,10).map((w,i)=>(
                    <div key={w.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:i<Math.min(weightLog.length,10)-1?`1px solid ${T.border}`:"none"}}>
                      <span style={{fontSize:12,color:T.muted}}>{w.date}</span>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {i<weightLog.length-1&&(
                          <span style={{fontSize:11,fontFamily:"monospace",color:weightLog[weightLog.length-1-i-1]?.weight>w.weight?T.green:T.red}}>
                            {weightLog[weightLog.length-1-i-1]?.weight>w.weight?"↓":"↑"}
                            {Math.abs(w.weight-(weightLog[weightLog.length-1-i-1]?.weight||w.weight)).toFixed(1)}
                          </span>
                        )}
                        <span style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:T.hi}}>{w.weight} كغ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.surf,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"center"}}>
        <div style={{maxWidth:640,width:"100%",display:"flex"}}>
          {[{id:"home",l:"الرئيسية",ic:"🏠"},{id:"weight",l:"الوزن",ic:"📈"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 6px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"center",borderTop:`2px solid ${tab===t.id?accent:"transparent"}`,transition:"border-color .2s"}}>
              <div style={{fontSize:20}}>{t.ic}</div>
              <div style={{fontSize:10,color:tab===t.id?accent:T.muted,marginTop:2,fontFamily:"'Tajawal',sans-serif"}}>{t.l}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ROOT — App Controller
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const[screen,setScreen]=useState(()=>{
    const s=load("ft_session",null);
    if(!s)return "activation";
    if(s.type==="trial"){
      const elapsed=Date.now()-(s.trialStart||0);
      if(elapsed>72*60*60*1000)return"trial_expired";
    }
    const p=load("ft_profile",null);
    return p?"tracker":"setup";
  });
  const[session,setSession]=useState(()=>load("ft_session",{}));
  const[profile,setProfile]=useState(()=>load("ft_profile",null));
  const[showAdmin,setShowAdmin]=useState(false);
  const[tapCount,setTapCount]=useState(0);

  // Secret admin tap (5 taps on logo)
  function handleLogoTap(){
    const next=tapCount+1;
    setTapCount(next);
    if(next>=5){setShowAdmin(true);setTapCount(0);}
    setTimeout(()=>setTapCount(0),2000);
  }

  function handleActivate(info){
    const s={...info,activatedAt:Date.now()};
    setSession(s);save("ft_session",s);
    const p=load("ft_profile",null);
    setScreen(p?"tracker":"setup");
  }

  function handleTrial(){
    const s={type:"trial",trialStart:Date.now()};
    setSession(s);save("ft_session",s);
    setScreen("setup");
  }

  function handleSetupDone(p){
    setProfile(p);save("ft_profile",p);
    setScreen("tracker");
  }

  function handleReset(){
    save("ft_profile",null);
    setProfile(null);
    setScreen("setup");
  }

  function handleFullReset(){
    ["ft_session","ft_profile","ft_streak"].forEach(k=>localStorage.removeItem(k));
    setSession({});setProfile(null);setScreen("activation");
  }

  const gymId=session?.gymId||null;

  return(
    <>
      {showAdmin&&<AdminPanel onClose={()=>setShowAdmin(false)}/>}

      {/* Hidden admin trigger */}
      <div onClick={handleLogoTap} style={{position:"fixed",top:0,right:0,width:60,height:40,zIndex:50,cursor:"default"}}/>

      {screen==="activation"&&<ActivationScreen trialExpired={false} onActivate={handleActivate} onTrial={handleTrial}/>}
      {screen==="trial_expired"&&<ActivationScreen trialExpired={true} onActivate={handleActivate} onTrial={null}/>}
      {screen==="setup"&&<Setup gymId={gymId} onDone={handleSetupDone}/>}
      {screen==="tracker"&&profile&&<Tracker profile={profile} session={session} onReset={handleReset}/>}
    </>
  );
}

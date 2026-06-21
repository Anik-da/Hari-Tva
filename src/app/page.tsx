"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Zap, Globe, Activity, Leaf, ArrowRight, MessageSquare,
  ChevronDown, Camera, Map, Sparkles, Check,
  Sliders, CheckCircle2
} from "lucide-react";

// Safe dynamic import for WebGL ThreeGlobe component to prevent hydration blocks
const ThreeGlobe = dynamic(() => import("@/components/ThreeGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-72 h-72 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    </div>
  )
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.06 } }
};

function splitSimpleText(text: string) {
  // Matches parenthetical pattern: (Simple: ...) or (ಸರಳವಾಗಿ: ...)
  const parenRegex = /\s*\((Simple|Simple explanation|सरल भाषा में|सहज शब्दों में|সহজ কথায়|ಸರಳವಾಗಿ|ಸರಳವಾಗಿ ಹೇಳುವುದಾದರೆ):\s*([^)]+)\)/i;
  let match = text.match(parenRegex);
  if (match) {
    const main = text.replace(parenRegex, "").trim();
    const simple = match[2].trim();
    return { main, simple };
  }

  // Matches leading colon pattern: Simple explanation: ...
  const colonRegex = /^(Simple|Simple explanation|सरल भाषा में|सहज शब्दों में|সহজ কথায়|ಸರಳವಾಗಿ|ಸರಳವಾಗಿ ಹೇಳುವುದಾದರೆ):\s*(.+)$/i;
  match = text.match(colonRegex);
  if (match) {
    return { main: "", simple: match[2].trim() };
  }

  return { main: text, simple: null };
}

function renderDescription(text: string, align: "center" | "left" = "center") {
  const { main, simple } = splitSimpleText(text);
  const alignClass = align === "center" ? "mx-auto text-center justify-center" : "text-left justify-start";
  return (
    <div className={`space-y-3 max-w-2xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      {main && <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{main}</p>}
      {simple && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded text-[11px] text-emerald-400 font-medium ${alignClass}`}>
          <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span>{simple}</span>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [lang, setLang] = useState<"en" | "hi" | "bn" | "kn">("en");
  
  // Carbon Simulator State
  const [solarPercent, setSolarPercent] = useState<number>(55);
  const [transitMiles, setTransitMiles] = useState<number>(25);
  const [dietIndex, setDietIndex] = useState<number>(1); // 0: Vegan, 1: Vegetarian, 2: Omnivore, 3: Carnivore
  const [simRating, setSimRating] = useState<number>(85);
  const [simCO2, setSimCO2] = useState<number>(8.4);

  useEffect(() => {
    // Recalculate simulator metrics in real time
    const baseTransit = transitMiles * 0.38; // gas vehicle co2 coef
    const baseEnergy = (1 - solarPercent / 100) * 11.2;
    const baseDiet = dietIndex === 0 ? 0.9 : dietIndex === 1 ? 1.5 : dietIndex === 2 ? 2.4 : 3.6;
    const computedCO2 = parseFloat((baseTransit + baseEnergy + baseDiet).toFixed(1));
    const computedScore = Math.max(10, Math.min(100, Math.round(100 - (computedCO2 * 2.4))));
    
    setSimCO2(computedCO2);
    setSimRating(computedScore);
  }, [solarPercent, transitMiles, dietIndex]);

  const translations = {
    en: {
      nav: { impact: "Impact", simulations: "Simulator", toolkit: "Toolkit", faq: "FAQ", launch: "Launch Platform" },
      hero: {
        tag: "SUSTAINABLE FUTURE IN REAL TIME",
        title1: "The human-centered",
        title2: "carbon intelligence",
        desc: "An elegant, easy-to-use tool to track, simulate, and reduce your daily carbon footprint (pollution). Check your electricity bills, calculate driving impact, and make green choices to earn rewards.",
        statusTitle: "Personal Carbon Status",
        sync: "Active Sync",
        reduction: "Reduction Rate",
        netFootprint: "Net Footprint",
        ecoRating: "Eco Rating",
        openDashboard: "Open Dashboard",
        runSimulation: "Run Simulation",
        simpleLabel: "Simple explanation: This card tracks how much carbon/pollution your lifestyle saves compared to normal households."
      },
      stats: {
        title: "Global Progress",
        desc: "Global verified ecological savings and certified carbon offsets cataloged across our planetary nodes.",
        items: [
          { title: "Grid Energy Offset", sub: "Clean power replacement" },
          { title: "Clean Miles Logged", sub: "Electric rail & EV travels" },
          { title: "Waste Diverted", sub: "Recycled and processed locally" },
          { title: "Forest Equivalent", sub: "Net biological offset equivalent" }
        ]
      },
      simulator: {
        title: "Carbon Simulator",
        desc: "Dynamically adjust your lifestyle variables to instantly preview algorithmic projections of environmental rating adjustments.",
        parameters: "Parameters (Lifestyle Habits)",
        interactiveModeler: "Interactive Modeler",
        renewableShare: "Renewable Energy Share (Solar/Wind)",
        commuteMiles: "Daily commute miles (Driving/Transit)",
        dietaryProfile: "Dietary Profile (Food Choices)",
        dietTypes: ["Vegan", "Vegetarian", "Omnivore", "Carnivore"],
        note: "Interactive modeling parameters update environmental rating metrics using carbon science databases.",
        projection: "Simulated Projection",
        scoreTitle: "Eco Health Score",
        ratingLabel: "Rating",
        footprintLabel: "Daily Carbon Footprint",
        syncState: "Sync simulated state"
      },
      toolkit: {
        title: "AI Sustainability Toolkit",
        desc: "Sophisticated enterprise-grade modules designed to solve complex global footprint measurement challenges.",
        modules: {
          auditor: "EMISSIONS AUDITOR",
          calcTitle: "Carbon Calculator",
          calcDesc: "Detailed profiling of energy, daily transit, food, and aviation logs.",
          commute: "Commute",
          utility: "Utility Energy",
          totalEmissions: "Total Emissions",
          copilot: "PERSONALIZED CO-PILOT",
          mentorTitle: "AI Mentor",
          mentorDesc: "Chat workspace providing dynamic mitigation advisories to lower carbon indices.",
          recommendation: "Recommendation",
          recVal: '"Transitioning domestic commutes to electric rail updates your eco-rating index by +12%."',
          scannerTitle: "LCA Scanner",
          scannerDesc: "Scan products or receipts via computer vision to identify direct lifecycle ratings.",
          scannerBadge: "GRADE A+ SUSTAINABLE",
          routing: "ECO ROUTING",
          routerTitle: "Travel Router",
          routerDesc: "Real-time footprint comparison algorithms across global transit networks.",
          highSpeed: "High-Speed Transit",
          aviation: "Commercial Aviation"
        },
        launchCenter: "Launch platform command center"
      },
      missions: {
        title: "Daily Missions",
        desc: "Execute targeted daily operational tasks to establish sustainable habits and progressively optimize your simulated carbon indices.",
        viewActive: "View Active Missions",
        tasks: [
          "De-energize standby home electronics and peripheral devices",
          "Transition to zero-plastic grocery workflows and reusable containers",
          "Analyze and optimize utility invoice billing consumption patterns"
        ]
      },
      leaderboard: {
        title: "Leaderboards",
        desc: "Benchmark your net footprint reductions against active municipal datasets to acquire certified community standings.",
        isoBadge: "ISO-14064 COMPLIANT INDEX"
      },
      faq: {
        title: "System FAQ",
        desc: "Core configuration definitions and platform specifications. Consult the integrated AI Mentor for detailed operational guides.",
        queryAdvisor: "Query AI Advisor"
      },
      aiEngine: {
        title: "AI Engine Powered by Hugging Face",
        desc: "We leverage premium serverless open-weights models optimized for high-performance reasoning, natural language translation, and complex computer vision."
      }
    },
    hi: {
      nav: { impact: "असर (Impact)", simulations: "सिम्युलेटर (Simulator)", toolkit: "टूलकिट (Toolkit)", faq: "पूछे जाने वाले प्रश्न (FAQ)", launch: "प्लेटफॉर्म लॉन्च करें" },
      hero: {
        tag: "सच्चे समय में सुरक्षित भविष्य",
        title1: "मानव-केंद्रित",
        title2: "कार्बन इंटेलिजेंस",
        desc: "अपने दैनिक कार्बन प्रदूषण (फुटप्रिंट) को मापने, अनुकरण करने और कम करने के लिए एक आसान टूल। अपने बिजली के बिल की जांच करें, वाहन चलाने के प्रभाव की गणना करें और हरित विकल्पों के लिए पुरस्कार अर्जित करें।",
        statusTitle: "व्यक्तिगत कार्बन स्थिति",
        sync: "सक्रिय सिंक",
        reduction: "बचत दर",
        netFootprint: "कुल फुटप्रिंट",
        ecoRating: "इको रेटिंग",
        openDashboard: "डैशबोर्ड खोलें",
        runSimulation: "सिम्युलेटर चलाएं",
        simpleLabel: "सरल भाषा में: यह कार्ड दिखाता है कि सामान्य परिवारों की तुलना में आपकी जीवनशैली कितना प्रदूषण बचाती है।"
      },
      stats: {
        title: "वैश्विक प्रगति (Global Progress)",
        desc: "हमारे सिस्टम में दर्ज की गई पर्यावरण सुरक्षा और प्रदूषण में कुल कमी। (सरल भाषा में: सभी उपयोगकर्ताओं द्वारा मिलकर कुल बचाया गया कार्बन और कचरा)",
        items: [
          { title: "ग्रिड ऊर्जा बचत", sub: "स्वच्छ बिजली प्रतिस्थापन" },
          { title: "साफ यात्रा मील", sub: "इलेक्ट्रिक ट्रेन और ईवी यात्राएं" },
          { title: "डायवर्ट किया गया कचरा", sub: "स्थानीय रूप से पुनर्चक्रित किया गया" },
          { title: "वन के बराबर लाभ", sub: "शुद्ध जैविक वनस्पति लाभ" }
        ]
      },
      simulator: {
        title: "कार्बन सिम्युलेटर",
        desc: "नीचे अपनी जीवनशैली की आदतों को बदलें और तुरंत देखें कि पर्यावरण को कितना फायदा होगा। (सरल भाषा में: ड्राइविंग या बिजली की आदतें बदलने पर पृथ्वी को कितना लाभ होता है, यह देखने के लिए नियंत्रणों को खिसकाएं)",
        parameters: "पैरामीटर (जीवनशैली की आदतें)",
        interactiveModeler: "इंटरैक्टिव मॉडलर",
        renewableShare: "अक्षय ऊर्जा हिस्सेदारी (सौर/पवन)",
        commuteMiles: "दैनिक यात्रा मील (ड्राइविंग/परिवहन)",
        dietaryProfile: "आहार प्रोफाइल (भोजन विकल्प)",
        dietTypes: ["शाकाहारी (Vegan)", "दूध-शाकाहारी (Vegetarian)", "सर्वाहारी (Omnivore)", "मांसाहारी (Carnivore)"],
        note: "वैज्ञानिक डेटाबेस का उपयोग करके आदतों के अनुसार वास्तविक समय में रेटिंग अपडेट की जाती है।",
        projection: "अनुमानित प्रक्षेपण",
        scoreTitle: "इको हेल्थ स्कोर",
        ratingLabel: "रेटिंग",
        footprintLabel: "दैनिक कार्बन फुटप्रिंट",
        syncState: "सिम्युलेटेड स्थिति सिंक करें"
      },
      toolkit: {
        title: "एआई पर्यावरण टूलकिट",
        desc: "आसान सॉफ्टवेयर उपकरण जो आपके दैनिक प्रदूषण को मापने और कम करने में मदद करते हैं। (सरल भाषा में: स्मार्ट टूल्स जो बिल स्कैन करने, यात्रा का मार्ग खोजने और सुझाव देने में मदद करते हैं)",
        modules: {
          auditor: "उत्सर्जन लेखा परीक्षक",
          calcTitle: "कार्बन कैलकुलेटर",
          calcDesc: "बिजली, ड्राइविंग, भोजन और विमान यात्राओं का विस्तृत विश्लेषण।",
          commute: "दैनिक यात्रा",
          utility: "ग्रिड बिजली",
          totalEmissions: "कुल उत्सर्जन",
          copilot: "व्यक्तिगत एआई सहायक",
          mentorTitle: "एआई मेंटर (AI Mentor)",
          mentorDesc: "कार्बन उत्सर्जन को कम करने के लिए व्यक्तिगत और सरल सलाह देने वाला चैट रूम।",
          recommendation: "एआई की सिफारिश",
          recVal: '"अपनी दैनिक यात्रा को इलेक्ट्रिक ट्रेन से करने पर आपकी पर्यावरण रेटिंग में +12% सुधार होगा।"',
          scannerTitle: "एलसीए स्कैनर (LCA Scanner)",
          scannerDesc: "उत्पाद के निर्माण और परिवहन से जुड़े प्रदूषण स्तर का पता लगाने के लिए बिल या रसीद स्कैन करें।",
          scannerBadge: "ग्रेड ए+ पर्यावरण अनुकूल",
          routing: "इको रूटिंग",
          routerTitle: "ट्रैवल राउटर",
          routerDesc: "यात्रा के लिए सबसे कम प्रदूषण फैलाने वाले परिवहन साधनों की तुलना करना।",
          highSpeed: "हाई-स्पीड इलेक्ट्रिक ट्रेन",
          aviation: "विमान यात्रा"
        },
        launchCenter: "प्लेटफ़ॉर्म कमांड सेंटर लॉन्च करें"
      },
      missions: {
        title: "दैनिक कार्य (Daily Missions)",
        desc: "पर्यावरण सुधार की आदतें विकसित करने और अपना स्कोर बेहतर करने के लिए छोटे दैनिक कार्य पूरे करें। (सरल भाषा में: बिजली बचाने और ग्रीन पॉइंट कमाने के आसान काम)",
        viewActive: "सक्रिय मिशन देखें",
        tasks: [
          "स्टैंडबाय इलेक्ट्रॉनिक्स बंद करें (सरल भाषा में: काम न होने पर स्विच बंद कर दें)",
          "प्लास्टिक बैग का उपयोग बंद करें (सरल भाषा में: खरीददारी के लिए कपड़े या कागज के थैलों का उपयोग करें)",
          "बिजली बिल की खपत का विश्लेषण करें (सरल भाषा में: बिजली के बिल की समीक्षा कर यह समझें कि खपत कहां अधिक हो रही है)"
        ]
      },
      leaderboard: {
        title: "लीडरबोर्ड (Leaderboards)",
        desc: "पर्यावरण को बचाने में अपने योगदान की तुलना शहर के अन्य सक्रिय लोगों से करें। (सरल भाषा में: देखें कि समाज में सबसे ज्यादा कार्बन कौन बचा रहा है)",
        isoBadge: "ISO-14064 अनुपालन सूचकांक"
      },
      faq: {
        title: "अक्सर पूछे जाने वाले सवाल (FAQ)",
        desc: "प्लेटफ़ॉर्म के संबंध में बुनियादी जानकारी। विस्तृत गाइड के लिए हमारे एआई मेंटर से संपर्क करें।",
        queryAdvisor: "एआई सलाहकार से पूछें"
      },
      aiEngine: {
        title: "हगिंग फेस द्वारा संचालित एआई इंजन",
        desc: "हम तर्क, अनुवाद और दृष्टि विश्लेषण के लिए अनुकूलित उच्च प्रदर्शन वाले एआई मॉडल का उपयोग करते हैं।"
      }
    },
    bn: {
      nav: { impact: "প্রভাব (Impact)", simulations: "সিমুলেটর (Simulator)", toolkit: "টুলকিট (Toolkit)", faq: "প্রশ্নোত্তর (FAQ)", launch: "প্ল্যাটফর্ম চালু করুন" },
      hero: {
        tag: "রিয়েল-টাইমে সবুজ ভবিষ্যৎ",
        title1: "মানুষ-কেন্দ্রিক",
        title2: "কার্বন ইন্টেলিজেন্স",
        desc: "আপনার প্রতিদিনের কার্বন দূষণ (ফুটপ্রিন্ট) ট্র্যাক করার, পরিমাপ করার এবং কমানোর একটি সহজ টুল। আপনার বিদ্যুৎ বিল পরীক্ষা করুন, গাড়ি চালানোর প্রভাব গণনা করুন এবং পরিবেশ বান্ধব পছন্দের জন্য পুরষ্কার অর্জন করুন।",
        statusTitle: "ব্যক্তিগত কার্বন স্থিতি",
        sync: "সক্রিয় সিঙ্ক",
        reduction: "সঞ্চয় হার",
        netFootprint: "মোট কার্বন ফুটপ্রিন্ট",
        ecoRating: "ইকো রেটিং",
        openDashboard: "ড্যাশবোর্ড খুলুন",
        runSimulation: "সিমুলেটর চালান",
        simpleLabel: "সহজ কথায়: সাধারণ পরিবারের তুলনায় আপনার জীবনযাত্রা কতখানি দূষণ কমিয়েছে তা এই কার্ডটি দেখায়।"
      },
      stats: {
        title: "বিশ্বব্যাপী অগ্রগতি (Global Progress)",
        desc: "আমাদের সিস্টেমে নথিভুক্ত পরিবেশগত নিরাপত্তা এবং দূষণ কমানোর হার। (সহজ কথায়: সমস্ত ব্যবহারকারী একসাথে কতখানি কার্বন ও বর্জ্য বাঁচিয়েছেন)",
        items: [
          { title: "গ্রিড বিদ্যুৎ সাশ্রয়", sub: "পরিচ্ছন্ন শক্তি প্রতিস্থাপন" },
          { title: "পরিচ্ছন্ন যাতায়াত মাইল", sub: "বৈদ্যুতিক ট্রেন ও ইভি যাত্রা" },
          { title: "অপসারিত বর্জ্য", sub: "স্থানীয়ভাবে প্রক্রিয়াজাতকরণ" },
          { title: "বনের সমতুল্য উপকার", sub: "জৈবিক বৃক্ষরোপণ সমতুল্য" }
        ]
      },
      simulator: {
        title: "কার্বন সিমুলেটর",
        desc: "নিচে আপনার দৈনন্দিন অভ্যাস পরিবর্তন করুন এবং অবিলম্বে দেখুন আপনি পরিবেশকে কতখানি বাঁচাতে পারেন। (সহজ কথায়: যাতায়াত বা বিদ্যুৎ ব্যবহারের পরিবর্তন পরিবেশের কতটা উপকার করে তা স্লাইডার টেনে দেখুন)",
        parameters: "প্যারামিটার (জীবনযাত্রার অভ্যাস)",
        interactiveModeler: "ইন্টারেক্টিভ মডেলর",
        renewableShare: "নবায়নযোগ্য বিদ্যুৎ অংশ (সৌর/বায়ু)",
        commuteMiles: "প্রতিদিনের যাতায়াত মাইল (গাড়ি/পরিবহন)",
        dietaryProfile: "খাদ্য তালিকা প্রোফাইল (খাবারের পছন্দ)",
        dietTypes: ["নিরামিষাশী (Vegan)", "দুধ-নিরামিষাশী (Vegetarian)", "সবভুক (Omnivore)", "মাংসাশী (Carnivore)"],
        note: "বৈজ্ঞানিক ডেটাবেস ব্যবহার করে আপনার অভ্যাসের সাথে তাল মিলিয়ে রেটিং সরাসরি আপডেট হয়।",
        projection: "অনুমানিত ফলাফল",
        scoreTitle: "ইকো হেলথ স্কোর",
        ratingLabel: "রেটিং",
        footprintLabel: "প্রতিদিনের কার্বন ফুটপ্রিন্ট",
        syncState: "সিমুলেটেড অবস্থা সিঙ্ক করুন"
      },
      toolkit: {
        title: "এআই পরিবেশ টুলকিট",
        desc: "সহজ সফটওয়্যার টুল যা আপনার প্রতিদিনের দূষণ পরিমাপ ও কমাতে সাহায্য করে। (সহজ কথায়: স্মার্ট টুলস যা রসিদ স্ক্যান করতে, যাতায়াত পথের হিসাব করতে এবং পরামর্শ দিতে ব্যবহৃত হয়)",
        modules: {
          auditor: "নির্গমন অডিটর",
          calcTitle: "কার্বন ক্যালকুলেটর",
          calcDesc: "বিদ্যুৎ, ড্রাইভিং, খাবার এবং বিমান ভ্রমণের বিস্তারিত বিশ্লেষণ।",
          commute: "প্রতিদিনের ভ্রমণ",
          utility: "গ্রিড বিদ্যুৎ",
          totalEmissions: "মোট নির্গমন",
          copilot: "ব্যক্তিগত এআই সহকারী",
          mentorTitle: "এআই মেন্টর (AI Mentor)",
          mentorDesc: "কার্বন নির্গমন কমানোর জন্য সহজ এবং কার্যকরী পরামর্শ পেতে সাহায্য করার চ্যাট রুম।",
          recommendation: "এআই সুপারিশ",
          recVal: '"প্রতিদিনের যাতায়াত বৈদ্যুতিক ট্রেনে পরিবর্তন করলে আপনার পরিবেশ রেটিং +১২% উন্নত হবে।"',
          scannerTitle: "এলসিএ স্ক্যানার (LCA Scanner)",
          scannerDesc: "পণ্যের উৎপাদন ও যাতায়াত জনিত দূষণ পরিমাপের জন্য পণ্যের রসিদ বা ইমেজ স্ক্যান করুন।",
          scannerBadge: "গ্রেড এ+ পরিবেশ বান্ধব",
          routing: "ইকো রাউটিং",
          routerTitle: "ট্রাভেল রাউটার",
          routerDesc: "ভ্রমণের জন্য বিভিন্ন পরিবহন ব্যবস্থার দূষণ পরিমাণের তুলনা।",
          highSpeed: "দ্রুতগতির বৈদ্যুতিক ট্রেন",
          aviation: "বিমান ভ্রমণ"
        },
        launchCenter: "প্ল্যাটফর্ম কমান্ড সেন্টার চালু করুন"
      },
      missions: {
        title: "দৈনিক মিশন (Daily Missions)",
        desc: "পরিবেশ বাঁচানোর ভালো অভ্যাস গড়ে তুলতে এবং নিজের স্কোর বাড়াতে ছোট ছোট দৈনিক কাজ সম্পূর্ণ করুন। (সহজ কথায়: বিদ্যুৎ বাঁচানো এবং ইকো পয়েন্ট জেতার সহজ কাজ)",
        viewActive: "সক্রিয় মিশন দেখুন",
        tasks: [
          "স্ট্যান্ডবাই ইলেকট্রনিক্স বন্ধ করুন (সহজ কথায়: কাজ শেষ হলে সুইচ বন্ধ করে দিন)",
          "প্লাস্টিকের ব্যবহার বন্ধ করুন (সহজ কথায়: কেনাকাটার জন্য কাপড় বা কাগজের থলে ব্যবহার করুন)",
          "বিদ্যুৎ বিলের বিবরণী পর্যালোচনা করুন (সহজ কথায়: আপনার ব্যবহারের ধরণ বুঝতে বিদ্যুৎ বিল ভালভাবে চেক করুন)"
        ]
      },
      leaderboard: {
        title: "লিডারবোর্ড (Leaderboards)",
        desc: "পরিবেশ রক্ষায় আপনার অবদানের তুলনা এলাকার অন্যান্য সক্রিয় নাগরিকদের সাথে করুন। (সহজ কথায়: দেখুন সমাজে কে সবচেয়ে বেশি পরিবেশ বাঁচাচ্ছে)",
        isoBadge: "ISO-14064 অনুগত সূচক"
      },
      faq: {
        title: "প্রশ্নোত্তর (FAQ)",
        desc: "প্ল্যাটফর্মের সাধারণ তথ্যাদি। বিস্তারিত পরামর্শের জন্য আমাদের এআই উপদেষ্টার সাহায্য নিন।",
        queryAdvisor: "এআই উপদেষ্টাকে জিজ্ঞাসা করুন"
      },
      aiEngine: {
        title: "হাগিং ফেস দ্বারা চালিত এআই ইঞ্জিন",
        desc: "আমরা চিন্তা, অনুবাদ এবং দৃষ্টি বিশ্লেষণের জন্য উপযুক্ত ও উচ্চক্ষমতাসম্পন্ন এআই মডেল ব্যবহার করি।"
      }
    },
    kn: {
      nav: { impact: "ಪರಿಣಾಮ (Impact)", simulations: "ಸಮ್ಯುಲೇಟರ್ (Simulator)", toolkit: "ಟೂಲ್‌ಕಿಟ್ (Toolkit)", faq: "ಪ್ರಶ್ನೋತ್ತರ (FAQ)", launch: "ವೇದಿಕೆ ಚಾಲನೆ ಮಾಡಿ" },
      hero: {
        tag: "ರಿಯಲ್-ಟೈಮ್‌ನಲ್ಲಿ ಹಸಿರು ಭವಿಷ್ಯ",
        title1: "ಮಾನವ-ಕೇಂದ್ರಿತ",
        title2: "ಕಾರ್ಬನ್ ಇಂಟೆಲಿಜೆನ್ಸ್",
        desc: "ನಿಮ್ಮ ದೈನಂದಿನ ಕಾರ್ಬನ್ ಹೆಜ್ಜೆಗುರುತನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು ಕಡಿಮೆ ಮಾಡಲು ಒಂದು ಸುಲಭವಾದ ಸಾಧನ. ನಿಮ್ಮ ವಿದ್ಯುತ್ ಬಿಲ್ ಪರಿಶೀಲಿಸಿ, ಚಾಲನಾ ಪರಿಣಾಮವನ್ನು ಲೆಕ್ಕಹಾಕಿ ಮತ್ತು ಹಸಿರು ಆಯ್ಕೆಗಳಿಗಾಗಿ ಬಹುಮಾನಗಳನ್ನು ಗಳಿಸಿ.",
        statusTitle: "ವೈಯಕ್ತಿಕ ಕಾರ್ಬನ್ ಸ್ಥಿತಿ",
        sync: "ಸಕ್ರಿಯ ಸಿಂಕ್",
        reduction: "ಉಳಿತಾಯ ದರ",
        netFootprint: "ಒಟ್ಟು ಕಾರ್ಬನ್ ಹೆಜ್ಜೆಗುರುತು",
        ecoRating: "ಇಕೋ ರೇಟಿಂಗ್",
        openDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
        runSimulation: "ಸಮ್ಯುಲೇಟರ್ ಚಲಾಯಿಸಿ",
        simpleLabel: "ಸರಳವಾಗಿ ಹೇಳುವುದಾದರೆ: ಸಾಮಾನ್ಯ ಮನೆಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ನಿಮ್ಮ ಜೀವನಶೈಲಿಯು ಎಷ್ಟು ಮಾಲಿನ್ಯವನ್ನು ಉಳಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ಈ ಕಾರ್ಡ್ ತೋರಿಸುತ್ತದೆ."
      },
      stats: {
        title: "ಜಾಗತಿಕ ಪ್ರಗತಿ (Global Progress)",
        desc: "ನಮ್ಮ ಸಿಸ್ಟಮ್‌ನಲ್ಲಿ ದಾಖಲಾದ ಒಟ್ಟು ಪರಿಸರ ಸುರಕ್ಷತೆ ಮತ್ತು ಮಾಲಿನ್ಯ ಇಳಿಕೆ. (ಸರಳವಾಗಿ: ಎಲ್ಲಾ ಬಳಕೆದಾರರು ಒಟ್ಟಾಗಿ ಉಳಿಸಿದ ಒಟ್ಟು ಕಾರ್ಬನ್ ಮತ್ತು ತ್ಯಾಜ್ಯ)",
        items: [
          { title: "ಗ್ರಿಡ್ ವಿದ್ಯುತ್ ಉಳಿತಾಯ", sub: "ಸ್ವಚ್ಛ ವಿದ್ಯುತ್ ಪರ್ಯಾಯ" },
          { title: "ಸ್ವಚ್ಛ ಪ್ರಯಾಣದ ಮೈಲುಗಳು", sub: "ಎಲೆಕ್ಟ್ರಿಕ್ ರೈಲು ಮತ್ತು ಇವಿ ಪ್ರಯಾಣಗಳು" },
          { title: "ಮರುಬಳಕೆ ಮಾಡಿದ ತ್ಯಾಜ್ಯ", sub: "ಸ್ಥಳೀಯವಾಗಿ ಸಂಸ್ಕರಿಸಲ್ಪಟ್ಟಿದೆ" },
          { title: "ಅರಣ್ಯಕ್ಕೆ ಸಮಾನವಾದ ಒಟ್ಟು ಲಾಭ", sub: "ಜೈವಿಕ ವೃಕ್ಷ ಪರಿಸರ ಲಾಭ" }
        ]
      },
      simulator: {
        title: "ಕಾರ್ಬನ್ ಸಮ್ಯುಲೇಟರ್",
        desc: "ನಿಮ್ಮ ಜೀವನಶೈಲಿಯ ಅಭ್ಯಾಸಗಳನ್ನು ಕೆಳಗೆ ಬದಲಾಯಿಸಿ ಮತ್ತು ಪರಿಸರಕ್ಕೆ ಆಗುವ ಲಾಭವನ್ನು ತಕ್ಷಣ ನೋಡಿ. (ಸರಳವಾಗಿ: ಚಾಲನಾ ಅಥವಾ ವಿದ್ಯುತ್ ಅಭ್ಯಾಸಗಳನ್ನು ಬದಲಾಯಿಸುವುದರಿಂದ ಪರಿಸರಕ್ಕೆ ಎಷ್ಟು ಸಹಾಯವಾಗುತ್ತದೆ ಎಂದು ತಿಳಿಯಲು ಕಂಟ್ರೋಲ್ ಬಟನ್ ಚಲಾಯಿಸಿ)",
        parameters: "ಪ್ಯಾರಾಮೀಟರ್‌ಗಳು (ಜೀವನಶೈಲಿ ಅಭ್ಯಾಸಗಳು)",
        interactiveModeler: "ಇಂಟರಾಕ್ಟಿವ್ ಮಾಡೆಲರ್",
        renewableShare: "ನವೀಕರಿಸಬಹುದಾದ ವಿದ್ಯುತ್ ಹಂಚಿಕೆ (ಸೌರ/ಪವನ)",
        commuteMiles: "ದೈನಂದಿನ ಪ್ರಯಾಣ ಮೈಲುಗಳು (ಡ್ರೈವಿಂಗ್/ಸಾರಿಗೆ)",
        dietaryProfile: "ಆಹಾರದ ಪ್ರೊಫೈಲ್ (ಆಹಾರದ ಆಯ್ಕೆಗಳು)",
        dietTypes: ["ಸಂಪೂರ್ಣ ಸಸ್ಯಾಹಾರಿ (Vegan)", "ಹಾಲಿನ ಸಸ್ಯಾಹಾರಿ (Vegetarian)", "ಮಿಶ್ರ ಆಹಾರ (Omnivore)", "ಮಾಂಸಾಹಾರಿ (Carnivore)"],
        note: "ವೈಜ್ಞಾನಿಕ ದತ್ತಸಂಚಯ ಬಳಸಿ ಅಭ್ಯಾಸಗಳಿಗೆ ತಕ್ಕಂತೆ ರೇಟಿಂಗ್ ತಕ್ಷಣ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ.",
        projection: "ಅಂದಾಜು ಪರಿಸರ ಸ್ಕೋರ್",
        scoreTitle: "ಇಕೋ ಹೆಲ್ತ್ ಸ್ಕೋರ್",
        ratingLabel: "ರೇಟಿಂಗ್",
        footprintLabel: "ದೈನಂದಿನ ಕಾರ್ಬನ್ ಹೆಜ್ಜೆಗುರುತು",
        syncState: "ಸಮ್ಯುಲೇಟೆಡ್ ಸ್ಥಿತಿಯನ್ನು ಸಿಂಕ್ ಮಾಡಿ"
      },
      toolkit: {
        title: "ಎಐ ಪರಿಸರ ಟೂಲ್‌ಕಿಟ್",
        desc: "ದೈನಂದಿನ ಮಾಲಿನ್ಯವನ್ನು ಅಳೆಯಲು ಮತ್ತು ಕಡಿಮೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುವ ಸರಳ ಸಾಫ್ಟ್‌ವೇರ್ ಪರಿಕರಗಳು. (ಸರಳವಾಗಿ: ಬಿಲ್‌ಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲು, ಪ್ರಯಾಣ ಮಾರ್ಗದ ಮಾಲಿನ್ಯ ಲೆಕ್ಕಹಾಕಲು ಮತ್ತು ಸಲಹೆ ನೀಡಲು ಎಐ ಪರಿಕರಗಳು)",
        modules: {
          auditor: "ಉತ್ಸರ್ಜನ ಆಡಿಟರ್",
          calcTitle: "ಕಾರ್ಬನ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
          calcDesc: "ವಿದ್ಯುತ್, ಪ್ರಯಾಣ, ಆಹಾರ ಮತ್ತು ವಿಮಾನ ಯಾನದ ಮಾಲಿನ್ಯದ ವಿವರವಾದ ವಿಶ್ಲೇಷಣೆ.",
          commute: "ದೈನಂದಿನ ಪ್ರಯಾಣ",
          utility: "ಗ್ರಿಡ್ ವಿದ್ಯುತ್",
          totalEmissions: "ಒಟ್ಟು ಹೊರಸೂಸುವಿಕೆ",
          copilot: "ವೈಯಕ್ತಿಕ ಎಐ ಸಹಾಯಕ",
          mentorTitle: "ಎಐ ಮಾರ್ಗದರ್ಶಕ (AI Mentor)",
          mentorDesc: "ಕಾರ್ಬನ್ ಹೊರಸೂಸುವಿಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಸಲಹೆ ನೀಡುವ ಚಾಟ್ ರೂಮ್.",
          recommendation: "ಎಐ ಶಿಫಾರಸು",
          recVal: '"ನಿಮ್ಮ ದೈನಂದಿನ ಪ್ರಯಾಣವನ್ನು ಎಲೆಕ್ಟ್ರಿಕ್ ರೈಲಿಗೆ ಬದಲಾಯಿಸುವುದರಿಂದ ನಿಮ್ಮ ಪರಿಸರ ರೇಟಿಂಗ್ +೧೨% ಹೆಚ್ಚಾಗುತ್ತದೆ."',
          scannerTitle: "ಎಲ್‌ಸಿಎ ಸ್ಕ್ಯಾನರ್ (LCA Scanner)",
          scannerDesc: "ಉತ್ಪನ್ನಗಳ ಉತ್ಪಾದನಾ ಮಾಲಿನ್ಯ ತಿಳಿಯಲು ರಸೀದಿ ಅಥವಾ ಫೋಟೋವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
          scannerBadge: "ಗ್ರೇಡ್ ಎ+ ಪರಿಸರ ಸ್ನೇಹಿ",
          routing: "ಇಕೋ ರೌಟಿಂಗ್",
          routerTitle: "ಟ್ರಾವೆಲ್ ರೌಟರ್",
          routerDesc: "ಕಡಿಮೆ ಮಾಲಿನ್ಯ ಕಾರಕ ಸಾರಿಗೆ ಸಾಧನಗಳನ್ನು ಹೋಲಿಸುವುದು.",
          highSpeed: "ವೇಗದ ಎಲೆಕ್ಟ್ರಿಕ್ ರೈಲು",
          aviation: "ವಿಮಾನ ಪ್ರಯಾಣ"
        },
        launchCenter: "ವೇದಿಕೆಯ ಕಮಾಂಡ್ ಸೆಂಟರ್ ಚಾಲನೆ ಮಾಡಿ"
      },
      missions: {
        title: "ದೈನಂದಿನ ಕಾರ್ಯಾಚರಣೆಗಳು (Daily Missions)",
        desc: "ಪರಿಸರ ಸಂರಕ್ಷಣೆಯ ಅಭ್ಯಾಸ ಬೆಳೆಸಿಕೊಳ್ಳಲು ಮತ್ತು ನಿಮ್ಮ ಸ್ಕೋರ್ ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಲು ಪ್ರತಿದಿನ ಸಣ್ಣ ಕಾರ್ಯಗಳನ್ನು ಮಾಡಿ. (ಸರಳವಾಗಿ: ವಿದ್ಯುತ್ ಉಳಿಸಲು ಮತ್ತು ಇಕೋ ಪಾಯಿಂಟ್ ಗಳಿಸಲು ಸರಳ ಕೆಲಸಗಳು)",
        viewActive: "ಸಕ್ರಿಯ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ನೋಡಿ",
        tasks: [
          "ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಬಂದ್ ಮಾಡಿ (ಸರಳವಾಗಿ: ಕೆಲಸ ಮುಗಿದ ನಂತರ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿ)",
          "ಪ್ಲಾಸ್ಟಿಕ್ ಚೀಲ ಬಳಸಬೇಡಿ (ಸರಳವಾಗಿ: ಖರೀದಿಗೆ ಬಟ್ಟೆ ಅಥವಾ ಕಾಗದದ ಚೀಲ ಬಳಸಿ)",
          "ವಿದ್ಯುತ್ ಬಿಲ್ ಬಳಕೆ ವಿಶ್ಲೇಷಿಸಿ (ಸರಳವಾಗಿ: ವಿದ್ಯುತ್ ಬಳಕೆಯ ವಿಧಾನ ತಿಳಿಯಲು ಬಿಲ್ ಪರಿಶೀಲಿಸಿ)"
        ]
      },
      leaderboard: {
        title: "ಲೀಡರ್‌ಬೋರ್ಡ್‌ಗಳು (Leaderboards)",
        desc: "ಪರಿಸರ ಉಳಿಸುವಲ್ಲಿ ನಿಮ್ಮ ಕೊಡುಗೆಯನ್ನು ನಿಮ್ಮ ಊರಿನ ಇತರರೊಂದಿಗೆ ಹೋಲಿಕೆ ಮಾಡಿ ನೋಡಿ. (ಸರಳವಾಗಿ: ಯಾರು ಅತಿ ಹೆಚ್ಚು ಕಾರ್ಬನ್ ಉಳಿಸುತ್ತಿದ್ದಾರೆ ಎಂದು ನೋಡಿ)",
        isoBadge: "ISO-14064 ಪ್ರಮಾಣೀಕೃತ ಸೂಚ್ಯಂಕ"
      },
      faq: {
        title: "ಪ್ರಶ್ನೋತ್ತರಗಳು (FAQ)",
        desc: "ವೇದಿಕೆಯ ಸಾಮಾನ್ಯ ಮಾಹಿತಿ. ವಿವರವಾದ ಮಾಹಿತಿಗಾಗಿ ನಮ್ಮ ಎಐ ಮಾರ್ಗದರ್ಶಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        queryAdvisor: "ಎಐ ಸಲಹೆಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ"
      },
      aiEngine: {
        title: "ಹಗ್ಗಿಂಗ್ ಫೇಸ್ ಎಐ ಇಂಜಿನ್ ಚಾಲಿತ",
        desc: "ವಿಶ್ಲೇಷಣೆ, ಭಾಷಾ ಅನುವಾದ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ದೃಷ್ಟಿ ತಂತ್ರಜ್ಞಾನಕ್ಕಾಗಿ ನಾವು ಪ್ರೀಮಿಯಂ ಎಐ ಮಾಡೆಲ್‌ಗಳನ್ನು ಬಳಸುತ್ತೇವೆ."
      }
    }
  };

  const cur = translations[lang];

  const translatedFaqs = {
    en: [
      { q: "What is HariTva's AI Sustainability Operating System?", a: "HariTva is an integrated intelligence platform that helps individuals and enterprises catalog, simulate, and reduce their ecological impact through micro-metric tracking, real-time lifecycle calculations, and predictive modeling." },
      { q: "How is the Eco Score calculated?", a: "Your Eco Score (0-100) measures your net footprint based on energy efficiency, travel choices, food inputs, waste segregation, and community advocacy metrics relative to global science-based targets." },
      { q: "Can we connect real utility invoices?", a: "Yes. Our OCR electricity bill parser and receipt scanner analyze consumption logs and items to calculate direct carbon footprint values instantly using Gemini Vision model." },
      { q: "Is there support for high-contrast accessibility?", a: "Absolutely. HariTva meets WCAG 2.1 AA. Toggle High Contrast Mode in settings to maximize visibility." },
    ],
    hi: [
      { q: "हरित्वा (HariTva) क्या है?", a: "हरित्वा एक स्मार्ट प्लेटफॉर्म है जो हर व्यक्ति और व्यावसायिक संस्थानों को उनके दैनिक प्रदूषण को मापने, अनुमान लगाने और आसान तरीकों से कम करने में मदद करता है।" },
      { q: "इको हेल्थ स्कोर की गणना कैसे की जाती है?", a: "आपका इको स्कोर (0-100) आपकी बिजली की बचत, यात्रा के साधनों, भोजन के विकल्पों, कचरे के सही निपटान और सामाजिक जागरूकता के आधार पर मापा जाता है।" },
      { q: "क्या हम वास्तविक बिजली बिल को जोड़ सकते हैं?", a: "हाँ। आप अपने बिजली के बिल या खरीदारी की रसीद की फोटो अपलोड कर सकते हैं। हमारा एआई स्कैनर फोटो से बिजली खपत और प्रदूषण की गणना तुरंत कर देता है।" },
      { q: "क्या यह आसान हिंदी/स्थानीय भाषाओं में उपलब्ध है?", a: "हाँ, यह प्लेटफॉर्म सभी के लिए सुलभ है। आप हिंदी, बंगाली, कन्नड़ और अंग्रेजी में इसका उपयोग आसानी से कर सकते हैं।" },
    ],
    bn: [
      { q: "হারিতভা (HariTva) কি?", a: "হারিতভা একটি পরিবেশবান্ধব স্মার্ট প্ল্যাটফর্ম যা প্রতিটি মানুষকে তাদের প্রতিদিনের দূষণ পরিমাপ ও কমাতে সাহায্য করে।" },
      { q: "ইকো স্কোর কীভাবে গণনা করা হয়?", a: "আপনার বিদ্যুৎ সাশ্রয়, যাতায়াতের মাধ্যম, খাবারের ধরণ এবং বর্জ্য ব্যবস্থাপনার উপর ভিত্তি করে আপনার ইকো স্কোর (০-১০০) গণনা করা হয়।" },
      { q: "আমরা কি আমাদের আসল বিদ্যুৎ বিল এখানে স্ক্যান করতে পারি?", a: "হ্যাঁ। আপনার বিদ্যুৎ বিল বা ক্রয়ের রসিদের ছবি আপলোড করলে আমাদের এআই স্ক্যানার সরাসরি তা থেকে আপনার কার্বন নির্গমন হিসাব করে দেবে।" },
      { q: "এটি কি বাংলা ভাষায় ব্যবহার করা যায়?", a: "হ্যাঁ। আপনি আপনার সুবিধা অনুযায়ী বাংলা, হিন্দি, কন্নড় বা ইংরেজি ভাষায় এটি ব্যবহার করতে পারবেন।" },
    ],
    kn: [
      { q: "ಹರಿತ್ವ (HariTva) ಎಂದರೇನು?", a: "ಹರಿತ್ವ ಒಂದು ಸುಲಭ ಪರಿಸರ ಸ್ನೇಹಿ ವೇದಿಕೆಯಾಗಿದ್ದು, ಜನರು ತಮ್ಮ ದೈನಂದಿನ ಮಾಲಿನ್ಯವನ್ನು ಅಳೆಯಲು ಮತ್ತು ಕಡಿಮೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ." },
      { q: "ಇಕೋ ಸ್ಕೋರ್ ಅನ್ನು ಹೇಗೆ ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತದೆ?", a: "ನಿಮ್ಮ ವಿದ್ಯುತ್ ಉಳಿತಾಯ, ಪ್ರಯಾಣದ ವಿಧಾನಗಳು, ಆಹಾರದ ಆಯ್ಕೆಗಳು ಮತ್ತು ತ್ಯಾಜ್ಯ ವಿಂಗಡಣೆಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಇಕೋ ಸ್ಕೋರ್ (೦-೧೦೦) ಅನ್ನು ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತದೆ." },
      { q: "ನಾವು ನಮ್ಮ ನಿಜವಾದ ವಿದ್ಯುತ್ ಬಿಲ್ ಅನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದೇ?", a: "ಹೌದು. ನಿಮ್ಮ ವಿದ್ಯುತ್ ಬಿಲ್ ಅಥವಾ ರಸೀದಿಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದರೆ ನಮ್ಮ ಎಐ ಸ್ಕ್ಯಾನರ್ ತಕ್ಷಣವೇ ಮಾಲಿನ್ಯದ ಪ್ರಮಾಣವನ್ನು ಲೆಕ್ಕ ಹಾಕುತ್ತದೆ." },
      { q: "ಇದು ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಲಭ್ಯವಿದೆಯೇ?", a: "ಹೌದು. ಇದು ಕನ್ನಡ, ಹಿಂದಿ, ಬಂಗಾಳಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಭಾಷೆಗಳಲ್ಲಿ ಸುಲಭವಾಗಿ ಲಭ್ಯವಿದೆ." },
    ]
  };

  const stats = [
    { title: cur.stats.items[0].title, value: "320.4 MWh", sub: cur.stats.items[0].sub, icon: Zap, color: "text-[#34d399]" },
    { title: cur.stats.items[1].title, value: "1.24 M mi", sub: cur.stats.items[1].sub, icon: Globe, color: "text-sky-400" },
    { title: cur.stats.items[2].title, value: "82.4 Tonnes", sub: cur.stats.items[2].sub, icon: Activity, color: "text-emerald-400" },
    { title: cur.stats.items[3].title, value: "48.2 k units", sub: cur.stats.items[3].sub, icon: Leaf, color: "text-teal-400" },
  ];

  const leaders = [
    { rank: "01", name: "Aria Thorne", score: "96", co2: "-1.2 T/yr", av: "AT" },
    { rank: "02", name: "Devon Lane", score: "93", co2: "-0.9 T/yr", av: "DL" },
    { rank: "03", name: "Sarah Vance", score: "89", co2: "-0.7 T/yr", av: "SV" },
  ];

  return (
    <div className="relative min-h-screen bg-[#07090e] text-[#f3f4f6] selection:bg-emerald-500/20 selection:text-white grid-dots overflow-x-hidden">
      
      {/* Ambient background glow blooms */}
      <div className="glow-blob-green top-10 left-[-200px] opacity-40" />
      <div className="glow-blob-purple top-[35%] right-[-200px] opacity-25" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07090e]/80 backdrop-blur-xl header-glow">
        <div className="max-w-[1480px] mx-auto px-6 sm:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-extrabold tracking-tight text-white uppercase font-sans">
              Hari<span className="text-emerald-400">Tva</span>
            </span>
            <span className="hidden sm:inline-block text-[8px] text-emerald-400/60 font-bold uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5">OS</span>
          </div>

          <nav className="hidden md:flex gap-8 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <a href="#stats" className="hover:text-emerald-400 transition-colors duration-200">{cur.nav.impact}</a>
            <a href="#simulator" className="hover:text-emerald-400 transition-colors duration-200">{cur.nav.simulations}</a>
            <a href="#toolkit" className="hover:text-emerald-400 transition-colors duration-200">{cur.nav.toolkit}</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors duration-200">{cur.nav.faq}</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Sleek Language Switcher */}
            <select
              id="language-switcher"
              aria-label="Select Language"
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "hi" | "bn" | "kn")}
              className="bg-white/5 border border-white/10 text-emerald-400 text-[10px] px-2.5 py-1.5 rounded uppercase tracking-wider font-semibold hover:border-emerald-500/40 outline-none cursor-pointer transition"
            >
              <option value="en" className="bg-[#07090e] text-slate-300">EN</option>
              <option value="hi" className="bg-[#07090e] text-slate-300">HI (हिन्दी)</option>
              <option value="bn" className="bg-[#07090e] text-slate-300">BN (বাংলা)</option>
              <option value="kn" className="bg-[#07090e] text-slate-300">KN (ಕನ್ನಡ)</option>
            </select>

            <Link href="/dashboard" className="btn-cyber-primary px-5 py-2.5 text-[10px] uppercase cursor-pointer font-bold tracking-wider">
              {cur.nav.launch}
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-[1480px] mx-auto px-6 sm:px-8 py-10 lg:py-16 flex items-center min-h-[calc(100vh-72px)]">
        {/* Ambient emerald glow behind hero text area */}
        <div className="absolute top-[15%] left-[5%] w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Text & Stats Column */}
          <motion.div className="lg:col-span-7 space-y-6 flex flex-col items-center text-center z-20 w-full" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3" /> {cur.hero.tag}
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white font-sans uppercase">
              {cur.hero.title1} <br />
              <span className="text-gradient-neon">{cur.hero.title2}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed mx-auto">
              {cur.hero.desc}
            </motion.p>

            {/* Premium Stats Summary Panel */}
            <motion.div variants={fadeUp} className="glass-hud p-5 w-full max-w-lg mx-auto text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {cur.hero.statusTitle}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {cur.hero.sync}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">{cur.hero.reduction}</span>
                  <span className="text-lg font-bold text-white mt-1 block">45.2%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">{cur.hero.netFootprint}</span>
                  <span className="text-lg font-bold text-white mt-1 block">1.2 T/yr</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">{cur.hero.ecoRating}</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">Grade A</span>
                </div>
              </div>
              <div className="mt-3.5 pt-2.5 border-t border-white/5 flex justify-center">
                {renderDescription(cur.hero.simpleLabel)}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center pt-1.5 w-full">
              <Link href="/dashboard" className="btn-cyber-primary px-6 py-3.5 text-xs uppercase flex items-center gap-2 font-bold tracking-wider">
                {cur.hero.openDashboard} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#simulator" className="btn-cyber-secondary px-6 py-3.5 text-xs uppercase flex items-center justify-center font-semibold tracking-wider">
                {cur.hero.runSimulation}
              </a>
            </motion.div>
          </motion.div>

          {/* Right Globe Column */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-4 lg:py-0 z-10 w-full max-w-[340px] lg:max-w-none mx-auto">
            <ThreeGlobe />
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section id="stats" className="py-20 border-y border-white/5 bg-black/10 px-6 sm:px-8 relative z-20">
        <div className="max-w-[1480px] mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">{cur.stats.title}</h2>
            {renderDescription(cur.stats.desc)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="glass-hud p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                    <Icon className={`w-5.5 h-5.5 ${s.color}`} />
                  </div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">{s.title}</span>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CARBON SIMULATOR ── */}
      <section id="simulator" className="py-24 px-6 sm:px-8 relative z-20 bg-black/20 border-b border-white/5">
        <div className="max-w-[1480px] mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">{cur.simulator.title}</h2>
            {renderDescription(cur.simulator.desc)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
            {/* Control Panel */}
            <div className="lg:col-span-7 glass-hud p-6 sm:p-8 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5"><Sliders className="w-4 h-4" /> {cur.simulator.parameters}</span>
                  <span className="text-[9px] text-slate-500 uppercase">{cur.simulator.interactiveModeler}</span>
                </div>

                <div className="space-y-6">
                  {/* Solar range slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">{cur.simulator.renewableShare}</span><span className="text-emerald-400">{solarPercent}%</span></div>
                    <input id="solar-percent-slider" aria-label={cur.simulator.renewableShare} type="range" min="0" max="100" value={solarPercent} onChange={e => setSolarPercent(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500" />
                  </div>

                  {/* Driving distance slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">{cur.simulator.commuteMiles}</span><span className="text-emerald-400">{transitMiles} mi</span></div>
                    <input id="commute-miles-slider" aria-label={cur.simulator.commuteMiles} type="range" min="0" max="120" value={transitMiles} onChange={e => setTransitMiles(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500" />
                  </div>

                  {/* Diet buttons */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 block uppercase">{cur.simulator.dietaryProfile}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {cur.simulator.dietTypes.map((label, idx) => (
                        <button key={idx} onClick={() => setDietIndex(idx)} 
                          className={`py-2 px-1 rounded border text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${dietIndex === idx ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-white/5 text-slate-400 hover:border-slate-700"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded border border-white/5">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0" />
                <p className="text-xs text-slate-400 leading-normal">{cur.simulator.note}</p>
              </div>
            </div>

            {/* Readout card */}
            <div className="lg:col-span-5 glass-hud p-6 sm:p-8 flex flex-col justify-between text-center relative overflow-hidden">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1.5 font-semibold">{cur.simulator.projection}</span>
                <h4 className="text-xl font-bold text-white uppercase tracking-tight">{cur.simulator.scoreTitle}</h4>
              </div>

              <div className="my-8 flex flex-col items-center justify-center">
                {/* SVG Progress Circle Ring */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="transparent"
                      strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * simRating) / 100}
                      className="transition-all duration-500 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{simRating}</span>
                    <span className="text-[9px] text-slate-450 tracking-wider font-semibold uppercase">{cur.simulator.ratingLabel}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3.5 bg-white/5 rounded border border-white/5 text-xs font-semibold">
                  <span className="text-slate-455">{cur.simulator.footprintLabel}</span>
                  <span className="text-white font-bold">{simCO2} kg CO2e</span>
                </div>
                <Link href="/dashboard" className="btn-cyber-primary w-full py-3.5 rounded text-xs uppercase text-center block cursor-pointer">
                  {cur.simulator.syncState}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLKIT GRID ── */}
      <section id="toolkit" className="py-24 border-y border-white/5 bg-[#07090e]/80 px-6 sm:px-8 relative z-20">
        <div className="max-w-[1480px] mx-auto">
          <div className="text-center space-y-3 mb-20">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">{cur.toolkit.title}</h2>
            {renderDescription(cur.toolkit.desc)}
          </div>

          <div className="flex flex-col gap-8 w-full">
            {/* Top Row */}
            <div className="flex flex-col lg:flex-row gap-8 w-full items-stretch">
              
              {/* Carbon Calculator */}
              <div className="w-full lg:w-2/3 glass-hud p-8 flex flex-col min-h-[280px]">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 font-semibold"><Zap className="w-3.5 h-3.5" /> {cur.toolkit.modules.auditor}</span>
                    <h3 className="text-xl font-bold text-white uppercase">{cur.toolkit.modules.calcTitle}</h3>
                    <p className="text-xs sm:text-sm text-slate-450 max-w-sm mt-1">{cur.toolkit.modules.calcDesc}</p>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded"><Zap className="w-5 h-5 text-indigo-400" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-auto">
                  <div className="bg-white/5 p-3 rounded border border-white/5">
                    <span className="text-slate-450 block uppercase text-[9px] font-semibold">{cur.toolkit.modules.commute}</span>
                    <span className="text-white font-bold block mt-1">120 mi / wk</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded border border-white/5">
                    <span className="text-slate-455 block uppercase text-[9px] font-semibold">{cur.toolkit.modules.utility}</span>
                    <span className="text-white font-bold block mt-1">340 kWh</span>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded border border-emerald-500/20">
                    <span className="text-emerald-400 block uppercase text-[9px] font-bold">{cur.toolkit.modules.totalEmissions}</span>
                    <span className="text-emerald-300 font-bold block mt-1">4.2 Tonnes</span>
                  </div>
                </div>
              </div>

              {/* AI Mentor */}
              <div className="w-full lg:w-1/3 glass-hud p-8 flex flex-col min-h-[280px]">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 font-semibold"><MessageSquare className="w-3.5 h-3.5" /> {cur.toolkit.modules.copilot}</span>
                <h3 className="text-xl font-bold text-white uppercase">{cur.toolkit.modules.mentorTitle}</h3>
                <p className="text-xs sm:text-sm text-slate-450 mt-1">{cur.toolkit.modules.mentorDesc}</p>
                
                <div className="mt-auto bg-white/5 p-4 rounded border border-white/5 text-xs leading-relaxed text-slate-300">
                  <span className="text-emerald-400 block mb-1 text-[9px] font-semibold uppercase">{cur.toolkit.modules.recommendation}</span>
                  {cur.toolkit.modules.recVal}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-col lg:flex-row gap-8 w-full items-stretch">
              
              {/* Product Scanner */}
              <div className="w-full lg:w-1/3 glass-hud p-8 flex flex-col justify-between min-h-[280px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] text-sky-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 font-semibold"><Camera className="w-3.5 h-3.5" /> {cur.toolkit.modules.copilot}</span>
                    <h3 className="text-xl font-bold text-white uppercase">{cur.toolkit.modules.scannerTitle}</h3>
                    <p className="text-xs sm:text-sm text-slate-450 mt-1">{cur.toolkit.modules.scannerDesc}</p>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded flex-shrink-0"><Camera className="w-5 h-5 text-sky-400" /></div>
                </div>
                <div className="mt-auto">
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-4 py-2.5 border border-sky-500/25 rounded block text-center w-full">{cur.toolkit.modules.scannerBadge}</span>
                </div>
              </div>

              {/* Travel Router */}
              <div className="w-full lg:w-2/3 glass-hud p-8 flex flex-col justify-between min-h-[280px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 font-semibold"><Map className="w-3.5 h-3.5" /> {cur.toolkit.modules.routing}</span>
                    <h3 className="text-xl font-bold text-white uppercase">{cur.toolkit.modules.routerTitle}</h3>
                    <p className="text-xs sm:text-sm text-slate-450 mt-1">{cur.toolkit.modules.routerDesc}</p>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded"><Map className="w-5 h-5 text-emerald-400" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-auto">
                  <div>
                    <div className="flex justify-between mb-1.5"><span className="text-slate-450">{cur.toolkit.modules.highSpeed}</span><span className="text-emerald-400 font-bold">12 kg CO2</span></div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: "10%" }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5"><span className="text-slate-455">{cur.toolkit.modules.aviation}</span><span className="text-rose-400 font-bold">184 kg CO2</span></div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full" style={{ width: "85%" }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link href="/dashboard" className="btn-cyber-primary inline-flex items-center gap-2 px-6 py-3.5 rounded text-xs uppercase cursor-pointer font-bold tracking-wider">
              {cur.toolkit.launchCenter} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DAILY MISSIONS ── */}
      <section className="py-24 px-6 sm:px-8 relative z-20 bg-black/10 border-t border-white/5">
        <div className="max-w-[1480px] mx-auto text-center space-y-12 w-full">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">{cur.missions.title}</h2>
            {renderDescription(cur.missions.desc)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { task: cur.missions.tasks[0], pts: "+100 pts", done: true, desc: "Opting for vegan or local vegetarian meals reduces agricultural greenhouse emissions significantly." },
              { task: cur.missions.tasks[1], pts: "+120 pts", done: true, desc: "Minimize vampire power draw by switching off unused electronic devices on standby mode." },
              { task: cur.missions.tasks[2], pts: "+150 pts", done: false, desc: "Use high-speed rail instead of air transit for domestic or short distance travel." }
            ].map((m, i) => (
              <div key={i} className="glass-hud p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded border ${m.done ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/5 text-slate-500"}`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">{m.pts}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">{m.task}</h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed font-normal">{m.desc}</p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">{m.done ? "Completed" : "In Progress"}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition duration-300" />
                </div>
              </div>
            ))}
          </div>

          <div>
            <Link href="/dashboard" className="btn-cyber-secondary px-6 py-3.5 rounded text-xs uppercase inline-block font-semibold tracking-wider">
              {cur.missions.viewActive}
            </Link>
          </div>
        </div>
      </section>

      {/* ── RANKINGS ── */}
      <section className="py-20 border-y border-white/5 bg-[#07090e]/80 px-6 sm:px-8">
        <div className="max-w-[1480px] mx-auto text-center space-y-12 w-full">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">{cur.leaderboard.title}</h2>
            {renderDescription(cur.leaderboard.desc)}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/20 border border-emerald-500/30 rounded text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mt-2">
              <CheckCircle2 className="w-4 h-4" /> {cur.leaderboard.isoBadge}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {leaders.map((l, i) => (
              <div key={i} className="glass-hud p-5 flex items-center justify-between hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm font-bold text-slate-500">{l.rank}</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-sm font-bold flex-shrink-0">{l.av}</div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate uppercase tracking-tight">{l.name}</span>
                    <span className="text-[10px] text-slate-450 block mt-0.5">{l.score} ECO POINTS</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10 block">{l.co2}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-wider block mt-1 font-bold">Net Offset</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-black/10 px-6 sm:px-8">
        <div className="max-w-[1480px] mx-auto text-center space-y-12 w-full">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">{cur.faq.title}</h2>
            {renderDescription(cur.faq.desc)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {translatedFaqs[lang].map((faq, i) => (
              <div key={i} className="glass-hud p-5 flex flex-col justify-between hover:border-white/10 transition-all duration-200">
                <button
                  id={`faq-btn-${i}`}
                  aria-expanded={activeFaq === i}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex justify-between items-start text-left text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition-colors uppercase tracking-tight gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 mt-0.5 ${activeFaq === i ? "rotate-180 text-emerald-400" : ""}`} />
                </button>
                {activeFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-slate-350 leading-relaxed pt-4 mt-4 border-t border-white/5">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <div>
            <Link href="/dashboard" className="btn-cyber-secondary px-6 py-3.5 rounded text-xs uppercase inline-block font-semibold tracking-wider">
              {cur.faq.queryAdvisor}
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACTIVE AI MODELS STATUS PANEL ── */}
      <section className="py-16 px-6 sm:px-8 border-t border-white/5 bg-[#07090e]/50">
        <div className="max-w-[1480px] mx-auto glass-hud p-8 text-center space-y-6 w-full">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{cur.aiEngine.title}</h3>
            {renderDescription(cur.aiEngine.desc)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {[
              { name: "Qwen 2.5 7B Instruct", role: "AI Mentor & Advisor", status: "Active & Latency Optimized" },
              { name: "Qwen 2 VL 7B Instruct", role: "OCR & Document Analysis", status: "Active & GPU Accelerated" },
              { name: "BLIP Image Captioning", role: "Fallback Vision Classifier", status: "Active & Cold-Standby ready" }
            ].map((m, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase block">{m.role}</span>
                  <h4 className="text-xs font-bold text-white mt-1 uppercase">{m.name}</h4>
                </div>
                <div className="flex items-center justify-center gap-1.5 pt-2 text-[8px] font-extrabold text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded bg-emerald-500 animate-pulse" />
                  {m.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-white/5 text-center space-y-4 text-slate-500 bg-black/40">
        <div className="flex justify-center items-center gap-2">
          <Leaf className="text-emerald-500 w-5 h-5" />
          <span className="text-sm font-bold tracking-tight text-white uppercase">HariTva Platform</span>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">© {new Date().getFullYear()} HariTva Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}

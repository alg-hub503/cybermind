/**
 * i18n dictionary for the marketing landing page (v1.1.1).
 *
 * IMPORTANT: Dashboard / Admin / Billing pages remain English-only for now.
 * This is an intentional, documented decision, not an oversight.
 * Full app-wide i18n is planned for v1.2.0 using a dedicated i18n library.
 */

export type Locale = "en" | "ar";

export interface Translation {
  nav: {
    features: string;
    howItWorks: string;
    pricing: string;
    logIn: string;
    startFree: string;
    langLabel: string;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    startFree: string;
    logIn: string;
  };
  features: {
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  preview: {
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  howItWorks: {
    title: string;
    description: string;
    steps: Array<{ step: string; title: string; description: string }>;
  };
  pricing: {
    title: string;
    description: string;
    free: {
      name: string;
      description: string;
      price: string;
      period: string;
      features: string[];
      cta: string;
    };
    pro: {
      name: string;
      description: string;
      price: string;
      period: string;
      badge: string;
      features: string[];
      cta: string;
    };
  };
  security: {
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  cta: {
    title: string;
    description: string;
    startFree: string;
    logIn: string;
  };
  footer: {
    tagline: string;
    features: string;
    pricing: string;
    privacy: string;
    terms: string;
    contact: string;
    copyright: string;
  };
}

export const translations: Record<Locale, Translation> = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How It Works",
      pricing: "Pricing",
      logIn: "Log In",
      startFree: "Start Free",
      langLabel: "عربي",
    },
    hero: {
      badge: "Production Ready SaaS Platform",
      headline: "Your school, run from one place. Not ten.",
      subheadline:
        "One platform. One workflow. One source of truth — for everything your institution needs today, and everything it will need tomorrow.",
      startFree: "Start Free",
      logIn: "Log In",
    },
    features: {
      title: "Why CyberMind?",
      description: "Everything you need to run your school management platform.",
      items: [
        {
          title: "School Management",
          description:
            "Create and manage schools with full CRUD. Organize your educational institutions in one dashboard.",
        },
        {
          title: "User & Role Management",
          description:
            "Role-based access control with ADMIN and USER roles. Manage who sees what.",
        },
        {
          title: "Client Management",
          description:
            "Track clients per school. Add, edit, and delete client records with ease.",
        },
        {
          title: "Invoice Management",
          description:
            "Create and manage invoices per school. Track payments and revenue.",
        },
        {
          title: "Billing & Subscriptions",
          description:
            "Stripe-powered subscription billing with Customer Portal, invoices, and webhook sync.",
        },
        {
          title: "Secure Admin Dashboard",
          description:
            "Full system overview with user management, subscription status, and global statistics.",
        },
      ],
    },
    preview: {
      title: "Platform Preview",
      description: "See what CyberMind looks like in action.",
      items: [
        {
          title: "Dashboard",
          description:
            "Overview of schools, users, clients, and subscription status at a glance.",
        },
        {
          title: "Schools",
          description:
            "Manage multiple educational institutions from a single interface.",
        },
        {
          title: "Clients",
          description:
            "Track and manage clients per school with full CRUD operations.",
        },
        {
          title: "Invoices",
          description:
            "Create, track, and manage invoices with payment status monitoring.",
        },
        {
          title: "Billing",
          description:
            "Stripe-powered subscription management with customer portal access.",
        },
      ],
    },
    howItWorks: {
      title: "How It Works",
      description: "Get started in minutes.",
      steps: [
        {
          step: "1",
          title: "Create Your Account",
          description:
            "Sign up with your email and password. No credit card required to start.",
        },
        {
          step: "2",
          title: "Create a School",
          description:
            "Set up your first school organization. Add details and configure settings.",
        },
        {
          step: "3",
          title: "Invite Users",
          description:
            "Add team members with appropriate roles. ADMIN for full access, USER for scoped access.",
        },
        {
          step: "4",
          title: "Manage Clients & Invoices",
          description:
            "Add clients to your schools, create invoices, and track payments.",
        },
        {
          step: "5",
          title: "Monitor Everything",
          description:
            "Use the dashboard to monitor schools, users, clients, invoices, and subscription status.",
        },
      ],
    },
    pricing: {
      title: "Simple Pricing",
      description: "Start free, upgrade when you need more.",
      free: {
        name: "Free",
        description: "Get started with basic features.",
        price: "$0",
        period: "/month",
        features: [
          "School management",
          "User management",
          "Client management",
          "Invoice management",
          "Basic dashboard",
        ],
        cta: "Get Started",
      },
      pro: {
        name: "Pro",
        description: "Full features for growing teams.",
        price: "$29",
        period: "/month",
        badge: "Most Popular",
        features: [
          "Everything in Free",
          "Stripe subscription billing",
          "Customer portal access",
          "Invoice PDF downloads",
          "Billing history & export",
          "Premium support",
        ],
        cta: "Upgrade Now",
      },
    },
    security: {
      title: "Security & Reliability",
      description: "Built for production from day one.",
      items: [
        {
          title: "Role-Based Access",
          description:
            "Granular permissions with ADMIN and USER roles. Every action is authorized.",
        },
        {
          title: "Secure Authentication",
          description:
            "Powered by NextAuth.js with encrypted sessions and secure password handling.",
        },
        {
          title: "Stripe Billing",
          description:
            "Payment processing handled by Stripe. No sensitive financial data touches our servers.",
        },
        {
          title: "Cloud Hosted",
          description:
            "Deployed on Vercel's global edge network. Enterprise-grade infrastructure.",
        },
        {
          title: "Production Ready",
          description:
            "TypeScript, ESLint, and strict type checking enforced at build time.",
        },
        {
          title: "Privacy First",
          description:
            "Your data is yours. Built with data isolation between schools and users.",
        },
      ],
    },
    cta: {
      title: "Ready to Get Started?",
      description:
        "Create your account now and start managing your schools in minutes.",
      startFree: "Start Free",
      logIn: "Log In",
    },
    footer: {
      tagline: "Smart School Management Platform",
      features: "Features",
      pricing: "Pricing",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
      copyright: "CyberMind. All rights reserved.",
    },
  },

  ar: {
    nav: {
      features: "الميزات",
      howItWorks: "كيف يعمل",
      pricing: "الأسعار",
      logIn: "تسجيل الدخول",
      startFree: "ابدأ مجاناً",
      langLabel: "EN",
    },
    hero: {
      badge: "منصة SaaS جاهزة للإنتاج",
      headline: "مدرستك تُدار من مكان واحد، لا من عشرة.",
      subheadline:
        "منصة واحدة. سير عمل واحد. مصدر حقيقة واحد — لكل ما تحتاجه مؤسستك التعليمية اليوم، وما ستحتاجه غداً.",
      startFree: "ابدأ مجاناً",
      logIn: "تسجيل الدخول",
    },
    features: {
      title: "لماذا CyberMind؟",
      description: "كل ما تحتاجه لإدارة منصة مدرستك.",
      items: [
        {
          title: "إدارة المدارس",
          description:
            "أنشئ وأدر المدارس بتحكم كامل. نظّم مؤسساتك التعليمية في لوحة تحكم واحدة.",
        },
        {
          title: "إدارة المستخدمين والأدوار",
          description:
            "التحكم في الوصول بالأدوار (ADMIN و USER). حدد من يرى ماذا.",
        },
        {
          title: "إدارة العملاء",
          description:
            "تتبع العملاء حسب المدرسة. أضف وعدّل واحذف سجلات العملاء بسهولة.",
        },
        {
          title: "إدارة الفواتير",
          description:
            "أنشئ وأدر الفواتير حسب المدرسة. تتبع المدفوعات والإيرادات.",
        },
        {
          title: "الفواتير والاشتراكات",
          description:
            "فوترة اشتراكات عبر Stripe مع بوابة العملاء والفواتير والمزامنة الآلية.",
        },
        {
          title: "لوحة تحكم آمنة للمشرفين",
          description:
            "نظرة شاملة للنظام مع إدارة المستخدمين وحالة الاشتراك والإحصائيات العامة.",
        },
      ],
    },
    preview: {
      title: "نظرة على المنصة",
      description: "شاهد CyberMind وهي تعمل.",
      items: [
        {
          title: "لوحة التحكم",
          description:
            "نظرة عامة على المدارس والمستخدمين والعملاء وحالة الاشتراك في لمحة.",
        },
        {
          title: "المدارس",
          description: "أدر مؤسسات تعليمية متعددة من واجهة واحدة.",
        },
        {
          title: "العملاء",
          description:
            "تتبع وأدر العملاء حسب المدرسة مع عمليات CRUD كاملة.",
        },
        {
          title: "الفواتير",
          description:
            "أنشئ وتابع وأدر الفواتير مع مراقبة حالة الدفع.",
        },
        {
          title: "الفواتير والاشتراكات",
          description:
            "إدارة اشتراكات Stripe مع بوابة العملاء.",
        },
      ],
    },
    howItWorks: {
      title: "كيف يعمل",
      description: "ابدأ في دقائق.",
      steps: [
        {
          step: "١",
          title: "أنشئ حسابك",
          description:
            "سجّل باستخدام بريدك الإلكتروني وكلمة المرور. لا حاجة لبطاقة ائتمان.",
        },
        {
          step: "٢",
          title: "أنشئ مدرسة",
          description:
            "أنشئ مؤسستك التعليمية الأولى. أضف التفاصيل وضبط الإعدادات.",
        },
        {
          step: "٣",
          title: "ادعُ المستخدمين",
          description:
            "أضف أعضاء الفريق بالأدوار المناسبة. ADMIN للوصول الكامل، USER للوصول المحدد.",
        },
        {
          step: "٤",
          title: "أدر العملاء والفواتير",
          description:
            "أضف عملاء لمدارسك، أنشئ فواتير، وتابع المدفوعات.",
        },
        {
          step: "٥",
          title: "راقب كل شيء",
          description:
            "استخدم لوحة التحكم لمراقبة المدارس والمستخدمين والعملاء والفواتير وحالة الاشتراك.",
        },
      ],
    },
    pricing: {
      title: "أسعار بسيطة",
      description: "ابدأ مجاناً، طوّر عندما تحتاج المزيد.",
      free: {
        name: "مجاني",
        description: "ابدأ بالميزات الأساسية.",
        price: "$0",
        period: "/الشهر",
        features: [
          "إدارة المدارس",
          "إدارة المستخدمين",
          "إدارة العملاء",
          "إدارة الفواتير",
          "لوحة تحكم أساسية",
        ],
        cta: "ابدأ الآن",
      },
      pro: {
        name: "احترافي",
        description: "ميزات كاملة للفرق المتنامية.",
        price: "$29",
        period: "/الشهر",
        badge: "الأكثر طلباً",
        features: [
          "كل ما في المجاني",
          "فوترة اشتراكات Stripe",
          "بوابة العملاء",
          "تنزيل الفواتير PDF",
          "سجل الفواتير والتصدير",
          "دعم متميز",
        ],
        cta: "اشترك الآن",
      },
    },
    security: {
      title: "الأمان والموثوقية",
      description: "مبني للإنتاج من اليوم الأول.",
      items: [
        {
          title: "التحكم في الوصول بالأدوار",
          description:
            "صلاحيات محددة بأدوار ADMIN و USER. كل إجراء مصرح به.",
        },
        {
          title: "توثيق آمن",
          description:
            "مدعوم بـ NextAuth.js مع جلسات مشفرة ومعالجة آمنة لكلمات المرور.",
        },
        {
          title: "فوترة Stripe",
          description:
            "معالجة المدفوعات عبر Stripe. لا تلمس البيانات المالية الحساسة خوادمنا.",
        },
        {
          title: "استضافة سحابية",
          description:
            "منشور على شبكة Vercel العالمية. بنية تحتية على مستوى المؤسسات.",
        },
        {
          title: "جاهز للإنتاج",
          description:
            "TypeScript و ESLint وفحص الأنماط الصارم في وقت البناء.",
        },
        {
          title: "الخصوصية أولاً",
          description:
            "بياناتك ملكك. مبني بعزل البيانات بين المدارس والمستخدمين.",
        },
      ],
    },
    cta: {
      title: "مستعد للبدء؟",
      description: "أنشئ حسابك الآن وابدأ بإدارة مدارسك في دقائق.",
      startFree: "ابدأ مجاناً",
      logIn: "تسجيل الدخول",
    },
    footer: {
      tagline: "منصة إدارة مدارس ذكية",
      features: "الميزات",
      pricing: "الأسعار",
      privacy: "الخصوصية",
      terms: "الشروط",
      contact: "اتصل بنا",
      copyright: "CyberMind. جميع الحقوق محفوظة.",
    },
  },
};

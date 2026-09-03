/**
 * i18n dictionary for the marketing landing page (v1.1.1).
 *
 * IMPORTANT: Dashboard / Admin / Billing pages remain English-only for now.
 * This is an intentional, documented decision, not an oversight.
 * Full app-wide i18n is planned for v1.2.0 using a dedicated i18n library.
 */

export type Locale = "en" | "ar" | "fr";

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

  fr: {
    nav: {
      features: "Fonctionnalités",
      howItWorks: "Comment ça marche",
      pricing: "Tarifs",
      logIn: "Connexion",
      startFree: "Commencer gratuitement",
      langLabel: "AR",
    },
    hero: {
      badge: "Plateforme SaaS prête pour la production",
      headline: "Votre école, gérée depuis un seul endroit. Pas dix.",
      subheadline:
        "Une plateforme. Un workflow. Une seule source de vérité — pour tout ce dont votre établissement a besoin aujourd'hui, et tout ce qu'il aura besoin demain.",
      startFree: "Commencer gratuitement",
      logIn: "Connexion",
    },
    features: {
      title: "Pourquoi CyberMind ?",
      description: "Tout ce dont vous avez besoin pour gérer votre plateforme scolaire.",
      items: [
        {
          title: "Gestion des écoles",
          description:
            "Créez et gérez les écoles avec un CRUD complet. Organisez vos établissements éducatifs dans un seul tableau de bord.",
        },
        {
          title: "Gestion des utilisateurs et des rôles",
          description:
            "Contrôle d'accès basé sur les rôles avec les rôles ADMIN et USER. Gérez qui voit quoi.",
        },
        {
          title: "Gestion des clients",
          description:
            "Suivez les clients par école. Ajoutez, modifiez et supprimez les enregistrements clients facilement.",
        },
        {
          title: "Gestion des factures",
          description:
            "Créez et gérez les factures par école. Suivez les paiements et les revenus.",
        },
        {
          title: "Facturation et abonnements",
          description:
            "Facturation d'abonnements par Stripe avec portail client, factures et synchronisation webhook.",
        },
        {
          title: "Tableau de bord admin sécurisé",
          description:
            "Vue d'ensemble complète du système avec gestion des utilisateurs, statut des abonnements et statistiques globales.",
        },
      ],
    },
    preview: {
      title: "Aperçu de la plateforme",
      description: "Découvrez CyberMind en action.",
      items: [
        {
          title: "Tableau de bord",
          description:
            "Vue d'ensemble des écoles, utilisateurs, clients et statut des abonnements en un coup d'œil.",
        },
        {
          title: "Écoles",
          description:
            "Gérez plusieurs établissements éducatifs depuis une seule interface.",
        },
        {
          title: "Clients",
          description:
            "Suivez et gérez les clients par école avec des opérations CRUD complètes.",
        },
        {
          title: "Factures",
          description:
            "Créez, suivez et gérez les factures avec surveillance de l'état des paiements.",
        },
        {
          title: "Facturation",
          description:
            "Gestion des abonnements par Stripe avec accès au portail client.",
        },
      ],
    },
    howItWorks: {
      title: "Comment ça marche",
      description: "Commencez en quelques minutes.",
      steps: [
        {
          step: "1",
          title: "Créez votre compte",
          description:
            "Inscrivez-vous avec votre email et mot de passe. Aucune carte de crédit requise pour commencer.",
        },
        {
          step: "2",
          title: "Créez une école",
          description:
            "Configurez votre premier établissement scolaire. Ajoutez les détails et configurez les paramètres.",
        },
        {
          step: "3",
          title: "Invitez des utilisateurs",
          description:
            "Ajoutez des membres de l'équipe avec les rôles appropriés. ADMIN pour l'accès complet, USER pour l'accès limité.",
        },
        {
          step: "4",
          title: "Gérez les clients et les factures",
          description:
            "Ajoutez des clients à vos écoles, créez des factures et suivez les paiements.",
        },
        {
          step: "5",
          title: "Surveillez tout",
          description:
            "Utilisez le tableau de bord pour surveiller les écoles, utilisateurs, clients, factures et le statut des abonnements.",
        },
      ],
    },
    pricing: {
      title: "Tarifs simples",
      description: "Commencez gratuitement, passez à la version supérieure quand vous en avez besoin.",
      free: {
        name: "Gratuit",
        description: "Commencez avec les fonctionnalités de base.",
        price: "0 $",
        period: "/mois",
        features: [
          "Gestion des écoles",
          "Gestion des utilisateurs",
          "Gestion des clients",
          "Gestion des factures",
          "Tableau de bord de base",
        ],
        cta: "Commencer",
      },
      pro: {
        name: "Pro",
        description: "Fonctionnalités complètes pour les équipes en croissance.",
        price: "29 $",
        period: "/mois",
        badge: "Le plus populaire",
        features: [
          "Tout le forfait Gratuit",
          "Facturation d'abonnements Stripe",
          "Accès au portail client",
          "Téléchargement des factures PDF",
          "Historique de facturation et export",
          "Support premium",
        ],
        cta: "Passer à la version Pro",
      },
    },
    security: {
      title: "Sécurité et fiabilité",
      description: "Conçu pour la production dès le premier jour.",
      items: [
        {
          title: "Accès basé sur les rôles",
          description:
            "Permissions granulaires avec les rôles ADMIN et USER. Chaque action est autorisée.",
        },
        {
          title: "Authentification sécurisée",
          description:
            "Propulsé par NextAuth.js avec des sessions chiffrées et une gestion sécurisée des mots de passe.",
        },
        {
          title: "Facturation Stripe",
          description:
            "Traitement des paiements par Stripe. Aucune donnée financière sensible ne touche nos serveurs.",
        },
        {
          title: "Hébergement cloud",
          description:
            "Déployé sur le réseau mondial de Vercel. Infrastructure de niveau entreprise.",
        },
        {
          title: "Prêt pour la production",
          description:
            "TypeScript, ESLint et vérification stricte des types appliqués lors de la compilation.",
        },
        {
          title: "Confidentialité d'abord",
          description:
            "Vos données vous appartiennent. Conçu avec isolation des données entre les écoles et les utilisateurs.",
        },
      ],
    },
    cta: {
      title: "Prêt à commencer ?",
      description:
        "Créez votre compte maintenant et commencez à gérer vos écoles en quelques minutes.",
      startFree: "Commencer gratuitement",
      logIn: "Connexion",
    },
    footer: {
      tagline: "Plateforme de gestion scolaire intelligente",
      features: "Fonctionnalités",
      pricing: "Tarifs",
      privacy: "Confidentialité",
      terms: "Conditions",
      contact: "Contact",
      copyright: "CyberMind. Tous droits réservés.",
    },
  },
};

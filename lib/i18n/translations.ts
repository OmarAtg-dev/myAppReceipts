type TranslationValues = Record<string, string | number>;

export type LanguageCode = "en" | "es" | "fr" | "ar" | "darija";

const baseTranslations = {
  "app.name": "Expensio",
  "app.tagline": "Expensio. The smarter way to track your money.",
  "language.en": "English",
  "language.es": "Español",
  "language.fr": "Français",
  "language.ar": "العربية",
  "language.darija": "الدارجة",
  "header.login": "Login",
  "header.myReceipts": "My Receipts",
  "header.managePlan": "Manage plan",
  "header.language": "Language",
  "hero.title": "Intelligent Receipt Scanning",
  "hero.subtitle":
    "Scan, analyze, and organize your receipts with AI-powered precision. Save time and gain insights from your expenses.",
  "hero.ctaPrimary": "Get Started",
  "hero.ctaSecondary": "Learn more",
  "dropzone.signInAlert": "Please sign in to upload files",
  "dropzone.pdfOnly": "Please drop only PDF files.",
  "dropzone.uploading": "Uploading...",
  "dropzone.signInToUpload": "Please sign in to upload files",
  "dropzone.dragDrop":
    "Drag and drop PDF files here, or click to select files",
  "dropzone.selectFiles": "Select files",
  "dropzone.upgradeToUpload": "Upgrade to upload",
  "dropzone.limitExceeded":
    "You have exceeded your limit of {count} scans. Please upgrade to continue.",
  "dropzone.uploadedFilesTitle": "Uploaded files:",
  "dropzone.uploadFailed": "Upload failed: {message}",
  "features.title": "Powerful Features",
  "features.subtitle":
    "Our AI-powered platform transforms how you handle receipts and track expenses.",
  "features.easyUploads.title": "Easy Uploads",
  "features.easyUploads.description":
    "Drag and drop your PDF receipts for instant scanning and processing.",
  "features.aiAnalysis.title": "AI Analysis",
  "features.aiAnalysis.description":
    "Automatically extract and categorize expense data with intelligent AI.",
  "features.expenseInsights.title": "Expense Insights",
  "features.expenseInsights.description":
    "Generate reports and gain valuable insights from your spending patterns.",
  "pricing.title": "Simple Pricing",
  "pricing.subtitle": "Choose the plan that works the best for your needs.",
  "pricing.perMonth": "/month",
  "pricing.free.title": "Free",
  "pricing.free.description": "Free tier for everyone to try!",
  "pricing.free.price": "$0.00",
  "pricing.free.cta": "Sign Up Free",
  "pricing.free.b1": "2 scans per month",
  "pricing.free.b2": "Basic data extraction",
  "pricing.free.b3": "7-day history",
  "pricing.starter.title": "Starter",
  "pricing.starter.description": "A taste of expense tracking goodness!",
  "pricing.starter.price": "$4.99",
  "pricing.starter.cta": "Sign Up",
  "pricing.starter.b1": "50 scans per month",
  "pricing.starter.b2": "Enhanced data extraction",
  "pricing.starter.b3": "30-day history",
  "pricing.starter.b4": "Basic export options",
  "pricing.pro.title": "Pro",
  "pricing.pro.description": "Pro features for the power user!",
  "pricing.pro.price": "$9.99",
  "pricing.pro.cta": "Go Pro",
  "pricing.pro.ribbon": "Popular",
  "pricing.pro.b1": "300 scans per month",
  "pricing.pro.b2": "Advanced AI data extraction",
  "pricing.pro.b3": "AI summaries",
  "pricing.pro.b4": "Expense categories & tags",
  "cta.title": "Start Scanning Today",
  "cta.subtitle":
    "Join thousands of users who save time and gain insights from their receipts.",
  "footer.tagline": "Expensio. The smarter way to track your money.",
  "receipts.signInPrompt": "Please sign in to view your receipts.",
  "receipts.loading": "Loading receipts...",
  "receipts.empty": "No receipts have been uploaded yet.",
  "receipts.title": "Your Receipts",
  "receipts.table.name": "Name",
  "receipts.table.uploaded": "Uploaded",
  "receipts.table.size": "Size",
  "receipts.table.total": "Total",
  "receipts.table.status": "Status",
  "receipt.back": "Back to Receipts",
  "receipt.notFoundTitle": "Receipt Not Found",
  "receipt.notFoundMessage":
    "The receipt you're looking for doesn't exist or has been removed.",
  "receipt.returnHome": "Return Home",
  "receipt.fileInfo.title": "File Information",
  "receipt.fileInfo.uploaded": "Uploaded",
  "receipt.fileInfo.size": "Size",
  "receipt.fileInfo.type": "Type",
  "receipt.fileInfo.id": "ID",
  "receipt.pdfPreview": "PDF Preview",
  "receipt.viewPdf": "View PDF",
  "receipt.details.title": "Receipt Details",
  "receipt.details.merchantTitle": "Merchant Information",
  "receipt.details.name": "Name",
  "receipt.details.address": "Address",
  "receipt.details.contact": "Contact",
  "receipt.details.transactionTitle": "Transaction Details",
  "receipt.details.date": "Date",
  "receipt.details.amount": "Amount",
  "receipt.summary.title": "AI Summary",
  "receipt.summary.hint": "AI-generated summary based on receipt data",
  "receipt.summary.lockedTitle": "AI Summary",
  "receipt.summary.lockedMessage": "AI summary is a PRO level feature",
  "receipt.summary.lockedCta": "Upgrade to Unlock",
  "receipt.summary.lockedHint":
    "Get AI-powered insights from your receipts",
  "status.pending": "Pending",
  "status.processed": "Processed",
  "status.failed": "Failed",
  "managePlan.title": "Manage your plan",
  "managePlan.subtitle":
    "Manage your subscription and billing details here.",
} as const;

export type TranslationKey = keyof typeof baseTranslations;
type LanguageTranslations = Record<TranslationKey, string>;

const createTranslations = (
  overrides: Partial<LanguageTranslations>,
): LanguageTranslations => ({
  ...baseTranslations,
  ...overrides,
});

const es = createTranslations({
  "app.tagline": "Expensio. La forma más inteligente de controlar tu dinero.",
  "header.login": "Iniciar sesión",
  "header.myReceipts": "Mis recibos",
  "header.managePlan": "Gestionar plan",
  "header.language": "Idioma",
  "hero.title": "Escaneo inteligente de recibos",
  "hero.subtitle":
    "Escanea, analiza y organiza tus recibos con precisión impulsada por IA. Ahorra tiempo y obtén información de tus gastos.",
  "hero.ctaPrimary": "Comenzar",
  "hero.ctaSecondary": "Saber más",
  "dropzone.signInAlert": "Inicia sesión para subir archivos",
  "dropzone.pdfOnly": "Por favor, suelta solo archivos PDF.",
  "dropzone.uploading": "Subiendo...",
  "dropzone.signInToUpload": "Inicia sesión para subir archivos",
  "dropzone.dragDrop":
    "Arrastra y suelta archivos PDF aquí o haz clic para seleccionarlos",
  "dropzone.selectFiles": "Seleccionar archivos",
  "dropzone.upgradeToUpload": "Mejorar plan para subir",
  "dropzone.limitExceeded":
    "Has superado tu límite de {count} escaneos. Mejora tu plan para continuar.",
  "dropzone.uploadedFilesTitle": "Archivos subidos:",
  "dropzone.uploadFailed": "Error al subir: {message}",
  "features.title": "Funciones potentes",
  "features.subtitle":
    "Nuestra plataforma con IA transforma la manera de manejar recibos y gastos.",
  "features.easyUploads.title": "Cargas sencillas",
  "features.easyUploads.description":
    "Arrastra y suelta tus recibos PDF para escanear y procesar al instante.",
  "features.aiAnalysis.title": "Análisis con IA",
  "features.aiAnalysis.description":
    "Extrae y clasifica automáticamente los datos de gastos con IA inteligente.",
  "features.expenseInsights.title": "Perspectivas de gastos",
  "features.expenseInsights.description":
    "Genera informes y obtén información valiosa de tus patrones de gasto.",
  "pricing.title": "Precios simples",
  "pricing.subtitle":
    "Elige el plan que mejor se adapte a tus necesidades.",
  "pricing.perMonth": "/mes",
  "pricing.free.title": "Gratis",
  "pricing.free.description": "Plan gratuito para que todos lo prueben.",
  "pricing.free.cta": "Regístrate gratis",
  "pricing.free.b1": "2 escaneos por mes",
  "pricing.free.b2": "Extracción básica de datos",
  "pricing.free.b3": "Historial de 7 días",
  "pricing.starter.title": "Inicial",
  "pricing.starter.description":
    "Una probada del mejor control de gastos.",
  "pricing.starter.cta": "Regístrate",
  "pricing.starter.b1": "50 escaneos por mes",
  "pricing.starter.b2": "Extracción mejorada de datos",
  "pricing.starter.b3": "Historial de 30 días",
  "pricing.starter.b4": "Opciones básicas de exportación",
  "pricing.pro.title": "Pro",
  "pricing.pro.description": "Funciones profesionales para el usuario experto.",
  "pricing.pro.cta": "Hazte Pro",
  "pricing.pro.ribbon": "Popular",
  "pricing.pro.b1": "300 escaneos por mes",
  "pricing.pro.b2": "Extracción avanzada de datos con IA",
  "pricing.pro.b3": "Resúmenes con IA",
  "pricing.pro.b4": "Categorías y etiquetas de gastos",
  "cta.title": "Empieza a escanear hoy",
  "cta.subtitle":
    "Únete a miles de usuarios que ahorran tiempo y obtienen información de sus recibos.",
  "footer.tagline":
    "Expensio. La forma más inteligente de controlar tu dinero.",
  "receipts.signInPrompt": "Inicia sesión para ver tus recibos.",
  "receipts.loading": "Cargando recibos...",
  "receipts.empty": "Todavía no se han subido recibos.",
  "receipts.title": "Tus recibos",
  "receipts.table.name": "Nombre",
  "receipts.table.uploaded": "Subido",
  "receipts.table.size": "Tamaño",
  "receipts.table.total": "Total",
  "receipts.table.status": "Estado",
  "receipt.back": "Volver a recibos",
  "receipt.notFoundTitle": "Recibo no encontrado",
  "receipt.notFoundMessage":
    "El recibo que buscas no existe o ha sido eliminado.",
  "receipt.returnHome": "Volver al inicio",
  "receipt.fileInfo.title": "Información del archivo",
  "receipt.fileInfo.uploaded": "Subido",
  "receipt.fileInfo.size": "Tamaño",
  "receipt.fileInfo.type": "Tipo",
  "receipt.fileInfo.id": "ID",
  "receipt.pdfPreview": "Vista previa del PDF",
  "receipt.viewPdf": "Ver PDF",
  "receipt.details.title": "Detalles del recibo",
  "receipt.details.merchantTitle": "Información del comercio",
  "receipt.details.name": "Nombre",
  "receipt.details.address": "Dirección",
  "receipt.details.contact": "Contacto",
  "receipt.details.transactionTitle": "Detalles de la transacción",
  "receipt.details.date": "Fecha",
  "receipt.details.amount": "Monto",
  "receipt.summary.title": "Resumen con IA",
  "receipt.summary.hint":
    "Resumen generado por IA basado en los datos del recibo",
  "receipt.summary.lockedTitle": "Resumen con IA",
  "receipt.summary.lockedMessage":
    "El resumen con IA es una función del plan Pro",
  "receipt.summary.lockedCta": "Mejorar para desbloquear",
  "receipt.summary.lockedHint":
    "Obtén información con IA de tus recibos",
  "status.pending": "Pendiente",
  "status.processed": "Procesado",
  "status.failed": "Fallido",
  "managePlan.title": "Gestiona tu plan",
  "managePlan.subtitle":
    "Administra aquí tu suscripción y los datos de facturación.",
});

const fr = createTranslations({
  "app.tagline":
    "Expensio. La manière la plus intelligente de suivre votre argent.",
  "header.login": "Se connecter",
  "header.myReceipts": "Mes reçus",
  "header.managePlan": "Gérer le plan",
  "header.language": "Langue",
  "hero.title": "Numérisation intelligente des reçus",
  "hero.subtitle":
    "Scannez, analysez et organisez vos reçus avec une précision alimentée par l'IA. Gagnez du temps et obtenez des informations sur vos dépenses.",
  "hero.ctaPrimary": "Commencer",
  "hero.ctaSecondary": "En savoir plus",
  "dropzone.signInAlert": "Veuillez vous connecter pour téléverser des fichiers",
  "dropzone.pdfOnly": "Veuillez déposer uniquement des fichiers PDF.",
  "dropzone.uploading": "Téléversement...",
  "dropzone.signInToUpload":
    "Veuillez vous connecter pour téléverser des fichiers",
  "dropzone.dragDrop":
    "Glissez-déposez des fichiers PDF ici ou cliquez pour les sélectionner",
  "dropzone.selectFiles": "Sélectionner des fichiers",
  "dropzone.upgradeToUpload": "Mettre à jour pour téléverser",
  "dropzone.limitExceeded":
    "Vous avez dépassé votre limite de {count} scans. Mettez à niveau pour continuer.",
  "dropzone.uploadedFilesTitle": "Fichiers téléversés :",
  "dropzone.uploadFailed": "Échec du téléversement : {message}",
  "features.title": "Fonctionnalités puissantes",
  "features.subtitle":
    "Notre plateforme alimentée par l'IA transforme votre gestion des reçus et des dépenses.",
  "features.easyUploads.title": "Téléversements faciles",
  "features.easyUploads.description":
    "Glissez-déposez vos reçus PDF pour un scan et un traitement instantanés.",
  "features.aiAnalysis.title": "Analyse IA",
  "features.aiAnalysis.description":
    "Extrayez et classez automatiquement les données de dépenses grâce à l'IA.",
  "features.expenseInsights.title": "Analyses des dépenses",
  "features.expenseInsights.description":
    "Générez des rapports et obtenez des informations précieuses sur vos habitudes de dépenses.",
  "pricing.title": "Tarification simple",
  "pricing.subtitle":
    "Choisissez le plan qui correspond le mieux à vos besoins.",
  "pricing.perMonth": "/mois",
  "pricing.free.title": "Gratuit",
  "pricing.free.description": "Offre gratuite pour que tout le monde puisse essayer.",
  "pricing.free.cta": "Inscription gratuite",
  "pricing.free.b1": "2 scans par mois",
  "pricing.free.b2": "Extraction de données basique",
  "pricing.free.b3": "Historique de 7 jours",
  "pricing.starter.title": "Starter",
  "pricing.starter.description":
    "Un avant-goût d'une gestion de dépenses réussie.",
  "pricing.starter.cta": "S'inscrire",
  "pricing.starter.b1": "50 scans par mois",
  "pricing.starter.b2": "Extraction de données améliorée",
  "pricing.starter.b3": "Historique de 30 jours",
  "pricing.starter.b4": "Options d'exportation basiques",
  "pricing.pro.title": "Pro",
  "pricing.pro.description":
    "Des fonctionnalités pro pour les utilisateurs exigeants.",
  "pricing.pro.cta": "Passer Pro",
  "pricing.pro.ribbon": "Populaire",
  "pricing.pro.b1": "300 scans par mois",
  "pricing.pro.b2": "Extraction avancée des données par IA",
  "pricing.pro.b3": "Résumés IA",
  "pricing.pro.b4": "Catégories et étiquettes de dépenses",
  "cta.title": "Commencez à scanner dès aujourd'hui",
  "cta.subtitle":
    "Rejoignez des milliers d'utilisateurs qui gagnent du temps et obtiennent des informations grâce à leurs reçus.",
  "footer.tagline":
    "Expensio. La manière la plus intelligente de suivre votre argent.",
  "receipts.signInPrompt": "Veuillez vous connecter pour voir vos reçus.",
  "receipts.loading": "Chargement des reçus...",
  "receipts.empty": "Aucun reçu téléversé pour l'instant.",
  "receipts.title": "Vos reçus",
  "receipts.table.name": "Nom",
  "receipts.table.uploaded": "Téléversé",
  "receipts.table.size": "Taille",
  "receipts.table.total": "Total",
  "receipts.table.status": "Statut",
  "receipt.back": "Retour aux reçus",
  "receipt.notFoundTitle": "Reçu introuvable",
  "receipt.notFoundMessage":
    "Le reçu que vous recherchez n'existe pas ou a été supprimé.",
  "receipt.returnHome": "Retour à l'accueil",
  "receipt.fileInfo.title": "Informations sur le fichier",
  "receipt.fileInfo.uploaded": "Téléversé",
  "receipt.fileInfo.size": "Taille",
  "receipt.fileInfo.type": "Type",
  "receipt.fileInfo.id": "ID",
  "receipt.pdfPreview": "Aperçu PDF",
  "receipt.viewPdf": "Voir le PDF",
  "receipt.details.title": "Détails du reçu",
  "receipt.details.merchantTitle": "Informations commerçant",
  "receipt.details.name": "Nom",
  "receipt.details.address": "Adresse",
  "receipt.details.contact": "Contact",
  "receipt.details.transactionTitle": "Détails de la transaction",
  "receipt.details.date": "Date",
  "receipt.details.amount": "Montant",
  "receipt.summary.title": "Résumé IA",
  "receipt.summary.hint":
    "Résumé généré par IA à partir des données du reçu",
  "receipt.summary.lockedTitle": "Résumé IA",
  "receipt.summary.lockedMessage":
    "Le résumé IA est une fonctionnalité du plan Pro",
  "receipt.summary.lockedCta": "Mettre à niveau",
  "receipt.summary.lockedHint":
    "Obtenez des informations alimentées par IA à partir de vos reçus",
  "status.pending": "En attente",
  "status.processed": "Traité",
  "status.failed": "Échec",
  "managePlan.title": "Gérez votre plan",
  "managePlan.subtitle":
    "Gérez ici votre abonnement et vos informations de facturation.",
});

const ar = createTranslations({
  "app.tagline": "إكسبنسيو. الطريقة الأذكى لمتابعة أموالك.",
  "header.login": "تسجيل الدخول",
  "header.myReceipts": "إيصالاتي",
  "header.managePlan": "إدارة الخطة",
  "header.language": "اللغة",
  "hero.title": "مسح ذكي للإيصالات",
  "hero.subtitle":
    "امسح إيصالاتك وحللها ونظمها بدقة مدعومة بالذكاء الاصطناعي. وفر وقتك واحصل على رؤى حول نفقاتك.",
  "hero.ctaPrimary": "ابدأ الآن",
  "hero.ctaSecondary": "اعرف المزيد",
  "dropzone.signInAlert": "يرجى تسجيل الدخول لرفع الملفات",
  "dropzone.pdfOnly": "يرجى إسقاط ملفات PDF فقط.",
  "dropzone.uploading": "جاري الرفع...",
  "dropzone.signInToUpload": "يرجى تسجيل الدخول لرفع الملفات",
  "dropzone.dragDrop":
    "اسحب ملفات PDF وأفلتها هنا أو انقر لاختيار الملفات",
  "dropzone.selectFiles": "اختر الملفات",
  "dropzone.upgradeToUpload": "طور خطتك للرفع",
  "dropzone.limitExceeded":
    "لقد تجاوزت الحد المسموح به وهو {count} عملية مسح. قم بالترقية للمتابعة.",
  "dropzone.uploadedFilesTitle": "الملفات المرفوعة:",
  "dropzone.uploadFailed": "فشل الرفع: {message}",
  "features.title": "ميزات قوية",
  "features.subtitle":
    "منصتنا المدعومة بالذكاء الاصطناعي تغيّر طريقة تعاملك مع الإيصالات والنفقات.",
  "features.easyUploads.title": "رفع سهل",
  "features.easyUploads.description":
    "اسحب إيصالاتك بصيغة PDF وأفلتها للمسح والمعالجة الفورية.",
  "features.aiAnalysis.title": "تحليل بالذكاء الاصطناعي",
  "features.aiAnalysis.description":
    "استخرج بيانات النفقات وصنفها تلقائياً باستخدام الذكاء الاصطناعي.",
  "features.expenseInsights.title": "رؤى النفقات",
  "features.expenseInsights.description":
    "أنشئ تقارير واحصل على رؤى قيّمة حول عادات الإنفاق.",
  "pricing.title": "تسعير بسيط",
  "pricing.subtitle": "اختر الخطة الأنسب لاحتياجاتك.",
  "pricing.perMonth": "‎/شهر",
  "pricing.free.title": "مجاني",
  "pricing.free.description": "خطة مجانية ليجربها الجميع.",
  "pricing.free.cta": "اشترك مجاناً",
  "pricing.free.b1": "مسحان شهرياً",
  "pricing.free.b2": "استخراج بيانات أساسي",
  "pricing.free.b3": "سجل لسبعة أيام",
  "pricing.starter.title": "الأساسية",
  "pricing.starter.description": "تجربة سريعة لإدارة النفقات بفعالية.",
  "pricing.starter.cta": "اشترك الآن",
  "pricing.starter.b1": "50 مسحاً شهرياً",
  "pricing.starter.b2": "استخراج بيانات معزز",
  "pricing.starter.b3": "سجل لثلاثين يوماً",
  "pricing.starter.b4": "خيارات تصدير أساسية",
  "pricing.pro.title": "المحترفة",
  "pricing.pro.description": "ميزات متقدمة للمستخدم المحترف.",
  "pricing.pro.cta": "احصل على برو",
  "pricing.pro.ribbon": "الأكثر شيوعاً",
  "pricing.pro.b1": "300 مسح شهرياً",
  "pricing.pro.b2": "استخراج بيانات متقدم بالذكاء الاصطناعي",
  "pricing.pro.b3": "ملخصات بالذكاء الاصطناعي",
  "pricing.pro.b4": "فئات وعلامات النفقات",
  "cta.title": "ابدأ المسح اليوم",
  "cta.subtitle":
    "انضم إلى آلاف المستخدمين الذين يوفرون الوقت ويحصلون على رؤى من إيصالاتهم.",
  "footer.tagline": "إكسبنسيو. الطريقة الأذكى لمتابعة أموالك.",
  "receipts.signInPrompt": "سجل الدخول لعرض إيصالاتك.",
  "receipts.loading": "جارٍ تحميل الإيصالات...",
  "receipts.empty": "لم يتم رفع أي إيصالات بعد.",
  "receipts.title": "إيصالاتك",
  "receipts.table.name": "الاسم",
  "receipts.table.uploaded": "تاريخ الرفع",
  "receipts.table.size": "الحجم",
  "receipts.table.total": "الإجمالي",
  "receipts.table.status": "الحالة",
  "receipt.back": "العودة إلى الإيصالات",
  "receipt.notFoundTitle": "الإيصال غير موجود",
  "receipt.notFoundMessage":
    "الإيصال الذي تبحث عنه غير موجود أو تم حذفه.",
  "receipt.returnHome": "العودة إلى الصفحة الرئيسية",
  "receipt.fileInfo.title": "معلومات الملف",
  "receipt.fileInfo.uploaded": "تاريخ الرفع",
  "receipt.fileInfo.size": "الحجم",
  "receipt.fileInfo.type": "النوع",
  "receipt.fileInfo.id": "المعرف",
  "receipt.pdfPreview": "معاينة PDF",
  "receipt.viewPdf": "عرض PDF",
  "receipt.details.title": "تفاصيل الإيصال",
  "receipt.details.merchantTitle": "بيانات التاجر",
  "receipt.details.name": "الاسم",
  "receipt.details.address": "العنوان",
  "receipt.details.contact": "التواصل",
  "receipt.details.transactionTitle": "تفاصيل العملية",
  "receipt.details.date": "التاريخ",
  "receipt.details.amount": "المبلغ",
  "receipt.summary.title": "ملخص بالذكاء الاصطناعي",
  "receipt.summary.hint":
    "ملخص مولد بالذكاء الاصطناعي اعتماداً على بيانات الإيصال",
  "receipt.summary.lockedTitle": "ملخص بالذكاء الاصطناعي",
  "receipt.summary.lockedMessage":
    "الملخص بالذكاء الاصطناعي متاح في خطة برو فقط",
  "receipt.summary.lockedCta": "طور للوصول",
  "receipt.summary.lockedHint": "احصل على رؤى مدعومة بالذكاء الاصطناعي من إيصالاتك",
  "status.pending": "قيد المعالجة",
  "status.processed": "مكتمل",
  "status.failed": "فشل",
  "managePlan.title": "إدارة خطتك",
  "managePlan.subtitle":
    "قم بإدارة اشتراكك ومعلومات الفوترة من هنا.",
});

const darija = createTranslations({
  "app.tagline": "إكسبنسيو. أحسن طريقة تراقب بها فلوسك.",
  "header.login": "دخل",
  "header.myReceipts": "الوصولات ديالي",
  "header.managePlan": "تدبير الباقة",
  "header.language": "اللغة",
  "hero.title": "سكانير ذكي للوصولات",
  "hero.subtitle":
    "سكان، حلل، ونظم الوصولات ديالك بدقة ديال الذكاء الاصطناعي. ربح الوقت وخذ نظرة واضحة على مصاريفك.",
  "hero.ctaPrimary": "بدا دابا",
  "hero.ctaSecondary": "معلومات أكثر",
  "dropzone.signInAlert": "خصك تدخل باش ترفع الملفات",
  "dropzone.pdfOnly": "عفاك حط غير ملفات PDF.",
  "dropzone.uploading": "كيتحمّل...",
  "dropzone.signInToUpload": "دخل باش تقدر ترفع الملفات",
  "dropzone.dragDrop":
    "جرّ ملفات PDF ولصقهم هنا ولا كليك باش تختارهم",
  "dropzone.selectFiles": "اختار الملفات",
  "dropzone.upgradeToUpload": "طوّر الباقة باش ترفع",
  "dropzone.limitExceeded":
    "دوزتي الحد ديال {count} د المسحات. طوّر الباقة باش تكمّل.",
  "dropzone.uploadedFilesTitle": "الملفات اللي ترفعو:",
  "dropzone.uploadFailed": "ما قدرش يرفع: {message}",
  "features.title": "مزايا قوية",
  "features.subtitle":
    "المنصة ديالنا بالذكاء الاصطناعي كتبدل الطريقة اللي كتعامل بها مع الوصولات والمصاريف.",
  "features.easyUploads.title": "رفع ساهل",
  "features.easyUploads.description":
    "جرّ الوصولات PDF وديرلهم سكان فالحين.",
  "features.aiAnalysis.title": "تحليل بالذكاء الاصطناعي",
  "features.aiAnalysis.description":
    "كتستخرج وكتصنّف بيانات المصاريف بوحدها.",
  "features.expenseInsights.title": "رؤى على المصاريف",
  "features.expenseInsights.description":
    "خرّج تقارير وخذ معلومات مهمة على العادات ديال الإنفاق.",
  "pricing.title": "أثمنة واضحة",
  "pricing.subtitle": "اختار الخطة اللي مناسبة ليك.",
  "pricing.perMonth": "/الشهر",
  "pricing.free.title": "مجاناً",
  "pricing.free.description": "خطة مجانية باش أي واحد يجرّب.",
  "pricing.free.cta": "تسجّل مجاناً",
  "pricing.free.b1": "2 ديال المسحات فالشهر",
  "pricing.free.b2": "استخراج بيانات بسيط",
  "pricing.free.b3": "أرشيف ديال 7 أيام",
  "pricing.starter.title": "بداية",
  "pricing.starter.description": "تجربة زوينة لمراقبة المصاريف.",
  "pricing.starter.cta": "تسجّل",
  "pricing.starter.b1": "50 مسحة فالشهر",
  "pricing.starter.b2": "استخراج بيانات محسن",
  "pricing.starter.b3": "أرشيف 30 يوم",
  "pricing.starter.b4": "اختيارات تصدير بسيطة",
  "pricing.pro.title": "برو",
  "pricing.pro.description": "مزايا متطورة للمستخدم المحترف.",
  "pricing.pro.cta": "ولّي برو",
  "pricing.pro.ribbon": "الأكثر طلباً",
  "pricing.pro.b1": "300 مسحة فالشهر",
  "pricing.pro.b2": "استخراج بيانات متقدم بالذكاء الاصطناعي",
  "pricing.pro.b3": "ملخصات بالذكاء الاصطناعي",
  "pricing.pro.b4": "تصنيفات ووسوم للمصاريف",
  "cta.title": "بدا السكان دابا",
  "cta.subtitle":
    "التحق بآلاف ديال الناس اللي كيربحو الوقت وكياخدو رؤى من الوصولات ديالهم.",
  "footer.tagline": "إكسبنسيو. أحسن طريقة تراقب بها فلوسك.",
  "receipts.signInPrompt": "دخل باش تشوف الوصولات ديالك.",
  "receipts.loading": "كيتحمّلو الوصولات...",
  "receipts.empty": "ما كاين حتى وصل مرفوع حتى لدابا.",
  "receipts.title": "الوصولات ديالك",
  "receipts.table.name": "الاسم",
  "receipts.table.uploaded": "تاريخ الرفع",
  "receipts.table.size": "الحجم",
  "receipts.table.total": "المجموع",
  "receipts.table.status": "الحالة",
  "receipt.back": "رجع للوصولات",
  "receipt.notFoundTitle": "الوصل ما كاينش",
  "receipt.notFoundMessage":
    "الوصل اللي كتقلب عليه راه ما بقاش ولا تتحيد.",
  "receipt.returnHome": "رجع للواجهة",
  "receipt.fileInfo.title": "معلومات على الملف",
  "receipt.fileInfo.uploaded": "تاريخ الرفع",
  "receipt.fileInfo.size": "الحجم",
  "receipt.fileInfo.type": "النوع",
  "receipt.fileInfo.id": "المعرف",
  "receipt.pdfPreview": "معاينة PDF",
  "receipt.viewPdf": "شوف PDF",
  "receipt.details.title": "تفاصيل الوصل",
  "receipt.details.merchantTitle": "معلومات على البائع",
  "receipt.details.name": "الاسم",
  "receipt.details.address": "العنوان",
  "receipt.details.contact": "التواصل",
  "receipt.details.transactionTitle": "تفاصيل العملية",
  "receipt.details.date": "التاريخ",
  "receipt.details.amount": "المبلغ",
  "receipt.summary.title": "ملخص بالذكاء الاصطناعي",
  "receipt.summary.hint":
    "ملخص مصاوب بالذكاء الاصطناعي انطلاقاً من بيانات الوصل",
  "receipt.summary.lockedTitle": "ملخص بالذكاء الاصطناعي",
  "receipt.summary.lockedMessage":
    "هاد الملخص متاح غير فالخطة برو",
  "receipt.summary.lockedCta": "طوّر باش تحل",
  "receipt.summary.lockedHint":
    "خذ رؤى بالذكاء الاصطناعي من الوصولات ديالك",
  "status.pending": "قيد الإنجاز",
  "status.processed": "تكمل",
  "status.failed": "ماضرش",
  "managePlan.title": "سير الخطة ديالك",
  "managePlan.subtitle": "سير الاشتراك والفاكتورات من هنا.",
});

export const translations = {
  en: baseTranslations,
  es,
  fr,
  ar,
  darija,
} as const satisfies Record<LanguageCode, LanguageTranslations>;

export const supportedLanguages: Array<{
  code: LanguageCode;
  nativeName: string;
}> = [
  { code: "en", nativeName: "English" },
  { code: "es", nativeName: "Español" },
  { code: "fr", nativeName: "Français" },
  { code: "ar", nativeName: "العربية" },
  { code: "darija", nativeName: "الدارجة" },
];

export const defaultLanguage: LanguageCode = "en";

const rtlLanguages: LanguageCode[] = ["ar", "darija"];

const htmlLangMap: Record<LanguageCode, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  ar: "ar",
  darija: "ary",
};

export const translate = (
  language: LanguageCode,
  key: TranslationKey,
  vars?: TranslationValues,
) => {
  const dictionary = translations[language] ?? translations[defaultLanguage];
  const fallback = translations[defaultLanguage];
  const template = dictionary[key] ?? fallback[key] ?? key;

  if (!vars) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const replacement = vars[token];
    return replacement !== undefined ? String(replacement) : `{${token}}`;
  });
};

export const isLanguageCode = (value: string): value is LanguageCode =>
  supportedLanguages.some((lang) => lang.code === value);

export const getHtmlLanguage = (language: LanguageCode) => htmlLangMap[language];

export const isRtl = (language: LanguageCode) =>
  rtlLanguages.includes(language);
